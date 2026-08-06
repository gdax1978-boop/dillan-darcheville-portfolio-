import React, { useRef, useEffect } from 'react';
import { ArrowUpRight, CalendarDays, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Spotlight } from '@/src/components/ui/spotlight';
import { ShimmerButton } from '@/src/components/ui/shimmer-button';
import HeroReel from './HeroReel';

const STATS = [
  { value: '2 Wks', label: 'Avg. Turnaround' },
  { value: '100%', label: 'Client Satisfaction' },
  { value: 'Global', label: 'Clientele' },
];


function MagneticButton({ href, children, primary }: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseEnter = () => {
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current || !rectRef.current) return;
    const rect = rectRef.current;
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
    ref.current.style.transition = 'transform 0.1s ease';
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    rectRef.current = null;
    ref.current.style.transform = 'translate(0, 0)';
    ref.current.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
  };

  return primary ? (
    <a
      ref={ref}
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative px-8 py-4 bg-accent text-black rounded-full font-medium overflow-hidden transition-shadow flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] focus-visible:ring-2 focus-visible:ring-accent"
      style={{ display: 'inline-flex', willChange: 'transform' }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    </a>
  ) : (
    <a
      ref={ref}
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group px-8 py-4 border border-white/10 rounded-full font-medium hover:bg-white/5 transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-accent"
      style={{ display: 'inline-flex', willChange: 'transform' }}
    >
      {children}
    </a>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-title', { y: 60, opacity: 0, duration: 1, skewY: 3 })
        .from('.hero-sub', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('.hero-stats > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.3');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} aria-label="Hero" className="relative min-h-screen flex flex-col items-center px-6 overflow-hidden bg-[#030303]">
      {/* Cinematic case-study reel, docks into the Work section on scroll */}
      <HeroReel />

      {/* Dark gradient overlay to keep text readable (above the reel). Stronger on
          mobile where the reel fills the screen behind the copy. */}
      <div className="absolute inset-0 z-[13] bg-gradient-to-b from-[#030303]/70 via-[#030303]/25 to-[#030303]/90 md:from-[#030303]/50 md:via-[#030303]/10 md:to-[#030303]/70 pointer-events-none" />

      {/* Aceternity spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 z-[13]" fill="#00F0FF" />

      <div className="relative z-20 max-w-5xl w-full text-center mt-32 md:mt-44 mb-16 px-1">


        <h1 className="hero-title text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.95] tracking-tighter mb-6 md:mb-12 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          CRAFTING <br />
          <span className="text-shimmer italic font-serif font-light text-transparent bg-clip-text">Digital</span> <br />
          LEGACIES.
        </h1>

        <p className="hero-sub text-base sm:text-lg md:text-xl text-white max-w-md md:max-w-2xl mx-auto font-normal leading-relaxed mb-8 md:mb-12 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
          An independent studio building fast, striking websites for brands
          that want to stand out.
        </p>

        <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-12 md:mb-20">
          <a href="#contact">
            <ShimmerButton
              shimmerColor="#00F0FF"
              background="rgba(0,240,255,0.08)"
              borderRadius="100px"
              className="px-8 py-4 font-medium text-white border-[#00F0FF]/30 hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] transition-shadow"
            >
              <CalendarDays className="w-4 h-4 mr-2 inline" />
              Book a Free Call
            </ShimmerButton>
          </a>
          <MagneticButton href="#work">
            Explore Projects
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-accent" />
          </MagneticButton>
          <Link
            to="/free-audit"
            className="group px-8 py-4 border border-[#00F0FF]/30 rounded-full font-medium text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all flex items-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-accent"
            style={{ display: 'inline-flex' }}
          >
            <Zap className="w-4 h-4" />
            Free Site Audit
          </Link>
        </div>

        {/* Stats row, compact 3-across on mobile, roomier on desktop */}
        <div className="hero-stats grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] max-w-md md:max-w-none mx-auto">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-[#0A0A0A]/85 backdrop-blur-sm px-2 py-4 md:px-6 md:py-5 flex flex-col items-center gap-1 hover:bg-[#0A0A0A] transition-colors">
              <span className="text-lg md:text-2xl font-display font-bold tracking-tight text-white">{value}</span>
              <span className="text-[9px] md:text-xs text-white/50 font-light uppercase tracking-wider md:tracking-widest text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 text-muted pointer-events-none">
        <div className="scroll-caret w-px h-12 bg-gradient-to-b from-accent to-transparent shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
      </div>
    </section>
  );
}
