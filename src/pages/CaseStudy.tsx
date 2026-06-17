import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

export default function CaseStudy() {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Map of actual case study data
  const projectsData: Record<string, any> = {
    '1': {
      title: 'Lumina Real Estate',
      metaDescription: 'How Canvex Studio built a cinematic, high-performance real estate platform for Lumina Group â€” immersive galleries, fluid navigation, and a 120% increase in lead generation.',
      client: 'Lumina Group',
      role: 'Lead Designer & Developer',
      duration: '2 Weeks',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=webp&auto=format&fit=crop&q=80&w=2000',
      overview: 'Lumina Real Estate is a premium digital platform designed to showcase high-end properties with immersive galleries and fluid navigation. The brand demanded an experience that matches the exclusivity of their real estate portfolio. This required a seamless blend of striking typography, high-resolution imagery, and smooth micro-interactions to create a cinematic browsing experience.',
      challenge: 'The client needed a platform that exuded luxury while providing robust filtering and high-resolution imagery without performance lag. With a diverse catalog of multi-million dollar properties, the challenge was to present extensive property details, floor plans, and neighborhood data in an intuitive, elegant interface that does not compromise on loading speed or SEO accessibility.',
      solution: 'Engineered a highly optimized React application utilizing lazy loading for images and a bespoke design system to elevate the brand perception. We implemented a headless architecture with Contentful CMS, allowing the marketing team to rapidly publish new listings while maintaining a lightning-fast, visually cohesive frontend powered by Vite and Framer Motion.',
      results: ['120% Increase in Lead Generation', 'Optimized Mobile Experience', 'Elevated Brand Trust'],
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Contentful CMS'],
      mockups: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
      ],
      link: 'https://luxury-cobbler-beccc8.netlify.app/'
    },
    '2': {
      title: 'Volt Fitness',
      metaDescription: 'A high-contrast fitness app UI built for Volt Athletics â€” personalized workout tracking, real-time performance data, and a seamless onboarding experience for modern athletes.',
      client: 'Volt Athletics',
      role: 'Frontend Engineer',
      duration: '2 Weeks',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=webp&auto=format&fit=crop&q=80&w=2000',
      overview: 'A dynamic fitness application for modern athletes, delivering personalized workout plans and real-time performance tracking. Volt Fitness aims to bridge the gap between professional coaching and at-home training, offering users a comprehensive suite of tools to measure their progress, adjust their goals, and stay motivated through a sleek, gamified user interface.',
      challenge: 'Creating an intuitive user interface that could display complex workout data without overwhelming the user during active training sessions. Athletes need immediate visual feedback and frictionless data entry while mid-workout, meaning the interface had to be highly legible in various lighting conditions, responsive to touch interactions with sweaty hands, and fast enough to never interrupt the flow of a workout.',
      solution: 'Developed a streamlined, high-contrast UI tailored for gym environments with quick-access logging and video demonstrations. We utilized React Native to ensure a native-level performance across both iOS and Android platforms, integrating Redux for robust offline state management and real-time synchronization with AWS once a connection is re-established.',
      results: ['Increased Daily Active Users', 'Seamless User Onboarding', 'High App Store Rating'],
      techStack: ['React Native', 'TypeScript', 'Redux', 'Node.js', 'PostgreSQL', 'AWS'],
      mockups: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
      ],
      link: 'https://resplendent-bonbon-288501.netlify.app/#home'
    },
    '3': {
      title: 'Osteria Roasters',
      metaDescription: 'A narrative-driven Shopify storefront for Osteria Coffee Co. â€” editorial product pages, direct-trade origin stories, and a frictionless subscription checkout experience.',
      client: 'Osteria Coffee Co.',
      role: 'Creative Developer',
      duration: '2 Weeks',
      image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?fm=webp&auto=format&fit=crop&q=80&w=2000',
      overview: 'An artisanal coffee shop digital experience offering seamless online ordering and subscription management. Osteria Roasters is dedicated to sourcing the finest ethically grown beans, and their website needed to reflect this commitment to quality, transparency, and craft through a beautifully designed, narrative-driven e-commerce environment.',
      challenge: 'Merging an e-commerce platform with the authentic, rustic storytelling of an independent coffee roaster. The challenge lay in balancing the transactional nature of an online store with rich editorial content that educates the customer on tasting notes, roast profiles, and the direct-trade origins of each specific coffee bean.',
      solution: 'Implemented a bespoke Shopify storefront with custom React components, focusing on product origin stories and smooth checkout. By leveraging a headless commerce approach, we created immersive, editorial-style product pages that guide the user through the sensory journey of the coffee, ultimately leading to a frictionless subscription sign-up process.',
      results: ['Boosted Monthly Subscriptions', 'Reduced Cart Abandonment', 'Rich Brand Storytelling'],
      techStack: ['Shopify', 'Liquid', 'React', 'Tailwind CSS', 'Framer Motion'],
      mockups: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
      ],
      link: 'https://serene-bombolone-4f49d1.netlify.app/brew'
    },
    '4': {
      title: 'Game Changers Gear',
      metaDescription: 'A custom uniform e-commerce platform for Game Changers Gear â€” visual configurator, bulk order management, and Stripe-powered checkout built on Next.js and Supabase.',
      client: 'Game Changers',
      role: 'Lead Designer & Developer',
      duration: '2 Weeks',
      image: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?fm=webp&auto=format&fit=crop&q=80&w=2000',
      overview: 'A high-performance e-commerce storefront for custom baseball and softball uniforms. Game Changers Gear caters to professional, collegiate, and amateur teams, requiring a highly specialized platform that can handle complex bulk orders, custom team colors, player rosters, and unique uniform configurations within a single intuitive interface.',
      challenge: 'The client needed a way for teams to easily visualize custom uniform options and submit bulk orders seamlessly. Previously, the order process was heavily manual and prone to errors. The new platform had to support a visual configurator, manage complex pricing tiers for bulk orders, and integrate directly with the manufacturing facilityâ€™s production pipeline.',
      solution: 'Developed a robust e-commerce platform with a dynamic gallery, custom order forms, and an integrated sizing guide. We built a powerful frontend using Next.js and Tailwind CSS, coupled with a serverless backend powered by Supabase and Stripe. This allowed us to automate the entire sales funnel, from custom design conceptualization to secure payment processing and order fulfillment.',
      results: ['Increased Bulk Order Efficiency', 'Enhanced Visual Product Presentation', 'Optimized User Journey'],
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe', 'Supabase', 'Vercel'],
      mockups: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fm=webp&auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&auto=format&fit=crop&q=80&w=1200'
      ],
      link: 'https://www.gamechangersgear.com/'
    }
  };

  const caseStudy = id && projectsData[id] ? projectsData[id] : {
    title: `Project Not Found`,
    client: '-',
    role: '-',
    duration: '-',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?fm=webp&auto=format&fit=crop&q=80&w=2000',
    overview: 'This project could not be found.',
    challenge: '-',
    solution: '-',
    results: [],
    techStack: [],
    mockups: [],
    link: '#'
  };

  useSEO(
    `${caseStudy.title} Case Study | Canvex Studio`,
    caseStudy.metaDescription ?? `${caseStudy.overview.slice(0, 140)}...`
  );

  return (
    <main className="min-h-screen pt-32 pb-20 bg-[#030303] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <Link to="/#work" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all mb-12 uppercase tracking-widest text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-8 uppercase text-white">
            {caseStudy.title}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pt-8 border-t border-white/10">
            <div>
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Client</h4>
              <p className="font-medium text-sm text-white/80">{caseStudy.client}</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Role</h4>
              <p className="font-medium text-sm text-white/80">{caseStudy.role}</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Duration</h4>
              <p className="font-medium text-sm text-white/80">{caseStudy.duration}</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Live Link</h4>
              <a href={caseStudy.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-sm text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">
                View Site <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full h-[60vh] md:h-[80vh] mb-20"
      >
        <img src={caseStudy.image} alt="Project Hero" className="w-full h-full object-cover" />
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-20 relative z-10">
        <section>
          <h3 className="text-2xl font-display font-bold mb-6 uppercase text-white">Overview</h3>
          <p className="text-white/70 font-light text-lg leading-relaxed">{caseStudy.overview}</p>
        </section>

        <section>
          <h3 className="text-2xl font-display font-bold mb-6 uppercase text-white">The Challenge</h3>
          <p className="text-white/70 font-light text-lg leading-relaxed">{caseStudy.challenge}</p>
        </section>

        <section>
          <h3 className="text-2xl font-display font-bold mb-6 uppercase text-white">The Solution</h3>
          <p className="text-white/70 font-light text-lg leading-relaxed">{caseStudy.solution}</p>
        </section>

        <section>
          <h3 className="text-2xl font-display font-bold mb-8 uppercase text-white">Key Results</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudy.results.map((result: string, idx: number) => (
              <li key={idx} className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex items-center justify-center text-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <span className="font-display font-bold text-xl uppercase text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">{result}</span>
              </li>
            ))}
          </ul>
        </section>

        {caseStudy.techStack && caseStudy.techStack.length > 0 && (
          <section>
            <h3 className="text-2xl font-display font-bold mb-8 uppercase text-white">Tech Stack</h3>
            <div className="flex flex-wrap gap-4">
              {caseStudy.techStack.map((tech: string, idx: number) => (
                <span key={idx} className="px-6 py-3 rounded-full border border-white/20 text-white/80 font-medium text-sm tracking-wide bg-white/5 hover:bg-white/10 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}


      </div>
    </main>
  );
}

