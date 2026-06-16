import { lazy, Suspense, useEffect } from 'react';
import Hero from '../components/Hero';
import { useSEO } from '../lib/useSEO';

const Projects    = lazy(() => import('../components/Projects'));
const Services    = lazy(() => import('../components/Services'));
const About       = lazy(() => import('../components/About'));
const BlogSection = lazy(() => import('../components/BlogSection'));
const Contact     = lazy(() => import('../components/Contact'));
const FloatingCTA = lazy(() => import('../components/FloatingCTA'));

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const scrollToHash = () => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'instant' });
      } else {
        requestAnimationFrame(scrollToHash);
      }
    };
    scrollToHash();
  }, []);

  useSEO(
    'Dillan Darcheville | Web Designer & Developer — New York',
    'New York-based web designer and developer specializing in creative direction, interface design, web development, and experience design for brands globally.',
    '/'
  );
  return (
    <main>
      <Hero />
      <Suspense fallback={null}>
        <Projects />
        <Services />
        <About />
        <BlogSection />
        <Contact />
        <FloatingCTA />
      </Suspense>
    </main>
  );
}
