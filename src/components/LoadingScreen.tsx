import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const WORDS = ['Research', 'Build', 'Ship'];
const DURATION = 2200;

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let raf = 0;
    let done: ReturnType<typeof setTimeout>;
    const start = performance.now();
    const tick = (now: number) => {
      const next = Math.min(100, Math.round(((now - start) / DURATION) * 100));
      setCount(next);
      if (next < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        done = setTimeout(onComplete, 400);
      }
    };
    raf = requestAnimationFrame(tick);
    const words = setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
      clearInterval(words);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <motion.div
      data-testid="loading-screen"
      className="fixed inset-0 z-[9999] flex flex-col justify-between p-6 md:p-10"
      style={{ background: '#0C0C0C' }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }}
    >
      <motion.span
        className="text-[#D7E2EA]/60 text-xs uppercase tracking-[0.3em]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Portfolio
      </motion.span>

      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={WORDS[wordIndex]}
            className="hero-heading font-black uppercase tracking-tight text-4xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4">
        <span
          data-testid="loading-count"
          className="self-end hero-heading font-black leading-none tabular-nums text-6xl md:text-8xl lg:text-9xl"
        >
          {String(count).padStart(3, '0')}
        </span>
        <div className="h-[3px] w-full bg-[#D7E2EA]/10 overflow-hidden rounded-full">
          <div
            className="h-full origin-left"
            style={{
              transform: `scaleX(${count / 100})`,
              background: 'linear-gradient(90deg, #B600A8 0%, #7621B0 60%, #BE4C00 100%)',
              boxShadow: '0 0 8px rgba(182, 0, 168, 0.45)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
