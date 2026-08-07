import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, CheckCircle, AlertTriangle, XCircle, Loader2, CalendarDays,
  ExternalLink, Zap, Eye, Search, Shield, Gauge, Clock, TrendingDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/useSEO';

/* ─────────────────────────────  types  ───────────────────────────── */

type ScoreLevel = 'poor' | 'average' | 'good';
type VitalRating = 'good' | 'needs-improvement' | 'poor';

interface CategoryScore {
  name: string;
  score: number;
  level: ScoreLevel;
  icon: React.ElementType;
  issues: string[];
  wins: string[];
  measured: boolean;
}

interface CoreWebVital {
  key: string;
  label: string;
  value: string;
  rating: VitalRating;
  threshold: string;
}

interface Opportunity {
  title: string;
  savingsLabel: string;
}

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'pass';

interface SecurityFinding {
  id: string;
  severity: Severity;
  modifier: number;
  title: string;
  detail: string;
}

interface SecurityScan {
  score: number;
  rawScore: number;
  grade: string;
  findings: SecurityFinding[];
  scannedUrl: string;
}

interface AuditResult {
  url: string;
  overall: number;
  grade: string;
  summary: string;
  conversion: string;
  categories: CategoryScore[];
  vitals: CoreWebVital[];
  opportunities: Opportunity[];
  topFixes: string[];
  revenueRisk: { level: 'Low' | 'Moderate' | 'High'; headline: string; detail: string };
  cta: string;
  measured: boolean;
  fieldData: boolean;
  screenshot?: string;
  security?: SecurityScan | null;
  /** Set when Lighthouse could not run, so the report is security-only. */
  psiUnavailable?: string;
}

/* ─────────────────────────────  helpers  ───────────────────────────── */

const SCORE_COLORS: Record<ScoreLevel, string> = {
  poor: '#FF4444',
  average: '#FFB800',
  good: '#00F0FF',
};

const VITAL_COLORS: Record<VitalRating, string> = {
  poor: '#FF4444',
  'needs-improvement': '#FFB800',
  good: '#00F0FF',
};

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#FF4444',
  high: '#FF8A3D',
  medium: '#FFB800',
  low: '#8A93A6',
  pass: '#00F0FF',
};

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Advisory',
  pass: 'Pass',
};

const RISK_COLORS: Record<'Low' | 'Moderate' | 'High', string> = {
  Low: '#00F0FF',
  Moderate: '#FFB800',
  High: '#FF4444',
};

