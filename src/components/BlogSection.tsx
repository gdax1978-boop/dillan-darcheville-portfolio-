import { motion } from 'motion/react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const POSTS = [
  {
    id: 1,
    title: 'The Future of Glassmorphism in UI Design',
    date: 'Apr 24, 2026',
    category: 'Design Trends',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?fm=webp&auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 2,
    title: 'Engineering Flawless Micro-Interactions with Framer Motion',
    date: 'Apr 10, 2026',
    category: 'Development',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?fm=webp&auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 3,
    title: 'Why Typography is the Backbone of Minimalist Portfolios',
    date: 'Mar 28, 2026',
    category: 'Typography',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?fm=webp&auto=format&fit=crop&q=80&w=800',
  }
];

export default function BlogSection() {
  return (
    <section id="blog" aria-label="Blog" className="py-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6 uppercase text-white">INSIGHTS</h2>
          <p className="text-white/70 font-light text-lg">Thoughts, technical deep dives, and reflections on design and engineering.</p>
        </div>
        <Link to="/blog" className="text-[#00F0FF] font-medium flex items-center gap-2 group cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all">
          Read All Articles <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={450}
                  srcSet={`${post.image.replace('w=800', 'w=400')} 400w, ${post.image} 800w`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3 text-xs font-bold uppercase tracking-widest text-[#00F0FF]">
                  <span>{post.category}</span>
                  <span className="text-white/50">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-display font-bold mb-4 uppercase text-white group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all leading-tight">{post.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 font-light text-sm">{post.date}</span>
                  <ArrowUpRight className="w-5 h-5 text-[#00F0FF] opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 drop-shadow-[0_0_8px_#00F0FF] transition-all duration-300" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
