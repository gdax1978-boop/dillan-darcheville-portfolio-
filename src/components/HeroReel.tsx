import { useEffect, useRef, useState } from 'react';

/**
 * HeroReel: a cinematic, letterboxed (2.39:1) showreel of the four case studies.
 * Hard-cuts between shots every ~2.5s with a slow push-in, film grain, and a small
 * project-name label. On scroll it scales down and docks into a glass card that
 * lands in the Work section (#reel-dock), so the hero literally becomes the portfolio.
 *
 * The dock morph is desktop-only; mobile / reduced-motion get a static reel.
 */

const SHOTS = [
  { id: 1, title: 'Lumina Real Estate', category: 'Real Estate · Luxury',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=webp&auto=format&fit=crop&q=80&w=1600' },
  { id: 2, title: 'Volt Fitness', category: 'Fitness · Lifestyle',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fm=webp&auto=format&fit=crop&q=80&w=1600' },
  { id: 3, title: 'Osteria Roasters', category: 'E-Commerce · Coffee',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?fm=webp&auto=format&fit=crop&q=80&w=1600' },
  { id: 4, title: 'Game Changers Gear', category: 'E-Commerce · Sports',
    image: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?fm=webp&auto=format&fit=crop&q=80&w=1600' },
];

const SHOT_MS = 2500;

// Inline SVG film-grain (fractal noise) as a data URI: no network request.
const GRAIN = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
     <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>
     <rect width='100%' height='100%' filter='url(#n)' opacity='0.5'/>
   </svg>`
);

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export default function HeroReel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const botBarRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [shot, setShot] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Track mobile so we can swap hard cuts for smooth crossfades on small screens.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Advance shots (hard cut).
  useEffect(() => {
    const id = setInterval(() => setShot(s => (s + 1) % SHOTS.length), SHOT_MS);
    return () => clearInterval(id);
  }, []);

  // Preload all shot images so cuts are instant.
  useEffect(() => {
    SHOTS.forEach(s => { const img = new Image(); img.src = s.image; });
  }, []);

  // Single rAF loop drives the scroll-dock morph. Running every frame keeps the reel
  // glued to the dock's live position, which is robust under smooth-scroll libraries
  // (Lenis) where scroll events are unreliable.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const frame = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dock = document.getElementById('reel-dock');
      const enabled = vw >= 1024 && !reduced;

      if (!enabled || !dock) {
        // Mobile / reduced motion: an immersive full-bleed reel scoped to the hero
        // (absolute so it scrolls away). No thin 2.39:1 letterbox strip on tall
        // phones: the image fills the screen for a premium, edge-to-edge feel.
        Object.assign(wrap.style, { position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%', borderRadius: '0px', boxShadow: 'none', borderColor: 'transparent' });
        if (topBarRef.current) topBarRef.current.style.height = '0px';
        if (botBarRef.current) botBarRef.current.style.height = '0px';
        if (hudRef.current) hudRef.current.style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + 20px)';
      } else {
        // Morph from full-bleed toward the dock's live viewport rect.
        wrap.style.position = 'fixed';
        const D = dock.getBoundingClientRect();
        const p = easeInOut(clamp01((vh - D.top) / (vh * 0.65)));
        const top = D.top * p;
        const left = D.left * p;
        const width = vw + (D.width - vw) * p;
        const height = vh + (D.height - vh) * p;
        Object.assign(wrap.style, {
          top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px`,
          borderRadius: `${24 * p}px`,
          boxShadow: p > 0.02 ? `0 40px 120px -20px rgba(0,0,0,${0.7 * p})` : 'none',
          borderColor: `rgba(255,255,255,${0.12 * p})`,
        });
        const bar = Math.max(0, (vh - vw / 2.39) / 2) * (1 - p);
        if (topBarRef.current) topBarRef.current.style.height = `${bar}px`;
        if (botBarRef.current) botBarRef.current.style.height = `${bar}px`;
        if (hudRef.current) hudRef.current.style.bottom = p > 0.6 ? '14px' : 'clamp(80px, 14vh, 160px)';
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const current = SHOTS[shot];

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="fixed left-0 top-0 z-[12] overflow-hidden pointer-events-none border border-transparent bg-black"
      style={{ width: '100vw', height: '100vh', willChange: 'width,height,top,left' }}
    >
      {/* Shots, hard cut, slow push-in */}
      {SHOTS.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === shot ? 1 : 0,
            transform: i === shot ? 'scale(1.08)' : 'scale(1.0)',
            // Desktop: hard cinematic cut. Mobile: smooth crossfade for a premium feel.
            transition: i === shot
              ? `transform ${SHOT_MS + 600}ms ease-out, opacity ${isMobile ? 900 : 60}ms ease`
              : `opacity ${isMobile ? 900 : 60}ms ease`,
            filter: 'saturate(1.05) contrast(1.05)',
          }}
        />
      ))}

      {/* Cinematic color grade + vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 120% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{ background: 'linear-gradient(120deg, rgba(0,240,255,0.10), rgba(0,0,0,0) 45%, rgba(120,0,180,0.10))' }} />

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.14] mix-blend-overlay grain-flicker"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: '140px 140px' }} />

      {/* Letterbox bars */}
      <div ref={topBarRef} className="absolute top-0 left-0 w-full bg-black z-20" style={{ height: 0 }} />
      <div ref={botBarRef} className="absolute bottom-0 left-0 w-full bg-black z-20" style={{ height: 0 }} />

      {/* HUD, mono, inside the frame */}
      <div ref={hudRef} className="absolute z-30 flex items-center justify-between font-mono uppercase tracking-widest text-[10px] md:text-xs text-white/85"
        style={{ left: 'clamp(16px, 4vw, 48px)', right: 'clamp(16px, 4vw, 48px)', bottom: 'clamp(80px, 14vh, 160px)' }}>
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline text-white/70">{current.title}</span>
          <span className="hidden md:inline text-white/40">· {current.category}</span>
        </span>
      </div>
    </div>
  );
}
