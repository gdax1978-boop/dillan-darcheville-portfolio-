#!/usr/bin/env node
/**
 * SEO audit — title/description lengths, meta tags, schema, canonical,
 * og/twitter, robots.txt, sitemap.xml, and source-file useSEO() calls.
 *
 * Usage:
 *   node scripts/seo-check.js [url1 url2 ...]
 *   (defaults to https://www.canvexstudio.com/ and /blog)
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');
const SITE  = 'https://www.canvexstudio.com';
const URLS  = process.argv.slice(2).filter(a => a.startsWith('http'))
              .concat(process.argv.slice(2).filter(a => a.startsWith('/')).map(p => SITE + p));
const CHECK_URLS = URLS.length ? URLS : [SITE + '/', SITE + '/blog'];

// ── ANSI ─────────────────────────────────────────────────────────────────────
const R = '\x1b[0m', B = '\x1b[1m', D = '\x1b[2m';
const red = '\x1b[31m', grn = '\x1b[32m', ylw = '\x1b[33m', cyn = '\x1b[36m';

let errors = 0, warnings = 0;
const issueLog = [];

function pass(msg, detail = '') { console.log(`  ${grn}✅ ${msg}${detail ? D + ' (' + detail + ')' + R : ''}${R}`); }
function warn(msg, detail = '') { console.log(`  ${ylw}⚠️  ${msg}${detail ? D + ' (' + detail + ')' + R : ''}${R}`); warnings++; issueLog.push({ level: 'warn', msg }); }
function fail(msg, detail = '') { console.log(`  ${red}❌ ${msg}${detail ? D + ' (' + detail + ')' + R : ''}${R}`); errors++; issueLog.push({ level: 'error', msg }); }
function note(msg)               { console.log(`     ${D}↳ ${msg}${R}`); }

// ── HTML helpers ─────────────────────────────────────────────────────────────

function metaContent(html, name, attr = 'name') {
  const p1 = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  const p2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${name}["']`, 'i');
  return (html.match(p1) ?? html.match(p2))?.[1] ?? null;
}

function allMatches(html, pattern) {
  return [...html.matchAll(new RegExp(pattern, 'gi'))];
}

// ── Live URL audit ────────────────────────────────────────────────────────────

async function auditURL(url) {
  console.log(`\n${cyn}${B}🌐 ${url}${R}`);
  console.log('─'.repeat(60));

  let html;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEO-Check/1.0)', Accept: 'text/html' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { fail(`HTTP ${res.status} ${res.statusText}`); return; }
    html = await res.text();
  } catch (e) {
    fail(`Fetch failed: ${e.message}`);
    return;
  }

  // Title
  const titleM = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!titleM) { fail('Missing <title>'); }
  else {
    const t = titleM[1].trim();
    note(`Title: "${t.slice(0, 70)}${t.length > 70 ? '…' : ''}" — ${t.length} chars`);
    if (t.length < 30)      warn(`Title too short (${t.length} chars)`, 'ideal 30–60');
    else if (t.length > 60) warn(`Title too long (${t.length} chars)`, 'ideal 30–60');
    else                    pass('Title length', `${t.length} chars`);
  }

  // Meta description
  const desc = metaContent(html, 'description');
  if (!desc) { fail('Missing meta description'); }
  else {
    note(`Desc: "${desc.slice(0, 80)}${desc.length > 80 ? '…' : ''}" — ${desc.length} chars`);
    if (desc.length < 70)       warn(`Description too short (${desc.length} chars)`, 'ideal 70–160');
    else if (desc.length > 160) warn(`Description too long (${desc.length} chars)`, 'ideal 70–160');
    else                        pass('Description length', `${desc.length} chars`);
  }

  // Canonical (set by JS in CSR apps — may not appear in static HTML)
  const canonM = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
              ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (!canonM) note('Canonical set by JS (useSEO hook) — Googlebot will see it');
  else         pass('Canonical', canonM[1]);

  // Open Graph
  const ogRequired = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
  for (const tag of ogRequired) {
    const v = metaContent(html, tag, 'property');
    if (!v) fail(`Missing <meta property="${tag}">`);
    else    pass(tag, v.slice(0, 55) + (v.length > 55 ? '…' : ''));
  }

  // Twitter Card
  const twRequired = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
  for (const tag of twRequired) {
    const v = metaContent(html, tag);
    if (!v) warn(`Missing <meta name="${tag}">`);
    else    pass(tag, v.slice(0, 55) + (v.length > 55 ? '…' : ''));
  }

  // JSON-LD Schema
  const schemas = allMatches(html, '<script[^>]+type=["\']application/ld\\+json["\'][^>]*>([\\s\\S]*?)</script>');
  if (!schemas.length) { fail('No JSON-LD schema found'); }
  else {
    for (const [, raw] of schemas) {
      try {
        const d = JSON.parse(raw.trim());
        const types = d['@graph']
          ? d['@graph'].map(n => n['@type']).join(', ')
          : String(d['@type'] ?? 'unknown');
        pass('JSON-LD', types);
      } catch (e) {
        fail(`Invalid JSON-LD: ${e.message}`);
      }
    }
  }

  // Images (static HTML — CSR apps have few here)
  const imgs = allMatches(html, '<img([^>]+)>');
  const missingAlt = imgs.filter(([, a]) => !/\balt=/.test(a)).length;
  if (imgs.length === 0)  note('No <img> in static HTML (CSR — images rendered by JS)');
  else if (missingAlt)    fail(`${missingAlt}/${imgs.length} images missing alt text`);
  else                    pass(`All ${imgs.length} images have alt text`);

  // Meta robots
  const robots = metaContent(html, 'robots');
  if (robots?.includes('noindex')) warn(`meta robots: "${robots}" — page excluded from search`);
  else if (robots)                 pass('meta robots', robots);
}

// ── robots.txt & sitemap.xml ─────────────────────────────────────────────────

async function checkRobotsTxt() {
  console.log(`\n${cyn}${B}🤖 robots.txt${R}`);
  console.log('─'.repeat(60));
  try {
    const res = await fetch(`${SITE}/robots.txt`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) { fail(`robots.txt HTTP ${res.status}`); return; }
    const text = await res.text();
    const ct   = res.headers.get('content-type') ?? '';
    if (!ct.includes('text/plain')) warn(`Content-Type: "${ct}"`, 'expected text/plain');
    else                            pass('Content-Type', ct.split(';')[0]);
    if (!text.includes('User-agent')) warn('robots.txt missing User-agent directive');
    else                              pass('Has User-agent directive');
    if (!text.includes('Sitemap:'))   warn('robots.txt does not reference Sitemap');
    else                              pass('References Sitemap');
    note(text.split('\n').slice(0, 4).join(' | '));
  } catch (e) {
    fail(`robots.txt fetch failed: ${e.message}`);
  }
}

async function checkSitemap() {
  console.log(`\n${cyn}${B}🗺️  sitemap.xml${R}`);
  console.log('─'.repeat(60));
  try {
    const res = await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) { fail(`sitemap.xml HTTP ${res.status}`); return; }
    const text = await res.text();
    const ct   = res.headers.get('content-type') ?? '';
    if (!ct.includes('xml') && !ct.includes('text')) warn(`Content-Type: "${ct}"`);
    else                                              pass('sitemap.xml accessible', ct.split(';')[0]);
    const urlCount = (text.match(/<url>/g) ?? []).length;
    if (urlCount === 0) warn('No <url> entries found in sitemap');
    else                pass(`${urlCount} URL(s) listed`);
  } catch (e) {
    fail(`sitemap.xml fetch failed: ${e.message}`);
  }
}

// ── Source-file useSEO() validation ─────────────────────────────────────────

function walkDir(dir, exts, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git'].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkDir(full, exts, acc);
    else if (exts.some(e => entry.endsWith(e))) acc.push(full);
  }
  return acc;
}

function checkSourceSEO() {
  console.log(`\n${cyn}${B}📁 Source SEO — useSEO() calls${R}`);
  console.log('─'.repeat(60));

  const files = walkDir(join(ROOT, 'src'), ['.tsx', '.ts']);
  let found = 0;

  for (const file of files) {
    const content  = readFileSync(file, 'utf8');
    const matches  = [...content.matchAll(/useSEO\(\s*(['"`])([^'"`]+)\1\s*,\s*(['"`])([^'"`]+)\3/g)];

    for (const [, tq, title, dq, desc] of matches) {
      found++;
      const rel = file.replace(ROOT, '').replace(/\\/g, '/').replace(/^\//, '');
      note(rel);

      // Skip dynamic template literals — can't evaluate ${expr} statically
      if (title.includes('${')) { note(`Title uses template literal — skipping length check`); }
      else if (title.length < 30)      warn(`Title too short: "${title.slice(0, 45)}" — ${title.length} chars`, 'ideal 30–60');
      else if (title.length > 60) warn(`Title too long: "${title.slice(0, 45)}…" — ${title.length} chars`, 'ideal 30–60');
      else                        pass('Title length OK', `${title.length} chars`);

      if (desc.includes('${')) { note(`Description uses template literal — skipping length check`); }
      else if (desc.length < 70)       warn(`Description too short — ${desc.length} chars`, 'ideal 70–160');
      else if (desc.length > 160) warn(`Description too long — ${desc.length} chars`, 'ideal 70–160');
      else                        pass('Description length OK', `${desc.length} chars`);
    }
  }

  if (found === 0) note('No useSEO() calls found');
  else             note(`Validated ${found} useSEO() call(s)`);
}

// ── Run ──────────────────────────────────────────────────────────────────────

console.log(`\n${B}🔍 SEO Audit — ${SITE}${R}`);
console.log('='.repeat(60));

for (const url of CHECK_URLS) await auditURL(url);
checkSourceSEO();
await checkRobotsTxt();
await checkSitemap();

// Save machine-readable report for auto-fix
writeFileSync(
  join(ROOT, '.seo-report.json'),
  JSON.stringify({ errors: issueLog.filter(i => i.level === 'error'), warnings: issueLog.filter(i => i.level === 'warn') }, null, 2)
);

console.log('\n' + '='.repeat(60));
if (errors > 0) {
  console.log(`\n${red}${B}❌ SEO audit failed: ${errors} error(s), ${warnings} warning(s)${R}\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n${ylw}${B}⚠️  SEO audit passed with ${warnings} warning(s)${R}\n`);
} else {
  console.log(`\n${grn}${B}✅ SEO audit clean${R}\n`);
}
