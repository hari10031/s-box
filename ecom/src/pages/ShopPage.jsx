import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStoreSarees, getStoreCategories } from '../api/storefront';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, X, Package } from 'lucide-react';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sarees, setSarees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [garmentType, setGarmentType] = useState(searchParams.get('garmentType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    getStoreCategories().then(r => setCategories(r.data.data || [])).catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20, sort };
    if (search) params.search = search;
    if (category) params.category = category;
    if (garmentType) params.garmentType = garmentType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    getStoreSarees(params).then(r => {
      setSarees(r.data.data || []);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    }).catch(console.error).finally(() => setLoading(false));
  }, [page, search, category, garmentType, sort, minPrice, maxPrice]);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.elements.search.value.trim();
    setSearch(val);
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('search', val); else next.delete('search');
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setGarmentType('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 md:py-16">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl italic font-serif text-[var(--color-text-primary)]">Shop</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{total} items available</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Search sarees..."
            className="input-field pl-11 pr-4"
          />
        </form>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline md:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-10">
        {/* Sidebar Filters (desktop) */}
        <aside className={`shrink-0 w-64 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-heading flex-1">Filters</h3>
              {(search || category || minPrice || maxPrice || garmentType) && (
                <button onClick={clearFilters} className="text-xs text-[var(--color-brand-500)] cursor-pointer border-none bg-transparent hover:underline flex items-center gap-1 ml-2">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <div className="py-4 border-b border-[0.5px] border-[var(--color-border)]">
              <p className="text-[12px] text-[var(--color-text-muted)] mb-2">Garment Type</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setGarmentType(''); setPage(1); }}
                  className="text-left text-[13px] transition-all cursor-pointer border-none bg-transparent text-[var(--color-text-primary)] flex items-center gap-2"
                >
                  <span className={`w-[14px] h-[14px] border border-[var(--color-border)] ${!garmentType ? 'bg-[var(--color-text-primary)]' : ''}`} />
                  All
                </button>
                {['saree', 'dress'].map((type) => (
                  <button
                    key={type}
                    onClick={() => { setGarmentType(type); setPage(1); }}
                    className="text-left text-[13px] transition-all cursor-pointer border-none bg-transparent text-[var(--color-text-primary)] flex items-center gap-2"
                  >
                    <span className={`w-[14px] h-[14px] border border-[var(--color-border)] ${garmentType === type ? 'bg-[var(--color-text-primary)]' : ''}`} />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-4 border-b border-[0.5px] border-[var(--color-border)]">
              <p className="text-[12px] text-[var(--color-text-muted)] mb-2">Price range</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  placeholder="Min"
                  className="input-field h-10 text-sm rounded-none"
                />
                <span className="text-[var(--color-text-muted)]">—</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  placeholder="Max"
                  className="input-field h-10 text-sm rounded-none"
                />
              </div>
            </div>
            <div className="py-4 border-b border-[0.5px] border-[var(--color-border)]">
              <p className="text-[12px] text-[var(--color-text-muted)] mb-2">Categories</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setCategory(''); setPage(1); }}
                  className="text-left text-[13px] transition-all cursor-pointer border-none bg-transparent text-[var(--color-text-primary)] flex items-center gap-2"
                >
                  <span className={`w-[14px] h-[14px] border border-[var(--color-border)] ${!category ? 'bg-[var(--color-text-primary)]' : ''}`} />
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => { setCategory(c._id); setPage(1); }}
                    className="text-left text-[13px] transition-all cursor-pointer border-none bg-transparent text-[var(--color-text-primary)] flex items-center gap-2"
                  >
                    <span className={`w-[14px] h-[14px] border border-[var(--color-border)] transition-colors duration-200 ${category === c._id ? 'bg-[var(--color-text-primary)]' : ''}`} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-4">
              <p className="text-[12px] text-[var(--color-text-muted)] mb-3">Sort</p>
              <input
                type="hidden"
              />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="input-field rounded-none"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="name_asc">Name: A → Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-[var(--color-border)] border-t-[var(--color-brand-500)] rounded-full animate-spin" />
            </div>
          ) : sarees.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
                <Package size={28} />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">No sarees found</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {sarees.map((s) => (
                  <ProductCard key={s._id} saree={s} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                      className={`w-10 h-10 rounded-xl text-sm font-medium cursor-pointer border transition-all ${p === page
                          ? 'bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)]'
                          : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand-500)]'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