function getLevel(score: number): ScoreLevel {
  if (score >= 75) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

function getGrade(score: number): string {
  if (score >= 93) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Accept whatever the visitor types and turn it into a scannable URL — no
 * need to type https://. "canvexstudio.com", "www.canvexstudio.com",
 * "CANVEXSTUDIO.COM/about" and "http://x.com" all normalize correctly.
 * Returns '' if it can't plausibly be a domain.
 */
function normalizeUrl(raw: string): string {
  let s = (raw || '').trim().replace(/\s+/g, '');
  if (!s) return '';

  s = s.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, ''); // drop any scheme they typed
  s = s.replace(/^\/+/, '');                          // stray leading slashes
  if (!s) return '';

  const host = s.split(/[/?#]/)[0];                   // host = before first / ? #
  // Must look like a real domain: label(s) + 2+ char TLD.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(host)) return '';

  return `https://${s}`;
}

/* ───────────────  Google PageSpeed Insights (real Lighthouse)  ─────────────── */

interface LHAudit {
  id?: string;
  title: string;
  score: number | null;
  scoreDisplayMode?: string;
  numericValue?: number;
  displayValue?: string;
  details?: { type?: string; data?: string };
}
interface LHResult {
  categories: Record<string, { score: number | null; auditRefs: { id: string }[] }>;
  audits: Record<string, LHAudit>;
}

function vitalRating(numeric: number, good: number, poor: number): VitalRating {
  if (numeric <= good) return 'good';
  if (numeric >= poor) return 'poor';
  return 'needs-improvement';
}

// Real-user field data (Chrome UX Report) returned by PageSpeed
interface CruxMetric { percentile: number; category: 'FAST' | 'AVERAGE' | 'SLOW' }
interface LoadingExperience { metrics?: Record<string, CruxMetric> }

function cruxRating(category: string): VitalRating {
  if (category === 'FAST') return 'good';
  if (category === 'SLOW') return 'poor';
  return 'needs-improvement';
}
function fmtMs(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`;
}

// Build Core Web Vitals from real-user field data. Returns null if the site has
// too little traffic for Google to have field data (then we fall back to lab).
function fieldVitals(le: LoadingExperience | null | undefined): { vitals: CoreWebVital[]; lcpMs: number } | null {
  const m = le?.metrics;
  if (!m || !m['LARGEST_CONTENTFUL_PAINT_MS']) return null;
  const vitals: CoreWebVital[] = [];
  const add = (id: string, key: string, label: string, threshold: string, fmt: (v: number) => string) => {
    const x = m[id];
    if (!x) return;
    vitals.push({ key, label, value: fmt(x.percentile), rating: cruxRating(x.category), threshold });
  };
  add('LARGEST_CONTENTFUL_PAINT_MS', 'lcp', 'Largest Contentful Paint', 'Good < 2.5s', fmtMs);
  add('INTERACTION_TO_NEXT_PAINT', 'inp', 'Interaction to Next Paint', 'Good < 200ms', v => `${Math.round(v)} ms`);
  add('CUMULATIVE_LAYOUT_SHIFT_SCORE', 'cls', 'Cumulative Layout Shift', 'Good < 0.1', v => (v / 100).toFixed(2));
  add('FIRST_CONTENTFUL_PAINT_MS', 'fcp', 'First Contentful Paint', 'Good < 1.8s', fmtMs);
  add('EXPERIMENTAL_TIME_TO_FIRST_BYTE', 'ttfb', 'Time to First Byte', 'Good < 800ms', fmtMs);
  return { vitals, lcpMs: m['LARGEST_CONTENTFUL_PAINT_MS'].percentile };
}

function categoryAudits(lhr: LHResult, categoryId: string, wantPass: boolean, limit: number): string[] {
  const cat = lhr.categories[categoryId];
  if (!cat) return [];
  const seen = new Set<string>();
  const out: { title: string; score: number }[] = [];
  for (const ref of cat.auditRefs) {
    const a = lhr.audits[ref.id];
    if (!a || a.score === null) continue;
    if (a.scoreDisplayMode === 'informative' || a.scoreDisplayMode === 'notApplicable' || a.scoreDisplayMode === 'manual') continue;
    const passed = a.score >= 0.9;
    if (passed !== wantPass) continue;
    if (seen.has(a.title)) continue;
    seen.add(a.title);
    out.push({ title: a.title, score: a.score });
  }
  out.sort((x, y) => (wantPass ? y.score - x.score : x.score - y.score));
  return out.slice(0, limit).map(o => o.title);
}

// Security scan measured server-side and scored against the Mozilla HTTP
// Observatory model, so the grade is comparable to the tool the industry cites.
function securityCategory(sec: SecurityScan | null | undefined, lhr?: LHResult): CategoryScore {
  if (!sec) {
    // Scan couldn't reach the site: fall back to Lighthouse's HTTPS check only, conservatively.
    const https = lhr?.audits['is-on-https']?.score === 1;
    const score = https ? 55 : 15;
    return {
      name: 'Security', score, level: getLevel(score), icon: Shield, measured: true,
      issues: https ? ['Security headers could not be fully verified'] : ['Site is not served fully over HTTPS'],
      wins: https ? ['Served over HTTPS'] : [],
    };
  }
  return {
    name: 'Security', score: sec.score, level: getLevel(sec.score), icon: Shield, measured: true,
    issues: sec.findings.filter(f => f.severity !== 'pass').slice(0, 2).map(f => f.title),
    wins: sec.findings.filter(f => f.severity === 'pass').slice(0, 1).map(f => f.title),
  };
}

/**
 * Lighthouse couldn't run, but the security scan did. Everything below is still
 * genuinely measured, so this is a real report, just a narrower one — no
 * estimated performance numbers are invented to fill the gap.
 */
function securityOnlyResult(sec: SecurityScan, reason?: string): Partial<AuditResult> & { lcpNumeric: number; perf: number } {
  const serious = sec.findings.filter(f => f.severity === 'critical' || f.severity === 'high');
  const risk: AuditResult['revenueRisk'] = serious.length
    ? {
        level: serious.some(f => f.severity === 'critical') ? 'High' : 'Moderate',
        headline: 'Security gaps are exposing your visitors',
        detail: `Your site scores ${sec.grade} (${sec.score}/100) on the Mozilla Observatory scale, with ${serious.length} serious ${serious.length === 1 ? 'issue' : 'issues'} open. The most urgent is: ${serious[0].title.toLowerCase()}.`,
      }
    : {
        level: 'Low',
        headline: 'Your security posture is solid',
        detail: `Your site scores ${sec.grade} (${sec.score}/100) on the Mozilla Observatory scale with no critical or high-severity findings.`,
      };

  return {
    overall: sec.score,
    grade: sec.grade,
    categories: [securityCategory(sec)],
    vitals: [],
    opportunities: [],
    revenueRisk: risk,
    fieldData: false,
    security: sec,
    psiUnavailable: reason || 'unavailable',
    lcpNumeric: 0,
    perf: 0,
  };
}

async function fetchPageSpeed(url: string): Promise<Partial<AuditResult> & { lcpNumeric: number; perf: number }> {
  // Calls our own serverless proxy (/api/audit): the Google API key stays server-side.
  const params = new URLSearchParams({ url, strategy: 'mobile' });
  const endpoint = `/api/audit?${params.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  let json: { lighthouseResult?: LHResult | null; loadingExperience?: LoadingExperience | null; originLoadingExperience?: LoadingExperience | null; security?: SecurityScan | null; psiUnavailable?: string };
  try {
    const res = await fetch(endpoint, { signal: controller.signal });
    if (!res.ok) throw new Error(`audit ${res.status}`);
    json = await res.json();
  } finally {
    clearTimeout(timeout);
  }

  const lhr = json.lighthouseResult;
  // Lighthouse unavailable (no key, quota, timeout). The security scan needs no
  // third party, so deliver that real measured report instead of dead-ending.
  if (!lhr) {
    if (!json.security) throw new Error('No measurement available');
    return securityOnlyResult(json.security, json.psiUnavailable);
  }

  const catScore = (id: string) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
  const perf = catScore('performance');
  const seo = catScore('seo');
  const a11y = catScore('accessibility');
  const bp = catScore('best-practices');

  const categories: CategoryScore[] = [
    { name: 'Performance', score: perf, level: getLevel(perf), icon: Zap, measured: true,
      issues: categoryAudits(lhr, 'performance', false, 2), wins: categoryAudits(lhr, 'performance', true, 1) },
    { name: 'SEO & Visibility', score: seo, level: getLevel(seo), icon: Search, measured: true,
      issues: categoryAudits(lhr, 'seo', false, 2), wins: categoryAudits(lhr, 'seo', true, 1) },
    { name: 'Accessibility', score: a11y, level: getLevel(a11y), icon: Eye, measured: true,
      issues: categoryAudits(lhr, 'accessibility', false, 2), wins: categoryAudits(lhr, 'accessibility', true, 1) },
    { name: 'Best Practices', score: bp, level: getLevel(bp), icon: Gauge, measured: true,
      issues: categoryAudits(lhr, 'best-practices', false, 2), wins: categoryAudits(lhr, 'best-practices', true, 1) },
    securityCategory(json.security, lhr),
  ];
  const sec = categories[4].score;

  const A = lhr.audits;
  const num = (id: string) => A[id]?.numericValue ?? 0;
  const disp = (id: string) => A[id]?.displayValue ?? '-';
  const lcpNumeric = num('largest-contentful-paint');

  // Lab vitals: a single synthetic run. Used only when no real-user field data exists.
  const labVitals: CoreWebVital[] = [
    { key: 'lcp', label: 'Largest Contentful Paint', value: disp('largest-contentful-paint'),
      rating: vitalRating(lcpNumeric, 2500, 4000), threshold: 'Good < 2.5s' },
    { key: 'cls', label: 'Cumulative Layout Shift', value: disp('cumulative-layout-shift'),
      rating: vitalRating(num('cumulative-layout-shift'), 0.1, 0.25), threshold: 'Good < 0.1' },
    { key: 'tbt', label: 'Total Blocking Time', value: disp('total-blocking-time'),
      rating: vitalRating(num('total-blocking-time'), 200, 600), threshold: 'Good < 200ms' },
    { key: 'fcp', label: 'First Contentful Paint', value: disp('first-contentful-paint'),
      rating: vitalRating(num('first-contentful-paint'), 1800, 3000), threshold: 'Good < 1.8s' },
    { key: 'si', label: 'Speed Index', value: disp('speed-index'),
      rating: vitalRating(num('speed-index'), 3400, 5800), threshold: 'Good < 3.4s' },
  ];

  // Prefer real-user field data (CrUX p75, last 28 days): what Google actually ranks on.
  const field = fieldVitals(json.loadingExperience) ?? fieldVitals(json.originLoadingExperience);
  const fieldData = !!field;
  const vitals = field ? field.vitals : labVitals;
  const lcpForRisk = field ? field.lcpMs : lcpNumeric;
  const lcpLabel = vitals.find(v => v.key === 'lcp')?.value ?? disp('largest-contentful-paint');

  // Real speed opportunities, sorted by time savings
  const opportunities: Opportunity[] = Object.values(A)
    .filter(a => a.details?.type === 'opportunity' && (a.numericValue ?? 0) > 150)
    .sort((a, b) => (b.numericValue ?? 0) - (a.numericValue ?? 0))
    .slice(0, 4)
    .map(a => ({ title: a.title, savingsLabel: a.displayValue ?? `${Math.round((a.numericValue ?? 0) / 100) / 10}s` }));

  // Weighted overall (Google indexes mobile-first; perf + SEO carry the most weight)
  const overall = Math.round(perf * 0.30 + seo * 0.25 + a11y * 0.15 + bp * 0.15 + sec * 0.15);

  // Revenue risk grounded in Google's published bounce research. Uses real-user
  // LCP when available (more accurate than a single lab run).
  const src = fieldData ? 'Real visitors experience' : 'Your site measured';
  let risk: AuditResult['revenueRisk'];
  if (perf >= 85 && lcpForRisk <= 2500) {
    risk = { level: 'Low', headline: 'Speed is protecting your conversions',
      detail: `${src} an LCP of ${lcpLabel}, fast enough that speed isn't the thing costing you leads.` };
  } else if (lcpForRisk <= 4000 && perf >= 40) {
    risk = { level: 'Moderate', headline: 'You are leaking mobile visitors',
      detail: `Google research shows the probability of a bounce rises 32% as load time goes from 1s to 3s. ${src} an LCP of ${lcpLabel}, enough friction to lose impatient mobile visitors before they convert.` };
  } else {
    risk = { level: 'High', headline: 'Speed is actively costing you customers',
      detail: `Google research shows bounce probability rises 90% as load time goes from 1s to 5s. ${src} an LCP of ${lcpLabel}, most mobile visitors leave before your site finishes loading.` };
  }

  const screenshot = A['final-screenshot']?.details?.data;

  return { overall, grade: getGrade(overall), categories, vitals, opportunities, revenueRisk: risk, screenshot, fieldData, security: json.security ?? null, lcpNumeric, perf };
}

/* ───────────────  AI narrative layer (interprets the REAL data)  ─────────────── */

async function fetchNarrative(
  url: string,
  data: Partial<AuditResult> & { perf: number },
  apiKey: string
): Promise<{ summary: string; conversion: string; topFixes: string[]; cta: string }> {
  const cats = (data.categories ?? []).map(c => `${c.name}: ${c.score}/100`).join(', ');
  const vitals = (data.vitals ?? []).map(v => `${v.label} ${v.value} (${v.rating})`).join(', ');
  const opps = (data.opportunities ?? []).map(o => `${o.title} (save ${o.savingsLabel})`).join('; ') || 'none flagged';
  const secFindings = (data.security?.findings ?? [])
    .filter(f => f.severity !== 'pass')
    .slice(0, 5)
    .map(f => `${f.severity.toUpperCase()}: ${f.title}`)
    .join('; ') || 'none flagged';
  const secGrade = data.security ? `${data.security.grade} (${data.security.score}/100)` : 'not measured';

  const prompt = `You are the lead web strategist at Canvex Studio, New York. Below is REAL Google Lighthouse data and a real HTTP security scan measured live for ${url}. Interpret it for a non-technical business owner. Never invent numbers, only reference the data given.

MEASURED (mobile):
Scores, ${cats}
Core Web Vitals, ${vitals}
Top speed opportunities, ${opps}
Security grade, ${secGrade}
Security findings, ${secFindings}

Respond ONLY as valid JSON:
{
  "summary": "<2 sentences naming the single biggest problem hurting this business, in plain English, referencing the real numbers>",
  "conversion": "<1-2 sentences on what a real visitor experiences and how it affects trust or conversions>",
  "topFixes": ["<business-impact fix 1>", "<fix 2>", "<fix 3>"],
  "cta": "<one punchy sentence on what Canvex Studio could unlock for this specific site>"
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    }),
  });
  const json = await res.json();
  const raw = JSON.parse(json.choices?.[0]?.message?.content ?? '{}');
  return {
    summary: raw.summary ?? '',
    conversion: raw.conversion ?? '',
    topFixes: Array.isArray(raw.topFixes) ? raw.topFixes.slice(0, 3) : [],
    cta: raw.cta ?? 'A focused rebuild could turn this site into a lead engine.',
  };
}

/* AI-only fallback when real Lighthouse data isn't available (no PSI key / site unreachable).
   Produces the same shape so the page always renders something useful. */
async function runAIOnlyAudit(url: string, apiKey: string): Promise<AuditResult> {
  const prompt = `You are the lead web strategist at Canvex Studio, New York. Give an honest preliminary audit of this website: ${url}

CRITICAL ACCURACY RULES:
- You have NOT loaded or measured this site. Do NOT invent specific measurements: no exact load times ("4.5 seconds"), no exact percentages, no made-up metric values.
- Frame issues as risks to verify ("likely...", "commonly...", "often..."), not as measured facts.
- Base your assessment on well-known best-practice risks for a site of this type and industry.
- Score conservatively and consistently: most sites land 45-70. Never claim a win you cannot infer.

Respond ONLY as valid JSON:
{
  "overall": <0-100>,
  "summary": "<2 sentences on the single biggest problem and the potential>",
  "conversion": "<1-2 sentences on the likely visitor experience and conversion impact>",
  "categories": [
    {"name":"Visual Design","score":<0-100>,"issues":["<issue>","<issue>"],"wins":["<win>"]},
    {"name":"Performance","score":<0-100>,"issues":["<issue>","<issue>"],"wins":["<win>"]},
    {"name":"SEO & Visibility","score":<0-100>,"issues":["<issue>","<issue>"],"wins":["<win>"]},
    {"name":"Conversion","score":<0-100>,"issues":["<issue>","<issue>"],"wins":["<win>"]},
    {"name":"Security","score":<0-100>,"issues":["<issue about HTTPS, security headers, mixed content, exposed data, or outdated libraries>","<issue>"],"wins":["<win>"]}
  ],
  "topFixes": ["<fix 1>","<fix 2>","<fix 3>"],
  "cta": "<one punchy sentence on what a rebuild could unlock>"
}
Be specific. Most sites score 40-70; only exceptional sites exceed 80.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800, temperature: 0.6, response_format: { type: 'json_object' },
    }),
  });
  const json = await res.json();
  const raw = JSON.parse(json.choices?.[0]?.message?.content ?? '{}');
  const icons = [Eye, Zap, Search, TrendingDown, Shield];
  const overall = raw.overall ?? 55;
  return {
    url, overall, grade: getGrade(overall),
    summary: raw.summary ?? 'Analysis complete.',
    conversion: raw.conversion ?? '',
    categories: (raw.categories ?? []).map((c: { name: string; score: number; issues: string[]; wins: string[] }, i: number) => ({
      ...c, icon: icons[i] ?? Eye, level: getLevel(c.score), measured: false,
    })),
    vitals: [], opportunities: [],
    topFixes: Array.isArray(raw.topFixes) ? raw.topFixes.slice(0, 3) : [],
    revenueRisk: { level: 'Moderate', headline: 'Estimated from an AI review',
      detail: 'For exact Core Web Vitals and revenue-leak numbers, this site needs a live Lighthouse scan.' },
    cta: raw.cta ?? 'A focused rebuild could turn this site into a lead engine.',
    measured: false,
    fieldData: false,
  };
}

