import * as SecureStore from 'expo-secure-store';
import api, { BASE_URL_CANDIDATES, getActiveBaseUrl, setActiveBaseUrl } from './client';

export const getSarees = (params) => api.get('/sarees', { params });
export const getSareeDetail = (id) => api.get(`/sarees/${id}`);
export const deleteSaree = (id) => api.delete(`/sarees/${id}`);

const getJsonError = async (response) => {
  const fallback = `Request failed (${response.status})`;
  try {
    const data = await response.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
};

const refreshAccessToken = async (baseUrl) => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) return null;

  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return null;

  const data = await response.json();
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  return data.accessToken;
};

const sendFormData = async (baseUrl, path, method, formData, token) => {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: formData,
  });
};

const requestFormData = async ({ path, method, formData }) => {
  const activeBaseUrl = getActiveBaseUrl();
  const candidates = Array.from(new Set([activeBaseUrl, ...BASE_URL_CANDIDATES].filter(Boolean)));
  let lastError;

  for (const baseUrl of candidates) {
    let token = await SecureStore.getItemAsync('accessToken');

    try {
      let response = await sendFormData(baseUrl, path, method, formData, token);

      if (response.status === 401) {
        token = await refreshAccessToken(baseUrl);
        if (token) response = await sendFormData(baseUrl, path, method, formData, token);
      }

      if (!response.ok) {
        const message = await getJsonError(response);
        const error = new Error(message);
        error.response = { status: response.status, data: { error: message } };
        throw error;
      }

      const data = await response.json();
      setActiveBaseUrl(baseUrl);
      return { data };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new Error('Request failed');
};

export const createSaree = (formData) =>
  requestFormData({ path: '/sarees', method: 'POST', formData });

export const updateSaree = (id, formData) =>
  requestFormData({ path: `/sarees/${id}`, method: 'PATCH', formData });

export const generateSareeImage = (formData) =>
  requestFormData({ path: '/sarees/generate-image', method: 'POST', formData });
