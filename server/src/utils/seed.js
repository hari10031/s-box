import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) { console.log('Super admin already exists:', existing.username); process.exit(0); }

    const superAdmin = await User.create({
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'super_admin',
      status: 'active',
    });

    console.log(`✅ Super admin created: ${superAdmin.username}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
