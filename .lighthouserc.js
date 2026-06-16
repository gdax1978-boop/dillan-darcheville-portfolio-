export default {
  ci: {
    collect: {
      // Start the Vite preview server and test these URLs
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local',
      startServerReadyTimeout: 20000,
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/blog',
        'http://localhost:4173/case-study/1',
      ],
      numberOfRuns: 1,
      settings: {
        // Simulate mobile (Lighthouse default) — covers performance, a11y, SEO, best practices
        preset: 'desktop',
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance':        ['warn', { minScore: 0.85 }],
        // Accessibility
        'categories:accessibility':      ['error', { minScore: 0.90 }],
        // SEO
        'categories:seo':                ['error', { minScore: 0.90 }],
        // Best Practices
        'categories:best-practices':     ['warn', { minScore: 0.90 }],
        // Core Web Vitals
        'first-contentful-paint':        ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint':      ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift':       ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time':           ['warn', { maxNumericValue: 300 }],
        // Meta / SEO specifics
        'meta-description':              ['error', { minScore: 1 }],
        'document-title':                ['error', { minScore: 1 }],
        'html-has-lang':                 ['error', { minScore: 1 }],
        'image-alt':                     ['error', { minScore: 1 }],
        'canonical':                     ['warn', { minScore: 1 }],
        // Security
        'is-on-https':                   ['warn', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
