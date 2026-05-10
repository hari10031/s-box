import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

const router = Router();

const generateAccessToken = (user) =>
  jwt.sign({ _id: user._id, role: user.role, adminRef: user.adminRef }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
  jwt.sign({ _id: user._id, role: user.role, adminRef: user.adminRef }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status === 'banned') return res.status(403).json({ error: 'Account has been banned' });
    if (user.status === 'pending') return res.status(403).json({ error: 'Account is pending approval' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshToken.create({ token: hashedToken, userId: user._id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, refreshToken, user: user.toJSON() });
  } catch (err) { next(err); }
});

// POST /auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
    catch { return res.status(401).json({ error: 'Invalid or expired refresh token' }); }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const storedToken = await RefreshToken.findOne({ token: hashedToken, userId: decoded._id });
    if (!storedToken) return res.status(401).json({ error: 'Refresh token not found' });

    const user = await User.findById(decoded._id);
    if (!user || user.status !== 'active') {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await RefreshToken.deleteOne({ _id: storedToken._id });
    const newHashedToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await RefreshToken.create({ token: newHashedToken, userId: user._id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken, user: user.toJSON() });
  } catch (err) { next(err); }
});

// POST /auth/register — customer self-registration
router.post('/register', async (req, res, next) => {
  try {
    const { name, username, password, contact, adminRef, email } = req.body;
    if (!name || !username || !password || !adminRef) {
      return res.status(400).json({ error: 'Name, username, password, and store ID are required' });
    }
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';

    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) return res.status(409).json({ error: 'Email already taken' });
    }

    // Verify adminRef points to a valid admin
    const admin = await User.findOne({ _id: adminRef, role: 'admin', status: 'active' });
    if (!admin) return res.status(400).json({ error: 'Invalid store' });

    // Some deployments still have a unique index on email, so avoid empty-string email collisions.
    const safeEmail = normalizedEmail || `${normalizedUsername}@customer.local`;

    const user = await User.create({
      name, username: normalizedUsername, password,
      role: 'customer', status: 'active',
      adminRef, createdBy: adminRef,
      contact: contact || '',
      email: safeEmail,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshToken.create({ token: hashedToken, userId: user._id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ accessToken, refreshToken, user: user.toJSON() });
  } catch (err) { next(err); }
});

// POST /auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      await RefreshToken.deleteOne({ token: hashedToken });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
});

export default router;
