// Vercel serverless function — runs Google PageSpeed Insights (Lighthouse) server-side
// so the API key never reaches the browser. Called by /free-audit.
//
// Requires a server env var (NOT prefixed with VITE_, so it stays private):
//   PAGESPEED_API_KEY = <your free Google PageSpeed Insights API key>

import { scanSecurity } from './_security.js';

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  // The security scan needs no API key and no third party, so it runs regardless
  // and in parallel with the (slow) Lighthouse call. If PageSpeed is missing a
  // key, rate-limited, or times out, we still return a real measured report
  // rather than dead-ending the visitor.
  const securityPromise = scanSecurity(target).catch(() => null);

  async function runPageSpeed() {
    if (!key) return { ok: false, reason: 'no_api_key' };
    const params = new URLSearchParams({ url: target.toString(), strategy, key });
    ALLOWED_CATEGORIES.forEach(c => params.append('category', c));
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;
    try {
      const psiRes = await fetch(endpoint, { signal: controller.signal });
      const json = await psiRes.json();
      if (!psiRes.ok || !json.lighthouseResult) {
        return { ok: false, reason: 'psi_failed', status: psiRes.status };
      }
      return { ok: true, json };
    } catch (err) {
      return { ok: false, reason: err && err.name === 'AbortError' ? 'timeout' : 'fetch_failed' };
    }
  }

  try {
    const [psi, security] = await Promise.all([runPageSpeed(), securityPromise]);

    if (!psi.ok && !security) {
      // Nothing could be measured at all — the site is genuinely unreachable.
      return res.status(502).json({ error: psi.reason });
    }

    // Edge-cache identical scans: this data is stable for the short term, so a
    // repeat scan of the same URL returns near-instantly instead of re-running.
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=21600');
    return res.status(200).json({
      lighthouseResult: psi.ok ? psi.json.lighthouseResult : null,
      loadingExperience: psi.ok ? (psi.json.loadingExperience || null) : null,
      originLoadingExperience: psi.ok ? (psi.json.originLoadingExperience || null) : null,
      security, // Observatory-calibrated security scan, measured directly
      psiUnavailable: psi.ok ? undefined : psi.reason,
    });
  } finally {
    clearTimeout(timeout);
  }
}
