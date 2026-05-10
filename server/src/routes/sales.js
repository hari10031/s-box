import { Router } from 'express';
import Sale from '../models/Sale.js';
import Saree from '../models/Saree.js';
import Notification from '../models/Notification.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';
import injectAdminRef from '../middleware/injectAdminRef.js';
import scopeQuery from '../middleware/scopeQuery.js';
import { emitSaleNew, emitSaleUpdated } from '../utils/socket.js';

const router = Router();
router.use(verifyToken);

// POST /sales — employee logs a sale
router.post('/', requireRole(['employee']), injectAdminRef, async (req, res, next) => {
  try {
    const { sareeRef, customerRef, salePrice, saleDate, note } = req.body;
    if (!sareeRef || !customerRef || salePrice == null) return res.status(400).json({ error: 'sareeRef, customerRef, and salePrice required' });

    const sale = await Sale.create({
      sareeRef, employeeRef: req.user._id, customerRef, adminRef: req.body.adminRef,
      salePrice: +salePrice, saleDate: saleDate ? new Date(saleDate) : new Date(), status: 'pending', note: note || '',
    });

    const populated = await Sale.findById(sale._id)
      .populate('sareeRef', 'name price images').populate('customerRef', 'name username').populate('employeeRef', 'name username');

    emitSaleNew(req.user.adminRef.toString(), populated.toObject());
    await Notification.create({ userId: req.user.adminRef, title: 'New Sale Pending', body: 'A new sale needs your approval.', type: 'sale_pending' });
    res.status(201).json(populated);
  } catch (err) { next(err); }
});

// GET /sales — admin: all / employee: own only
router.get('/', requireRole(['admin', 'employee']), scopeQuery, async (req, res, next) => {
  try {
    const { cursor, page = 1, limit = 20, status } = req.query;
    const query = { ...req.storeFilter };
    if (req.user.role === 'employee') query.employeeRef = req.user._id;
    if (status) query.status = status;

    if (req.user.role === 'employee') {
      if (cursor) query._id = { $gt: cursor };
      const lim = Math.min(+limit, 50);
      const sales = await Sale.find(query).sort({ _id: -1 }).limit(lim + 1)
        .populate('sareeRef', 'name price images').populate('customerRef', 'name username').populate('employeeRef', 'name username');
      const hasMore = sales.length > lim;
      const results = hasMore ? sales.slice(0, lim) : sales;
      return res.json({ data: results, nextCursor: hasMore ? results.at(-1)._id : null, hasMore });
    }

    const lim = Math.min(+limit, 100);
    const p = Math.max(+page, 1);
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query).sort({ createdAt: -1 }).skip((p - 1) * lim).limit(lim)
      .populate('sareeRef', 'name price images').populate('customerRef', 'name username').populate('employeeRef', 'name username');
    res.json({ data: sales, total, page: p, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

// PATCH /sales/:id/approve
router.patch('/:id/approve', requireRole(['admin']), scopeQuery, async (req, res, next) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, status: 'pending', ...req.storeFilter });
    if (!sale) return res.status(404).json({ error: 'Pending sale not found' });
    sale.status = 'approved'; await sale.save();
    await Saree.findByIdAndUpdate(sale.sareeRef, { stockStatus: 'sold' });
    emitSaleUpdated(sale.employeeRef.toString(), sale.toObject());
    await Notification.create({ userId: sale.employeeRef, title: 'Sale Approved', body: 'Your sale has been approved.', type: 'sale_approved' });
    res.json(sale);
  } catch (err) { next(err); }
});

// PATCH /sales/:id/reject
router.patch('/:id/reject', requireRole(['admin']), scopeQuery, async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const sale = await Sale.findOne({ _id: req.params.id, status: 'pending', ...req.storeFilter });
    if (!sale) return res.status(404).json({ error: 'Pending sale not found' });
    sale.status = 'rejected'; sale.rejectionReason = rejectionReason || ''; await sale.save();
    emitSaleUpdated(sale.employeeRef.toString(), sale.toObject());
    await Notification.create({ userId: sale.employeeRef, title: 'Sale Rejected', body: rejectionReason || 'Your sale has been rejected.', type: 'sale_rejected' });
    res.json(sale);
  } catch (err) { next(err); }
});

export default router;
