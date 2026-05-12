import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';
import injectAdminRef from '../middleware/injectAdminRef.js';
import scopeQuery from '../middleware/scopeQuery.js';
import { emitEmployeePending } from '../utils/socket.js';

const router = Router();
router.use(verifyToken);

const normalizeText = (value) => (value || '').toString().trim();
const normalizeUsername = (value) => normalizeText(value).toLowerCase();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const buildFallbackEmail = (username, role) => `${username}@${role}.local`;

// ── Super Admin ──────────────────────────────────

// GET /users — list all admins
router.get('/', requireRole(['super_admin']), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = { role: 'admin' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { username: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const admins = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit);
    res.json({ data: admins, total, page: +page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /users/stats — platform-wide stats
router.get('/stats', requireRole(['super_admin']), async (req, res, next) => {
  try {
    const [totalAdmins, totalSarees, totalSales, totalEmployees] = await Promise.all([
      User.countDocuments({ role: 'admin' }),
      mongoose.model('Saree').countDocuments(),
      mongoose.model('Sale').countDocuments(),
      User.countDocuments({ role: 'employee', status: 'active' }),
    ]);
    res.json({ totalAdmins, totalSarees, totalSales, totalEmployees });
  } catch (err) { next(err); }
});

// GET /users/admin/:id — single admin detail
router.get('/admin/:id', requireRole(['super_admin']), async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) { next(err); }
});

// POST /users/admin — create admin
router.post('/admin', requireRole(['super_admin']), async (req, res, next) => {
  try {
    const { name, username, password, contact, imageUploadLimit, email } = req.body;
    if (!name || !username || !password) return res.status(400).json({ error: 'Name, username, and password are required' });
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedUsername) return res.status(400).json({ error: 'Username is required' });
    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) return res.status(409).json({ error: 'Email already taken' });
    }
    const storeCode = `STORE-${Date.now().toString(36).toUpperCase()}`;
    const admin = await User.create({
      name, username: normalizedUsername, password, role: 'admin', status: 'active',
      contact: contact || '', email: normalizedEmail || buildFallbackEmail(normalizedUsername, 'admin'), imageUploadLimit: imageUploadLimit || 500,
      imageUploadCount: 0, storeCode, createdBy: req.user._id,
    });
    res.status(201).json(admin);
  } catch (err) { next(err); }
});

// PATCH /users/:id/limit — set image upload limit
router.patch('/:id/limit', requireRole(['super_admin']), async (req, res, next) => {
  try {
    const { imageUploadLimit } = req.body;
    if (imageUploadLimit == null || imageUploadLimit < 0) return res.status(400).json({ error: 'Valid imageUploadLimit required' });
    const admin = await User.findOneAndUpdate({ _id: req.params.id, role: 'admin' }, { imageUploadLimit }, { new: true });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) { next(err); }
});

// PATCH /users/:id/ban — toggle ban
router.patch('/:id/ban', requireRole(['super_admin']), async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    admin.status = admin.status === 'banned' ? 'active' : 'banned';
    await admin.save();
    res.json(admin);
  } catch (err) { next(err); }
});

// ── Admin ────────────────────────────────────────

// POST /users/employee — create employee directly
router.post('/employee', requireRole(['admin']), injectAdminRef, async (req, res, next) => {
  try {
    const { name, username, password, contact, email } = req.body;
    if (!name || !username || !password) return res.status(400).json({ error: 'Name, username, and password are required' });
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedUsername) return res.status(400).json({ error: 'Username is required' });
    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) return res.status(409).json({ error: 'Email already taken' });
    }
    const employee = await User.create({
      name, username: normalizedUsername, password, role: 'employee', status: 'active',
      adminRef: req.body.adminRef, createdBy: req.user._id, contact: contact || '',
      email: normalizedEmail || buildFallbackEmail(normalizedUsername, 'employee'),
    });
    res.status(201).json(employee);
  } catch (err) { next(err); }
});

// POST /users/employee/register — employee self-registration (no auth)
router.post('/employee/register', async (req, res, next) => {
  try {
    const { name, username, password, storeCode, contact, email } = req.body;
    if (!name || !username || !password || !storeCode) return res.status(400).json({ error: 'Name, username, password, and storeCode are required' });
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedUsername) return res.status(400).json({ error: 'Username is required' });
    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) return res.status(409).json({ error: 'Email already taken' });
    }
    const admin = await User.findOne({ role: 'admin', storeCode, status: 'active' });
    if (!admin) return res.status(404).json({ error: 'Invalid store code' });
    const employee = await User.create({
      name,
      username: normalizedUsername,
      password,
      role: 'employee',
      status: 'pending',
      adminRef: admin._id,
      contact: contact || '',
      email: normalizedEmail || buildFallbackEmail(normalizedUsername, 'employee'),
    });
    await Notification.create({ userId: admin._id, title: 'New Employee Registration', body: `${name} has requested to join your store.`, type: 'employee_pending' });
    emitEmployeePending(admin._id.toString(), employee.toJSON());
    res.status(201).json({ message: 'Registration submitted. Waiting for admin approval.', employee: employee.toJSON() });
  } catch (err) { next(err); }
});

// GET /users/employees — list store employees
router.get('/employees', requireRole(['admin']), scopeQuery, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const query = { role: 'employee', ...req.storeFilter };
    if (status) query.status = status;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { username: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const employees = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit);
    res.json({ data: employees, total, page: +page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// PATCH /users/:id/approve — approve/reject pending employee
router.patch('/:id/approve', requireRole(['admin']), scopeQuery, async (req, res, next) => {
  try {
    const { approve } = req.body;
    const employee = await User.findOne({ _id: req.params.id, role: 'employee', status: 'pending', ...req.storeFilter });
    if (!employee) return res.status(404).json({ error: 'Pending employee not found' });
    if (approve) {
      employee.status = 'active'; await employee.save();
      await Notification.create({ userId: employee._id, title: 'Registration Approved', body: 'You can now log in.', type: 'employee_approved' });
    } else {
      await User.deleteOne({ _id: employee._id });
      return res.json({ message: 'Employee registration rejected' });
    }
    res.json(employee);
  } catch (err) { next(err); }
});

// ── Customers ────────────────────────────────────

// POST /users/customer — create customer
router.post('/customer', requireRole(['admin', 'employee']), injectAdminRef, async (req, res, next) => {
  try {
    const { name, username, password, contact, email } = req.body;
    if (!name || !username || !password) return res.status(400).json({ error: 'Name, username, and password are required' });
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedUsername) return res.status(400).json({ error: 'Username is required' });
    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) return res.status(409).json({ error: 'Email already taken' });
    }
    const customer = await User.create({
      name, username: normalizedUsername, password, role: 'customer', status: 'active',
      adminRef: req.body.adminRef, createdBy: req.user._id, contact: contact || '',
      email: normalizedEmail || buildFallbackEmail(normalizedUsername, 'customer'),
    });
    res.status(201).json(customer);
  } catch (err) { next(err); }
});

// GET /users/customers — admin: all / employee: own only
router.get('/customers', requireRole(['admin', 'employee']), scopeQuery, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = { role: 'customer', ...req.storeFilter };
    if (req.user.role === 'employee') query.createdBy = req.user._id;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { username: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const customers = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit);
    res.json({ data: customers, total, page: +page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /users/profile — own profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
