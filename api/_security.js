// Website security scanner, calibrated to the Mozilla HTTP Observatory scoring
// model (https://developer.mozilla.org/en-US/observatory/docs/scoring_methodology).
//
// Baseline 100, each check applies a signed modifier, grade is banded off the
// raw total so a hardened site can exceed 100 and earn A+. Using Observatory's
// published modifiers means our number is comparable to the tool the industry
// actually cites, rather than an invented weighting.
//
// Vercel does not route files in /api that begin with an underscore, so this is
// an internal module, not an endpoint.

const HTML_BYTE_CAP = 500_000;
const UA = 'Mozilla/5.0 (compatible; CanvexAudit/2.0; +https://www.canvexstudio.com/free-audit)';

/* ─────────────────────────────  fetch helpers  ───────────────────────────── */

async function timedFetch(url, opts, ms) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ac.signal, headers: { 'User-Agent': UA, ...(opts.headers || {}) } });
  } finally {
    clearTimeout(t);
  }
}

// Read at most HTML_BYTE_CAP so a huge or streaming page can't stall the scan.
async function readCappedText(res) {
  const reader = res.body?.getReader?.();
  if (!reader) return (await res.text()).slice(0, HTML_BYTE_CAP);
  const chunks = [];
  let total = 0;
  while (total < HTML_BYTE_CAP) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  reader.cancel().catch(() => {});
  return new TextDecoder('utf-8', { fatal: false }).decode(concat(chunks, total));
}

function concat(chunks, total) {
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    const take = Math.min(c.length, total - at);
    out.set(c.subarray(0, take), at);
    at += take;
    if (at >= total) break;
  }
  return out;
}

function setCookies(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  const raw = headers.get('set-cookie');
  return raw ? [raw] : [];
}

/* ─────────────────────────────  CSP parsing  ───────────────────────────── */

function parseCsp(value) {
  const out = {};
  for (const part of value.split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;
    const name = tokens[0].toLowerCase();
    if (!(name in out)) out[name] = tokens.slice(1).map(v => v.toLowerCase());
  }
  return out;
}

const HASH_RE = /^'sha(256|384|512)-/;
const NONCE_RE = /^'nonce-/;

// Wildcard-ish sources that let an attacker host script anywhere.
function hasBroadSource(list) {
  return list.some(v => v === '*' || v === 'http:' || v === 'https:' || v === 'data:' || v.startsWith('http://'));
}

/* ─────────────────────────────  individual checks  ───────────────────────────── */
// Every check returns { id, modifier, severity, title, detail }.
// severity: 'critical' | 'high' | 'medium' | 'low' | 'pass'

function checkRedirection(httpProbe, isHttps) {
  if (!isHttps) {
    return { id: 'https', modifier: -50, severity: 'critical',
      title: 'Site is not served over HTTPS',
      detail: 'Traffic is sent in cleartext. Anyone on the same network can read or alter it, and browsers label the site "Not secure".' };
  }
  if (!httpProbe) {
    return { id: 'redirection', modifier: 0, severity: 'low',
      title: 'HTTP redirect behaviour could not be verified',
      detail: 'The plain-HTTP version of the site did not respond, so we could not confirm it forces visitors onto HTTPS.' };
  }
  if (!httpProbe.redirectsToHttps) {
    return { id: 'redirection', modifier: -20, severity: 'high',
      title: 'Plain HTTP does not redirect to HTTPS',
      detail: 'Visitors who type the address without "https" stay on an unencrypted connection instead of being upgraded.' };
  }
  if (httpProbe.firstHopCrossHost) {
    return { id: 'redirection', modifier: -10, severity: 'medium',
      title: 'HTTP redirects to another host before reaching HTTPS',
      detail: 'The first redirect leaves the original hostname while still on HTTP, which exposes one cleartext hop that HSTS cannot protect.' };
  }
  return { id: 'redirection', modifier: 0, severity: 'pass',
    title: 'HTTP traffic is redirected to HTTPS',
    detail: 'Visitors arriving over plain HTTP are upgraded to an encrypted connection on the first hop.' };
}

