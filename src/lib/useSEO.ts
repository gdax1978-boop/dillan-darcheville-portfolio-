import { useEffect } from 'react';

export function useSEO(
  title: string,
  description: string,
  canonicalPath?: string,
  jsonLd?: object | object[],
  ogImage?: string
) {
  useEffect(() => {
    document.title = title;

    const canonicalUrl = canonicalPath
      ? `https://www.canvexstudio.com${canonicalPath}`
      : window.location.href.split('?')[0].replace(/\/$/, '') || 'https://www.canvexstudio.com';

    const setMeta = (sel: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute('content', val);
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    if (ogImage) {
      setMeta('meta[property="og:image"]', ogImage);
      setMeta('meta[name="twitter:image"]', ogImage);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const SCHEMA_ID = 'page-jsonld';
    let existing = document.getElementById(SCHEMA_ID);
    if (jsonLd) {
      if (!existing) {
        existing = document.createElement('script');
        existing.id = SCHEMA_ID;
        existing.setAttribute('type', 'application/ld+json');
        document.head.appendChild(existing);
      }
      existing.textContent = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
    } else if (existing) {
      existing.remove();
    }

    return () => {
      const el = document.getElementById(SCHEMA_ID);
      if (el) el.remove();
    };
  }, [title, description, canonicalPath, JSON.stringify(jsonLd ?? null), ogImage]);
}
