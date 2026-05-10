import api from './client';

export const login = (username, password) => api.post('/auth/login', { username, password });
export const register = (data) => api.post('/auth/register', data);
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken });
