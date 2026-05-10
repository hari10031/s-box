import mongoose from 'mongoose';

export default async function createIndexes() {
  const db = mongoose.connection.db;
  try {
    await db.collection('sarees').createIndex({ adminRef: 1, _id: 1 });
    await db.collection('sarees').createIndex({ adminRef: 1, category: 1, _id: 1 });
    await db.collection('sarees').createIndex({ adminRef: 1, tags: 1, _id: 1 });
    await db.collection('sarees').createIndex({ adminRef: 1, stockStatus: 1, _id: 1 });
    await db.collection('sales').createIndex({ adminRef: 1, status: 1 });
    await db.collection('sales').createIndex({ employeeRef: 1, status: 1 });
    await db.collection('users').createIndex({ adminRef: 1, role: 1 });
    await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    console.log('✅ MongoDB indexes created');
  } catch (err) {
    console.error('Index creation error:', err.message);
  }
}
