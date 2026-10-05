import { FileText } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { data } from '../data';

const BORDER = '1px solid rgba(12, 12, 12, 0.15)';
const INK = '#0C0C0C';

function Heading({ id, children }: { id: string; children: string }) {
  return (
    <FadeIn
      as="h2"
      id={id}
      className="font-black uppercase text-center leading-none tracking-tight mb-16 sm:mb-20 md:mb-28 scroll-mt-24"
      style={{ color: INK, fontSize: 'clamp(3rem, 12vw, 160px)' }}
    >
      {children}
    </FadeIn>
  );
}

function Number({ n }: { n: number }) {
  return (
    <span className="font-black leading-none shrink-0" style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}>
      {String(n).padStart(2, '0')}
    </span>
  );
}

function rowStyle(i: number, len: number): React.CSSProperties {
  return { borderTop: BORDER, borderBottom: i === len - 1 ? BORDER : undefined, color: INK };
}

const nameStyle = { fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' };
const descStyle = { fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)', opacity: 0.6 };

export default function ExperienceSection() {
  const { experience, skills, contact } = data;
  return (
    <section
      id="experience"
      className="rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 pb-32 sm:pb-36 md:pb-44"
      style={{ background: '#FFFFFF' }}
    >
      <Heading id="experience-heading">Experience</Heading>

      <div className="max-w-5xl mx-auto">
        {experience.map((job, i) => (
          <FadeIn
            key={job.company}
            delay={i * 0.1}
            data-testid="experience-item"
            className="flex items-center gap-6 sm:gap-10 md:gap-14 py-8 sm:py-10 md:py-12"
            style={rowStyle(i, experience.length)}
          >
            <Number n={i + 1} />
            <div className="flex flex-col gap-2 sm:gap-3">
              <h3 className="font-medium uppercase" style={nameStyle}>
                {job.role}
              </h3>
              <p className="font-medium uppercase tracking-wider text-xs sm:text-sm" style={{ opacity: 0.8 }}>
                {job.company} · {job.start} – {job.end} · {job.location}
              </p>
              <p className="font-light leading-relaxed max-w-2xl" style={descStyle}>
                {job.summary}
              </p>
            </div>
          </FadeIn>
        ))}

        <FadeIn className="flex justify-center mt-12 sm:mt-16">
          <a
            href={contact.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#0C0C0C] text-[#0C0C0C] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base transition-colors duration-200 hover:bg-[#0C0C0C] hover:text-white"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
            View Full Resume
          </a>
        </FadeIn>
      </div>

      <div id="skills" className="pt-24 sm:pt-32 md:pt-40 scroll-mt-0">
        <Heading id="skills-heading">Skills</Heading>
        <FadeIn
          as="p"
          className="font-light uppercase tracking-widest text-center -mt-10 sm:-mt-14 md:-mt-20 mb-16 sm:mb-20 md:mb-24"
          style={{ color: INK, opacity: 0.6, fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
        >
          {skills.subtitle}
        </FadeIn>
        <div className="max-w-5xl mx-auto">
          {skills.categories.map((cat, i) => (
            <FadeIn
              key={cat.name}
              delay={i * 0.1}
              data-testid="skill-item"
              className="flex items-center gap-6 sm:gap-10 md:gap-14 py-8 sm:py-10 md:py-12"
              style={rowStyle(i, skills.categories.length)}
            >
              <Number n={i + 1} />
              <div className="flex flex-col gap-2 sm:gap-3">
                <h3 className="font-medium uppercase" style={nameStyle}>
                  {cat.name}
                </h3>
                <p className="font-light leading-relaxed max-w-2xl" style={descStyle}>
                  {cat.items.join(' · ')}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
