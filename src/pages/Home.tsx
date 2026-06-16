import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';
import { useSEO } from '../lib/useSEO';

const Projects    = lazy(() => import('../components/Projects'));
const Services    = lazy(() => import('../components/Services'));
const About       = lazy(() => import('../components/About'));
const BlogSection = lazy(() => import('../components/BlogSection'));
const Contact     = lazy(() => import('../components/Contact'));
const FloatingCTA = lazy(() => import('../components/FloatingCTA'));

export default function Home() {
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
