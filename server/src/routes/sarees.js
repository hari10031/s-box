import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import User from '../models/User.js';
import Saree from '../models/Saree.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';
import injectAdminRef from '../middleware/injectAdminRef.js';
import scopeQuery from '../middleware/scopeQuery.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import { buildImagePrompt, buildSareeImagePrompt, generateImageFromReference, generateImageFromReferences } from '../utils/aiImage.js';
import { buildImageUrl, expandListImage, expandDetailImages } from '../utils/imageUrl.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.use(verifyToken);

const parseBool = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const normalized = `${value}`.toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  return defaultValue;
};

const shouldUseAiImage = (req) => parseBool(req.body.useAiImage, true);
const getStoreOwnerId = (req) => (req.user.role === 'admin' ? req.user._id : req.user.adminRef);
const getStoreOwner = (req) => User.findById(getStoreOwnerId(req));
const getStoreFolder = (req) => `sarees/${getStoreOwnerId(req)}`;

// POST /sarees/generate-image — generate one image from multiple references and save to cloudinary
router.post('/generate-image', requireRole(['admin', 'employee']), upload.array('references', 8), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'At least one reference image is required' });

    const { name, description, tags, aiPrompt, previousGeneratedImagePublicId, garmentType = 'saree' } = req.body;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

    const generatedBuffer = await generateImageFromReferences({
      references: req.files.map((file) => ({ buffer: file.buffer, mimeType: file.mimetype })),
      prompt: buildImagePrompt({
        systemPrompt: process.env.AI_IMAGE_SYSTEM_PROMPT,
        aiPrompt,
        name,
        description,
        tags: parsedTags,
        garmentType,
      }),
    });

    const uploaded = await uploadImage(generatedBuffer, getStoreFolder(req));
    const previousPublicId = (previousGeneratedImagePublicId || '').toString().trim();
    if (previousPublicId) await deleteImage(previousPublicId).catch(() => { });
    return res.json({
      publicId: uploaded.public_id,
      imageUrl: buildImageUrl(uploaded.public_id, 'detail'),
    });
  } catch (err) { next(err); }
});

// POST /sarees — create saree with quota check
router.post('/', requireRole(['admin', 'employee']), upload.array('images', 8), injectAdminRef, async (req, res, next) => {
  try {
    const { name, description, price, discount, category, tags, aiPrompt, generatedImagePublicId, garmentType = 'saree' } = req.body;
    if (!name || price == null) return res.status(400).json({ error: 'Name and price required' });
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

    const generatedPublicId = (generatedImagePublicId || '').toString().trim();
    const imageCount = generatedPublicId ? 1 : (req.files?.length ?? 0);
    let publicIds = [];
    const storeOwner = await getStoreOwner(req);
    if (!storeOwner) return res.status(400).json({ error: 'Store owner not found' });

    if (generatedPublicId) {
      if (storeOwner.imageUploadCount + 1 > storeOwner.imageUploadLimit) {
        return res.status(403).json({ error: `Image upload limit reached. Limit: ${storeOwner.imageUploadLimit}, Used: ${storeOwner.imageUploadCount}` });
      }
      publicIds = [generatedPublicId];
      await User.findByIdAndUpdate(storeOwner._id, { $inc: { imageUploadCount: 1 } });
    }

    if (imageCount > 0) {
      if (!generatedPublicId) {
        if (storeOwner.imageUploadCount + imageCount > storeOwner.imageUploadLimit) {
          return res.status(403).json({ error: `Image upload limit reached. Limit: ${storeOwner.imageUploadLimit}, Used: ${storeOwner.imageUploadCount}` });
        }
        for (const file of req.files) {
          try {
            const bufferToUpload = shouldUseAiImage(req)
              ? await generateImageFromReference({
                buffer: file.buffer,
                mimeType: file.mimetype,
                prompt: buildImagePrompt({
                  systemPrompt: process.env.AI_IMAGE_SYSTEM_PROMPT,
                  aiPrompt,
                  name,
                  description,
                  tags: parsedTags,
                  garmentType,
                }),
              })
              : file.buffer;
            const result = await uploadImage(bufferToUpload, getStoreFolder(req));
            publicIds.push(result.public_id);
          } catch (err) {
            for (const pid of publicIds) await deleteImage(pid).catch(() => { });
            return res.status(err.statusCode || 500).json({ error: err.message || 'Image upload failed' });
          }
        }
        await User.findByIdAndUpdate(storeOwner._id, { $inc: { imageUploadCount: imageCount } });
      }
    }

    const saree = await Saree.create({
      name, description: description || '', price: +price, discount: +(discount || 0),
      images: publicIds, category: category || null, tags: parsedTags, garmentType, adminRef: req.body.adminRef,
    });
    res.status(201).json(saree);
  } catch (err) { next(err); }
});

