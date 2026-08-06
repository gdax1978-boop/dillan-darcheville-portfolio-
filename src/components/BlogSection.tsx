import { motion } from 'motion/react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { POSTS as ALL_POSTS } from '../data/posts';

// Card data derived from the canonical post list so titles, dates, and URLs
// can never drift from src/data/posts.ts.
const POSTS = Object.values(ALL_POSTS).slice(0, 3).map((p) => ({
  slug: p.slug,
  title: p.title,
  date: p.date,
  category: p.category,
  readTime: p.readTime,
  image: p.image.replace('w=2000', 'w=800'),
}));

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
