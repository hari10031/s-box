import { Router } from 'express';
import mongoose from 'mongoose';
import Saree from '../models/Saree.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Sale from '../models/Sale.js';
import Notification from '../models/Notification.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';
import { expandListImage, expandDetailImages } from '../utils/imageUrl.js';

const router = Router();

// Validate adminId param
const validateAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }
    const admin = await User.findOne({ _id: adminId, role: 'admin', status: 'active' });
    if (!admin) return res.status(404).json({ error: 'Store not found' });
    req.storeAdmin = admin;
    next();
  } catch (err) { next(err); }
};

router.use('/:adminId', validateAdmin);

// GET /storefront/:adminId/info — public store info
router.get('/:adminId/info', async (req, res) => {
  const { storeAdmin } = req;
  res.json({
    id: storeAdmin._id,
    name: storeAdmin.name,
    storeCode: storeAdmin.storeCode || '',
    contact: storeAdmin.contact || '',
  });
});

// GET /storefront/:adminId/categories — public categories
router.get('/:adminId/categories', async (_req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json({ data: categories });
  } catch (err) { next(err); }
});

// GET /storefront/:adminId/sarees — browse available sarees (public, paginated)
router.get('/:adminId/sarees', async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { page = 1, limit = 20, category, search, sort = 'newest', minPrice, maxPrice } = req.query;

    const query = { adminRef: new mongoose.Types.ObjectId(adminId), stockStatus: 'available' };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = +minPrice;
      if (maxPrice) query.price.$lte = +maxPrice;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };

    const lim = Math.min(+limit, 40);
    const p = Math.max(+page, 1);
    const total = await Saree.countDocuments(query);
    const sarees = await Saree.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((p - 1) * lim)
      .limit(lim)
      .populate('category', 'name slug fabric occasion region priceTier');

    const data = sarees.map(s => {
      const o = s.toObject();
      o.coverImage = expandListImage(o.images);
      return o;
    });

    res.json({ data, total, page: p, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

// GET /storefront/:adminId/sarees/:id — saree detail (public)
router.get('/:adminId/sarees/:id', async (req, res, next) => {
  try {
    const { adminId, id } = req.params;
    const saree = await Saree.findOne({
      _id: id,
      adminRef: new mongoose.Types.ObjectId(adminId),
    }).populate('category');

    if (!saree) return res.status(404).json({ error: 'Saree not found' });

    const obj = saree.toObject();
    obj.coverImage = expandListImage(obj.images);
    obj.imageUrls = expandDetailImages(obj.images);
    res.json(obj);
  } catch (err) { next(err); }
});

// GET /storefront/:adminId/orders — customer's order/enquiry history
router.get('/:adminId/orders', verifyToken, requireRole(['customer']), async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!req.user.adminRef || req.user.adminRef.toString() !== adminId) {
      return res.status(403).json({ error: 'You are not allowed to access this store' });
    }

    const lim = Math.min(+limit, 50);
    const p = Math.max(+page, 1);
    const query = {
      adminRef: new mongoose.Types.ObjectId(adminId),
      customerRef: req.user._id,
    };

    const total = await Sale.countDocuments(query);
    const data = await Sale.find(query)
      .sort({ createdAt: -1 })
      .skip((p - 1) * lim)
      .limit(lim)
      .populate('sareeRef', 'name images')
      .populate('adminRef', 'name');

    res.json({ data, total, page: p, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

// POST /storefront/:adminId/enquiries — submit cart as pending enquiries
router.post('/:adminId/enquiries', verifyToken, requireRole(['customer']), async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { items, note = '' } = req.body;

    if (!req.user.adminRef || req.user.adminRef.toString() !== adminId) {
      return res.status(403).json({ error: 'You are not allowed to place enquiry for this store' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one cart item is required' });
    }

    const normalizedItems = items.map((item) => ({
      sareeId: item?.sareeId,
      qty: Number(item?.qty),
    }));

    const invalidItem = normalizedItems.find((item) => !mongoose.Types.ObjectId.isValid(item.sareeId) || !Number.isInteger(item.qty) || item.qty < 1);
    if (invalidItem) return res.status(400).json({ error: 'Invalid enquiry items' });

    const sareeIds = [...new Set(normalizedItems.map((item) => item.sareeId))].map((id) => new mongoose.Types.ObjectId(id));
    const sarees = await Saree.find({
      _id: { $in: sareeIds },
      adminRef: new mongoose.Types.ObjectId(adminId),
      stockStatus: 'available',
    });

    if (sarees.length !== sareeIds.length) {
      return res.status(400).json({ error: 'Some selected sarees are unavailable' });
    }

    const sareeMap = new Map(sarees.map((saree) => [saree._id.toString(), saree]));
    const docs = normalizedItems.map((item) => {
      const saree = sareeMap.get(item.sareeId);
      const discountedPrice = Math.round(saree.price * (1 - (saree.discount || 0) / 100));
      const enquiryNote = note ? `Storefront enquiry | Qty: ${item.qty} | ${note}` : `Storefront enquiry | Qty: ${item.qty}`;

      return {
        sareeRef: saree._id,
        employeeRef: adminId,
        customerRef: req.user._id,
        adminRef: adminId,
        salePrice: discountedPrice,
        saleDate: new Date(),
        status: 'pending',
        note: enquiryNote,
      };
    });

    const created = await Sale.insertMany(docs, { ordered: true });
    await Notification.create({
      userId: adminId,
      title: 'New Storefront Enquiry',
      body: `${created.length} new enquiry item(s) from customer`,
      type: 'sale_pending',
    });

    res.status(201).json({ message: 'Enquiry submitted successfully', count: created.length });
  } catch (err) { next(err); }
});

export default router;
