// Vercel serverless function — runs Google PageSpeed Insights (Lighthouse) server-side
// so the API key never reaches the browser. Called by /free-audit.
//
// Requires a server env var (NOT prefixed with VITE_, so it stays private):
//   PAGESPEED_API_KEY = <your free Google PageSpeed Insights API key>

export const config = { maxDuration: 60 };

const ALLOWED_CATEGORIES = ['PERFORMANCE', 'SEO', 'ACCESSIBILITY', 'BEST_PRACTICES'];

export default async function handler(req, res) {
  // Same-origin only in practice; keep it locked to GET.
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Accept either name so it works whether the Vercel var is PAGESPEED_API_KEY
  // or VITE_PAGESPEED_API_KEY. (Server functions can read both; neither is
  // exposed to the browser because the client no longer references them.)
  const key = process.env.PAGESPEED_API_KEY
    || process.env.VITE_PAGESPEED_API_KEY
    || process.env.PAGESPEED_API_KE; // tolerate the truncated name saved in Vercel
  if (!key) {
    // No key configured — tell the client so it can fall back to preliminary mode.
    return res.status(503).json({ error: 'measurement_unavailable' });
  }

  const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  if (!rawUrl) return res.status(400).json({ error: 'Missing url' });

  // Validate: only public http/https URLs may be scanned.
  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http/https URLs are allowed' });
  }
  // Block internal / private hosts (SSRF guard) — we only scan public sites.
  const host = target.hostname.toLowerCase();
  if (
    host === 'localhost' || host === '0.0.0.0' || host === '::1' || host.endsWith('.local') ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return res.status(400).json({ error: 'Only public URLs are allowed' });
  }

  const strategy = req.query.strategy === 'desktop' ? 'desktop' : 'mobile';

  const params = new URLSearchParams({ url: target.toString(), strategy, key });
  ALLOWED_CATEGORIES.forEach(c => params.append('category', c));
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  try {
    // Run the Lighthouse scan and a real security-header check in PARALLEL, so
    // the accurate security data adds no extra time on top of the (slow) PSI run.
    const [psiRes, securityHeaders] = await Promise.all([
      fetch(endpoint, { signal: controller.signal }),
      readSecurityHeaders(target),
    ]);
    const json = await psiRes.json();

    if (!psiRes.ok || !json.lighthouseResult) {
      return res.status(502).json({ error: 'psi_failed', status: psiRes.status });
    }

    // Edge-cache identical scans: Lighthouse data is stable for the short term, so
    // a repeat scan of the same URL returns near-instantly instead of re-running.
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=21600');
    return res.status(200).json({
      lighthouseResult: json.lighthouseResult,
      loadingExperience: json.loadingExperience || null,
      originLoadingExperience: json.originLoadingExperience || null,
      securityHeaders, // real HTTP security headers, measured directly
    });
  } catch (err) {
    const aborted = err && err.name === 'AbortError';
    return res.status(aborted ? 504 : 502).json({ error: aborted ? 'timeout' : 'fetch_failed' });
  } finally {
    clearTimeout(timeout);
  }
}

// Fetch the target and read its real security headers. Fast (~one request) and
// far more accurate than Lighthouse's "informative" security audits, which report
// a pass even when a header is absent. Returns null if the site can't be reached.
async function readSecurityHeaders(target) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  try {
    const r = await fetch(target.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: ac.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CanvexAudit/1.0)' },
    });
    const h = r.headers;
    const csp = h.get('content-security-policy') || h.get('content-security-policy-report-only') || '';
    return {
      https: r.url.startsWith('https:') || target.protocol === 'https:',
      hsts: !!h.get('strict-transport-security'),
      csp: !!csp,
      frameProtection: !!h.get('x-frame-options') || /frame-ancestors/i.test(csp),
      noSniff: (h.get('x-content-type-options') || '').toLowerCase().includes('nosniff'),
      referrerPolicy: !!h.get('referrer-policy'),
      permissionsPolicy: !!h.get('permissions-policy'),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
