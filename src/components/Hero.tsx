import React, { useRef, useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';

const STATS = [
  { value: '2 Wks', label: 'Avg. Turnaround' },
  { value: '100%', label: 'Client Satisfaction' },
  { value: 'Global', label: 'Clientele' },
];

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: 'Good Morning — Available for New Projects', pulse: true };
  if (h >= 12 && h < 18) return { text: 'Available for New Projects', pulse: true };
  if (h >= 18 && h < 22) return { text: 'Taking Evening Inquiries', pulse: true };
  return { text: 'Available — Replies by Morning EST', pulse: false };
}

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
  const [greeting, setGreeting] = useState(getTimeGreeting());

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getTimeGreeting()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center px-6 overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="hero-orb-1 absolute top-1/4 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-[#00F0FF]/20 to-purple-900/10 rounded-full blur-[100px]" />
        <div className="hero-orb-2 absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-purple-900/20 to-[#00F0FF]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full text-center mt-44 mb-16">

        {/* Time-aware availability badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/5 text-[#00F0FF] text-xs font-semibold uppercase tracking-widest mb-10 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
          <span className={`w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] ${greeting.pulse ? 'animate-pulse' : ''}`} />
          {greeting.text}
        </div>

        <h1 className="hero-title text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-none tracking-tighter mb-12 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          CRAFTING <br />
          <span className="text-shimmer italic font-serif font-light text-transparent bg-clip-text">Digital</span> <br />
          LEGACIES.
        </h1>

        <p className="hero-sub text-lg md:text-xl text-muted max-w-2xl mx-auto font-light leading-relaxed mb-12">
          An independent design & development studio focused on creating immersive
          digital experiences that blend technical excellence with cinematic aesthetics.
        </p>

        <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
          <MagneticButton href="#contact" primary>
            <CalendarDays className="w-4 h-4" />
            Book a Free Call
          </MagneticButton>
          <MagneticButton href="#work">
            Explore Projects
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-accent" />
          </MagneticButton>
        </div>

        {/* Stats row */}
        <div className="hero-stats grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-[#0A0A0A]/80 backdrop-blur-sm px-6 py-5 flex flex-col items-center gap-1 hover:bg-[#0A0A0A] transition-colors">
              <span className="text-2xl font-display font-bold tracking-tight text-white">{value}</span>
              <span className="text-xs text-muted font-light uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted pointer-events-none">
        <div className="scroll-caret w-px h-12 bg-gradient-to-b from-accent to-transparent shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
      </div>
    </section>
  );
}
