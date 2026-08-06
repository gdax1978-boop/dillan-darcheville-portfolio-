import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';
import { POSTS as ALL_POSTS } from '../data/posts';

// Card data derived from the canonical post list so titles, dates, and URLs
// can never drift from src/data/posts.ts.
const POSTS = Object.values(ALL_POSTS).map((p) => ({
  slug: p.slug,
  title: p.title,
  date: p.date,
  category: p.category,
  readTime: p.readTime,
  image: p.image.replace('w=2000', 'w=800'),
}));

export default function BlogIndex() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.canvexstudio.com/' },
        { '@type': 'ListItem', position: 2, name: 'Journal', item: 'https://www.canvexstudio.com/blog' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': 'https://www.canvexstudio.com/blog',
      name: 'The Journal, Canvex Studio',
      description: 'Design and development insights by Dillan Darcheville. Topics include UI design, web engineering, typography, motion design, and creative direction.',
      url: 'https://www.canvexstudio.com/blog',
      publisher: {
        '@type': 'Organization',
        name: 'Canvex Studio',
        url: 'https://www.canvexstudio.com',
        logo: { '@type': 'ImageObject', url: 'https://www.canvexstudio.com/dillan-profile.webp' },
      },
      author: {
        '@type': 'Person',
        name: 'Dillan Darcheville',
        url: 'https://www.canvexstudio.com/',
        jobTitle: 'Web Designer & Developer',
        address: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY', addressCountry: 'US' },
      },
      blogPost: POSTS.map(p => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `https://www.canvexstudio.com/blog/${p.slug}`,
        image: p.image,
        articleSection: p.category,
        timeRequired: p.readTime,
        author: { '@type': 'Person', name: 'Dillan Darcheville' },
      })),
    },
  ];

  useSEO(
    'The Journal | Canvex Studio: Design & Development Insights',
    'Web design and development insights by Dillan Darcheville of Canvex Studio, New York. Deep dives on UI design, React engineering, and creative direction.',
    '/blog',
    schemas
  );
  useEffect(() => {
    window.scrollTo(0, 0);
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = POSTS[0].image;
    preload.setAttribute('fetchpriority', 'high');
    document.head.appendChild(preload);
    return () => { document.head.removeChild(preload); };
  }, []);

  return (
    <main className="min-h-screen pt-32 pb-20 bg-[#030303] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 mb-8 font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Journal</span>
        </nav>

        <div className="max-w-3xl mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-8 uppercase text-white"
          >
            THE <br /> JOURNAL.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 font-light text-xl leading-relaxed"
          >
            Thoughts, technical deep dives, and reflections on design, engineering, and the digital landscape.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POSTS.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group block cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-[#00F0FF]/50 transition-all duration-300 bg-white/[0.02]"
            >
              <Link to={`/blog/${post.slug}`}>
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    width={800}
                    height={450}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    srcSet={`${post.image.replace('w=800', 'w=400')} 400w, ${post.image} 800w`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3 text-xs font-bold uppercase tracking-widest text-[#00F0FF]">
                    <span>{post.category}</span>
                    <span className="text-white/50">{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-display font-bold mb-4 uppercase text-white group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all leading-tight">{post.title}</h2>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 font-light text-sm">{post.date}</span>
                    <ArrowUpRight className="w-5 h-5 text-[#00F0FF] opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 drop-shadow-[0_0_8px_#00F0FF] transition-all duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

