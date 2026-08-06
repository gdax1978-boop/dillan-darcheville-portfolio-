// Metadata for routes whose content is not driven by src/data/posts.ts or
// src/data/caseStudies.ts. Consumed by scripts/prerender.ts at build time.
//
// `title` and `description` MUST match the useSEO() call in the matching page
// component, otherwise the prerendered HTML and the hydrated DOM disagree and
// Google sees a different title on each crawl pass.

export interface StaticPage {
  path: string;
  title: string;
  description: string;
  ogType: string;
  /** Rendered into the crawlable fallback block. Plain text, no markup. */
  heading: string;
  body: string[];
  /** sitemap.xml <priority>. Higher means "crawl this first". */
  priority: number;
  /** sitemap.xml <changefreq>. */
  changefreq: 'weekly' | 'monthly' | 'yearly';
  /** sitemap.xml <lastmod>, ISO date. Bump when the page's copy changes. */
  lastmod: string;
}

export const STATIC_PAGES: StaticPage[] = [
  {
    path: '/',
    title: 'Dillan Darcheville | Web Designer & Developer, New York',
    description:
      'New York-based web designer and developer specializing in creative direction, interface design, web development, and experience design for brands globally.',
    ogType: 'website',
    heading: 'Dillan Darcheville, Web Designer & Developer, New York',
    body: [
      'Canvex Studio is a New York-based independent creative and engineering studio delivering cinematic digital experiences, high-end web design, and production-grade development for brands globally. Founded by Dillan Darcheville, the studio specializes in Creative Direction, Interface Design, Web Development, and Experience Design.',
      'Services: Creative Direction covering brand strategy, mood direction, and narrative design. Interface Design covering high-fidelity UI systems and component libraries. Web Development in React, TypeScript, Next.js, Tailwind CSS, and Vite. Experience Design covering user journey mapping, UX audits, and conversion rate optimization.',
      'Selected work includes Lumina Real Estate, a cinematic property platform; Volt Fitness, a high-contrast fitness app UI; Osteria Roasters, a narrative-driven Shopify storefront; and Game Changers Gear, a custom uniform e-commerce platform.',
      'Landing pages and portfolio sites start at $1,500. Full brand and web builds range from $3,500 to $10,000 and up. Most projects are delivered within 2 weeks of kickoff.',
      'Based in New York, NY 10001. Serving clients globally. Email: canvexstudio@gmail.com. Book a free 30-minute discovery call: calendly.com/canvexstudio/30min',
    ],
    priority: 1.0,
    changefreq: 'weekly',
    lastmod: '2026-07-31',
  },
  {
    path: '/blog',
    title: 'The Journal | Canvex Studio: Design & Development Insights',
    description:
      'Web design and development insights by Dillan Darcheville of Canvex Studio, New York. Deep dives on UI design, React engineering, and creative direction.',
    ogType: 'website',
    heading: 'The Journal, Canvex Studio',
    body: [
      'Web design and development writing by Dillan Darcheville of Canvex Studio, New York. Deep dives on interface design, React engineering, motion, typography, and creative direction.',
    ],
    priority: 0.9,
    changefreq: 'weekly',
    lastmod: '2026-07-31',
  },
  {
    path: '/free-audit',
    title: 'Free Website Audit | Canvex Studio: Real Google Lighthouse Report',
    description:
      'Get a free instant website audit powered by real Google Lighthouse data: Core Web Vitals, SEO, performance, and accessibility scored live. Built by Canvex Studio, New York.',
    ogType: 'website',
    heading: 'Free Website Audit, Real Google Lighthouse Data',
    body: [
      'Run a free instant audit of any website using real Google Lighthouse data. Scores Core Web Vitals, performance, SEO, and accessibility, then translates the results into a plain-English action plan.',
      'Built and operated by Canvex Studio, a New York web design and development studio. No signup required. Email: canvexstudio@gmail.com',
    ],
    priority: 0.9,
    changefreq: 'monthly',
    lastmod: '2026-07-31',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Canvex Studio',
    description: 'How Canvex Studio collects, uses, and protects your personal information.',
    ogType: 'website',
    heading: 'Privacy Policy',
    body: ['How Canvex Studio collects, uses, and protects your personal information.'],
    priority: 0.3,
    changefreq: 'yearly',
    lastmod: '2026-07-02',
  },
  {
    path: '/terms',
    title: 'Terms of Service | Canvex Studio',
    description: 'Terms and conditions governing the use of Canvex Studio services and website.',
    ogType: 'website',
    heading: 'Terms of Service',
    body: ['Terms and conditions governing the use of Canvex Studio services and website.'],
    priority: 0.3,
    changefreq: 'yearly',
    lastmod: '2026-07-02',
  },
];
