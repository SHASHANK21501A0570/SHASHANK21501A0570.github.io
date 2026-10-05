import { useEffect, useRef, useState } from 'react';
import { TECH_TAGS } from '../data';

const half = Math.ceil(TECH_TAGS.length / 2);
const ROW_1 = TECH_TAGS.slice(0, half);
const ROW_2 = TECH_TAGS.slice(half);

function Row({ items, transform, testId }: { items: string[]; transform: string; testId: string }) {
  const tripled = [...items, ...items, ...items];
  return (
    <div data-testid={testId} className="flex gap-3 w-max" style={{ transform, willChange: 'transform' }}>
      {tripled.map((item, i) => (
        <span
          key={i}
          className="shrink-0 flex items-center justify-center h-[90px] sm:h-[110px] px-8 sm:px-12 rounded-2xl border border-[#D7E2EA]/15 bg-[#151515] font-black uppercase tracking-tight whitespace-nowrap hero-heading"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3.25rem)' }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const sectionTop = el.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Tech stack"
      className="flex flex-col gap-3 pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden"
      style={{ background: '#0C0C0C' }}
    >
      <Row items={ROW_1} testId="marquee-row-1" transform={`translateX(${offset - 200}px)`} />
      <Row items={ROW_2} testId="marquee-row-2" transform={`translateX(${-(offset - 200)}px)`} />
    </section>
  );
}
