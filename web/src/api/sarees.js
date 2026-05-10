import api from './client';

export const getSarees = (params) => api.get('/sarees', { params });
export const getSareeDetail = (id) => api.get(`/sarees/${id}`);
export const createSaree = (formData) =>
  api.post('/sarees', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSaree = (id, formData) =>
  api.patch(`/sarees/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteSaree = (id) => api.delete(`/sarees/${id}`);
