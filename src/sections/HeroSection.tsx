import { useEffect, useState } from 'react';
import FadeIn from '../components/FadeIn';
import ContactButton from '../components/ContactButton';
import MobileMenu from '../components/MobileMenu';
import DataPortrait from '../components/DataPortrait';
import useCursorFollow from '../hooks/useCursorFollow';
import { NAV, data, firstName } from '../data';

function RotatingRole() {
  const { roles } = data.hero;
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % roles.length), 2000);
    return () => clearInterval(id);
  }, [roles.length]);
  return (
    <span key={index} data-testid="hero-role" className="block font-medium animate-role-fade-in">
      {roles[index]}
    </span>
  );
}

export default function HeroSection() {
  // Portrait glides across the hero in step with the cursor's screen position. It may rise
  // until the hair tucks behind the headline (which sits above it), but the eyes (~28% down
  // the image) always stay below the letters.
  const followRef = useCursorFollow<HTMLDivElement>({ reach: 0.85, maxUp: 200, maxDown: 20, avoidAbove: 'h1', contentTop: 0.28 });

  return (
    <section className="relative h-screen flex flex-col" style={{ overflowX: 'clip' }}>
      <FadeIn
        as="nav"
        aria-label="Primary"
        delay={0}
        y={-20}
        className="hidden sm:flex justify-between px-6 md:px-10 pt-6 md:pt-8"
      >
        {NAV.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] transition-opacity duration-200 hover:opacity-70"
          >
            {link.label}
          </a>
        ))}
      </FadeIn>

      <FadeIn delay={0} y={-20} className="sm:hidden relative z-30 flex items-center justify-between px-6 pt-5">
        <span className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm">{data.meta.shortName}</span>
      </FadeIn>
      {/* Kept outside FadeIn: a transformed ancestor would break the drawer's position: fixed */}
      <div className="sm:hidden fixed right-4 top-3 z-50">
        <MobileMenu />
      </div>

      <div className="relative z-20 overflow-hidden pointer-events-none">
        <FadeIn
          as="h1"
          delay={0.15}
          y={40}
          className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-center text-[10.5vw] sm:text-[11vw] md:text-[11.5vw] lg:text-[11.8vw] mt-6 sm:mt-4 md:-mt-3"
        >
          Hi, i&apos;m {firstName}
        </FadeIn>
      </div>

      <div className="mt-auto flex justify-between items-end gap-4 px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 relative z-20">
        <FadeIn
          as="p"
          delay={0.35}
          y={20}
          className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[170px] sm:max-w-[240px] md:max-w-[300px]"
          style={{ fontSize: 'clamp(0.7rem, 1.2vw, 1.25rem)' }}
        >
          <RotatingRole />
          {data.hero.focus}
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton href={data.hero.cta.href} label={data.hero.cta.label} />
        </FadeIn>
      </div>

      <div
        data-testid="hero-portrait"
        className="absolute left-1/2 -translate-x-1/2 z-10 w-[320px] sm:w-[min(400px,58vh)] md:w-[min(480px,60vh)] lg:w-[min(560px,62vh)] top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0"
      >
        <FadeIn delay={0.6} y={30}>
          <div ref={followRef} data-testid="portrait-follow" style={{ willChange: 'transform' }}>
            <DataPortrait src={data.hero.portrait} alt={data.hero.name} width={900} height={868} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
