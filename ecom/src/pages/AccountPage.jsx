import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../store/authContext';
import { getStoreOrders } from '../api/storefront';
import { User, Mail, Phone, Calendar, LogOut, ShoppingBag, Clock3 } from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    let active = true;
    setLoadingOrders(true);
    setOrderError('');
    getStoreOrders({ limit: 20 })
      .then((res) => {
        if (!active) return;
        setOrders(res.data.data || []);
      })
      .catch((err) => {
        if (!active) return;
        setOrderError(err.response?.data?.error || err.message || 'Unable to fetch order history');
      })
      .finally(() => {
        if (active) setLoadingOrders(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-serif text-[var(--color-text-primary)] mb-8">My Account</h1>

        {/* Profile Card */}
        <div className="card p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{user.name}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">@{user.username}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Role</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] capitalize">{user.role}</p>
                  </div>
                </div>

                {user.contact && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Phone</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{user.contact}</p>
                    </div>
                  </div>
                )}

                {user.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Joined</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/shop" className="card p-5 flex items-center gap-4 no-underline group">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-600)] group-hover:bg-[var(--color-brand-100)] transition-colors">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Browse Shop</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Explore our collection</p>
            </div>
          </Link>

          <Link to="/cart" className="card p-5 flex items-center gap-4 no-underline group">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">My Cart</p>
              <p className="text-xs text-[var(--color-text-secondary)]">View your items</p>
            </div>
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="btn-outline w-full text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
        >
          <LogOut size={16} /> Sign Out
        </button>

        <div className="card p-6 mt-8">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Order History</h3>
          {loadingOrders ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Loading orders...</p>
          ) : orderError ? (
            <p className="text-sm text-red-600">{orderError}</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">No enquiries yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div key={order._id} className="rounded-xl border border-[var(--color-border)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{order.sareeRef?.name || 'Saree'}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        <Clock3 size={12} className="inline-block mr-1" />
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`badge ${order.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-brand-600)] mt-2">₹{Math.round(order.salePrice || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
