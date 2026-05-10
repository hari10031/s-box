import axios from 'axios';
import api, { API_BASE_URL } from './client';

const STORE_ID = import.meta.env.VITE_STORE_ADMIN_ID;
const base = `${API_BASE_URL}/storefront/${STORE_ID}`;

const ensureStoreConfigured = () => {
    if (!STORE_ID) throw new Error('Store is not configured. Set VITE_STORE_ADMIN_ID in ecom/.env');
};

// These are public — no auth needed
export const getStoreInfo = () => { ensureStoreConfigured(); return axios.get(`${base}/info`); };
export const getStoreCategories = () => { ensureStoreConfigured(); return axios.get(`${base}/categories`); };
export const getStoreSarees = (params) => { ensureStoreConfigured(); return axios.get(`${base}/sarees`, { params }); };
export const getStoreSareeDetail = (id) => { ensureStoreConfigured(); return axios.get(`${base}/sarees/${id}`); };

export const createStoreEnquiry = (payload) => {
    ensureStoreConfigured();
    return api.post(`/storefront/${STORE_ID}/enquiries`, payload);
};

export const getStoreOrders = (params) => {
    ensureStoreConfigured();
    return api.get(`/storefront/${STORE_ID}/orders`, { params });
};
