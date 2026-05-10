import { Router } from 'express';
import Sale from '../models/Sale.js';
import Saree from '../models/Saree.js';
import User from '../models/User.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';
import scopeQuery from '../middleware/scopeQuery.js';

const router = Router();
router.use(verifyToken);

// GET /analytics/dashboard
router.get('/dashboard', requireRole(['admin']), scopeQuery, async (req, res, next) => {
  try {
    const f = req.storeFilter;
    const [totalSarees, availableSarees, soldSarees, totalSales, pendingSales, approvedSales, totalEmployees, activeEmployees, totalCustomers, totalRevenue] = await Promise.all([
      Saree.countDocuments(f), Saree.countDocuments({ ...f, stockStatus: 'available' }), Saree.countDocuments({ ...f, stockStatus: 'sold' }),
      Sale.countDocuments(f), Sale.countDocuments({ ...f, status: 'pending' }), Sale.countDocuments({ ...f, status: 'approved' }),
      User.countDocuments({ ...f, role: 'employee' }), User.countDocuments({ ...f, role: 'employee', status: 'active' }),
      User.countDocuments({ ...f, role: 'customer' }),
      Sale.aggregate([{ $match: { ...f, status: 'approved' } }, { $group: { _id: null, total: { $sum: '$salePrice' } } }]).then(r => r[0]?.total || 0),
    ]);
    res.json({ totalSarees, availableSarees, soldSarees, totalSales, pendingSales, approvedSales, totalEmployees, activeEmployees, totalCustomers, totalRevenue });
  } catch (err) { next(err); }
});

// GET /analytics/sales
router.get('/sales', requireRole(['admin']), scopeQuery, async (req, res, next) => {
  try {
    const f = req.storeFilter;
    const { period = '30d' } = req.query;
    const dateFrom = new Date();
    if (period === '7d') dateFrom.setDate(dateFrom.getDate() - 7);
    else if (period === '30d') dateFrom.setDate(dateFrom.getDate() - 30);
    else if (period === '90d') dateFrom.setDate(dateFrom.getDate() - 90);
    else dateFrom.setFullYear(dateFrom.getFullYear() - 1);

    const [salesOverTime, topSarees, revenueByEmployee] = await Promise.all([
      Sale.aggregate([
        { $match: { ...f, status: 'approved', saleDate: { $gte: dateFrom } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } }, count: { $sum: 1 }, revenue: { $sum: '$salePrice' } } },
        { $sort: { _id: 1 } },
      ]),
      Sale.aggregate([
        { $match: { ...f, status: 'approved' } }, { $group: { _id: '$sareeRef', count: { $sum: 1 }, revenue: { $sum: '$salePrice' } } },
        { $sort: { count: -1 } }, { $limit: 10 },
        { $lookup: { from: 'sarees', localField: '_id', foreignField: '_id', as: 'saree' } }, { $unwind: '$saree' },
        { $project: { name: '$saree.name', count: 1, revenue: 1 } },
      ]),
      Sale.aggregate([
        { $match: { ...f, status: 'approved' } }, { $group: { _id: '$employeeRef', count: { $sum: 1 }, revenue: { $sum: '$salePrice' } } },
        { $sort: { revenue: -1 } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'employee' } }, { $unwind: '$employee' },
        { $project: { name: '$employee.name', count: 1, revenue: 1 } },
      ]),
    ]);
    res.json({ salesOverTime, topSarees, revenueByEmployee });
  } catch (err) { next(err); }
});

export default router;
