#!/usr/bin/env node
/**
 * AI-powered auto-fix using Claude API.
 * Reads .seo-report.json and .lighthouse-results.json, feeds issues plus
 * relevant source files to Claude, and outputs targeted code fixes.
 *
 * Usage:
 *   node scripts/auto-fix.js            # dry run — prints suggestions
 *   node scripts/auto-fix.js --apply    # writes suggestions to .auto-fix-suggestions.md
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/auto-fix.js
 *
 * Requires ANTHROPIC_API_KEY in .env or environment.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir  = dirname(fileURLToPath(import.meta.url));
const ROOT   = resolve(__dir, '..');
const APPLY  = process.argv.includes('--apply');

// ── ANSI ─────────────────────────────────────────────────────────────────────
const R = '\x1b[0m', B = '\x1b[1m', D = '\x1b[2m';
const red = '\x1b[31m', grn = '\x1b[32m', ylw = '\x1b[33m', cyn = '\x1b[36m';

// ── Load .env ────────────────────────────────────────────────────────────────
const envPath = join(ROOT, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    }
  }
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error(`${red}${B}❌  ANTHROPIC_API_KEY not set.${R}`);
  console.error(`   Add it to your .env file:  ANTHROPIC_API_KEY=sk-ant-...`);
  process.exit(1);
}

// ── Collect issues from report files ────────────────────────────────────────

function loadReport(name) {
  const p = join(ROOT, name);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

const seoReport  = loadReport('.seo-report.json');
const lhReport   = loadReport('.lighthouse-results.json');
const contReport = loadReport('.content-report.json');

const allIssues = [];

if (seoReport) {
  for (const i of seoReport.errors   ?? []) allIssues.push(`[SEO ERROR] ${i.msg}`);
  for (const i of seoReport.warnings ?? []) allIssues.push(`[SEO WARN]  ${i.msg}`);
}
if (contReport) {
  for (const i of contReport.errors   ?? []) allIssues.push(`[CONTENT ERROR] ${i.msg}`);
  for (const i of contReport.warnings ?? []) allIssues.push(`[CONTENT WARN]  ${i.msg}`);
}
if (lhReport?.failures) {
  for (const f of lhReport.failures) {
    allIssues.push(`[LIGHTHOUSE ${f.category.toUpperCase()}] Score: ${f.score}/100`);
    for (const a of f.audits ?? []) {
      allIssues.push(`  • ${a.title}${a.displayValue ? ' (' + a.displayValue + ')' : ''}`);
    }
  }
}

if (allIssues.length === 0) {
  console.log(`${grn}${B}✅  No issues found in reports — nothing to fix.${R}`);
  console.log(`   Run seo:check and/or lhci first to generate reports.`);
  process.exit(0);
}

// ── Read source files for context ────────────────────────────────────────────

const KEY_FILES = [
  'index.html',
  'src/lib/useSEO.ts',
  'src/pages/Home.tsx',
  'src/pages/BlogIndex.tsx',
  'src/components/BlogSection.tsx',
  'src/components/Projects.tsx',
  'src/components/Hero.tsx',
  'public/robots.txt',
  'public/sitemap.xml',
];

// Extra files passed on CLI
for (const arg of process.argv.slice(2).filter(a => !a.startsWith('--'))) {
  KEY_FILES.push(arg);
}

const fileContext = KEY_FILES
  .filter(f => existsSync(join(ROOT, f)))
  .map(f => {
    const content = readFileSync(join(ROOT, f), 'utf8');
    const snippet = content.length > 5000 ? content.slice(0, 5000) + '\n[… truncated]' : content;
    return `### ${f}\n\`\`\`\n${snippet}\n\`\`\``;
  })
  .join('\n\n');

// ── Build Claude prompt ──────────────────────────────────────────────────────

const prompt = `You are an expert React/TypeScript developer reviewing a portfolio site called Canvex Studio (https://www.canvexstudio.com).

## Detected issues from automated SEO, content, and Lighthouse checks:

${allIssues.map((i, n) => `${n + 1}. ${i}`).join('\n')}

## Relevant source files:

${fileContext}

## Your task:

For each issue above, provide the exact code change needed. Format each fix as:

**Fix N: [Short description]**
File: \`path/to/file\`
\`\`\`diff
- old line(s)
+ new line(s)
\`\`\`
Reason: [one sentence why]

Rules:
- Only fix what's listed above — no refactoring, no new features
- Prefer minimal changes (single-line fixes > multi-line rewrites)
- For title/description length: provide the corrected string
- For missing meta tags: provide the complete tag to add
- If an issue can't be fixed in source (e.g., third-party controlled), say so briefly
- Skip issues that are architectural limitations (CSR/SSR) unless there's a quick fix`;

// ── Call Claude API ──────────────────────────────────────────────────────────

console.log(`\n${B}🤖  Claude Auto-Fix${R}`);
console.log('─'.repeat(60));
console.log(`Analyzing ${allIssues.length} issue(s) from reports...`);
if (APPLY) console.log(`${ylw}⚠️  --apply flag set: suggestions will be saved to .auto-fix-suggestions.md${R}`);

let suggestion;
try {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 4096,
      messages:   [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`${red}❌  Claude API error ${res.status}: ${err}${R}`);
    process.exit(1);
  }

  const data = await res.json();
  suggestion  = data.content?.[0]?.text ?? '(empty response)';
} catch (e) {
  console.error(`${red}❌  Request failed: ${e.message}${R}`);
  process.exit(1);
}

console.log(`\n${cyn}${B}💡  Suggested fixes:${R}\n`);
console.log(suggestion);

// Always save to file
const outPath = join(ROOT, '.auto-fix-suggestions.md');
writeFileSync(outPath, `# Auto-Fix Suggestions\nGenerated: ${new Date().toISOString()}\n\n${suggestion}\n`);
console.log(`\n${D}Full suggestions saved to .auto-fix-suggestions.md${R}`);

if (!APPLY) {
  console.log(`\n${ylw}ℹ️  Review the suggestions above, then apply them manually or re-run with ${B}--apply${R}${ylw}.${R}`);
}
