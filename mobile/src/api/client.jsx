import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');
const ensureApiPath = (value) => (value.endsWith('/api') ? value : `${value}/api`);
const sanitize = (value) => (value || '').toString().trim();

const fromCsv = (value) => sanitize(value).split(',').map((v) => sanitize(v)).filter(Boolean);
const preferred = sanitize(process.env.EXPO_PUBLIC_API_BASE_URL);
const fallback = sanitize(process.env.EXPO_PUBLIC_API_FALLBACK_BASE_URL);
const multi = fromCsv(process.env.EXPO_PUBLIC_API_BASE_URLS);
const defaults = ['http://localhost:5000/api', 'http://10.0.2.2:5000/api'];

const BASE_URL_CANDIDATES = Array.from(new Set([
  ...[preferred, fallback].filter(Boolean),
  ...multi,
  ...defaults,
].map((v) => ensureApiPath(normalizeBaseUrl(v)))));

const BASE_URL = BASE_URL_CANDIDATES[0];

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 0,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasNetworkError = !error.response;
    if (hasNetworkError && originalRequest && !originalRequest._baseFailoverTried) {
      const currentBase = originalRequest.baseURL || api.defaults.baseURL || BASE_URL;
      const currentIndex = Math.max(0, BASE_URL_CANDIDATES.indexOf(currentBase));
      const nextBase = BASE_URL_CANDIDATES[currentIndex + 1];
      if (nextBase) {
        api.defaults.baseURL = nextBase;
        return api({
          ...originalRequest,
          baseURL: nextBase,
          _baseFailoverTried: true,
          _retry: false,
        });
      }
    }

    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return Promise.reject(error);

        const refreshBaseUrl = api.defaults.baseURL || BASE_URL;
        const { data } = await axios.post(`${refreshBaseUrl}/auth/refresh`, { refreshToken });

        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens, user must re-login
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
export const getActiveBaseUrl = () => api.defaults.baseURL;
