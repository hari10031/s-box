import { cn } from '../../lib/utils';

const colors = {
  violet: 'bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.30)] text-[#c4b5fd]',
  sky: 'bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#7dd3fc]',
  emerald: 'bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] text-[#6ee7b7]',
  amber: 'bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.25)] text-[#fde68a]',
  red: 'bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.25)] text-[#fca5a5]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]',
  lg: 'px-3.5 py-1 text-[13px]',
};

export function GlassBadge({ children, color = 'violet', size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colors[color],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}