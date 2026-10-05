import FadeIn from '../components/FadeIn';
import { data } from '../data';

const BORDER = '1px solid rgba(215, 226, 234, 0.15)';

export default function ResearchSection() {
  const { publications, achievements } = data;
  return (
    <section
      id="research"
      className="relative z-10 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn
        as="h2"
        y={40}
        className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-4"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Research
      </FadeIn>
      <FadeIn
        as="p"
        delay={0.1}
        className="text-[#D7E2EA] font-light uppercase tracking-widest text-center opacity-70 mb-16 sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
      >
        Publications &amp; Recognition
      </FadeIn>

      <div className="max-w-5xl mx-auto">
        {publications.map((pub, i) => (
          <FadeIn
            key={pub.title}
            delay={i * 0.1}
            data-testid="publication"
            className="flex items-center gap-6 sm:gap-10 md:gap-14 py-8 sm:py-10 md:py-12"
            style={{ borderTop: BORDER, borderBottom: i === publications.length - 1 ? BORDER : undefined }}
          >
            <span className="hero-heading font-black leading-none shrink-0" style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm">
                  {pub.venue} · {pub.year}
                </span>
                <span className="rounded-full border border-[#D7E2EA]/30 text-[#D7E2EA]/80 uppercase tracking-wider px-3 py-0.5 text-[0.6rem] sm:text-xs">
                  {pub.status}
                </span>
              </div>
              <h3
                className="text-[#D7E2EA] font-medium leading-snug max-w-3xl"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 1.9rem)' }}
              >
                {pub.title}
              </h3>
            </div>
          </FadeIn>
        ))}

        <ul className="mt-16 sm:mt-20 grid gap-4 sm:gap-5 md:grid-cols-3">
          {achievements.map((a, i) => (
            <FadeIn
              as="li"
              key={a}
              delay={i * 0.1}
              data-testid="achievement"
              className="rounded-[32px] border-2 border-[#D7E2EA]/20 p-6 sm:p-8 text-[#D7E2EA]/80 font-light leading-relaxed"
              style={{ fontSize: 'clamp(0.85rem, 1.2vw, 1rem)' }}
            >
              {a}
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
