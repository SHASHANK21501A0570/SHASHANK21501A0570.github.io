import { FileText, Github, Linkedin, Mail } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import GhostButton from '../components/GhostButton';
import ContactButton from '../components/ContactButton';
import { data } from '../data';

const ICONS: Record<string, typeof Mail> = { Email: Mail, LinkedIn: Linkedin, GitHub: Github, Resume: FileText };

export default function ContactSection() {
  const { contact, meta } = data;
  return (
    <section
      id="contact"
      className="relative z-10 px-5 sm:px-8 md:px-10 pt-10 sm:pt-14 md:pt-16 pb-10 overflow-hidden"
      style={{ background: '#0C0C0C' }}
    >
      <div aria-hidden className="-mx-5 sm:-mx-8 md:-mx-10 mb-16 sm:mb-24 md:mb-28 overflow-hidden">
        <div data-testid="contact-marquee" className="animate-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((half) => (
            <span
              key={half}
              className="hero-heading font-black uppercase leading-none tracking-tight opacity-25"
              style={{ fontSize: 'clamp(3rem, 9vw, 130px)' }}
            >
              {Array.from({ length: 5 }, () => 'Building intelligent systems • ').join('')}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center text-center gap-8 sm:gap-10 md:gap-12">
        <FadeIn
          as="h2"
          y={40}
          className="hero-heading font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          {contact.heading}
        </FadeIn>
        <FadeIn
          as="p"
          delay={0.1}
          className="text-[#D7E2EA] font-light uppercase tracking-widest opacity-70 max-w-[640px]"
          style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
        >
          {contact.subtitle}
        </FadeIn>
        <FadeIn delay={0.2}>
          <a
            href={`mailto:${contact.email}`}
            className="text-[#D7E2EA] font-medium break-all transition-opacity duration-200 hover:opacity-70"
            style={{ fontSize: 'clamp(1.1rem, 3vw, 2.5rem)' }}
          >
            {contact.email}
          </a>
        </FadeIn>
        <FadeIn delay={0.3} className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {contact.links
            .filter((l) => l.label !== 'Email')
            .map((link) => {
              const Icon = ICONS[link.label];
              return (
                <GhostButton key={link.label} href={link.url}>
                  {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />}
                  {link.label}
                </GhostButton>
              );
            })}
        </FadeIn>
        <FadeIn delay={0.4}>
          <ContactButton href={`mailto:${contact.email}`} />
        </FadeIn>
      </div>

      <footer className="mt-24 sm:mt-32 pt-6 border-t border-[#D7E2EA]/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[#D7E2EA]/60 text-xs sm:text-sm font-light">
        <span className="uppercase tracking-widest font-medium text-[#D7E2EA]">{meta.shortName}</span>
        <span data-testid="availability" className="flex items-center gap-2 uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          {contact.availability} · {contact.location}
        </span>
        <span>{meta.copyright}</span>
      </footer>
    </section>
  );
}
