import portfolio from '../portfolio.json';

export type Project = {
  icon: string;
  title: string;
  description: string;
  tags: string[];
  github: string | null;
};

export const data = portfolio as typeof portfolio & { projects: { items: Project[] } };

const navIds: Record<string, string> = {
  About: 'about',
  Experience: 'experience',
  Projects: 'projects',
  Skills: 'skills',
  Research: 'research',
  Contact: 'contact',
};
export const NAV = data.nav.map((label) => ({ label, href: `#${navIds[label] ?? label.toLowerCase()}` }));

// Unique tech tags across all projects, in first-seen order, for the marquee
export const TECH_TAGS = Array.from(new Set(data.projects.items.flatMap((p) => p.tags)));

export const firstName = data.hero.name.split(' ')[0].toLowerCase();
