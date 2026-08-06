// Case study content. Imported by src/pages/CaseStudy.tsx at runtime and by
// scripts/prerender.ts at build time. Keep free of React imports.

export interface ProjectData {
  slug: string;
  title: string;
  metaDescription: string;
  client: string;
  role: string;
  duration: string;
  image: string;
  overview: string;
  challenge: string;
  solution: string;
  results: string[];
  techStack: string[];
  mockups: string[];
  link: string;
}

export const projectsData: Record<string, ProjectData> = {
  '1': {
    slug: 'lumina-real-estate',
    title: 'Lumina Real Estate',
    metaDescription: 'How Canvex Studio built a cinematic, high-performance real estate platform for Lumina Group, immersive galleries, fluid navigation, and a 120% increase in lead generation.',
    client: 'Lumina Group',
    role: 'Lead Designer & Developer',
    duration: '2 Weeks',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=webp&auto=format&fit=crop&q=80&w=2000',
    overview: 'Lumina Real Estate needed a platform that could show off multi-million dollar listings without the site getting in the way. Large photo galleries, clean navigation, and typography that feels as considered as the properties themselves.',
    challenge: 'The catalog covers high-end properties with a lot of detail per listing: floor plans, neighborhood data, high-resolution photography. Fitting all of that into something that still loads fast and filters well, without the interface turning cluttered or hurting SEO, was the real problem.',
    solution: 'Built the frontend in React with lazy-loaded images and a custom design system, on a headless setup with Contentful so the marketing team can publish new listings without touching code. Vite and Framer Motion keep the site fast and the transitions smooth.',
    results: ['120% Increase in Lead Generation', 'Optimized Mobile Experience', 'Elevated Brand Trust'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Contentful CMS'],
    mockups: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
    ],
    link: 'https://luxury-cobbler-beccc8.netlify.app/'
  },
  '2': {
    slug: 'volt-fitness',
    title: 'Volt Fitness',
    metaDescription: 'A high-contrast fitness app UI built for Volt Athletics, personalized workout tracking, real-time performance data, and a seamless onboarding experience for modern athletes.',
    client: 'Volt Athletics',
    role: 'Frontend Engineer',
    duration: '2 Weeks',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=webp&auto=format&fit=crop&q=80&w=2000',
    overview: 'Volt Fitness gives people personalized workout plans and tracks their performance in real time, aiming at the middle ground between hiring a coach and training alone with no feedback at all. Users log progress, adjust goals, and the interface is built around gamification to keep them coming back.',
    challenge: 'The interface had to show a lot of workout data without overwhelming someone mid-set. Athletes need feedback and quick data entry while they\'re actually working out, so the UI had to stay legible in bad gym lighting, respond well to touch, and never slow down the workout itself.',
    solution: 'Built a high-contrast UI meant for gym use, with quick-access logging and video demonstrations. React Native gets it running at native speed on iOS and Android, and Redux handles offline state so the app keeps working without signal and syncs to AWS once the connection comes back.',
    results: ['Increased Daily Active Users', 'Seamless User Onboarding', 'High App Store Rating'],
    techStack: ['React Native', 'TypeScript', 'Redux', 'Node.js', 'PostgreSQL', 'AWS'],
    mockups: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
    ],
    link: 'https://resplendent-bonbon-288501.netlify.app/#home'
  },
  '3': {
    slug: 'osteria-roasters',
    title: 'Osteria Roasters',
    metaDescription: 'A narrative-driven Shopify storefront for Osteria Coffee Co., editorial product pages, direct-trade origin stories, and a frictionless subscription checkout experience.',
    client: 'Osteria Coffee Co.',
    role: 'Creative Developer',
    duration: '2 Weeks',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?fm=webp&auto=format&fit=crop&q=80&w=2000',
    overview: 'Osteria Roasters sources its beans through direct trade and wanted a site that actually reflected that, not just an online store bolted onto a coffee brand. That meant real storytelling about where the coffee comes from, alongside straightforward ordering and subscriptions.',
    challenge: 'The site had to work as a real store while still making room for editorial content: tasting notes, roast profiles, where each bean is actually from. Getting that balance right, without the store feeling like an afterthought or the content burying the checkout, was the challenge.',
    solution: 'Built on Shopify with custom React components, with most of the design attention going to the product pages, the origin stories, and a checkout that stays out of the way. Going headless meant building real editorial product pages instead of settling for Shopify\'s stock templates, with the subscription sign-up following on naturally from there.',
    results: ['Boosted Monthly Subscriptions', 'Reduced Cart Abandonment', 'Rich Brand Storytelling'],
    techStack: ['Shopify', 'Liquid', 'React', 'Tailwind CSS', 'Framer Motion'],
    mockups: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
    ],
    link: 'https://serene-bombolone-4f49d1.netlify.app/brew'
  },
  '4': {
    slug: 'game-changers-gear',
    title: 'Game Changers Gear',
    metaDescription: 'A custom uniform e-commerce platform for Game Changers Gear, visual configurator, bulk order management, and Stripe-powered checkout built on Next.js and Supabase.',
    client: 'Game Changers',
    role: 'Lead Designer & Developer',
    duration: '2 Weeks',
    image: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?fm=webp&auto=format&fit=crop&q=80&w=2000',
    overview: 'Game Changers Gear sells custom baseball and softball uniforms to teams at every level, pro, college, and rec league, and needed a platform that could handle bulk orders, team colors, rosters, and custom configurations without turning into ten different forms.',
    challenge: 'Teams needed an easy way to see what a custom uniform would actually look like before ordering, and to place bulk orders without back-and-forth emails. The old process was mostly manual and error-prone. The new platform needed a visual configurator, pricing that scales with bulk tiers, and a direct line into the manufacturer\'s production pipeline.',
    solution: 'Built the storefront on Next.js and Tailwind CSS, with a serverless backend on Supabase and Stripe. It includes a product gallery, custom order forms, and a sizing guide, and covers the whole funnel: designing the uniform, paying for it, and getting it into production.',
    results: ['Increased Bulk Order Efficiency', 'Enhanced Visual Product Presentation', 'Optimized User Journey'],
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe', 'Supabase', 'Vercel'],
    mockups: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
    ],
    link: 'https://www.gamechangersgear.com/'
  }
};
