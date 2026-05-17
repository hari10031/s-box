import api from './client';

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const refreshToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken });

export const logout = (refreshToken) =>
  api.post('/auth/logout', { refreshToken });
