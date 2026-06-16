#!/usr/bin/env node
/**
 * Content & crawler check — verifies SPA routes are reachable,
 * response times are acceptable, static assets serve correctly,
 * and raw HTML has the base meta shell crawlers expect.
 *
 * Usage: node scripts/content-check.js
 */

import { writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');
const SITE  = 'https://www.canvexstudio.com';

const SPA_ROUTES = ['/', '/blog', '/case-study/1', '/case-study/2', '/case-study/3', '/case-study/4'];
const STATIC_ASSETS = [
  { path: '/robots.txt',         type: 'text/plain' },
  { path: '/sitemap.xml',        type: 'xml'        },
  { path: '/dillan-profile.jpg', type: 'image'      },
];

// ── ANSI ─────────────────────────────────────────────────────────────────────
const R = '\x1b[0m', B = '\x1b[1m', D = '\x1b[2m';
const red = '\x1b[31m', grn = '\x1b[32m', ylw = '\x1b[33m', cyn = '\x1b[36m';

let errors = 0, warnings = 0;
const issueLog = [];

function pass(msg, d = '') { console.log(`  ${grn}✅ ${msg}${d ? D + ' — ' + d + R : ''}${R}`); }
function warn(msg, d = '') { console.log(`  ${ylw}⚠️  ${msg}${d ? D + ' — ' + d + R : ''}${R}`); warnings++; issueLog.push({ level: 'warn', msg }); }
function fail(msg, d = '') { console.log(`  ${red}❌ ${msg}${d ? D + ' — ' + d + R : ''}${R}`); errors++; issueLog.push({ level: 'error', msg }); }
function note(msg)          { console.log(`     ${D}↳ ${msg}${R}`); }

// ── SPA route check ──────────────────────────────────────────────────────────

async function checkRoute(path) {
  const url = SITE + path;
  const t0  = Date.now();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const ms = Date.now() - t0;
    const ct = res.headers.get('content-type') ?? '';

    if (!res.ok) { fail(`${path}`, `HTTP ${res.status} — ${ms}ms`); return; }
    if (!ct.includes('text/html')) { fail(`${path}`, `wrong Content-Type: "${ct}"`); return; }

    const html = await res.text();

    // React root shell
    if (!html.includes('id="root"') && !html.includes("id='root'")) {
      warn(`${path}`, 'HTML missing React root element');
    }

    // Base title (what crawlers without JS see — from index.html)
    const hasTitle = /<title[^>]*>[^<]{10,}<\/title>/i.test(html);
    const hasDesc  = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html)
                  || /<meta[^>]+content=["'][^"']{20,}["'][^>]+name=["']description["']/i.test(html);
    if (!hasTitle) warn(`${path}`, 'Missing or empty <title> in static HTML');
    if (!hasDesc)  warn(`${path}`, 'Missing or short meta description in static HTML');

    // JSON-LD in static HTML
    if (!html.includes('application/ld+json')) {
      warn(`${path}`, 'No JSON-LD schema in static HTML');
    }

    // Response time
    const timeStatus = ms > 3000 ? `${ylw}slow${R}` : ms > 1500 ? `${ylw}moderate${R}` : `${grn}fast${R}`;
    pass(`${path}`, `HTTP ${res.status} — ${ms}ms (${timeStatus}${D})`);
    if (ms > 3000) warn(`${path} slow response: ${ms}ms`, 'ideal <3000ms');

  } catch (e) {
    fail(`${path}`, e.message);
  }
}

// ── Static asset check ───────────────────────────────────────────────────────

async function checkAsset(path, expectedType) {
  const url = SITE + path;
  try {
    const res = await fetch(url, {
      method: expectedType === 'image' ? 'HEAD' : 'GET',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) { fail(path, `HTTP ${res.status}`); return; }
    const ct = res.headers.get('content-type') ?? '';
    if (expectedType && !ct.toLowerCase().includes(expectedType)) {
      warn(path, `Content-Type "${ct}" — expected "${expectedType}"`);
    } else {
      pass(path, `HTTP ${res.status}`);
    }
  } catch (e) {
    fail(path, e.message);
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────

console.log(`\n${B}🕷️  Content & Crawler Check — ${SITE}${R}`);
console.log('='.repeat(60));

console.log(`\n${cyn}${B}📄 SPA Routes (Googlebot UA)${R}`);
console.log('─'.repeat(60));
note('CSR app: Googlebot executes JS so sees full content. Non-Google crawlers see HTML shell only.');

// Check routes concurrently
await Promise.all(SPA_ROUTES.map(r => checkRoute(r)));

console.log(`\n${cyn}${B}📦 Static Assets${R}`);
console.log('─'.repeat(60));
await Promise.all(STATIC_ASSETS.map(a => checkAsset(a.path, a.type)));

// CSR advisory
console.log(`\n${cyn}${B}ℹ️  CSR / Indexability Notes${R}`);
console.log('─'.repeat(60));
note('Google: executes JS → sees dynamic meta tags from useSEO() hooks ✅');
note('Bing, social cards (Slack, Discord, Twitter): JS not always executed ⚠️');
note('For full static SEO: consider Next.js SSR or Vite SSG (vite-plugin-ssr)');
note('Current mitigation: og:title, og:description, og:image in static index.html ✅');

// Save report
writeFileSync(
  join(ROOT, '.content-report.json'),
  JSON.stringify({ errors: issueLog.filter(i => i.level === 'error'), warnings: issueLog.filter(i => i.level === 'warn') }, null, 2)
);

console.log('\n' + '='.repeat(60));
if (errors > 0) {
  console.log(`\n${red}${B}❌ Content check failed: ${errors} error(s), ${warnings} warning(s)${R}\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n${ylw}${B}⚠️  Content check passed with ${warnings} warning(s)${R}\n`);
} else {
  console.log(`\n${grn}${B}✅ Content check passed${R}\n`);
}
