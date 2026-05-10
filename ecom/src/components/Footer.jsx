import { Link } from 'react-router-dom';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Sarees Store';

export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface-card)] border-t border-[var(--color-border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] flex items-center justify-center text-white font-bold text-sm shadow-md">
                S
              </div>
              <span className="text-lg font-bold font-serif text-[var(--color-text-primary)]">{STORE_NAME}</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs">
              Discover exquisite handcrafted sarees — from timeless silks to contemporary designs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: '/shop', label: 'Browse Sarees' },
                { to: '/cart', label: 'Shopping Cart' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors no-underline">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">Contact</h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Have questions? Reach out to us and we'll help you find the perfect saree.
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] mt-10 pt-6 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
