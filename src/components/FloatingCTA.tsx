import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, X } from 'lucide-react';

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!dismissed) setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-lg animate-float"
        >
          <div className="flex items-center justify-between gap-4 bg-[#0A0A0A]/90 backdrop-blur-xl text-white px-6 py-4 rounded-full border border-[#00F0FF]/20 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            <p className="text-sm font-light leading-snug hidden sm:block">
              Ready to build something great?
            </p>
            <a
              href="#contact"
              onClick={() => setVisible(false)}
              className="flex items-center gap-2 bg-[#00F0FF] text-black px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-white"
            >
              <CalendarDays className="w-4 h-4" />
              Book a Free Call
            </a>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-white/60 hover:text-white transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
