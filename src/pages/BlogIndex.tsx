import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';

const POSTS = [
  {
    id: 1,
    title: 'The Future of Glassmorphism in UI Design',
    date: 'Apr 24, 2026',
    category: 'Design Trends',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 2,
    title: 'Engineering Flawless Micro-Interactions with Framer Motion',
    date: 'Apr 10, 2026',
    category: 'Development',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 3,
    title: 'Why Typography is the Backbone of Minimalist Portfolios',
    date: 'Mar 28, 2026',
    category: 'Typography',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 4,
    title: 'Building Performant WebGL Experiences in React',
    date: 'Mar 15, 2026',
    category: 'Creative Coding',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 5,
    title: 'The Psychology of Color in Luxury Branding',
    date: 'Feb 20, 2026',
    category: 'Art Direction',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
  }
];

export default function BlogIndex() {
  useSEO(
    'The Journal | Canvex Studio — Design & Development Insights',
    'Thoughts, technical deep dives, and reflections on design, engineering, and the digital landscape by Dillan Darcheville.',
    '/blog'
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
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group block cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-[#00F0FF]/50 transition-all duration-300 bg-white/[0.02]"
            >
              <Link to={`/blog/${post.id}`}>
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
