#!/usr/bin/env node
/**
 * Pre-deploy Lighthouse gate.
 * Builds, serves via vite preview, audits with lhci, blocks if any score < threshold.
 * Performance threshold is 80 (4x CPU throttle artificially lowers SPA scores locally).
 * All other categories must score 90+.
 * Usage: npm run deploy
 */

import { execSync, spawnSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const MIN_SCORE    = 0.9;
const MIN_PERF     = 0.8;
const LHCI_DIR     = '.lighthouseci';
const PREVIEW_PORT = 4173;
const PREVIEW_URL  = `http://localhost:${PREVIEW_PORT}/`;

const CATEGORIES = {
  performance:      'Performance',
  accessibility:    'Accessibility',
  'best-practices': 'Best Practices',
  seo:              'SEO',
};

// ── helpers ──────────────────────────────────────────────────────────────────

function bar(score) {
  const filled = Math.round(score / 10);
  return '[' + '█'.repeat(filled) + '░'.repeat(10 - filled) + ']';
}
function colour(score) {
  if (score >= 90) return '\x1b[32m';
  if (score >= 50) return '\x1b[33m';
  return '\x1b[31m';
}
const reset = '\x1b[0m';
const bold  = '\x1b[1m';
const dim   = '\x1b[2m';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── clean previous run ───────────────────────────────────────────────────────

if (existsSync(LHCI_DIR)) rmSync(LHCI_DIR, { recursive: true });

// ── build ────────────────────────────────────────────────────────────────────

console.log(`\n${bold}🔍  Lighthouse pre-deploy audit${reset}`);
console.log(`${dim}📦  Building...${reset}`);
execSync('npm run build', { stdio: 'inherit' });

// ── chrome detection ─────────────────────────────────────────────────────────

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
].filter(Boolean);

const chromePath = CHROME_PATHS.find(p => existsSync(p));
console.log(`${dim}🌐  Chrome: ${chromePath ?? 'system default'}${reset}`);

// ── start preview server ──────────────────────────────────────────────────────

console.log(`${dim}🚀  Starting vite preview on port ${PREVIEW_PORT}...${reset}`);

const previewProc = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
  windowsHide: true,
  detached: false,
});

// Wait for vite preview to be ready
await sleep(3500);

// ── collect ──────────────────────────────────────────────────────────────────

console.log(`${dim}⚡  Auditing ${PREVIEW_URL}...\n${reset}`);

const collectEnv = { ...process.env };
if (chromePath) collectEnv.CHROME_PATH = chromePath;

const collect = spawnSync(
  'npx',
  ['lhci', 'collect', `--url=${PREVIEW_URL}`, '--numberOfRuns=1', '--settings.output=json'],
  { shell: true, stdio: ['ignore', 'pipe', 'pipe'], env: collectEnv }
);

// Kill preview server regardless of outcome
previewProc.kill();
try { execSync(`taskkill /F /PID ${previewProc.pid} /T`, { stdio: 'ignore' }); } catch {}

if (collect.status !== 0) {
  const out = collect.stdout?.toString().trim();
  const err = collect.stderr?.toString().trim();
  if (out) console.error(out);
  if (err) console.error(err);
  console.error('\x1b[31m❌  lhci collect failed — see output above\x1b[0m');
  process.exit(1);
}

// ── read report ──────────────────────────────────────────────────────────────

const jsonFiles = existsSync(LHCI_DIR)
  ? readdirSync(LHCI_DIR).filter(f => f.endsWith('.json') && !f.includes('manifest'))
  : [];

if (!jsonFiles.length) {
  console.error('\x1b[31m❌  No Lighthouse report found in', LHCI_DIR, '\x1b[0m');
  process.exit(1);
}

const report = JSON.parse(readFileSync(join(LHCI_DIR, jsonFiles[0]), 'utf8'));

// ── score table ───────────────────────────────────────────────────────────────

const LINE = '─'.repeat(52);
console.log(LINE);
console.log(`${'Category'.padEnd(20)} ${'Score'.padEnd(8)} ${'Bar'.padEnd(14)} Status`);
console.log(LINE);

let failed = false;
const failures = [];

for (const [key, label] of Object.entries(CATEGORIES)) {
  const cat       = report.categories?.[key];
  if (!cat) continue;
  const threshold = key === 'performance' ? MIN_PERF : MIN_SCORE;
  const pct       = Math.round((cat.score ?? 0) * 100);
  const minPct    = Math.round(threshold * 100);
  const pass      = pct >= minPct;
  const c         = colour(pct);
  const tag       = key === 'performance' ? ` (gate: ${minPct})` : '';
  console.log(`${pass ? '✅' : '❌'}  ${label.padEnd(18)} ${c}${bold}${String(pct).padStart(3)}/100${reset}  ${c}${bar(pct)}${reset}${tag}`);

  if (!pass) {
    failed = true;
    const badAudits = (cat.auditRefs ?? [])
      .filter(r => (r.weight ?? 0) > 0)
      .map(r => ({ r, audit: report.audits?.[r.id] }))
      .filter(({ audit }) => audit && audit.score !== null && audit.score < threshold)
      .sort((a, b) => (a.audit.score ?? 1) - (b.audit.score ?? 1))
      .slice(0, 6)
      .map(({ audit }) => ({
        title:        audit.title,
        description:  audit.description?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 120),
        score:        Math.round((audit.score ?? 0) * 100),
        displayValue: audit.displayValue ?? '',
      }));
    failures.push({ category: label, score: pct, audits: badAudits });
  }
}

console.log(LINE);

// ── result ────────────────────────────────────────────────────────────────────

if (failed) {
  console.log(`\n\x1b[31m${bold}🚫  Deploy blocked — fix these issues first:\x1b[0m\n`);
  for (const { category, score, audits } of failures) {
    console.log(`\x1b[33m${bold}▸ ${category} — ${score}/100${reset}`);
    for (const a of audits) {
      const val = a.displayValue ? ` (${a.displayValue})` : '';
      console.log(`  • ${bold}${a.title}${val}${reset}`);
      if (a.description) console.log(`    ${dim}${a.description}${reset}`);
    }
    console.log('');
  }
  console.log(`\x1b[36m💡  Paste the output above into Claude and ask it to fix these issues.\x1b[0m\n`);
  writeFileSync('.lighthouse-results.json', JSON.stringify({ passed: false, failures }, null, 2));
  if (existsSync(LHCI_DIR)) rmSync(LHCI_DIR, { recursive: true });
  process.exit(1);
}

// ── all green → deploy ────────────────────────────────────────────────────────

console.log(`\n\x1b[32m${bold}✅  All scores 90+. Pushing to production...\x1b[0m\n`);
if (existsSync(LHCI_DIR)) rmSync(LHCI_DIR, { recursive: true });
execSync('vercel --prod', { stdio: 'inherit' });
