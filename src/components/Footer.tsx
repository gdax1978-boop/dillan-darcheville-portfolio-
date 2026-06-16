import React from 'react';

import { Link } from 'react-router-dom';



export default function Footer() {
  return (
    <footer className="bg-[#030303] py-20 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-end border-b border-white/10 pb-20 mb-12">
          <div>
            <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-12 uppercase">
              STAY <br /> CONNECTED.
            </h2>
            <div className="flex flex-col gap-6">
              <a
                href="mailto:canvexstudio@gmail.com"
                className="text-2xl md:text-4xl font-serif italic border-b border-[#00F0FF]/30 hover:border-[#00F0FF] hover:text-[#00F0FF] hover:shadow-[0_4px_20px_rgba(0,240,255,0.3)] transition-all pb-2 w-fit"
              >
                canvexstudio@gmail.com
              </a>

            </div>
          </div>

          <div className="md:justify-self-end">
            <div className="grid grid-cols-2 gap-12 text-sm">
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-white/50">Navigation</h3>
                <div className="flex flex-col gap-2 text-white/80">
                  <Link to="/" className="hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">Home</Link>
                  <Link to="/#work" className="hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">Work</Link>
                  <Link to="/#services" className="hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">Services</Link>
                  <Link to="/#about" className="hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">About</Link>
                  <Link to="/blog" className="hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">Blog</Link>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-white/50">Work</h3>
                <div className="flex flex-col gap-2 text-white/80 text-xs font-light">
                  <Link to="/case-study/1" className="hover:text-[#00F0FF] transition-colors">Lumina Real Estate</Link>
                  <Link to="/case-study/2" className="hover:text-[#00F0FF] transition-colors">Volt Fitness</Link>
                  <Link to="/case-study/3" className="hover:text-[#00F0FF] transition-colors">Osteria Roasters</Link>
                  <Link to="/case-study/4" className="hover:text-[#00F0FF] transition-colors">Game Changers Gear</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/50 font-medium uppercase tracking-widest">
          <div>© {new Date().getFullYear()} DILLAN DARCHEVILLE. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-8 italic">
            <span>Built with Intention</span>
            <span>2026 GOLD STANDARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
