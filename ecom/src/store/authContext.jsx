import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

const STORE_ID = import.meta.env.VITE_STORE_ADMIN_ID;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ecom_user');
    const token = localStorage.getItem('ecom_accessToken');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await apiLogin(username, password);
    if (data.user?.role !== 'customer') {
      throw new Error('Only customer accounts can sign in here');
    }
    localStorage.setItem('ecom_accessToken', data.accessToken);
    localStorage.setItem('ecom_refreshToken', data.refreshToken);
    localStorage.setItem('ecom_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async ({ name, username, password, contact }) => {
    const { data } = await apiRegister({ name, username, password, contact, adminRef: STORE_ID });
    if (data.user?.role !== 'customer') {
      throw new Error('Registration failed for customer account');
    }
    localStorage.setItem('ecom_accessToken', data.accessToken);
    localStorage.setItem('ecom_refreshToken', data.refreshToken);
    localStorage.setItem('ecom_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const rt = localStorage.getItem('ecom_refreshToken');
      if (rt) await apiLogout(rt);
    } catch { }
    localStorage.removeItem('ecom_accessToken');
    localStorage.removeItem('ecom_refreshToken');
    localStorage.removeItem('ecom_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
