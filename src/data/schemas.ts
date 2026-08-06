// Pure JSON-LD builders shared by the page components (runtime) and
// scripts/prerender.ts (build time). Keeping one implementation means the
// schema in the prerendered HTML can never drift from the schema React
// injects after hydration.

import type { Post } from './posts';
import type { ProjectData } from './caseStudies';

export const SITE = 'https://www.canvexstudio.com';

const AUTHOR = {
  '@type': 'Person',
  name: 'Dillan Darcheville',
  url: `${SITE}/`,
  jobTitle: 'Web Designer & Developer',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New York',
    addressRegion: 'NY',
    addressCountry: 'US',
  },
};

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Canvex Studio',
  url: SITE,
  logo: { '@type': 'ImageObject', url: `${SITE}/dillan-profile.webp` },
};

export function blogPostSchemas(post: Post) {
  const postId = post.slug;
  const wordCount = post.content.trim().split(/\s+/).length;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.isoDate,
    dateModified: post.isoDate,
    wordCount,
    timeRequired: post.readTime,
    inLanguage: 'en-US',
    author: AUTHOR,
    publisher: PUBLISHER,
    image: { '@type': 'ImageObject', url: post.image, width: 2000, height: 1333 },
    articleSection: post.category,
    url: `${SITE}/blog/${postId}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${postId}` },
    isPartOf: { '@type': 'Blog', '@id': `${SITE}/blog`, name: 'The Journal, Canvex Studio' },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE}/blog/${postId}` },
    ],
  };

  return [articleSchema, breadcrumbSchema];
}

export function caseStudySchemas(caseStudy: ProjectData) {
  const caseStudyId = caseStudy.slug;
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE}/#work` },
      {
        '@type': 'ListItem',
        position: 3,
        name: caseStudy.title,
        item: `${SITE}/case-study/${caseStudyId}`,
      },
    ],
  };

  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${caseStudy.title} Case Study, Canvex Studio`,
    description: caseStudy.metaDescription,
    url: `${SITE}/case-study/${caseStudyId}`,
    image: { '@type': 'ImageObject', url: caseStudy.image },
    author: { '@type': 'Organization', name: 'Canvex Studio', url: SITE },
    about: {
      '@type': 'CreativeWork',
      name: caseStudy.title,
      description: caseStudy.overview,
      creator: { '@type': 'Organization', name: 'Canvex Studio', url: SITE },
      contributor: { '@type': 'Person', name: 'Dillan Darcheville', jobTitle: caseStudy.role },
      keywords: caseStudy.techStack.join(', '),
    },
    provider: { '@type': 'Organization', name: 'Canvex Studio', url: SITE },
  };

  return [breadcrumbSchema, caseStudySchema];
}

// Homepage-only structured data. Prerendered into dist/index.html by
// scripts/prerender.ts and re-injected by Home.tsx on hydration.
export const homeSchemas = [
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
    name: 'Web Design & Development Services, Canvex Studio',
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
        acceptedAnswer: { '@type': 'Answer', text: 'Project investment varies based on scope. A focused landing page or portfolio site starts at $1,500. Full brand and web builds range from $3,500 to $10,000+. Every engagement begins with a free 30-minute discovery call.' },
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
        name: 'What industries do you design for?',
        acceptedAnswer: { '@type': 'Answer', text: 'Canvex Studio designs for brands across real estate, fitness, food and beverage, e-commerce, and sports — with recent work spanning luxury real estate (Lumina), fitness apps (Volt), artisanal coffee (Osteria Roasters), and custom sports gear (Game Changers Gear).' },
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
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. We audit your current site for performance, conversion, and brand alignment, then rebuild with a clear strategy, not just a cosmetic refresh.' },
      },
      {
        '@type': 'Question',
        name: 'What makes Canvex Studio different from other web design agencies?',
        acceptedAnswer: { '@type': 'Answer', text: 'Canvex Studio combines cinematic design with engineering precision. We deliver pixel-perfect, production-grade work with a 2-week turnaround and a direct line to the designer and developer on your project, no account managers, no handoffs.' },
      },
    ],
  },
];
