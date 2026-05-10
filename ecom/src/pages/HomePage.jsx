import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStoreSarees, getStoreCategories } from '../api/storefront';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { ArrowRight, Sparkles, Truck, Shield, Star } from 'lucide-react';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Sarees Store';

export default function HomePage() {
  const navigate = useNavigate();
  const [sarees, setSarees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStoreSarees({ limit: 8, sort: 'newest' }),
      getStoreCategories(),
    ]).then(([sRes, cRes]) => {
      setSarees(sRes.data.data || []);
      setCategories(cRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: Sparkles, title: 'Handcrafted', desc: 'Each saree is carefully curated' },
    { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable shipping' },
    { icon: Shield, title: 'Authentic', desc: '100% genuine products' },
    { icon: Star, title: 'Premium Quality', desc: 'Finest fabrics and weaves' },
  ];

  return (
    <div>
      <section className="max-w-[1280px] mx-auto px-4 md:px-10 pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 md:gap-12">
          <div className="border-t border-[0.5px] border-[var(--color-border)] pt-8 md:pt-12">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="section-heading mb-6"
            >
              Welcome to {STORE_NAME}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="text-[44px] md:text-[64px] leading-[1.05] font-serif italic text-[var(--color-text-primary)] max-w-4xl"
            >
              Drapes that feel modern, rooted, and unmistakably timeless.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-[15px] text-[var(--color-text-secondary)] leading-7 mt-6 max-w-2xl"
            >
              Explore handpicked sarees for festive moments, everyday elegance, and wedding stories - crafted with rich weaves and refined detail.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Link to="/shop" className="btn-primary text-sm no-underline min-w-[200px]">
                Shop collection <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="btn-outline text-sm no-underline min-w-[180px]">
                Create account
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="card p-5 md:p-6 h-fit"
          >
            <p className="section-heading mb-4">Store highlights</p>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Categories</p>
                <p className="text-2xl font-medium mt-1">{categories.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Latest styles</p>
                <p className="text-2xl font-medium mt-1">{sarees.length}</p>
              </div>
            </div>
            <div className="h-[180px] bg-[var(--color-surface)] border border-[0.5px] border-[var(--color-border)] p-4 flex flex-col justify-between">
              <p className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Editorial pick</p>
              <p className="text-[20px] leading-7 font-serif italic">Crafted sarees for every celebration.</p>
              <Link to="/shop" className="text-sm text-[var(--color-brand-500)] no-underline">View curation</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="text-center p-5"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-600)] mb-3">
                <f.icon size={22} />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{f.title}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 md:px-10 pb-16 md:pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-heading mb-3">Collections</p>
              <h2 className="text-2xl md:text-3xl font-serif italic text-[var(--color-text-primary)]">Shop by Category</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Discover styles by weave, fabric, and occasion.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard key={cat._id} category={cat} onClick={(id) => navigate(`/shop?category=${id}`)} />
            ))}
          </div>
        </section>
      )}

      {!loading && sarees.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 md:px-10 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[var(--color-text-primary)]">New Arrivals</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Fresh additions to our collection</p>
            </div>
            <Link to="/shop" className="btn-outline text-sm no-underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sarees.map((s) => (
              <ProductCard key={s._id} saree={s} />
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[var(--color-border)] border-t-[var(--color-brand-500)] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
