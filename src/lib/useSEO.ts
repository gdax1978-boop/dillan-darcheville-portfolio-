import { useEffect } from 'react';

/** Matches the <meta name="robots"> baked into index.html. */
const DEFAULT_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export function useSEO(
  title: string,
  description: string,
  canonicalPath?: string,
  jsonLd?: object | object[],
  ogImage?: string,
  ogType: string = 'website',
  /**
   * Set for pages that resolve but have no real content, e.g. /blog/99. Without
   * this they return 200 with fallback content, which Google records as a soft
   * 404 and counts against site quality.
   */
  noindex: boolean = false
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

    setMeta('meta[name="robots"]', noindex ? 'noindex, follow' : DEFAULT_ROBOTS);
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    if (ogImage) {
      setMeta('meta[property="og:image"]', ogImage);
      setMeta('meta[property="og:image:alt"]', title);
      setMeta('meta[name="twitter:image"]', ogImage);
      setMeta('meta[name="twitter:image:alt"]', title);
      setMeta('meta[name="twitter:card"]', 'summary_large_image');
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
      // Restore the default so a noindex page does not leak its robots value
      // onto the next route during client-side navigation.
      setMeta('meta[name="robots"]', DEFAULT_ROBOTS);
    };
  }, [
    title,
    description,
    canonicalPath,
    JSON.stringify(jsonLd ?? null),
    ogImage,
    ogType,
    noindex,
  ]);
}
