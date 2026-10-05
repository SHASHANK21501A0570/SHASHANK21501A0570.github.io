import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Github } from 'lucide-react';
import { useRef } from 'react';
import FadeIn from '../components/FadeIn';
import GhostButton from '../components/GhostButton';
import { data, type Project } from '../data';

const RADIUS = 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px]';

function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div className="h-[85vh]">
      <div className="sticky top-24 md:top-32">
        <motion.article
          data-testid="project-card"
          className={`relative w-full ${RADIUS} border-2 border-[#D7E2EA] p-6 sm:p-8 md:p-10 origin-top`}
          style={{ background: '#0C0C0C', scale, top: `${index * 28}px` }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-end gap-4 sm:gap-6 md:gap-8 min-w-0">
              <span className="hero-heading font-black leading-none shrink-0" style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3
                className="text-[#D7E2EA] font-medium uppercase pb-1 sm:pb-3"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {project.title}
              </h3>
            </div>
            {project.github && (
              <GhostButton href={project.github}>
                <Github className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
                GitHub
              </GhostButton>
            )}
          </div>

          <p
            className="text-[#D7E2EA] font-light leading-relaxed max-w-4xl opacity-70 mb-6 sm:mb-8"
            style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.2rem)' }}
          >
            {project.description}
          </p>

          <ul className="flex flex-wrap gap-2 sm:gap-3">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-[#D7E2EA]/30 text-[#D7E2EA] uppercase tracking-wider px-4 py-1.5 text-[0.65rem] sm:text-xs md:text-sm"
              >
                {tag}
              </li>
            ))}
          </ul>
        </motion.article>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const { items, subtitle } = data.projects;

  return (
    <section
      id="projects"
      className="relative z-10 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn
        as="h2"
        y={40}
        className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-4"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Projects
      </FadeIn>
      <FadeIn
        as="p"
        delay={0.1}
        className="text-[#D7E2EA] font-light uppercase tracking-widest text-center opacity-70 mb-16 sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
      >
        {subtitle}
      </FadeIn>

      <div ref={containerRef} className="relative max-w-6xl mx-auto">
        {items.map((p, i) => (
          <ProjectCard key={p.title} project={p} index={i} total={items.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
