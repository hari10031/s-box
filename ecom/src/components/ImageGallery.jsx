import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="w-full aspect-[3/4] rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
        No images available
      </div>
    );
  }

  const mainImage = images[active]?.detail || images[active]?.list || '';

  return (
    <div className="grid grid-cols-[68px_1fr] gap-3">
      {images.length > 1 && (
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-[56px] h-[72px] overflow-hidden border cursor-pointer transition-opacity duration-150 ${i === active ? 'border-[var(--color-text-primary)] opacity-100' : 'border-[var(--color-border)] opacity-60 hover:opacity-100'}`}
            >
              <img src={img.thumbnail || img.list} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={mainImage}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'ease' }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
