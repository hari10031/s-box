import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoreSarees } from '../api/storefront';

function highlight(text, query) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[var(--color-brand-500)]">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem('ecom_recent_searches');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      getStoreSarees({ search: query.trim(), limit: 6, sort: 'newest' })
        .then((res) => setResults(res.data.data || []))
        .catch(() => setResults([]));
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const canViewAll = useMemo(() => query.trim().length > 0, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-white/95 backdrop-blur-sm p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sarees"
          autoFocus
          className="w-full bg-transparent border-none border-b border-[var(--color-border)] focus:border-[var(--color-brand-500)] text-2xl md:text-3xl py-4 outline-none"
        />

        {recent.length > 0 && !query && (
          <div className="mt-6 flex flex-wrap gap-2">
            {recent.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="px-3 py-1 border border-[var(--color-border)] text-xs font-mono uppercase tracking-wider bg-white cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {results.map((item) => {
            const img = typeof item.coverImage === 'object' ? item.coverImage.thumbnail || item.coverImage.list : item.coverImage;
            return (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                onClick={() => {
                  if (query.trim()) {
                    const updated = [query.trim(), ...recent.filter((x) => x !== query.trim())].slice(0, 5);
                    setRecent(updated);
                    localStorage.setItem('ecom_recent_searches', JSON.stringify(updated));
                  }
                  onClose();
                }}
                className="flex items-center gap-3 no-underline text-[var(--color-text-primary)]"
              >
                <div className="w-10 h-10 bg-[var(--color-surface)] overflow-hidden shrink-0">
                  {img ? <img src={img} alt={item.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="text-sm">{highlight(item.name || '', query)}</p>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">{item.category?.name || 'Saree'}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {canViewAll && (
          <Link
            to={`/shop?search=${encodeURIComponent(query.trim())}`}
            onClick={onClose}
            className="inline-block mt-8 text-sm text-[var(--color-brand-500)] no-underline"
          >
            View all results
          </Link>
        )}
      </div>
      <p className="absolute bottom-4 right-4 text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Esc to close</p>
    </div>
  );
}