// GET /sarees — browse (cursor for customer/employee, offset for admin)
router.get('/', requireRole(['admin', 'employee', 'customer']), scopeQuery, async (req, res, next) => {
  try {
    const { cursor, page = 1, limit = 20, category, search, stockStatus } = req.query;
    const query = { ...req.storeFilter };

    const isManagementUser = req.user.role === 'admin' || req.user.role === 'employee';
    if (req.user.role === 'customer') query.stockStatus = 'available';
    if (stockStatus && isManagementUser) query.stockStatus = stockStatus;
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    if (!isManagementUser) {
      if (cursor) query._id = { $gt: new mongoose.Types.ObjectId(cursor) };
      const lim = Math.min(+limit, 50);
      const sarees = await Saree.find(query).sort({ _id: 1 }).limit(lim + 1).populate('category', 'name slug fabric occasion region priceTier');
      const hasMore = sarees.length > lim;
      const results = hasMore ? sarees.slice(0, lim) : sarees;
      const data = results.map(s => { const o = s.toObject(); o.coverImage = expandListImage(o.images); return o; });
      return res.json({ data, nextCursor: hasMore ? results.at(-1)._id : null, hasMore });
    }

    const lim = Math.min(+limit, 100);
    const p = Math.max(+page, 1);
    const total = await Saree.countDocuments(query);
    const sarees = await Saree.find(query).sort({ createdAt: -1 }).skip((p - 1) * lim).limit(lim).populate('category', 'name slug fabric occasion region priceTier');
    const data = sarees.map(s => { const o = s.toObject(); o.coverImage = expandListImage(o.images); return o; });
    res.json({ data, total, page: p, totalPages: Math.ceil(total / lim) });
  } catch (err) { next(err); }
});

// GET /sarees/:id — detail
router.get('/:id', requireRole(['admin', 'employee', 'customer']), scopeQuery, async (req, res, next) => {
  try {
    const saree = await Saree.findOne({ _id: req.params.id, ...req.storeFilter }).populate('category');
    if (!saree) return res.status(404).json({ error: 'Saree not found' });
    const obj = saree.toObject();
    obj.imageUrls = expandDetailImages(obj.images);
    res.json(obj);
  } catch (err) { next(err); }
});

// PATCH /sarees/:id — edit
router.patch('/:id', requireRole(['admin', 'employee']), upload.array('newImages', 8), injectAdminRef, scopeQuery, async (req, res, next) => {
  try {
    const saree = await Saree.findOne({ _id: req.params.id, ...req.storeFilter });
    if (!saree) return res.status(404).json({ error: 'Saree not found' });
    const storeOwner = await getStoreOwner(req);
    if (!storeOwner) return res.status(400).json({ error: 'Store owner not found' });

    const { name, description, price, discount, category, tags, stockStatus, removeImages, aiPrompt, generatedImagePublicId, garmentType } = req.body;
    if (name) saree.name = name;
    if (description !== undefined) saree.description = description;
    if (price != null) saree.price = +price;
    if (discount != null) saree.discount = +discount;
    if (category !== undefined) saree.category = category || null;
    if (tags) saree.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (stockStatus) saree.stockStatus = stockStatus;
    if (garmentType) saree.garmentType = garmentType;

    if (removeImages) {
      const toRemove = typeof removeImages === 'string' ? JSON.parse(removeImages) : removeImages;
      for (const pid of toRemove) await deleteImage(pid).catch(() => { });
      saree.images = saree.images.filter(img => !toRemove.includes(img));
      await User.findByIdAndUpdate(storeOwner._id, { $inc: { imageUploadCount: -toRemove.length } });
    }

    const generatedPublicId = (generatedImagePublicId || '').toString().trim();
    if (generatedPublicId) {
      const currentCount = saree.images.length;
      if (storeOwner.imageUploadCount - currentCount + 1 > storeOwner.imageUploadLimit) {
        return res.status(403).json({ error: 'Image upload limit reached' });
      }
      for (const pid of saree.images) await deleteImage(pid).catch(() => { });
      saree.images = [generatedPublicId];
      await User.findByIdAndUpdate(storeOwner._id, { $inc: { imageUploadCount: 1 - currentCount } });
    }

    if (req.files?.length && !generatedPublicId) {
      if (storeOwner.imageUploadCount + req.files.length > storeOwner.imageUploadLimit) return res.status(403).json({ error: 'Image upload limit reached' });
      for (const file of req.files) {
        const bufferToUpload = shouldUseAiImage(req)
          ? await generateImageFromReference({
            buffer: file.buffer,
            mimeType: file.mimetype,
            prompt: buildImagePrompt({
              systemPrompt: process.env.AI_IMAGE_SYSTEM_PROMPT,
              aiPrompt,
              name: saree.name,
              description: saree.description,
              tags: saree.tags,
              garmentType: saree.garmentType,
            }),
          })
          : file.buffer;
        const result = await uploadImage(bufferToUpload, getStoreFolder(req));
        saree.images.push(result.public_id);
      }
      await User.findByIdAndUpdate(storeOwner._id, { $inc: { imageUploadCount: req.files.length } });
    }

    await saree.save();
    res.json(saree);
  } catch (err) { next(err); }
});

// DELETE /sarees/:id
router.delete('/:id', requireRole(['admin', 'employee']), scopeQuery, async (req, res, next) => {
  try {
    const saree = await Saree.findOne({ _id: req.params.id, ...req.storeFilter });
    if (!saree) return res.status(404).json({ error: 'Saree not found' });
    const storeOwner = await getStoreOwner(req);
    if (!storeOwner) return res.status(400).json({ error: 'Store owner not found' });
    for (const pid of saree.images) await deleteImage(pid).catch(() => { });
    await User.findByIdAndUpdate(storeOwner._id, { $inc: { imageUploadCount: -saree.images.length } });
    await Saree.deleteOne({ _id: saree._id });
    res.json({ message: 'Saree deleted' });
  } catch (err) { next(err); }
});

export default router;
