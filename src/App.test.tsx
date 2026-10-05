import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from './App';
import Magnet from './components/Magnet';
import { data, TECH_TAGS } from './data';

describe('Shashank portfolio', () => {
  it('renders the main wrapper with dark background and overflowX clip', () => {
    const { container } = render(<App skipIntro />);
    const main = container.querySelector('main')!;
    expect(main.style.background).toMatch(/rgb\(12, 12, 12\)|#0C0C0C/i);
    expect(main.style.overflowX).toBe('clip');
  });

  it('renders sections in order and every nav link has a target', () => {
    const { container } = render(<App skipIntro />);
    const sections = container.querySelectorAll('main > section');
    expect(sections).toHaveLength(7);
    expect(sections[0].querySelector('h1')).toHaveTextContent("Hi, i'm shashank");
    expect(sections[1]).toHaveAttribute('aria-label', 'Tech stack');
    expect(Array.from(sections).slice(2).map((s) => s.id)).toEqual(['about', 'experience', 'projects', 'research', 'contact']);

    const links = Array.from(screen.getByRole('navigation', { name: 'Primary' }).querySelectorAll('a'));
    expect(links.map((a) => a.textContent)).toEqual(data.nav);
    links.forEach((a) => {
      const id = a.getAttribute('href')!.slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    });
  });

  it('hero: heading, tagline, photo, CTA', () => {
    render(<App skipIntro />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('hero-heading', 'whitespace-nowrap');
    expect(screen.getByTestId('hero-role')).toHaveTextContent(data.hero.roles[0]);
    expect(screen.getByAltText(data.hero.name)).toHaveAttribute('src', data.hero.portrait);
    const portrait = screen.getByTestId('data-portrait');
    expect(portrait.querySelector('canvas')).toHaveAttribute('aria-hidden');
    expect(portrait.querySelector('img')).toHaveAttribute('alt', data.hero.name);
    const cta = screen.getByRole('link', { name: data.hero.cta.label });
    expect(cta).toHaveAttribute('href', '#projects');
    expect(cta.getAttribute('style')).toContain('linear-gradient(123deg');
  });

  it('marquee: all unique tech tags, tripled, in two rows', () => {
    render(<App skipIntro />);
    const r1 = screen.getByTestId('marquee-row-1').children.length;
    const r2 = screen.getByTestId('marquee-row-2').children.length;
    expect(r1 + r2).toBe(TECH_TAGS.length * 3);
    expect(new Set(TECH_TAGS).size).toBe(TECH_TAGS.length);
  });

  it('marquee rows move in opposite directions on scroll', () => {
    render(<App skipIntro />);
    const r1 = screen.getByTestId('marquee-row-1');
    const r2 = screen.getByTestId('marquee-row-2');
    // Section sits at document y=900; after scrolling 1000px its viewport top is -100
    r1.parentElement!.getBoundingClientRect = () => ({ top: -100 }) as DOMRect;
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    const x1 = parseFloat(r1.style.transform.match(/translateX\((-?[\d.]+)px\)/)![1]);
    const x2 = parseFloat(r2.style.transform.match(/translateX\((-?[\d.]+)px\)/)![1]);
    const offset = (1000 - 900 + window.innerHeight) * 0.3;
    expect(x1).toBeCloseTo(offset - 200);
    expect(x2).toBeCloseTo(-(offset - 200));
  });

  it('about: all paragraphs animated per character, stats shown', () => {
    render(<App skipIntro />);
    expect(screen.getByRole('heading', { name: 'About me' })).toBeInTheDocument();
    data.about.paragraphs.forEach((p) => {
      const el = screen.getByLabelText(p);
      expect(el.querySelectorAll('span.invisible')).toHaveLength(p.length);
    });
    data.about.stats.forEach((s) => expect(screen.getByText(s.label)).toBeInTheDocument());
  });

  it('experience and skills lists match the data', () => {
    render(<App skipIntro />);
    const jobs = screen.getAllByTestId('experience-item');
    expect(jobs).toHaveLength(data.experience.length);
    data.experience.forEach((job, i) => {
      expect(jobs[i]).toHaveTextContent(job.role);
      expect(jobs[i]).toHaveTextContent(job.company);
      expect(jobs[i].querySelectorAll('li')).toHaveLength(0);
    });
    const skills = screen.getAllByTestId('skill-item');
    expect(skills).toHaveLength(data.skills.categories.length);
    data.skills.categories.forEach((c, i) => expect(skills[i]).toHaveTextContent(c.items[0]));
  });

  it('projects: one stacked card per project, GitHub buttons only when a repo exists', () => {
    render(<App skipIntro />);
    const cards = screen.getAllByTestId('project-card');
    expect(cards).toHaveLength(data.projects.items.length);
    data.projects.items.forEach((p, i) => {
      const card = cards[i];
      expect(card).toHaveTextContent(p.title);
      expect(card.style.top).toBe(`${i * 28}px`);
      expect(card.parentElement).toHaveClass('sticky', 'top-24', 'md:top-32');
      const gh = card.querySelector('a[href^="https://github.com"]');
      if (p.github) {
        expect(gh).toHaveAttribute('href', p.github);
        expect(gh).toHaveAttribute('target', '_blank');
      } else {
        expect(gh).toBeNull();
      }
    });
  });

  it('contact: email, LinkedIn, GitHub, copyright', () => {
    const { container } = render(<App skipIntro />);
    const contact = container.querySelector('#contact')!;
    expect(contact.querySelector(`a[href="mailto:${data.contact.email}"]`)).not.toBeNull();
    expect(contact.querySelector('a[href*="linkedin.com"]')).not.toBeNull();
    expect(contact.querySelector(`a[href="https://github.com/SHASHANK21501A0570"]`)).not.toBeNull();
    expect(contact).toHaveTextContent(data.meta.copyright);
  });
});

describe('Magnet', () => {
  it('follows the mouse within padding and resets outside', () => {
    render(
      <Magnet padding={150} strength={3}>
        <span>x</span>
      </Magnet>,
    );
    const inner = screen.getByTestId('magnet-inner');
    inner.parentElement!.getBoundingClientRect = () =>
      ({ left: 100, top: 100, width: 200, height: 200, right: 300, bottom: 300, x: 100, y: 100, toJSON() {} }) as DOMRect;

    act(() => {
      fireEvent.mouseMove(window, { clientX: 290, clientY: 260 });
    });
    expect(inner.style.transform).toBe('translate3d(30px, 20px, 0)');
    expect(inner.style.transition).toBe('transform 0.3s ease-out');

    act(() => {
      fireEvent.mouseMove(window, { clientX: 900, clientY: 900 });
    });
    expect(inner.style.transform).toBe('translate3d(0px, 0px, 0)');
    expect(inner.style.transition).toBe('transform 0.6s ease-in-out');
  });
});

describe('Resume content', () => {
  it('experience includes Abbott and the AIMES Lab research role, newest first', () => {
    render(<App skipIntro />);
    const jobs = screen.getAllByTestId('experience-item');
    expect(jobs[0]).toHaveTextContent('Abbott Cancer Diagnostics');
    expect(jobs[0]).toHaveTextContent('CyberSecurity AI Intern');
    expect(jobs[1]).toHaveTextContent('AIMES Lab, Northeastern University');
    expect(jobs[1]).toHaveTextContent('Research Assistant');
    expect(jobs[1]).toHaveTextContent('Prof. John Wihbey');
  });

  it('education, publications and achievements render', () => {
    render(<App skipIntro />);
    expect(screen.getByTestId('education')).toHaveTextContent('GPA 4.0/4.0');
    const pubs = screen.getAllByTestId('publication');
    expect(pubs).toHaveLength(data.publications.length);
    expect(pubs[1]).toHaveTextContent('IEEE ICCSAI');
    expect(pubs[1]).toHaveTextContent('Accepted');
    expect(screen.getAllByTestId('achievement')).toHaveLength(data.achievements.length);
    expect(screen.getByTestId('availability')).toHaveTextContent(data.contact.location);
  });
});

describe('Borrowed interactions', () => {
  it('hero role cycles every 2s', () => {
    vi.useFakeTimers();
    render(<App skipIntro />);
    expect(screen.getByTestId('hero-role')).toHaveTextContent(data.hero.roles[0]);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId('hero-role')).toHaveTextContent(data.hero.roles[1]);
    vi.useRealTimers();
  });

  it('mobile menu opens, locks scroll, and closes from the backdrop', () => {
    render(<App skipIntro />);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    const drawer = screen.getByRole('navigation', { name: 'Mobile' });
    expect(drawer.querySelectorAll('a[href^="#"]')).toHaveLength(data.nav.length);
    fireEvent.click(screen.getByTestId('menu-backdrop'));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.body.style.overflow).toBe('');
  });

  it('loading screen counts to 100 then reveals the page', async () => {
    sessionStorage.clear();
    const { container } = render(<App />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeNull();
    await waitFor(() => expect(container.querySelector('main')).not.toBeNull(), { timeout: 5000 });
    expect(sessionStorage.getItem('introSeen')).toBe('1');
  });
});

describe('Contact details', () => {
  const RESUME = 'https://drive.google.com/file/d/1VMv5hywmoW77ebEso3NNhAjNq1FlU3DP/view?usp=sharing';

  it('uses the gmail address everywhere and no old address remains', () => {
    const { container } = render(<App skipIntro />);
    const mailtos = Array.from(container.querySelectorAll('a[href^="mailto:"]')).map((a) => a.getAttribute('href'));
    expect(mailtos.length).toBeGreaterThan(0);
    mailtos.forEach((href) => expect(href).toBe('mailto:kadiyalashashank@gmail.com'));
    expect(container.innerHTML).not.toContain('northeastern.edu');
  });

  it('links the resume from Experience, Contact and the mobile menu, opening in a new tab', () => {
    const { container } = render(<App skipIntro />);
    const links = Array.from(container.querySelectorAll(`a[href="${RESUME}"]`));
    expect(links).toHaveLength(3);
    links.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    });
    expect(screen.getByRole('link', { name: 'View Full Resume' })).toBeInTheDocument();
  });
});

describe('Portrait interactions', () => {
  it('Magnet travel is capped by maxX / maxY', () => {
    render(
      <Magnet padding={300} strength={1.8} maxX={110} maxY={28}>
        <span>x</span>
      </Magnet>,
    );
    const inner = screen.getByTestId('magnet-inner');
    inner.parentElement!.getBoundingClientRect = () =>
      ({ left: 100, top: 100, width: 200, height: 200, right: 300, bottom: 300, x: 100, y: 100, toJSON() {} }) as DOMRect;
    // center (200, 200); cursor 360px right, 180px down -> raw (200, 100) -> capped (110, 28)
    act(() => {
      fireEvent.mouseMove(window, { clientX: 560, clientY: 380 });
    });
    expect(inner.style.transform).toBe('translate3d(110px, 28px, 0)');
  });

  it('shows a hover hint with pointer and touch wording', () => {
    render(<App skipIntro />);
    const hint = screen.getByTestId('portrait-hint');
    expect(hint).toHaveTextContent('Hover to see what the model attends to');
    expect(hint).toHaveTextContent('Tap to see what the model attends to');
    expect(hint.style.opacity).toBe('1');
  });
});