function checkHsts(headers, isHttps) {
  const raw = headers.get('strict-transport-security');
  if (!isHttps) {
    return { id: 'hsts', modifier: 0, severity: 'low',
      title: 'HSTS not applicable without HTTPS',
      detail: 'Strict-Transport-Security only takes effect on encrypted connections.' };
  }
  if (!raw) {
    return { id: 'hsts', modifier: -20, severity: 'high',
      title: 'No HSTS header',
      detail: 'Without Strict-Transport-Security a visitor\'s first request each session can be intercepted and downgraded to HTTP.' };
  }
  const maxAge = Number((/max-age\s*=\s*"?(\d+)"?/i.exec(raw) || [])[1] ?? 0);
  const subdomains = /includesubdomains/i.test(raw);
  const preload = /preload/i.test(raw);
  if (maxAge < 15768000) {
    return { id: 'hsts', modifier: -10, severity: 'medium',
      title: `HSTS max-age is too short (${maxAge}s)`,
      detail: 'Observatory and the browser preload list require at least 15768000 seconds (six months). A short window leaves repeat visitors unprotected.' };
  }
  let modifier = 0;
  const extras = [];
  if (subdomains) { modifier += 2; extras.push('includeSubDomains'); }
  if (preload) { modifier += 3; extras.push('preload'); }
  return { id: 'hsts', modifier, severity: 'pass',
    title: 'HSTS enforces encrypted connections',
    detail: `max-age of ${maxAge}s${extras.length ? ` with ${extras.join(' and ')}` : ''}.` };
}

function checkCsp(headers) {
  const enforced = headers.get('content-security-policy');
  const reportOnly = headers.get('content-security-policy-report-only');
  if (!enforced) {
    if (reportOnly) {
      return { id: 'csp', modifier: -25, severity: 'high',
        title: 'Content Security Policy is report-only',
        detail: 'The policy is being monitored but not enforced, so it blocks nothing. Cross-site scripting still executes.' };
    }
    return { id: 'csp', modifier: -25, severity: 'high',
      title: 'No Content Security Policy',
      detail: 'CSP is the main defence against cross-site scripting. Without it, any injected script runs with full access to your visitors\' session.' };
  }

  const d = parseCsp(enforced);
  const scriptSrc = d['script-src'] ?? d['default-src'];
  if (!scriptSrc) {
    return { id: 'csp', modifier: -25, severity: 'high',
      title: 'Content Security Policy does not restrict scripts',
      detail: 'The policy sets no script-src or default-src, so script loading is unrestricted and the header provides no XSS protection.' };
  }

  // CSP3: a nonce or hash makes browsers ignore 'unsafe-inline', so that
  // combination is a valid backwards-compatible pattern, not a weakness.
  const strictDynamic = scriptSrc.includes("'strict-dynamic'");
  const nonceOrHash = scriptSrc.some(v => NONCE_RE.test(v) || HASH_RE.test(v));
  const unsafeInline = scriptSrc.includes("'unsafe-inline'") && !nonceOrHash;
  const unsafeEval = scriptSrc.includes("'unsafe-eval'");
  const broad = hasBroadSource(scriptSrc) && !strictDynamic;

  if (broad) {
    return { id: 'csp', modifier: -20, severity: 'high',
      title: 'Content Security Policy allows scripts from any origin',
      detail: 'script-src includes a wildcard or a bare scheme, so an attacker can load script from a host they control and the policy will permit it.' };
  }
  if (unsafeInline) {
    return { id: 'csp', modifier: -20, severity: 'high',
      title: "Content Security Policy allows 'unsafe-inline' scripts",
      detail: 'Inline script execution is the exact thing CSP exists to block. Without a nonce or hash the policy does not stop injected script.' };
  }
  if (unsafeEval) {
    return { id: 'csp', modifier: -10, severity: 'medium',
      title: "Content Security Policy allows 'unsafe-eval'",
      detail: 'eval() and equivalents stay available, which lets attacker-controlled strings become executable code.' };
  }

  const defaultNone = (d['default-src'] ?? []).includes("'none'");
  const missing = [];
  if (!d['object-src'] && !d['default-src']) missing.push('object-src');
  if (!d['base-uri']) missing.push('base-uri');
  if (missing.length) {
    return { id: 'csp', modifier: 0, severity: 'low',
      title: 'Content Security Policy is strong but incomplete',
      detail: `Scripts are properly restricted. Add ${missing.join(' and ')} to close plugin and base-tag injection paths.` };
  }
  return { id: 'csp', modifier: defaultNone ? 10 : 5, severity: 'pass',
    title: 'Strong Content Security Policy',
    detail: defaultNone
      ? "Locked down with default-src 'none' and no unsafe directives."
      : 'Scripts are restricted to trusted sources with no unsafe directives.' };
}

