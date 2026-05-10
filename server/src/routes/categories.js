import { Router } from 'express';
import Category from '../models/Category.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();
router.use(verifyToken);

// GET /categories
router.get('/', async (req, res, next) => {
  try {
    const { fabric, occasion, region, priceTier } = req.query;
    const query = {};
    if (fabric) query.fabric = { $regex: fabric, $options: 'i' };
    if (occasion) query.occasion = { $regex: occasion, $options: 'i' };
    if (region) query.region = { $regex: region, $options: 'i' };
    if (priceTier) query.priceTier = priceTier;
    const categories = await Category.find(query).sort({ name: 1 });
    res.json({ data: categories });
  } catch (err) { next(err); }
});

// POST /categories
router.post('/', requireRole(['admin']), async (req, res, next) => {
  try {
    const { name, fabric, occasion, region, priceTier } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name, slug, fabric: fabric || '', occasion: occasion || '', region: region || '', priceTier: priceTier || '' });
    res.status(201).json(category);
  } catch (err) { next(err); }
});

export default router;
