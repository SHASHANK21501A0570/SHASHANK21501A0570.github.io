import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import { data } from '../data';

const BASE = 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7';

const DECOR = [
  {
    src: `${BASE}/moon_icon.11395d36.png`,
    className: 'w-[90px] sm:w-[140px] md:w-[190px] top-[2%] left-[1%] sm:left-[2%] md:left-[4%]',
    delay: 0.1,
    x: -80,
  },
  {
    src: `${BASE}/p59_1.4659672e.png`,
    className: 'w-[80px] sm:w-[120px] md:w-[160px] bottom-[3%] left-[3%] sm:left-[4%] md:left-[6%]',
    delay: 0.25,
    x: -80,
  },
  {
    src: `${BASE}/lego_icon-1.703bb594.png`,
    className: 'w-[90px] sm:w-[140px] md:w-[190px] top-[2%] right-[1%] sm:right-[2%] md:right-[4%]',
    delay: 0.15,
    x: 80,
  },
  {
    src: `${BASE}/Group_134-1.2e04f3ce.png`,
    className: 'w-[90px] sm:w-[130px] md:w-[180px] bottom-[3%] right-[3%] sm:right-[4%] md:right-[6%]',
    delay: 0.3,
    x: 80,
  },
];

export default function AboutSection() {
  const { about, contact, education } = data;
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10 py-28 sm:py-32"
    >
      {DECOR.map((d) => (
        <FadeIn
          key={d.src}
          delay={d.delay}
          x={d.x}
          y={0}
          duration={0.9}
          className={`absolute pointer-events-none opacity-60 md:opacity-100 ${d.className}`}
        >
          <img src={d.src} alt="" className="w-full h-auto" />
        </FadeIn>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <div className="flex flex-col items-center gap-4">
            <FadeIn
              as="h2"
              delay={0}
              y={40}
              className="hero-heading font-black uppercase leading-none tracking-tight text-center"
              style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
            >
              About me
            </FadeIn>
            <FadeIn
              as="p"
              delay={0.1}
              y={20}
              className="text-[#D7E2EA] font-light uppercase tracking-widest text-center opacity-70 max-w-[640px]"
              style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
            >
              {about.heading}
            </FadeIn>
          </div>

          <div className="flex flex-col gap-6 sm:gap-8 max-w-[720px]">
            {about.paragraphs.map((para) => (
              <AnimatedText
                key={para}
                text={para}
                className="text-[#D7E2EA] font-medium text-center leading-relaxed"
                style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 sm:gap-x-14 w-full max-w-[900px]">
            {about.stats.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.1} className="flex flex-col items-center text-center gap-2">
                <span className="hero-heading font-black leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                  {s.value}
                </span>
                <span className="text-[#D7E2EA] font-light uppercase tracking-wider opacity-70 text-xs sm:text-sm">
                  {s.label}
                </span>
              </FadeIn>
            ))}
          </div>

          <FadeIn
            data-testid="education"
            className="w-full max-w-[900px] rounded-[40px] border-2 border-[#D7E2EA]/20 px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center text-center gap-3"
          >
            <span className="text-[#D7E2EA]/60 font-light uppercase tracking-[0.3em] text-xs">Education</span>
            <h3 className="hero-heading font-black uppercase leading-tight" style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.6rem)' }}>
              {education.school}
            </h3>
            <p className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm sm:text-base">
              {education.degree}
            </p>
            <p className="text-[#D7E2EA]/70 font-light text-xs sm:text-sm uppercase tracking-wider">
              {education.start} – {education.end} · {education.location} · GPA {education.gpa}
            </p>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {education.coursework.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-[#D7E2EA]/30 text-[#D7E2EA] uppercase tracking-wider px-4 py-1.5 text-[0.65rem] sm:text-xs"
                >
                  {c}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
        <ContactButton href={`mailto:${contact.email}`} />
      </div>
    </section>
  );
}
