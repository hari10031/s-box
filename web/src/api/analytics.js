import api from './client';

export const getDashboard = () => api.get('/analytics/dashboard');
export const getSalesAnalytics = (params) => api.get('/analytics/sales', { params });
