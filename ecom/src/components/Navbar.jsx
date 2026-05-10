import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../store/authContext';
import { useCart } from '../store/cartContext';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Sarees Store';

export default function Navbar() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-[var(--color-surface)] ${hasScrolled ? 'border-b border-[var(--color-border)]' : ''}`}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="text-2xl italic font-serif text-[var(--color-text-primary)]">{STORE_NAME}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link text-[13px] no-underline text-[var(--color-text-primary)] ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center border-b border-[var(--color-border)]">
              <button
                onClick={() => setSearchExpanded((v) => !v)}
                className="w-8 h-8 flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--color-text-primary)]"
              >
                <Search size={16} />
              </button>
              <input
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => setSearchExpanded(false)}
                onClick={() => setSearchOpen(true)}
                readOnly
                placeholder="Search"
                className={`text-sm bg-transparent border-none outline-none transition-all duration-200 ease-in ${searchExpanded ? 'w-36 px-2 opacity-100' : 'w-0 px-0 opacity-0'}`}
              />
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center text-[var(--color-text-primary)] border-none bg-transparent cursor-pointer"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-brand-500)] text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            <Link
              to={user ? '/account' : '/login'}
              className="hidden sm:flex w-9 h-9 items-center justify-center text-[var(--color-text-primary)]"
            >
              <User size={18} />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent text-[var(--color-text-primary)]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[var(--color-border)]"
          >
            <nav className="px-4 py-4 flex flex-col gap-2">
              <button onClick={() => { setSearchOpen(true); setMobileOpen(false); }} className="text-left px-4 py-2.5 text-sm no-underline border-none bg-transparent">
                Search
              </button>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm no-underline text-[var(--color-text-primary)]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={user ? '/account' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 text-sm no-underline text-[var(--color-text-primary)]"
              >
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