/* Templated narrative when no AI key is present: still fully grounded in real data */
function templatedNarrative(data: Partial<AuditResult> & { perf: number }): { summary: string; conversion: string; topFixes: string[]; cta: string } {
  const weakest = [...(data.categories ?? [])].sort((a, b) => a.score - b.score)[0];
  const serious = (data.security?.findings ?? []).filter(f => f.severity === 'critical' || f.severity === 'high');
  let summary: string;
  if (data.psiUnavailable) {
    summary = serious.length
      ? `Your site scores ${data.security?.grade} (${data.security?.score}/100) for security, with ${serious.length} serious ${serious.length === 1 ? 'gap' : 'gaps'} an attacker could use today.`
      : `Your site scores ${data.security?.grade} (${data.security?.score}/100) for security with no serious gaps open.`;
  } else if (weakest) {
    summary = `Your biggest weak point is ${weakest.name} at ${weakest.score}/100. That's the area dragging down your visibility and the visitor experience the most.`;
  } else {
    summary = 'Your site was measured across performance, SEO, accessibility and best practices.';
  }
  const fixes = (data.security?.findings ?? [])
    .filter(f => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 2)
    .map(f => `${f.title}. ${f.detail}`);
  for (const o of data.opportunities ?? []) {
    if (fixes.length >= 3) break;
    fixes.push(`${o.title}, potential to save ${o.savingsLabel} of load time.`);
  }
  while (fixes.length < 3 && weakest) fixes.push(`Address failing ${weakest.name.toLowerCase()} checks flagged above.`);
  return {
    summary,
    conversion: (data.revenueRisk?.detail) ?? '',
    topFixes: fixes.slice(0, 3),
    cta: 'A focused rebuild could turn these red scores green, and turn visitors into booked calls.',
  };
}

