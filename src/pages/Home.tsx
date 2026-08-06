import { lazy, Suspense, useEffect } from 'react';
import Hero from '../components/Hero';
import { useSEO } from '../lib/useSEO';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenis } from '../lib/lenisInstance';
import { homeSchemas } from '../data/schemas';

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
        lenis.scrollTo(el as HTMLElement, { immediate: true, offset: 0 });
      } else {
        requestAnimationFrame(scrollToHash);
      }
    };
    scrollToHash();
  }, []);

  useEffect(() => {
    // Section reveal animations via ScrollTrigger
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('section').forEach((section) => {
        const children = section.querySelectorAll<HTMLElement>(
          'h2, h3, p, [class*="card"], [class*="grid"] > *, article, .reveal-item'
        );
        if (!children.length) return;
        gsap.from(children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  useSEO(
    'Dillan Darcheville | Web Designer & Developer, New York',
    'New York-based web designer and developer specializing in creative direction, interface design, web development, and experience design for brands globally.',
    '/',
    homeSchemas
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
