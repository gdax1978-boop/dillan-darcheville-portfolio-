import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { POSTS } from '../data/posts';
import { findPost } from '../data/lookup';
import { blogPostSchemas } from '../data/schemas';
import NotFound from '../components/NotFound';

export default function BlogPost() {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const found = findPost(id);
  const notFound = !found;
  const post = found ?? POSTS['1'];

  const [articleSchema, breadcrumbSchema] = blogPostSchemas(post);

  useSEO(
    notFound ? 'Article Not Found | Canvex Studio' : post.seoTitle,
    notFound
      ? 'This article could not be found. Browse the Canvex Studio journal for writing on web design and development.'
      : post.description,
    notFound ? undefined : `/blog/${post.slug}`,
    notFound ? undefined : [articleSchema, breadcrumbSchema],
    notFound ? undefined : post.image,
    'article',
    notFound
  );

  if (notFound) {
    return <NotFound kind="article" backTo="/blog" backLabel="Back to the Journal" />;
  }

  return (
    <main className="min-h-screen pt-32 pb-20 bg-[#030303] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 mb-6 font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-[#00F0FF] transition-colors">Journal</Link>
          <span>/</span>
          <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <Link to="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all mb-8 uppercase tracking-widest text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#00F0FF] mb-6">
            <span className="drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">{post.category}</span>
            <span className="w-1 h-1 rounded-full bg-white/30"></span>
            <span className="flex items-center gap-1 text-white/60"><Clock className="w-3 h-3" /> {post.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8 uppercase text-white">
            {post.title}
          </h1>

          <p className="text-white/60 font-medium mb-12">{post.date}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full h-[50vh] md:h-[70vh] mb-16 max-w-5xl mx-auto rounded-3xl overflow-hidden"
      >
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="eager" decoding="async" />
      </motion.div>

      <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">
        <div className="prose prose-invert prose-lg prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-a:text-[#00F0FF] hover:prose-a:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
          {post.content.split('\n').map((paragraph, idx) => {
            if (paragraph.trim().startsWith('## ')) {
              return <h2 key={idx} className="text-3xl font-bold mt-12 mb-6 text-white">{paragraph.replace('## ', '')}</h2>;
            }
            if (paragraph.trim().startsWith('### ')) {
              return <h3 key={idx} className="text-2xl font-bold mt-8 mb-4 text-white">{paragraph.replace('### ', '')}</h3>;
            }
            if (paragraph.trim().startsWith('1.') || paragraph.trim().startsWith('2.') || paragraph.trim().startsWith('3.')) {
              return <p key={idx} className="font-medium text-[#00F0FF] ml-4 drop-shadow-[0_0_4px_rgba(0,240,255,0.3)]">{paragraph}</p>;
            }
            if (paragraph.trim() !== '') {
              return <p key={idx} className="text-white/70 font-light leading-relaxed mb-6">{paragraph}</p>;
            }
            return null;
          })}
        </div>

        <div className="mt-20 pt-12 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div>
            <p className="text-white/50 text-sm font-light mb-1">Written by</p>
            <p className="text-white font-semibold">Dillan Darcheville</p>
            <p className="text-white/50 text-sm">Web Designer &amp; Developer, <span className="text-[#00F0FF]">Canvex Studio, New York</span></p>
          </div>
          <Link
            to="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00F0FF] text-black rounded-full font-medium text-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all whitespace-nowrap"
          >
            Start a Project
          </Link>
        </div>

        {/* Related posts */}
        <div className="mt-16">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6">More from the Journal</p>
          <div className="flex flex-col gap-3">
            {Object.entries(POSTS)
              .filter(([, p]) => p.slug !== post.slug)
              .slice(0, 3)
              .map(([id, p]) => (
                <Link
                  key={id}
                  to={`/blog/${p.slug}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#00F0FF]/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                >
                  <img src={p.image.replace('w=2000', 'w=120')} alt={p.title} width={60} height={60} className="w-14 h-14 object-cover rounded-lg shrink-0" loading="lazy" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#00F0FF] mb-1">{p.category}</p>
                    <p className="text-sm font-medium text-white group-hover:text-[#00F0FF] transition-colors leading-snug">{p.title}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
