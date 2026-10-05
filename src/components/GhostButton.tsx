import type { ReactNode } from 'react';

type GhostButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function GhostButton({ href, children, className = '' }: GhostButtonProps) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base whitespace-nowrap transition-colors duration-200 hover:bg-[#D7E2EA]/10 ${className}`}
    >
      {children}
    </a>
  );
}
