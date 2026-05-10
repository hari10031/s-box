import { Router } from 'express';
import Notification from '../models/Notification.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();
router.use(verifyToken);

// GET /notifications/me
router.get('/me', requireRole(['admin', 'employee']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') query.read = false;
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ data: notifications, total, unreadCount, page: +page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) { next(err); }
});

// PATCH /notifications/read-all
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

export default router;
