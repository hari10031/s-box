import api from './client';

export const createSale = (data) => api.post('/sales', data);
export const getSales = (params) => api.get('/sales', { params });
export const approveSale = (id) => api.patch(`/sales/${id}/approve`);
export const rejectSale = (id, rejectionReason) => api.patch(`/sales/${id}/reject`, { rejectionReason });
