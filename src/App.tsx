import { AnimatePresence } from 'framer-motion';
import { useCallback, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import AboutSection from './sections/AboutSection';
import ExperienceSection from './sections/ExperienceSection';
import ProjectsSection from './sections/ProjectsSection';
import ResearchSection from './sections/ResearchSection';
import ContactSection from './sections/ContactSection';

// Show the intro once per browser session, and never for reduced-motion users
function shouldShowIntro() {
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem('introSeen') !== '1';
  } catch {
    return true;
  }
}

export default function App({ skipIntro = false }: { skipIntro?: boolean }) {
  const [loading, setLoading] = useState(() => !skipIntro && shouldShowIntro());
  const finish = useCallback(() => {
    try {
      sessionStorage.setItem('introSeen', '1');
    } catch {
      /* storage unavailable: intro simply shows again next visit */
    }
    setLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen key="loader" onComplete={finish} />}</AnimatePresence>
      {/* Mount the page after the intro so the hero's entrance animations play in view */}
      {!loading && (
        <main style={{ background: '#0C0C0C', overflowX: 'clip' }}>
          <HeroSection />
          <MarqueeSection />
          <AboutSection />
          <ExperienceSection />
          <ProjectsSection />
          <ResearchSection />
          <ContactSection />
        </main>
      )}
    </>
  );
}
