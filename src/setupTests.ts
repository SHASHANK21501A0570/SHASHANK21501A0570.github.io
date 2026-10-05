import '@testing-library/jest-dom/vitest';

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
}
// jsdom lacks IntersectionObserver, which framer-motion's whileInView uses
(globalThis as unknown as { IntersectionObserver: typeof IO }).IntersectionObserver = IO;

// jsdom has no canvas backend; DataPortrait falls back to the plain <img> when getContext returns null
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
