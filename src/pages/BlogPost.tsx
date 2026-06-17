import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

const POSTS: Record<string, { title: string; seoTitle: string; description: string; date: string; category: string; readTime: string; image: string; content: string }> = {
  '1': {
    title: 'The Future of Glassmorphism in UI Design',
    seoTitle: 'Glassmorphism in UI Design | Canvex Studio',
    description: 'How glassmorphism evolved from trend to foundational design language â€” and how to engineer performant backdrop-filter effects for layered, cinematic interfaces.',
    date: 'Apr 24, 2026',
    category: 'Design Trends',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      Glassmorphism has evolved from a fleeting trend into a foundational design language. By blending depth, transparency, and background blur, it mimics the physical properties of frosted glass in a digital environment.

      ## The Evolution of the Blur

      Initially, designers used it purely for aesthetic appeal. Now, we are seeing it used strategically to establish hierarchy. The blurred background draws focus to the foreground elements, creating a natural depth of field that guides the user's eye.

      ## Engineering the Effect

      Creating a performant glass effect requires careful consideration of CSS properties. The backdrop-filter property is powerful, but it can be computationally expensive. We must optimize our use of blur() and saturate() to ensure smooth rendering across all devices.

      ### Best Practices

      1.  **Subtle Backgrounds:** The background needs enough texture or color variation for the blur to be noticeable.
      2.  **Semi-transparent Borders:** A 1px white border with low opacity helps define the edge of the glass element.
      3.  **Accessibility First:** Ensure text contrast remains high, regardless of what's behind the glass panel.

      As we look to the future, glassmorphism will likely integrate further with 3D elements and spatial computing, creating interfaces that feel both grounded and ethereal.
    `
  },
  '2': {
    title: 'Engineering Flawless Micro-Interactions with Framer Motion',
    seoTitle: 'Micro-Interactions with Framer Motion | Canvex Studio',
    description: 'Micro-interactions are the invisible handshake between user and interface. A practical guide to building physics-based animations with Framer Motion that feel natural, not mechanical.',
    date: 'Apr 10, 2026',
    category: 'Development',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      Micro-interactions are the invisible handshake between user and interface. A button that pulses when hovered, a menu that slides with weight and momentum â€” these moments define whether a product feels crafted or commodity.

      ## Why Motion Matters

      Users don't consciously register most micro-interactions, but they feel their absence immediately. Motion communicates state: something loading, something saved, something gone. Without it, interfaces feel brittle and lifeless.

      ## The Framer Motion Approach

      Framer Motion's declarative API makes complex animations approachable. The useSpring hook is particularly powerful for physics-based motion that feels natural rather than mechanical.

      ### Core Patterns

      1.  **Staggered Lists:** Animate children with staggerChildren to guide the eye through content reveals.
      2.  **Layout Animations:** Use the layout prop to automatically animate between different states without calculating positions manually.
      3.  **Exit Animations:** AnimatePresence enables components to animate out before unmounting â€” critical for smooth transitions.

      The goal is always restraint. Motion should serve communication, not distract from it.
    `
  },
  '3': {
    title: 'Why Typography is the Backbone of Minimalist Portfolios',
    seoTitle: 'Typography in Minimalist Portfolios | Canvex Studio',
    description: 'Typography is the single most powerful tool a designer has. Before color or imagery, the choice of typeface sets the entire emotional register of a design.',
    date: 'Mar 28, 2026',
    category: 'Typography',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      Typography is the single most powerful tool a designer has. Before color, before imagery, before layout â€” the choice of typeface sets the emotional register of everything that follows.

      ## The Hierarchy Principle

      Minimalist portfolios succeed or fail on typographic hierarchy. When there's nothing else to fall back on, the relationship between heading weight, body size, and line height must do the heavy lifting. A strong display font paired with a quiet body type creates contrast without visual noise.

      ## Choosing the Right Pair

      The best pairings share DNA without matching. A geometric sans-serif headline with a humanist body creates intellectual tension that keeps the reader engaged. Avoid pairing two fonts with similar personalities â€” they compete rather than complement.

      ### Rules Worth Breaking

      1.  **Size contrast:** Headlines should be dramatically larger than body text â€” not just slightly.
      2.  **Weight contrast:** If both fonts are the same weight, the hierarchy collapses.
      3.  **Whitespace:** Leading and letter-spacing are as important as the typeface itself.

      Typography is architecture. Get the structure right, and everything else finds its place.
    `
  },
  '4': {
    title: 'Building Performant WebGL Experiences in React',
    seoTitle: 'WebGL Experiences in React | Canvex Studio',
    description: 'WebGL is the frontier of web experience. A deep dive into integrating Three.js with React Three Fiber to build immersive, performant 3D scenes in the browser.',
    date: 'Mar 15, 2026',
    category: 'Creative Coding',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      WebGL is the frontier of web experience â€” immersive, performant, and deeply engaging when done right. Integrating it into a React application requires a thoughtful architecture that separates the rendering loop from the component tree.

      ## The Canvas Problem

      React's rendering model is declarative and diffed. WebGL's rendering model is imperative and continuous. Bridging these two paradigms is the central challenge of building WebGL experiences in React.

      ## Three.js and React Three Fiber

      React Three Fiber (R3F) solves this elegantly by wrapping Three.js in a React-idiomatic API. Components become meshes, hooks control the animation loop, and the entire scene graph is declaratively managed.

      ### Performance Priorities

      1.  **Instanced Meshes:** Render thousands of objects with a single draw call using InstancedMesh.
      2.  **Frustum Culling:** Three.js handles this automatically, but understanding it helps you structure scenes efficiently.
      3.  **Texture Compression:** Use KTX2/Basis compressed textures to reduce GPU memory and load time dramatically.

      The web can render cinematic 3D experiences. The constraint is discipline â€” knowing when the complexity earns its weight.
    `
  },
  '5': {
    title: 'The Psychology of Color in Luxury Branding',
    seoTitle: 'Color Psychology in Luxury Branding | Canvex Studio',
    description: 'Color transmits an emotional signal before a single word is read. How luxury brands use restraint, saturation, and palette precision to signal exclusivity and premium positioning.',
    date: 'Feb 20, 2026',
    category: 'Art Direction',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      Color is the fastest communicator in a designer's toolkit. Before a single word is read, before the layout is parsed, color has already transmitted an emotional signal. In luxury branding, that signal must be precise.

      ## The Language of Restraint

      Luxury brands rarely use many colors. The Chanel palette is black, white, and beige. Rolex leans on gold and green. This restraint is intentional â€” scarcity of color signals exclusivity, just as scarcity of product does.

      ## Saturation as Status

      High saturation reads as accessible and energetic â€” think fast food, children's toys, sports brands. Low saturation reads as refined and considered. For luxury positioning, desaturating your palette even slightly shifts perception dramatically toward premium.

      ### Strategic Color Choices

      1.  **Deep Navy:** Projects authority and trust without the aggression of black.
      2.  **Warm Champagne:** Signals wealth and warmth â€” more approachable than cold gold.
      3.  **Charcoal over Black:** Pure black can feel harsh; charcoal retains sophistication with more nuance.

      Color doesn't just describe a brand â€” it defines how it feels to inhabit one.
    `
  }
};

export default function BlogPost() {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const post = POSTS[id ?? '1'] ?? POSTS['1'];
  useSEO(post.seoTitle, post.description);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "datePublished": post.date,
    "author": { "@type": "Person", "name": "Dillan Darcheville" },
    "publisher": { "@type": "Organization", "name": "Canvex Studio" },
    "image": post.image,
    "articleSection": post.category,
  };

  return (
    <main className="min-h-screen pt-32 pb-20 bg-[#030303] text-white relative overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">
        <Link to="/#blog" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all mb-12 uppercase tracking-widest text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Insights
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
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
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
      </div>
    </main>
  );
}