/* ─────────────────────────────  UI atoms  ───────────────────────────── */

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const level = getLevel(score);
  const color = SCORE_COLORS[level];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-display font-bold text-white" style={{ fontSize: size * 0.24 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {score}
        </motion.span>
        <span className="text-white/40 font-light" style={{ fontSize: size * 0.09 }}>out of 100</span>
      </div>
    </div>
  );
}

const LOADING_STEPS = [
  'Launching Google Lighthouse…',
  'Loading your site on a real mobile device…',
  'Measuring Core Web Vitals…',
  'Scoring SEO, accessibility & best practices…',
  'Writing your action plan…',
];

/* ─────────────────────────────  page  ───────────────────────────── */

export default function FreeAudit() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'result' | 'error'>('idle');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useSEO(
    'Free Website Audit | Canvex Studio: Real Google Lighthouse Report',
    'Get a free instant website audit powered by real Google Lighthouse data: Core Web Vitals, SEO, performance, and accessibility scored live. Built by Canvex Studio, New York.',
    '/free-audit',
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Free Website Audit Tool, Canvex Studio',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Instant website audit using real Google Lighthouse data: Core Web Vitals, performance, SEO, and accessibility, translated into a plain-English action plan.',
      url: 'https://www.canvexstudio.com/free-audit',
      provider: { '@type': 'Organization', name: 'Canvex Studio', url: 'https://www.canvexstudio.com' },
    }
  );

  // rotate loading messages while the (real, slow) Lighthouse run happens
  useEffect(() => {
    if (state !== 'loading') return;
    setStep(0);
    const id = setInterval(() => setStep(s => Math.min(s + 1, LOADING_STEPS.length - 1)), 4500);
    return () => clearInterval(id);
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = normalizeUrl(url);
    if (!trimmed) {
      setErrorMsg("That doesn't look like a website address. Try something like yourwebsite.com");
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROK_API_KEY;

    try {
      // 1. REAL measured data from Google Lighthouse
      const measured = await fetchPageSpeed(trimmed);

      // 2. AI (or templated) narrative layered on top of real numbers
      let narrative;
      try {
        narrative = apiKey ? await fetchNarrative(trimmed, measured, apiKey) : templatedNarrative(measured);
      } catch {
        narrative = templatedNarrative(measured);
      }

      setResult({
        url: trimmed,
        overall: measured.overall!,
        grade: measured.grade!,
        categories: measured.categories!,
        vitals: measured.vitals!,
        opportunities: measured.opportunities!,
        revenueRisk: measured.revenueRisk!,
        screenshot: measured.screenshot,
        security: measured.security,
        psiUnavailable: measured.psiUnavailable,
        measured: true,
        fieldData: measured.fieldData!,
        summary: narrative.summary || templatedNarrative(measured).summary,
        conversion: narrative.conversion,
        topFixes: narrative.topFixes.length ? narrative.topFixes : templatedNarrative(measured).topFixes,
        cta: narrative.cta,
      });
      setState('result');
    } catch {
      // Real Lighthouse unavailable (no PSI key, quota, or site unreachable): degrade to AI-only, never a dead end.
      if (apiKey) {
        try {
          setResult(await runAIOnlyAudit(trimmed, apiKey));
          setState('result');
          return;
        } catch { /* fall through to error */ }
      }
      setErrorMsg("We couldn't complete a live scan of that URL. Check the address is public and reachable, then try again.");
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setUrl('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] bg-[#00F0FF]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-36 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 mb-12 font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Free Audit</span>
        </nav>

        <AnimatePresence mode="wait">

          {/* ── IDLE ── */}
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/5 text-[#00F0FF] text-xs font-bold uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_8px_#00F0FF]" />
                Powered by Google Lighthouse · Free · No Email
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-6 uppercase leading-none">
                IS YOUR SITE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF]">COSTING YOU</span><br />
                CLIENTS?
              </h1>

              <p className="text-white/60 text-xl font-light leading-relaxed max-w-2xl mb-6">
                This isn't an AI guess. We run a live <span className="text-white">Google Lighthouse</span> scan on your site, the same engine Google uses to rank you, then translate the real Core Web Vitals, SEO, and accessibility scores into a plain-English action plan.
              </p>
              <p className="text-white/40 text-sm font-light max-w-2xl mb-12">
                Real measured data · Core Web Vitals · Revenue-leak analysis · Takes ~30 seconds.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-12">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="yourwebsite.com"
                  required
                  aria-label="Your website address"
                  className="flex-1 px-6 py-4 rounded-full border border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/30 transition-all text-base font-light backdrop-blur-sm"
                />
                <button type="submit" className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#00F0FF] text-black rounded-full font-semibold text-sm hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                  Run Live Audit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                {[
                  { icon: Gauge, label: 'Core Web Vitals' },
                  { icon: Zap, label: 'Performance' },
                  { icon: Search, label: 'SEO & Visibility' },
                  { icon: TrendingDown, label: 'Revenue Leaks' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-white/50 text-sm font-light">
                    <Icon className="w-4 h-4 text-[#00F0FF] shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {state === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-2 border-[#00F0FF]/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#00F0FF]/10 animate-ping" />
              </div>
              <h2 className="text-2xl font-display font-bold uppercase mb-3">Running Live Scan</h2>
              <AnimatePresence mode="wait">
                <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-white/50 font-light">
                  {LOADING_STEPS[step]}
                </motion.p>
              </AnimatePresence>
              <p className="text-white/25 text-xs font-light mt-6 max-w-xs">A real Lighthouse run takes 20–40 seconds. Worth the wait. These are real numbers, not estimates.</p>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {state === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
              <XCircle className="w-12 h-12 text-red-400" />
              <p className="text-white/70 max-w-md">{errorMsg}</p>
              <button onClick={reset} className="px-6 py-3 bg-[#00F0FF] text-black rounded-full font-medium text-sm hover:scale-105 transition-transform">Try Again</button>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {state === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Preliminary banner, shown only when we could NOT run a real measurement */}
              {!result.measured && (
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 mb-8">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-yellow-200/80 text-sm font-light leading-relaxed">
                    <span className="font-medium text-yellow-200">Preliminary review.</span> A live measurement wasn't available for this URL, so these are best-practice estimates, not measured figures. Book a call for a full, measured Lighthouse audit.
                  </p>
                </div>
              )}

              {/* Lighthouse unavailable: the security half is still fully measured */}
              {result.measured && result.psiUnavailable && (
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#00F0FF]/25 bg-[#00F0FF]/5 mb-8">
                  <Shield className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                  <p className="text-white/70 text-sm font-light leading-relaxed">
                    <span className="font-medium text-white">Security report only.</span> The Google Lighthouse
                    {result.psiUnavailable === 'timeout' ? ' scan timed out' : ' scan was unavailable'} for this run, so
                    performance, SEO and accessibility are not scored below. Everything shown is still measured directly
                    against your live site.
                  </p>
                </div>
              )}

              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-14">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-white/40 font-medium uppercase tracking-widest mb-4">
                    <span>
                      {!result.measured ? 'Preliminary Review'
                        : result.psiUnavailable ? 'Live Security Report'
                        : 'Live Lighthouse Report'}
                    </span>
                    <span>·</span>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#00F0FF] transition-colors truncate max-w-[220px]">
                      {result.url.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-display font-bold text-7xl md:text-8xl leading-none" style={{ color: SCORE_COLORS[getLevel(result.overall)] }}>
                      {result.grade}
                    </span>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter uppercase leading-none">
                        Overall Grade
                      </h1>
                      <p className="text-white/40 text-sm mt-1">
                        {result.psiUnavailable
                          ? 'Measured security grade, Mozilla Observatory scale.'
                          : 'Weighted across all five categories, measured on mobile.'}
                      </p>
                    </div>
                  </div>
                  <p className="text-white/70 font-light text-lg leading-relaxed max-w-xl">{result.summary}</p>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-4">
                  <ScoreRing score={result.overall} size={160} />
                  {result.screenshot && (
                    <div className="rounded-xl overflow-hidden border border-white/10 w-[110px] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      <img src={result.screenshot} alt={`Screenshot of ${result.url}`} className="w-full block" />
                    </div>
                  )}
                </div>
              </div>

              {/* Category scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {result.categories.map((cat, i) => (
                  <motion.div key={cat.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <cat.icon className="w-4 h-4" style={{ color: SCORE_COLORS[cat.level] }} />
                        </div>
                        <span className="font-semibold text-sm text-white">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-xl" style={{ color: SCORE_COLORS[cat.level] }}>{cat.score}</span>
                        <span className="text-white/30 text-xs ml-1">/100</span>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: SCORE_COLORS[cat.level], boxShadow: `0 0 8px ${SCORE_COLORS[cat.level]}` }}
                        initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ duration: 1, delay: i * 0.08 + 0.3, ease: [0.22, 1, 0.36, 1] }} />
                    </div>
                    <div className="space-y-1.5">
                      {cat.issues.map((issue, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-white/60 font-light">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />{issue}
                        </div>
                      ))}
                      {cat.wins.map((win, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-white/60 font-light">
                          <CheckCircle className="w-3 h-3 text-[#00F0FF] shrink-0 mt-0.5" />{win}
                        </div>
                      ))}
                      {cat.issues.length === 0 && cat.wins.length === 0 && (
                        <div className="text-xs text-white/40 font-light">No blocking issues flagged.</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Core Web Vitals */}
              {result.vitals.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] mb-6">
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-[#00F0FF]" />
                      <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF]">Core Web Vitals</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full border border-white/10 text-white/50">
                      {result.fieldData ? 'Real-user data · 28-day' : 'Lab estimate · single run'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {result.vitals.map(v => (
                      <div key={v.key} className="text-center">
                        <div className="font-display font-bold text-2xl mb-1" style={{ color: VITAL_COLORS[v.rating] }}>{v.value}</div>
                        <div className="text-[10px] uppercase tracking-wider text-white/50 font-medium leading-tight mb-1">{v.label}</div>
                        <div className="text-[10px] text-white/30 font-light">{v.threshold}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Security report (Observatory-calibrated) */}
              {result.security && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 shrink-0 text-[#00F0FF]" />
                      <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF] whitespace-nowrap">Security Report</p>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full border border-white/10 text-white/50 whitespace-nowrap">
                        Mozilla Observatory scale
                      </span>
                      <span className="font-display font-bold text-3xl leading-none" style={{ color: SCORE_COLORS[getLevel(result.security.score)] }}>
                        {result.security.grade}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {result.security.findings.map(f => (
                      <div key={f.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0 mt-0.5 w-[64px] text-center"
                          style={{ color: SEVERITY_COLORS[f.severity], background: `${SEVERITY_COLORS[f.severity]}1A` }}
                        >
                          {SEVERITY_LABELS[f.severity]}
                        </span>
                        <div className="min-w-0">
                          <p className="text-white/85 text-sm font-medium leading-snug">{f.title}</p>
                          <p className="text-white/45 text-xs font-light leading-relaxed mt-1">{f.detail}</p>
                        </div>
                        {f.modifier !== 0 && (
                          <span className="ml-auto shrink-0 text-xs font-medium tabular-nums" style={{ color: SEVERITY_COLORS[f.severity] }}>
                            {f.modifier > 0 ? '+' : ''}{f.modifier}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-white/30 text-[11px] font-light leading-relaxed mt-6 pt-5 border-t border-white/10">
                    Scored live against your real HTTP response using the Mozilla HTTP Observatory methodology, starting at 100 and applying each modifier above. Checks cover HTTPS enforcement, HSTS, Content Security Policy, clickjacking, cookie flags, CORS, Subresource Integrity, mixed content and version disclosure.
                  </p>
                </motion.div>
              )}

              {/* Revenue risk */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="p-8 rounded-2xl border mb-6" style={{ borderColor: `${RISK_COLORS[result.revenueRisk.level]}40`, background: `${RISK_COLORS[result.revenueRisk.level]}0D` }}>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="w-5 h-5" style={{ color: RISK_COLORS[result.revenueRisk.level] }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: RISK_COLORS[result.revenueRisk.level] }}>
                    Revenue Risk: {result.revenueRisk.level}
                  </span>
                </div>
                <p className="text-white font-medium text-lg mb-2">{result.revenueRisk.headline}</p>
                <p className="text-white/60 font-light leading-relaxed">{result.revenueRisk.detail}</p>
              </motion.div>

              {/* Speed opportunities (real ms savings) */}
              {result.opportunities.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] mb-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Clock className="w-4 h-4 text-[#00F0FF]" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF]">Biggest Speed Wins</p>
                  </div>
                  <div className="space-y-3">
                    {result.opportunities.map((o, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="text-white/80 font-light text-sm">{o.title}</span>
                        <span className="text-[#00F0FF] font-medium text-sm whitespace-nowrap">save {o.savingsLabel}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Top priorities (AI-interpreted business impact) */}
              {result.topFixes.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="p-8 rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/5 mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF] mb-5">Your Top 3 Priorities</p>
                  <div className="space-y-4">
                    {result.topFixes.map((fix, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="text-[#00F0FF] font-display font-bold text-2xl leading-none shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-white/80 font-light leading-relaxed">{fix}</p>
                      </div>
                    ))}
                  </div>
                  {result.conversion && (
                    <p className="text-white/50 font-light text-sm leading-relaxed mt-6 pt-6 border-t border-white/10">{result.conversion}</p>
                  )}
                </motion.div>
              )}

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-8 rounded-2xl border border-white/10 bg-[#0A0A0A]/80">
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Ready to fix it?</p>
                  <p className="text-white font-medium text-lg max-w-md">{result.cta}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <a href="https://calendly.com/canvexstudio/30min" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#00F0FF] text-black rounded-full font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                    <CalendarDays className="w-4 h-4" />Book a Free Call
                  </a>
                  <button onClick={reset}
                    className="flex items-center gap-2 px-6 py-3.5 border border-white/20 rounded-full font-medium text-sm text-white/70 hover:text-white hover:border-white/40 transition-all whitespace-nowrap">
                    Audit Another Site
                  </button>
                </div>
              </motion.div>

              <p className="text-center text-white/30 text-xs font-light mt-8">
                {!result.measured
                  ? 'Preliminary AI review · Full measured audit by '
                  : result.psiUnavailable
                    ? 'Measured live against the Mozilla Observatory scale · Interpreted by '
                    : 'Measured live with Google Lighthouse · Interpreted by '}
                <Link to="/" className="text-[#00F0FF] hover:underline">Canvex Studio</Link>, New York
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
