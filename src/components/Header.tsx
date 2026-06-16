import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = ['Work', 'Services', 'About', 'Blog', 'Contact'];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const first = menuRef.current?.querySelector<HTMLElement>('a, button');
        first?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !menuRef.current) return;
      const focusable: HTMLElement[] = Array.from(
        menuRef.current.querySelectorAll('a[href], button:not([disabled])'),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMenuOpen(false);
    if (isHome) {
      e.preventDefault();
      const scrollToTarget = () => {
        const el = document.querySelector(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'instant' });
          window.history.pushState(null, '', targetId);
        } else {
          requestAnimationFrame(scrollToTarget);
        }
      };
      scrollToTarget();
    }
  };

  const navLinkClass = 'text-sm font-medium text-muted hover:text-accent transition-colors';

  const navLink = (item: string) => {
    if (item === 'Blog') {
      return (
        <Link key={item} to="/blog" onClick={() => setMenuOpen(false)} className={navLinkClass}>
          {item}
        </Link>
      );
    }
    const hash = `#${item.toLowerCase()}`;
    return isHome ? (
      <a key={item} href={hash} onClick={(e) => handleNavClick(e, hash)} className={navLinkClass}>
        {item}
      </a>
    ) : (
      <Link key={item} to={`/${hash}`} onClick={() => setMenuOpen(false)} className={navLinkClass}>
        {item}
      </Link>
    );
  };

  return (
    <>
      <header
        className={`header-slide-in fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className={`glass-dark px-6 py-3 rounded-full flex items-center gap-4 transition-all duration-500 ${
            scrolled ? 'shadow-[0_0_40px_rgba(0,240,255,0.1)]' : 'bg-transparent border-transparent'
          }`}>
            <Link to="/" className="text-xl font-display font-semibold tracking-tight uppercase">
              DILLAN DARCHEVILLE
            </Link>
            <div className="hidden md:block w-px h-4 bg-accent/10" />
            <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map(navLink)}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isHome ? (
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="hidden md:block glass-dark px-6 py-3 rounded-full text-sm font-medium hover:bg-accent hover:text-black transition-all duration-300"
              >
                Work With Me
              </a>
            ) : (
              <Link
                to="/#contact"
                className="hidden md:block glass-dark px-6 py-3 rounded-full text-sm font-medium hover:bg-accent hover:text-black transition-all duration-300"
              >
                Work With Me
              </Link>
            )}

            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden glass-dark p-3 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          key="mobile-menu"
          id="mobile-nav"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="mobile-menu-enter fixed inset-0 z-40 flex flex-col bg-[#030303]/95 backdrop-blur-md pt-28 px-8 pb-12"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              if (item === 'Blog') {
                return (
                  <Link
                    key={item}
                    to="/blog"
                    onClick={() => setMenuOpen(false)}
                    className="text-4xl font-display font-bold tracking-tighter uppercase py-3 border-b border-accent/10 hover:text-accent transition-colors"
                  >
                    {item}
                  </Link>
                );
              }
              const hash = `#${item.toLowerCase()}`;
              return isHome ? (
                <a
                  key={item}
                  href={hash}
                  onClick={(e) => handleNavClick(e, hash)}
                  className="text-4xl font-display font-bold tracking-tighter uppercase py-3 border-b border-accent/10 hover:text-accent transition-colors"
                >
                  {item}
                </a>
              ) : (
                <Link
                  key={item}
                  to={`/${hash}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-4xl font-display font-bold tracking-tighter uppercase py-3 border-b border-accent/10 hover:text-accent transition-colors"
                >
                  {item}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            {isHome ? (
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="flex items-center justify-center w-full py-4 bg-accent text-black rounded-full font-medium text-sm tracking-wide hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
              >
                Work With Me
              </a>
            ) : (
              <Link
                to="/#contact"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-4 bg-accent text-black rounded-full font-medium text-sm tracking-wide hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
              >
                Work With Me
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
