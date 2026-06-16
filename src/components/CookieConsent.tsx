import React, { useState, useEffect } from 'react';

const KEY = 'cookie_consent';

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      setTimeout(() => {
        setMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      }, 1500);
    }
  }, []);

  const dismiss = (value: string) => {
    localStorage.setItem(KEY, value);
    setShown(false);
    setTimeout(() => setMounted(false), 350);
  };

  if (!mounted) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className={`fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100%-3rem)] md:w-auto rounded-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-5 transition-all duration-300 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF] mb-2">Cookie Notice</p>
      <p className="text-sm text-white/70 font-light leading-relaxed mb-4">
        We use analytics cookies to improve your experience. You can accept or decline non-essential cookies.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => dismiss('accepted')}
          className="flex-1 py-2.5 bg-[#00F0FF] text-black text-sm font-semibold rounded-full hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all focus-visible:ring-2 focus-visible:ring-white"
        >
          Accept All
        </button>
        <button
          onClick={() => dismiss('declined')}
          className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-light rounded-full hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
