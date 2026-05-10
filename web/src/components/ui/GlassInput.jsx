import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const GlassInput = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full h-11 px-4 glass-input text-sm',
        error && 'border-[rgba(239,68,68,0.6)] shadow-[0_0_0_3px_rgba(239,68,68,0.10)]',
        className
      )}
      {...props}
    />
  );
});

GlassInput.displayName = 'GlassInput';

export const GlassTextarea = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-3 glass-input text-sm min-h-[80px] resize-y',
        error && 'border-[rgba(239,68,68,0.6)] shadow-[0_0_0_3px_rgba(239,68,68,0.10)]',
        className
      )}
      {...props}
    />
  );
});

GlassTextarea.displayName = 'GlassTextarea';

export const GlassSelect = forwardRef(({ className, error, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full h-11 px-4 glass-input text-sm appearance-none cursor-pointer',
        error && 'border-[rgba(239,68,68,0.6)]',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

GlassSelect.displayName = 'GlassSelect';