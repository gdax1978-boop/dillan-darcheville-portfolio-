import React, { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;
    el.style.display = 'block';
    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.055) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
      }}
    />
  );
}
