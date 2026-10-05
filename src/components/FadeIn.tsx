import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

type FadeInProps = {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  [key: string]: unknown;
};

// Cache motion components per element type so they aren't recreated on every render
const motionCache = new Map<ElementType, ElementType>();
function getMotion(as: ElementType): ElementType {
  let comp = motionCache.get(as);
  if (!comp) {
    comp = motion.create(as as never) as ElementType;
    motionCache.set(as, comp);
  }
  return comp;
}

export default function FadeIn({
  children,
  as = 'div',
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  ...rest
}: FadeInProps) {
  const Component = getMotion(as);
  return (
    <Component
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
