import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function GlassCard({ children, className, shimmer = false, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        'glass-card relative overflow-hidden',
        shimmer && 'glass-card-shimmer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}