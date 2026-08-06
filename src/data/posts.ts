// Blog post content. Imported by src/pages/BlogPost.tsx at runtime and by
// scripts/prerender.ts at build time. Keep free of React imports.

export const POSTS: Record<string, {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  date: string;
  isoDate: string;
  category: string;
  readTime: string;
  image: string;
  content: string;
}> = {
  '1': {
    slug: 'glassmorphism-in-ui-design',
    title: 'The Future of Glassmorphism in UI Design',
    seoTitle: 'Glassmorphism in UI Design 2026 | Canvex Studio',
    description: 'How glassmorphism evolved from trend to foundational design language, and how to engineer performant backdrop-filter effects for layered, cinematic interfaces.',
    date: 'Apr 24, 2026',
    isoDate: '2026-04-24',
    category: 'Design Trends',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      Glassmorphism started as a visual trend, but it stuck around because it solves a real problem: layering. Blur, transparency, and depth let you stack UI elements without hard edges cutting them apart, the way frosted glass does in the physical world.

      ## The Evolution of the Blur

      At first it was mostly decorative. Now designers use it more deliberately, as a way to separate foreground from background. A blurred layer behind a card pushes that card forward, so the eye lands on the right element without extra effort.

      ## Engineering the Effect

      Getting the effect to run smoothly takes some care. backdrop-filter looks great, but it's one of the more expensive CSS properties to paint. Keep your blur() and saturate() values modest so the effect still renders smoothly on lower-powered devices.

      ### Best Practices

      1.  **Subtle Backgrounds:** The background needs enough texture or color variation for the blur to be noticeable.
      2.  **Semi-transparent Borders:** A 1px white border with low opacity helps define the edge of the glass element.
      3.  **Accessibility First:** Ensure text contrast remains high, regardless of what's behind the glass panel.

      Handled carefully, glassmorphism is a solid tool for layering interfaces without hard edges. Handled carelessly, it's just blur for blur's sake.
    `
  },
  '2': {
    slug: 'micro-interactions-with-framer-motion',
    title: 'Engineering Flawless Micro-Interactions with Framer Motion',
    seoTitle: 'Micro-Interactions with Framer Motion | Canvex Studio',
    description: 'Micro-interactions are the invisible handshake between user and interface. A practical guide to building physics-based animations with Framer Motion that feel natural, not mechanical.',
    date: 'Apr 10, 2026',
    isoDate: '2026-04-10',
    category: 'Development',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      You don't consciously notice most micro-interactions. A button that pulses on hover, a menu that slides with actual weight to it, these are small details, but they're the difference between a product that feels crafted and one that feels assembled from a kit.

      ## Why Motion Matters

      You won't clock most micro-interactions as you use an app, but you'd notice fast if they disappeared. Motion is how an interface tells you something happened: a save went through, a step loaded, an item got removed. Strip it out and everything feels stiff.

      ## The Framer Motion Approach

      Framer Motion's declarative API turns what would be a mess of manual timing into a few lines of config. The useSpring hook in particular is worth learning: it produces motion that feels physical, not like a plain easing curve.

      ### Core Patterns

      1.  **Staggered Lists:** Animate children with staggerChildren to guide the eye through content reveals.
      2.  **Layout Animations:** Use the layout prop to automatically animate between different states without calculating positions manually.
      3.  **Exit Animations:** AnimatePresence enables components to animate out before unmounting, critical for smooth transitions.

      The goal is restraint. Motion should support what's happening on screen, not become the main event.
    `
  },
  '3': {
    slug: 'typography-in-minimalist-portfolios',
    title: 'Why Typography is the Backbone of Minimalist Portfolios',
    seoTitle: 'Typography in Minimalist Portfolios | Canvex Studio',
    description: 'Typography is the single most powerful tool a designer has. Before color or imagery, the choice of typeface sets the entire emotional register of a design.',
    date: 'Mar 28, 2026',
    isoDate: '2026-03-28',
    category: 'Typography',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      Typography does more work than people give it credit for. Before color, before imagery, before layout is even locked, the typeface you pick sets the tone for everything that follows.

      ## The Hierarchy Principle

      Minimalist portfolios live or die on hierarchy. With nothing else to lean on, the relationship between heading weight, body size, and line height has to carry the whole page. Pair a strong display font with a quiet body type and you get contrast without adding noise.

      ## Choosing the Right Pair

      The best pairings share some DNA without matching outright. A geometric sans headline over a humanist body font gives you tension that reads as interesting instead of clashing. Two fonts with the same personality just compete with each other.

      ### Rules Worth Breaking

      1.  **Size contrast:** Headlines should be dramatically larger than body text, not just slightly.
      2.  **Weight contrast:** If both fonts are the same weight, the hierarchy collapses.
      3.  **Whitespace:** Leading and letter-spacing are as important as the typeface itself.

      Get the size and weight contrast right, and most of the rest of the page takes care of itself.
    `
  },
  '4': {
    slug: 'webgl-experiences-in-react',
    title: 'Building Performant WebGL Experiences in React',
    seoTitle: 'WebGL Experiences in React | Canvex Studio',
    description: 'WebGL is the frontier of web experience. A deep dive into integrating Three.js with React Three Fiber to build immersive, performant 3D scenes in the browser.',
    date: 'Mar 15, 2026',
    isoDate: '2026-03-15',
    category: 'Creative Coding',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      WebGL lets you build genuinely immersive 3D scenes in the browser, but only if the architecture underneath is solid. Dropping it into a React app means keeping the render loop separate from the component tree, because the two don't share a mental model.

      ## The Canvas Problem

      React re-renders declaratively and diffs the result. WebGL just runs, continuously and imperatively, frame after frame. Making those two coexist is the real problem with WebGL in React.

      ## Three.js and React Three Fiber

      React Three Fiber wraps Three.js in an API that actually feels like React: components become meshes, hooks drive the animation loop, and the whole scene graph is managed declaratively instead of by hand.

      ### Performance Priorities

      1.  **Instanced Meshes:** Render thousands of objects with a single draw call using InstancedMesh.
      2.  **Frustum Culling:** Three.js handles this automatically, but understanding it helps you structure scenes efficiently.
      3.  **Texture Compression:** Use KTX2/Basis compressed textures to cut GPU memory and load time.

      3D in the browser can look genuinely cinematic. The hard part isn't the code, it's knowing when the extra complexity is worth it.
    `
  },
  '5': {
    slug: 'color-psychology-in-luxury-branding',
    title: 'The Psychology of Color in Luxury Branding',
    seoTitle: 'Color Psychology in Luxury Branding | Canvex Studio',
    description: 'Color transmits an emotional signal before a single word is read. How luxury brands use restraint, saturation, and palette precision to signal exclusivity and premium positioning.',
    date: 'Feb 20, 2026',
    isoDate: '2026-02-20',
    category: 'Art Direction',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?fm=webp&auto=format&fit=crop&q=80&w=2000',
    content: `
      Color moves faster than words. Before anyone reads a headline or parses a layout, the palette has already sent a signal. In luxury branding, that signal has to be exact.

      ## Why Luxury Brands Use Fewer Colors

      Luxury brands tend to stick to very few colors. Chanel: black, white, beige. Rolex: gold and green. That's not an accident, restraint reads as exclusivity here the same way a limited product run does.

      ## What Saturation Signals

      High saturation reads as accessible and energetic: think fast food, kids' toys, sports brands. Low saturation reads as considered and refined. Pull the saturation down even slightly and perception shifts hard toward premium.

      ### Strategic Color Choices

      1.  **Deep Navy:** Projects authority and trust without the aggression of black.
      2.  **Warm Champagne:** Signals wealth and warmth, more approachable than cold gold.
      3.  **Charcoal over Black:** Pure black can feel harsh; charcoal retains sophistication with more nuance.

      Get the color right and the brand feels expensive before anyone reads a word of copy.
    `
  }
};

export type Post = (typeof POSTS)[string];
