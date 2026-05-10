import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const variants = {
  gradient: 'gradient-cta text-white',
  primary: 'bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.10)]',
  ghost: 'bg-transparent border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)]',
  destructive: 'bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.40)] hover:shadow-[0_0_24px_rgba(239,68,68,0.4)]',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function GlassButton({ children, variant = 'gradient', size = 'md', className, disabled, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer border-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}