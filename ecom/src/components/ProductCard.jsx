import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../store/cartContext';

export default function ProductCard({ saree }) {
  const { addItem } = useCart();
  const imageUrl = saree.coverImage
    ? (typeof saree.coverImage === 'object' ? saree.coverImage.list || saree.coverImage.thumbnail : saree.coverImage)
    : null;

  const discountedPrice = saree.discount > 0
    ? Math.round(saree.price * (1 - saree.discount / 100))
    : saree.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card group relative"
    >
      <Link to={`/product/${saree._id}`} className="block no-underline">
        <div className="relative aspect-[3/4] bg-[var(--color-surface-muted)] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={saree.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
              <ShoppingBag size={40} strokeWidth={1} />
            </div>
          )}
          {saree.category?.name && <span className="absolute top-3 left-3 badge bg-white text-[var(--color-text-primary)]">{saree.category.name}</span>}
          {saree.garmentType && <span className="absolute top-12 left-3 badge bg-[var(--color-brand-500)] text-white text-xs font-medium">{saree.garmentType.charAt(0).toUpperCase() + saree.garmentType.slice(1)}</span>}
          <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/95 border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer">
            <Heart size={14} />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${saree._id}`} className="no-underline">
          <h3 className="text-[14px] font-medium text-[var(--color-text-primary)] line-clamp-1 mb-2">
            {saree.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-medium text-[var(--color-brand-500)]">₹{discountedPrice.toLocaleString()}</span>
            {saree.discount > 0 && (
              <span className="text-xs text-[var(--color-text-muted)] line-through">₹{saree.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); addItem(saree); }}
        className="absolute left-0 right-0 bottom-0 h-[50px] bg-[#1A1916] text-white text-sm border-none cursor-pointer translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out"
      >
        Add to cart
      </button>
    </motion.div>
  );
}
