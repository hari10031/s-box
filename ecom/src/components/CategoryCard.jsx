import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryCard({ category, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={() => onClick(category._id)}
      className="group card p-5 md:p-6 text-left cursor-pointer border-none bg-[var(--color-surface-card)] w-full"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="badge bg-[var(--color-surface)] text-[var(--color-text-muted)]">{category.priceTier || 'category'}</p>
        <ArrowUpRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-500)] transition-colors duration-200" />
      </div>
      <h3 className="text-[16px] font-medium text-[var(--color-text-primary)] mb-2 line-clamp-1">{category.name}</h3>
      <div className="min-h-[36px]">
        {category.fabric && <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-1">{category.fabric}</p>}
        {category.occasion && <p className="text-[12px] text-[var(--color-text-muted)] line-clamp-1">{category.occasion}</p>}
      </div>
      <div className="mt-4 pt-3 border-t border-[0.5px] border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Explore</span>
        <span className="text-[13px] text-[var(--color-brand-500)]">View products</span>
      </div>
    </motion.button>
  );
}
