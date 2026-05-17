import api from './client';

// Super admin
export const getAdmins = (params) => api.get('/users', { params });
export const createAdmin = (data) => api.post('/users/admin', data);
export const getAdminDetail = (id) => api.get(`/users/admin/${id}`);
export const setAdminLimit = (id, imageUploadLimit) => api.patch(`/users/${id}/limit`, { imageUploadLimit });
export const toggleBanAdmin = (id) => api.patch(`/users/${id}/ban`);
export const getPlatformStats = () => api.get('/users/stats');

// Admin
export const createEmployee = (data) => api.post('/users/employee', data);
export const getEmployees = (params) => api.get('/users/employees', { params });
export const approveEmployee = (id, approve) => api.patch(`/users/${id}/approve`, { approve });

// Employee self-register
export const registerEmployee = (data) => api.post('/users/employee/register', data);

// Customer
export const createCustomer = (data) => api.post('/users/customer', data);
export const getCustomers = (params) => api.get('/users/customers', { params });

// Profile
export const getProfile = () => api.get('/users/profile');
