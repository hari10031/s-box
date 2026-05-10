import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../store/cartContext';
import { useAuth } from '../store/authContext';
import { createStoreEnquiry } from '../api/storefront';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' });

  const handlePlaceEnquiry = async () => {
    if (!user) return;
    if (!form.name || !form.phone || !form.address || !form.city) {
      setSubmitError('Please complete shipping details before submitting.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      await createStoreEnquiry({
        items: items.map((item) => ({ sareeId: item._id, qty: item.qty })),
      });
      clearCart();
      setSubmitSuccess('Enquiry submitted successfully. The store will contact you soon.');
    } catch (err) {
      setSubmitError(err.response?.data?.error || err.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)] mb-6">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-bold font-serif text-[var(--color-text-primary)] mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">Browse our collection and add your favorites!</p>
        <Link to="/shop" className="btn-primary no-underline inline-flex">
          Browse Sarees <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl italic font-serif text-[var(--color-text-primary)]">Checkout</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          {submitSuccess && <p className="text-sm text-emerald-700 mt-2">{submitSuccess}</p>}
          {submitError && <p className="text-sm text-red-600 mt-2">{submitError}</p>}
        </div>
        <button onClick={clearCart} className="btn-outline text-sm">Clear All</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="mb-4">
            <p className="section-heading">Shipping address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Full Name</p>
                <input className="input-underline" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Phone</p>
                <input className="input-underline" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Address</p>
                <input className="input-underline" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street address" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">City</p>
                <input className="input-underline" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="City" />
              </div>
            </div>
          </div>

          <p className="section-heading">Order items</p>
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4 flex gap-4"
            >
              {/* Image */}
              <div className="w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-[var(--color-surface-muted)]">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                    <ShoppingBag size={20} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item._id}`} className="text-sm font-semibold text-[var(--color-text-primary)] no-underline hover:text-[var(--color-brand-600)] transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">
                    ₹{Math.round(item.price * (1 - (item.discount || 0) / 100)).toLocaleString()}
                  </span>
                  {item.discount > 0 && (
                    <span className="text-xs text-[var(--color-text-muted)] line-through">₹{item.price.toLocaleString()}</span>
                  )}
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-surface-muted)] transition cursor-pointer border-none bg-transparent"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold border-x border-[var(--color-border)]">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-surface-muted)] transition cursor-pointer border-none bg-transparent"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-[var(--color-text-primary)]">
                  ₹{(Math.round(item.price * (1 - (item.discount || 0) / 100)) * item.qty).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <p className="section-heading mb-6">Order summary</p>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-[var(--color-text-primary)]">₹{Math.round(totalPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Shipping</span>
                <span className="font-medium text-emerald-600">Free</span>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-base font-bold text-[var(--color-text-primary)]">Total</span>
                <span className="text-xl font-bold text-[var(--color-brand-600)]">₹{Math.round(totalPrice).toLocaleString()}</span>
              </div>
            </div>

            {user ? (
              <button className="btn-primary w-full text-base" onClick={handlePlaceEnquiry} disabled={submitting}>
                {submitting ? 'Submitting...' : <>Place Enquiry <ArrowRight size={16} /></>}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-xs text-[var(--color-text-muted)] mb-3">Sign in to place your enquiry</p>
                <Link to="/login" className="btn-primary w-full text-base no-underline inline-flex justify-center">
                  Sign In to Continue
                </Link>
              </div>
            )}

            <p className="text-[11px] text-[var(--color-text-muted)] text-center mt-4">
              No payment required. Submit your interest and the store will contact you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
