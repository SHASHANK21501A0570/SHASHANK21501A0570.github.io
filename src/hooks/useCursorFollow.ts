import { useEffect, useRef } from 'react';

type Options = {
  /** Fraction of the free space beside the element it may use on each side (0..1) */
  reach?: number;
  /** Max upward travel in px when the cursor is at the top of the screen */
  maxUp?: number;
  /** Max downward travel in px when the cursor is at the bottom of the screen */
  maxDown?: number;
  /** Easing per 60fps frame toward the target (higher = snappier) */
  ease?: number;
  /** Selector of an element the subject must never rise above (e.g. the headline) */
  avoidAbove?: string;
  /** Where the visible subject starts inside the element, as a fraction of its height */
  contentTop?: number;
};

// Glides an element horizontally across its container in step with the cursor's
// position on screen: cursor at the left edge -> element at the far left of its
// range, right edge -> far right. Mouse/trackpad only; disabled for reduced motion.
export default function useCursorFollow<T extends HTMLElement>({ reach = 0.85, maxUp = 24, maxDown = 24, ease = 0.08, avoidAbove, contentTop = 0 }: Options = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (!finePointer || reduceMotion) return;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;

    // Free space on each side of the element within its section (the hero)
    const range = () => {
      const container = el.closest('section') ?? document.body;
      return Math.max(0, ((container.clientWidth - el.offsetWidth) / 2) * reach);
    };

    // How far the element may rise before its subject would reach the avoided element
    const upAllowance = () => {
      if (!avoidAbove) return Infinity;
      const avoid = document.querySelector(avoidAbove);
      if (!avoid) return Infinity;
      const range = document.createRange();
      range.selectNodeContents(avoid);
      const avoidBottom = range.getBoundingClientRect().bottom;
      const rect = el.getBoundingClientRect();
      const subjectTopAtRest = rect.top - pos.y + rect.height * contentTop;
      return Math.max(0, subjectTopAtRest - avoidBottom - 16);
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const k = 1 - Math.pow(1 - ease, dt / 16.67);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      el.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0)`;
      if (Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        last = 0;
      }
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.x = nx * range();
      target.y = ny < 0 ? -Math.min(-ny * maxUp, upAllowance()) : ny * maxDown;
      start();
    };

    const recenter = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', recenter);
    window.addEventListener('blur', recenter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', recenter);
      window.removeEventListener('blur', recenter);
      el.style.transform = '';
    };
  }, [reach, maxUp, maxDown, ease, avoidAbove, contentTop]);

  return ref;
}
