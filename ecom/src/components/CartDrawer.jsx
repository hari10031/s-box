import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../store/cartContext';

export default function CartDrawer({ open, onClose }) {
  const { items, totalItems, totalPrice, removeItem, updateQty } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/35 border-none cursor-pointer"
        aria-label="Close cart drawer"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[400px] bg-[var(--color-surface-card)] border-l border-[0.5px] border-[var(--color-border)] flex flex-col rounded-tl-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[0.5px] border-[var(--color-border)]">
          <h3 className="text-2xl italic font-serif text-[var(--color-text-primary)]">your cart</h3>
          <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">{totalItems} items</p>
          <button onClick={onClose} className="w-8 h-8 border-none bg-transparent cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)] mb-3">
                <ShoppingBag size={22} />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item._id} className="p-3 border border-[0.5px] border-[var(--color-border)] bg-white flex items-start gap-3">
                  <div className="w-[56px] h-[56px] overflow-hidden bg-[var(--color-surface-muted)] shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">{item.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-6 h-6 border-none bg-transparent cursor-pointer"><Minus size={12} /></button>
                      <span className="text-xs font-mono">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-6 h-6 border-none bg-transparent cursor-pointer"><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--color-brand-500)]">₹{Math.round(item.price * (1 - (item.discount || 0) / 100) * item.qty).toLocaleString()}</p>
                    <button onClick={() => removeItem(item._id)} className="mt-2 text-[11px] text-[var(--color-text-muted)] border-none bg-transparent cursor-pointer">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[0.5px] border-[var(--color-border)] p-4 sticky bottom-0 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--color-text-secondary)]">Subtotal</span>
            <span className="text-lg font-medium text-[var(--color-text-primary)]">₹{Math.round(totalPrice).toLocaleString()}</span>
          </div>
          <Link to="/cart" onClick={onClose} className="btn-primary w-full text-base no-underline inline-flex justify-center">
            View Cart & Enquire
          </Link>
        </div>
      </aside>
    </div>
  );
}
