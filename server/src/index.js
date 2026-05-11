import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { initSocket } from './utils/socket.js';
import createIndexes from './utils/createIndexes.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import sareeRoutes from './routes/sarees.js';
import saleRoutes from './routes/sales.js';
import categoryRoutes from './routes/categories.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';
import storefrontRoutes from './routes/storefront.js';

import User from './models/User.js';

const app = express();
const server = http.createServer(app);
const trustProxy = process.env.TRUST_PROXY === '1';

const parseOrigins = (value) => (value || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  process.env.CLIENT_URL || 'http://localhost:19006',
  process.env.WEB_URL || 'http://localhost:5173',
  process.env.ECOM_URL || 'http://localhost:5174',
  ...parseOrigins(process.env.CLIENT_URLS),
]));

// Socket.io
initSocket(server);

// Middleware
app.set('trust proxy', trustProxy ? 1 : false);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many login attempts' } }));

// Health
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sarees', sareeRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/storefront', storefrontRoutes);

// 404 + errors
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await createIndexes();

    const envPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const existing = await User.findOne({ role: 'super_admin' });
    if (!existing) {
      await User.create({
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
        password: envPassword,
        role: 'super_admin', status: 'active',
      });
      console.log('✅ Super admin seeded');
    } else {
      // Sync password from .env if it was changed after initial seed
      const passwordMatch = await existing.comparePassword(envPassword);
      if (!passwordMatch) {
        existing.password = envPassword;
        await existing.save();
        console.log('✅ Super admin password synced from .env');
      }
    }

    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });

export default app;
