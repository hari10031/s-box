import api from './client';

export const getNotifications = (params) => api.get('/notifications/me', { params });
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/notifications/read-all');