function checkFrameProtection(headers) {
  const xfo = (headers.get('x-frame-options') || '').trim().toLowerCase();
  const csp = headers.get('content-security-policy') || '';
  const frameAncestors = parseCsp(csp)['frame-ancestors'];

  if (frameAncestors) {
    const open = frameAncestors.some(v => v === '*' || v === 'http:' || v === 'https:');
    if (open) {
      return { id: 'clickjacking', modifier: -20, severity: 'high',
        title: 'Any site is allowed to frame this page',
        detail: "CSP frame-ancestors is set to a wildcard, so an attacker can embed your pages and run clickjacking against your visitors." };
    }
    return { id: 'clickjacking', modifier: 5, severity: 'pass',
      title: 'Clickjacking blocked via CSP frame-ancestors',
      detail: 'Framing is restricted using the modern directive, which supersedes X-Frame-Options.' };
  }
  if (!xfo) {
    return { id: 'clickjacking', modifier: -20, severity: 'high',
      title: 'No clickjacking protection',
      detail: 'Neither X-Frame-Options nor CSP frame-ancestors is set. An attacker can load your site in an invisible frame and trick users into clicking things they cannot see.' };
  }
  if (xfo.startsWith('allow-from')) {
    return { id: 'clickjacking', modifier: -20, severity: 'high',
      title: 'X-Frame-Options uses the obsolete ALLOW-FROM directive',
      detail: 'No current browser supports ALLOW-FROM, so this header is ignored and the page is effectively unprotected.' };
  }
  if (xfo === 'deny' || xfo === 'sameorigin') {
    return { id: 'clickjacking', modifier: 0, severity: 'pass',
      title: 'Clickjacking protection in place',
      detail: `X-Frame-Options is set to ${xfo.toUpperCase()}. Consider also setting CSP frame-ancestors, the modern replacement.` };
  }
  return { id: 'clickjacking', modifier: -20, severity: 'high',
    title: 'X-Frame-Options value is invalid',
    detail: `"${xfo}" is not a value browsers recognise, so the header is ignored.` };
}

function checkNoSniff(headers) {
  const v = (headers.get('x-content-type-options') || '').toLowerCase();
  if (v.includes('nosniff')) {
    return { id: 'nosniff', modifier: 0, severity: 'pass',
      title: 'MIME-type sniffing disabled',
      detail: 'Browsers respect your declared content types instead of guessing.' };
  }
  return { id: 'nosniff', modifier: -5, severity: 'medium',
    title: 'Missing X-Content-Type-Options: nosniff',
    detail: 'Browsers may guess a file\'s type and execute an uploaded image or text file as script.' };
}

