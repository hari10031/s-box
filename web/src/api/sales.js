import api from './client';

export const getSales = (params) => api.get('/sales', { params });
export const approveSale = (id) => api.patch(`/sales/${id}/approve`);
export const rejectSale = (id, rejectionReason) => api.patch(`/sales/${id}/reject`, { rejectionReason });
