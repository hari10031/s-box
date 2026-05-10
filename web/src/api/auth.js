import axios from 'axios';
import { API_BASE_URL } from './client';

export const login = (username, password) =>
  axios.post(`${API_BASE_URL}/auth/login`, { username, password });

export const logout = (refreshToken) =>
  axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken });
