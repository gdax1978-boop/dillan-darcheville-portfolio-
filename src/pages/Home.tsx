import { lazy, Suspense, useEffect } from 'react';
import Hero from '../components/Hero';
import { useSEO } from '../lib/useSEO';

const Projects    = lazy(() => import('../components/Projects'));
const Services    = lazy(() => import('../components/Services'));
const About       = lazy(() => import('../components/About'));
const BlogSection = lazy(() => import('../components/BlogSection'));
const Contact     = lazy(() => import('../components/Contact'));
const FloatingCTA = lazy(() => import('../components/FloatingCTA'));

const homeSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Canvex Studio',
    description: 'Book a free 30-minute discovery call or send a message to Canvex Studio.',
    url: 'https://www.canvexstudio.com/#contact',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Canvex Studio',
      email: 'canvexstudio@gmail.com',
      url: 'https://www.canvexstudio.com',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Web Design & Development Services — Canvex Studio',
    description: 'Full-service digital studio offering Creative Direction, Interface Design, Web Development, and Experience Design.',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          name: 'Creative Direction',
          description: 'Defining the visual soul of your brand through cinematic design and storytelling.',
          provider: { '@type': 'Organization', name: 'Canvex Studio', url: 'https://www.canvexstudio.com' },
          areaServed: 'Worldwide',
          serviceType: 'Creative Direction',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          name: 'Interface Design',
          description: 'High-fidelity UI systems that bridge the gap between aesthetics and functionality.',
          provider: { '@type': 'Organization', name: 'Canvex Studio', url: 'https://www.canvexstudio.com' },
          areaServed: 'Worldwide',
          serviceType: 'UI/UX Design',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          name: 'Web Development',
          description: 'Fast, responsive, secure digital products built with React, TypeScript, and modern tech stacks.',
          provider: { '@type': 'Organization', name: 'Canvex Studio', url: 'https://www.canvexstudio.com' },
          areaServed: 'Worldwide',
          serviceType: 'Web Development',
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Service',
          name: 'Experience Design',
          description: 'User journey mapping focused on conversion, clarity, and delight.',
          provider: { '@type': 'Organization', name: 'Canvex Studio', url: 'https://www.canvexstudio.com' },
          areaServed: 'Worldwide',
          serviceType: 'UX Design',
        },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does a web design project cost?',
        acceptedAnswer: { '@type': 'Answer', text: 'Project investment varies based on scope. A focused landing page or portfolio site starts at $2,500. Full brand and web builds range from $5,000 to $15,000+. Every engagement begins with a free 30-minute discovery call.' },
      },
      {
        '@type': 'Question',
        name: 'How long does a web design and development project take?',
        acceptedAnswer: { '@type': 'Answer', text: 'Most projects are completed within 2 weeks from kickoff to delivery. Complex builds with custom features or e-commerce may extend to 3–4 weeks.' },
      },
      {
        '@type': 'Question',
        name: 'What services does Canvex Studio offer?',
        acceptedAnswer: { '@type': 'Answer', text: 'Canvex Studio offers Creative Direction, Interface Design, Web Development, and Experience Design for brands globally.' },
      },
      {
        '@type': 'Question',
        name: 'Does Canvex Studio work with clients outside New York?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Canvex Studio is based in New York, NY but serves clients globally via fully remote engagements.' },
      },
      {
        '@type': 'Question',
        name: 'What technologies does Canvex Studio use?',
        acceptedAnswer: { '@type': 'Answer', text: 'We build with React, TypeScript, Next.js, Tailwind CSS, Framer Motion, and Vite. For e-commerce we use Shopify and headless stacks. CMS options include Contentful and Sanity.' },
      },
      {
        '@type': 'Question',
        name: 'How do I get started with Canvex Studio?',
        acceptedAnswer: { '@type': 'Answer', text: 'Book a free 30-minute discovery call at calendly.com/canvexstudio/30min or send a message through the contact form. We respond within 24 hours.' },
      },
      {
        '@type': 'Question',
        name: 'Can Canvex Studio redesign an existing website?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. We audit your current site for performance, conversion, and brand alignment, then rebuild with a clear strategy — not just a cosmetic refresh.' },
      },
      {
        '@type': 'Question',
        name: 'What makes Canvex Studio different from other web design agencies?',
        acceptedAnswer: { '@type': 'Answer', text: 'Canvex Studio combines cinematic design with engineering precision. We deliver pixel-perfect, production-grade work with a 2-week turnaround and a direct line to the designer and developer on your project — no account managers, no handoffs.' },
      },
    ],
  },
];

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