const SAFE_REFERRER = ['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'origin-when-cross-origin', 'origin'];

function checkReferrerPolicy(headers) {
  const raw = (headers.get('referrer-policy') || '').trim().toLowerCase();
  if (!raw) {
    return { id: 'referrer', modifier: 0, severity: 'low',
      title: 'No Referrer-Policy header',
      detail: 'Browsers fall back to their default. Setting strict-origin-when-cross-origin stops full URLs, including private paths and tokens, leaking to third parties.' };
  }
  // A comma-separated list is a fallback chain; the last value browsers understand wins.
  const values = raw.split(',').map(v => v.trim()).filter(Boolean);
  const effective = values[values.length - 1];
  if (SAFE_REFERRER.includes(effective)) {
    return { id: 'referrer', modifier: 5, severity: 'pass',
      title: 'Referrer-Policy limits URL leakage',
      detail: `Set to ${effective}, so full URLs are not handed to third-party sites.` };
  }
  return { id: 'referrer', modifier: -5, severity: 'medium',
    title: `Referrer-Policy "${effective}" leaks full URLs`,
    detail: 'unsafe-url and no-referrer-when-downgrade send the complete URL, including query strings, to other sites.' };
}

function checkCookies(headers, isHttps) {
  const cookies = setCookies(headers);
  if (!cookies.length) {
    return { id: 'cookies', modifier: 0, severity: 'pass',
      title: 'No cookies set on the landing page',
      detail: 'Nothing to misconfigure here.' };
  }
  const problems = [];
  let sessionInsecure = false;
  for (const c of cookies) {
    const name = c.split('=')[0].trim();
    const secure = /;\s*secure/i.test(c);
    const httpOnly = /;\s*httponly/i.test(c);
    const sameSite = (/;\s*samesite\s*=\s*(\w+)/i.exec(c) || [])[1]?.toLowerCase();
    const looksSession = /sess|sid|auth|token|login|jwt/i.test(name);

    if (!secure && isHttps) {
      problems.push(`${name} is missing the Secure flag`);
      if (looksSession) sessionInsecure = true;
    }
    if (!httpOnly && looksSession) problems.push(`${name} is readable by JavaScript (no HttpOnly)`);
    if (sameSite === 'none' && !secure) problems.push(`${name} uses SameSite=None without Secure and will be rejected`);
  }
  if (sessionInsecure) {
    return { id: 'cookies', modifier: -40, severity: 'critical',
      title: 'Session cookie sent without the Secure flag',
      detail: `${problems[0]}. The cookie can travel over an unencrypted connection, which is how session hijacking happens.` };
  }
  if (problems.length) {
    return { id: 'cookies', modifier: -20, severity: 'high',
      title: 'Cookies are missing security flags',
      detail: problems.slice(0, 2).join('. ') + '.' };
  }
  return { id: 'cookies', modifier: 5, severity: 'pass',
    title: 'Cookies carry the right security flags',
    detail: 'Secure, HttpOnly and SameSite are set appropriately.' };
}

function checkCors(headers) {
  const acao = (headers.get('access-control-allow-origin') || '').trim();
  const acac = (headers.get('access-control-allow-credentials') || '').trim().toLowerCase() === 'true';
  if (!acao) {
    return { id: 'cors', modifier: 0, severity: 'pass',
      title: 'No cross-origin sharing exposed',
      detail: 'The page does not hand its contents to other origins.' };
  }
  if (acao === '*' && acac) {
    return { id: 'cors', modifier: -50, severity: 'critical',
      title: 'CORS allows any origin to read authenticated responses',
      detail: 'Access-Control-Allow-Origin is * with credentials enabled. Any website can read logged-in user data from yours.' };
  }
  if (acao === '*') {
    return { id: 'cors', modifier: -5, severity: 'low',
      title: 'CORS is open to all origins',
      detail: 'Access-Control-Allow-Origin: * is fine for public assets, but should never appear on pages that return user data.' };
  }
  return { id: 'cors', modifier: 0, severity: 'pass',
    title: 'CORS is scoped to specific origins',
    detail: `Sharing is limited to ${acao}.` };
}

const SCRIPT_TAG_RE = /<script\b[^>]*>/gi;
const SRC_RE = /\ssrc\s*=\s*["']([^"']+)["']/i;
const INTEGRITY_RE = /\sintegrity\s*=\s*["'][^"']+["']/i;

function checkSri(html, pageUrl) {
  if (!html) return null;
  let external = 0;
  let unprotected = 0;
  let insecure = 0;
  for (const tag of html.match(SCRIPT_TAG_RE) || []) {
    const src = (SRC_RE.exec(tag) || [])[1];
    if (!src) continue;
    // Resolve against the page so protocol-relative and relative srcs are
    // classified correctly, and compare full origins so a lookalike host like
    // "yoursite.com.evil.com" is never mistaken for first-party.
    let resolved;
    try { resolved = new URL(src, pageUrl); } catch { continue; }
    if (resolved.protocol === 'http:') { insecure += 1; continue; }
    if (resolved.protocol !== 'https:') continue; // data:, blob:, javascript:
    if (resolved.origin === new URL(pageUrl).origin) continue;
    external += 1;
    if (!INTEGRITY_RE.test(tag)) unprotected += 1;
  }
  if (insecure) {
    return { id: 'sri', modifier: -50, severity: 'critical',
      title: 'Scripts are loaded over plain HTTP',
      detail: `${insecure} script tag${insecure > 1 ? 's are' : ' is'} loaded over http://. Anyone on the network path can replace that code and take over the page.` };
  }
  if (!external) {
    return { id: 'sri', modifier: 0, severity: 'pass',
      title: 'No unverified third-party scripts',
      detail: 'The page does not pull script from external origins.' };
  }
  if (unprotected) {
    return { id: 'sri', modifier: -5, severity: 'medium',
      title: `${unprotected} third-party script${unprotected > 1 ? 's' : ''} without Subresource Integrity`,
      detail: 'If any of those vendors is compromised, the altered code runs on your site with full access. An integrity hash makes the browser reject changed files.' };
  }
  return { id: 'sri', modifier: 5, severity: 'pass',
    title: 'Third-party scripts are integrity-checked',
    detail: 'External script tags carry Subresource Integrity hashes.' };
}

const MIXED_ACTIVE_RE = /<(?:script|iframe)\b[^>]*\s(?:src)\s*=\s*["']http:\/\//gi;
const MIXED_PASSIVE_RE = /<(?:img|video|audio|source)\b[^>]*\s(?:src|srcset)\s*=\s*["']http:\/\//gi;

function checkMixedContent(html, isHttps) {
  if (!html || !isHttps) return null;
  const active = (html.match(MIXED_ACTIVE_RE) || []).length;
  const passive = (html.match(MIXED_PASSIVE_RE) || []).length;
  if (active) {
    return { id: 'mixed-content', modifier: -30, severity: 'critical',
      title: 'Active mixed content on an HTTPS page',
      detail: `${active} script or frame${active > 1 ? 's are' : ' is'} loaded over http://. Browsers block these, so the page breaks, and where they are not blocked the encryption is defeated.` };
  }
  if (passive) {
    return { id: 'mixed-content', modifier: -10, severity: 'medium',
      title: 'Images or media loaded over plain HTTP',
      detail: `${passive} asset${passive > 1 ? 's are' : ' is'} requested over http://, which strips the padlock and can show a "not fully secure" warning.` };
  }
  return { id: 'mixed-content', modifier: 0, severity: 'pass',
    title: 'No mixed content',
    detail: 'Every subresource on the page is loaded over HTTPS.' };
}

const VERSION_RE = /\d+\.\d+/;

function checkDisclosure(headers) {
  const leaks = [];
  const server = headers.get('server');
  if (server && VERSION_RE.test(server)) leaks.push(`Server: ${server}`);
  const powered = headers.get('x-powered-by');
  if (powered) leaks.push(`X-Powered-By: ${powered}`);
  for (const h of ['x-aspnet-version', 'x-aspnetmvc-version', 'x-generator', 'x-drupal-cache']) {
    const v = headers.get(h);
    if (v) leaks.push(`${h}: ${v}`);
  }
  if (!leaks.length) {
    return { id: 'disclosure', modifier: 0, severity: 'pass',
      title: 'No software versions disclosed',
      detail: 'Response headers do not advertise your stack or its version.' };
  }
  return { id: 'disclosure', modifier: -5, severity: 'low',
    title: 'Response headers disclose your software version',
    detail: `${leaks.slice(0, 2).join(', ')}. Attackers scan for these to match a host against known CVEs before probing it.` };
}

function checkPermissionsPolicy(headers) {
  const raw = headers.get('permissions-policy') || headers.get('feature-policy');
  if (!raw) {
    return { id: 'permissions-policy', modifier: 0, severity: 'low',
      title: 'No Permissions-Policy header',
      detail: 'Camera, microphone, geolocation and payment APIs stay available to any embedded third-party frame. Denying what you do not use shrinks the attack surface.' };
  }
  return { id: 'permissions-policy', modifier: 2, severity: 'pass',
    title: 'Permissions-Policy restricts browser features',
    detail: 'Powerful APIs are explicitly scoped rather than left open.' };
}

function checkIsolation(headers) {
  const coop = (headers.get('cross-origin-opener-policy') || '').toLowerCase();
  const corp = (headers.get('cross-origin-resource-policy') || '').toLowerCase();
  let modifier = 0;
  const have = [];
  if (coop.startsWith('same-origin')) { modifier += 2; have.push('COOP'); }
  if (corp === 'same-origin' || corp === 'same-site') { modifier += 2; have.push('CORP'); }
  if (!modifier) {
    return { id: 'isolation', modifier: 0, severity: 'low',
      title: 'No cross-origin isolation headers',
      detail: 'Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy defend against cross-window attacks and speculative-execution leaks like Spectre.' };
  }
  return { id: 'isolation', modifier, severity: 'pass',
    title: `Cross-origin isolation via ${have.join(' and ')}`,
    detail: 'The page limits how other origins can reference or reach into it.' };
}

/* ─────────────────────────────  grading  ───────────────────────────── */

// Observatory's published grade bands. Raw score can exceed 100 (A+).
const GRADE_BANDS = [
  [100, 'A+'], [90, 'A'], [85, 'A-'], [80, 'B+'], [75, 'B'], [70, 'B-'],
  [65, 'C+'], [60, 'C'], [55, 'C-'], [50, 'D+'], [45, 'D'], [40, 'D-'], [0, 'F'],
];

function gradeFor(raw) {
  for (const [min, grade] of GRADE_BANDS) if (raw >= min) return grade;
  return 'F';
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, pass: 4 };

/* ─────────────────────────────  entry point  ───────────────────────────── */

export async function scanSecurity(target) {
  const isHttpsTarget = target.protocol === 'https:';

  const [mainSettled, httpSettled] = await Promise.allSettled([
    timedFetch(target.toString(), { redirect: 'follow' }, 10000),
    // Probe plain HTTP separately to see whether the site forces an upgrade.
    timedFetch(`http://${target.host}/`, { redirect: 'manual' }, 6000),
  ]);

  if (mainSettled.status !== 'fulfilled') return null;
  const res = mainSettled.value;
  const headers = res.headers;
  const finalUrl = new URL(res.url || target.toString());
  const isHttps = finalUrl.protocol === 'https:';

  let httpProbe = null;
  if (httpSettled.status === 'fulfilled') {
    const p = httpSettled.value;
    const location = p.headers.get('location');
    if (location && p.status >= 300 && p.status < 400) {
      let dest;
      try { dest = new URL(location, `http://${target.host}/`); } catch { dest = null; }
      httpProbe = {
        redirectsToHttps: dest?.protocol === 'https:',
        firstHopCrossHost: !!dest && dest.protocol === 'http:' && dest.host !== target.host,
      };
    } else {
      httpProbe = { redirectsToHttps: false, firstHopCrossHost: false };
    }
  }

  let html = '';
  const contentType = headers.get('content-type') || '';
  if (/text\/html/i.test(contentType)) {
    try { html = await readCappedText(res); } catch { html = ''; }
  }

  const findings = [
    checkRedirection(httpProbe, isHttps),
    checkHsts(headers, isHttps),
    checkCsp(headers),
    checkFrameProtection(headers),
    checkNoSniff(headers),
    checkReferrerPolicy(headers),
    checkCookies(headers, isHttps),
    checkCors(headers),
    checkSri(html, finalUrl.toString()),
    checkMixedContent(html, isHttps),
    checkDisclosure(headers),
    checkPermissionsPolicy(headers),
    checkIsolation(headers),
  ].filter(Boolean);

  // Observatory awards extra credit only once the penalised score already
  // reaches 90, so hardening bonuses can't paper over an outstanding weakness.
  const penalties = findings.reduce((s, f) => s + Math.min(0, f.modifier), 0);
  const bonuses = findings.reduce((s, f) => s + Math.max(0, f.modifier), 0);
  const base = 100 + penalties;
  const raw = base >= 90 ? base + bonuses : base;

  findings.sort((a, b) =>
    SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.modifier - b.modifier);

  return {
    score: Math.max(0, Math.min(100, raw)),
    rawScore: raw,
    grade: gradeFor(raw),
    findings,
    scannedUrl: finalUrl.toString(),
    testedAt: new Date().toISOString(),
  };
}
