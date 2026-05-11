import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStoreSareeDetail } from '../api/storefront';
import { useCart } from '../store/cartContext';
import ImageGallery from '../components/ImageGallery';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [saree, setSaree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [variant, setVariant] = useState('');

  useEffect(() => {
    setLoading(true);
    getStoreSareeDetail(id)
      .then(r => setSaree(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!saree) return;
    for (let i = 0; i < qty; i += 1) addItem(saree);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-3 border-[var(--color-border)] border-t-[var(--color-brand-500)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!saree) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">Saree not found</p>
        <Link to="/shop" className="btn-primary mt-4 no-underline inline-flex">Back to Shop</Link>
      </div>
    );
  }

  const discountedPrice = saree.discount > 0
    ? Math.round(saree.price * (1 - saree.discount / 100))
    : saree.price;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 md:py-16">
      {/* Breadcrumb */}
      <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-brand-500)] transition-colors no-underline mb-8">
        <ArrowLeft size={14} /> Shop / Product
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <ImageGallery images={saree.imageUrls || []} />
          <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mt-3">
            AI-enhanced image generated from uploaded reference
          </p>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h1 className="text-3xl md:text-4xl italic font-serif text-[var(--color-text-primary)] mb-4">{saree.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-medium text-[var(--color-brand-500)]">₹{discountedPrice.toLocaleString()}</span>
            {saree.discount > 0 && (
              <>
                <span className="text-lg text-[var(--color-text-muted)] line-through">₹{saree.price.toLocaleString()}</span>
                <span className="badge bg-white text-[var(--color-text-muted)]">-{saree.discount}% OFF</span>
              </>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`badge ${saree.stockStatus === 'available' ? 'bg-white text-[var(--color-text-primary)]' : 'bg-white text-[var(--color-text-muted)]'}`}>
              {saree.stockStatus === 'available' ? '● In Stock' : '● Sold Out'}
            </span>
          </div>

          {!!saree.tags?.length && (
            <div className="mb-8">
              <p className="section-heading mb-3">Variants</p>
              <div className="flex flex-wrap gap-2">
                {saree.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setVariant(tag)}
                    className={`px-3 py-1.5 text-xs border cursor-pointer ${variant === tag ? 'bg-[#1A1916] text-white border-[#1A1916]' : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-primary)]'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <p className="section-heading mb-3">Quantity</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty((v) => Math.max(1, v - 1))} className="w-8 h-8 border-none bg-transparent cursor-pointer"><Minus size={14} /></button>
              <span className="font-mono text-sm w-8 text-center">{qty}</span>
              <button onClick={() => setQty((v) => v + 1)} className="w-8 h-8 border-none bg-transparent cursor-pointer"><Plus size={14} /></button>
            </div>
          </div>

          {/* Add to Cart */}
          {saree.stockStatus === 'available' && (
            <button onClick={handleAddToCart} className="btn-primary text-base w-full" disabled={added}>
              {added ? (
                <><Check size={18} /> Added to Cart!</>
              ) : (
                <><ShoppingBag size={18} /> Add to Cart</>
              )}
            </button>
          )}

          <div className="mt-10">
            <div className="flex gap-6 border-b border-[0.5px] border-[var(--color-border)] mb-4">
              {['description', 'specs', 'reviews'].map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`pb-3 text-xs font-mono uppercase tracking-wider border-none bg-transparent cursor-pointer ${tab === key ? 'text-[var(--color-text-primary)] border-b border-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}
                >
                  {key}
                </button>
              ))}
            </div>
            {tab === 'description' && <p className="text-sm text-[var(--color-text-secondary)]">{saree.description || 'No description provided.'}</p>}
            {tab === 'specs' && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {saree.category?.fabric && <div><span className="text-[var(--color-text-muted)]">Fabric:</span> <span className="text-[var(--color-text-primary)]">{saree.category.fabric}</span></div>}
                {saree.category?.occasion && <div><span className="text-[var(--color-text-muted)]">Occasion:</span> <span className="text-[var(--color-text-primary)]">{saree.category.occasion}</span></div>}
                {saree.category?.region && <div><span className="text-[var(--color-text-muted)]">Region:</span> <span className="text-[var(--color-text-primary)]">{saree.category.region}</span></div>}
                {saree.category?.priceTier && <div><span className="text-[var(--color-text-muted)]">Tier:</span> <span className="text-[var(--color-text-primary)] capitalize">{saree.category.priceTier}</span></div>}
              </div>
            )}
            {tab === 'reviews' && <p className="text-sm text-[var(--color-text-secondary)]">Reviews will appear here.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
