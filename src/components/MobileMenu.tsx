import { useEffect, useState } from 'react';
import { NAV, data } from '../data';

const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';

// Slide-in drawer for phones (adapted from sample 2), styled to the primary design
export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const reveal = (delay: number, distance = 24): React.CSSProperties => ({
    transition: `opacity 500ms ${EASE} ${open ? delay : 0}ms, transform 500ms ${EASE} ${open ? delay : 0}ms`,
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : `translateY(${distance}px)`,
  });

  const socials = data.contact.links.filter((l) => l.label !== 'Email');

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative z-50 h-11 w-11 flex items-center justify-center rounded-full bg-[#0C0C0C]/80 backdrop-blur-md border border-[#D7E2EA]/15"
      >
        <span className="relative block h-4 w-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute left-0 h-0.5 w-6 bg-[#D7E2EA] rounded-full"
              style={{
                top: i === 0 ? 0 : i === 1 ? 7 : 14,
                transition: `transform 500ms ${EASE}, opacity 300ms`,
                transform: open && i !== 1 ? `translateY(${i === 0 ? 7 : -7}px) rotate(${i === 0 ? 45 : -45}deg)` : 'none',
                opacity: open && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </span>
      </button>

      <div
        data-testid="menu-backdrop"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <nav
        aria-label="Mobile"
        aria-hidden={!open}
        className="fixed top-0 right-0 bottom-0 z-40 w-[80%] max-w-sm bg-[#141414] px-8 py-10 flex flex-col"
        style={{ transition: `transform 600ms ${EASE}`, transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <span className="mt-12 text-xs uppercase tracking-[0.2em] text-[#D7E2EA]/50" style={reveal(250)}>
          Site Index
        </span>
        <ul className="mt-4 flex flex-col gap-2">
          {NAV.map((link, i) => (
            <li key={link.label} style={reveal(300 + i * 80)}>
              <a
                href={link.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="hero-heading font-black uppercase text-4xl leading-tight"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <span className="mt-auto text-xs uppercase tracking-[0.2em] text-[#D7E2EA]/50" style={reveal(500, 16)}>
          Find Me
        </span>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {socials.map((s, i) => (
            <li key={s.label} style={reveal(550 + i * 60, 16)}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
                className="text-sm text-[#D7E2EA] uppercase tracking-wider"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
