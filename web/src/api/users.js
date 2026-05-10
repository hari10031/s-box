import api from './client';

export const createEmployee = (data) => api.post('/users/employee', data);
export const getEmployees = (params) => api.get('/users/employees', { params });
export const approveEmployee = (id, approve) => api.patch(`/users/${id}/approve`, { approve });
export const createCustomer = (data) => api.post('/users/customer', data);
export const getCustomers = (params) => api.get('/users/customers', { params });
export const getProfile = () => api.get('/users/profile');
