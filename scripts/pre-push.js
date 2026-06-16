#!/usr/bin/env node
/**
 * Pre-push quality gate — runs all checks before a git push.
 *
 * Checks (always):
 *   1. SEO audit          (title/description/meta/schema)
 *   2. Content check      (route availability, static assets)
 *   3. Security gates     (SCA, Gitleaks, SAST, Trivy)
 *
 * Check (opt-in, slow):
 *   4. Lighthouse CI      (set FULL_AUDIT=1 to enable)
 *
 * Usage:
 *   node scripts/pre-push.js
 *   FULL_AUDIT=1 node scripts/pre-push.js
 *
 * Exit 0 = all checks passed (push proceeds)
 * Exit 1 = one or more checks failed (push blocked)
 */

import { spawnSync } from 'child_process';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir     = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dir, '..');
const FULL      = process.env.FULL_AUDIT === '1';
const START     = Date.now();

// ── ANSI ─────────────────────────────────────────────────────────────────────
const R = '\x1b[0m', B = '\x1b[1m', D = '\x1b[2m';
const red = '\x1b[31m', grn = '\x1b[32m', ylw = '\x1b[33m', cyn = '\x1b[36m';

const LINE = '─'.repeat(60);
const results = [];

// ── Gate runner ───────────────────────────────────────────────────────────────

function runGate(name, scriptPath, warnOnly = false) {
  console.log(`\n${cyn}${B}▸ ${name}${R}`);
  console.log(LINE);

  const start  = Date.now();
  const result = spawnSync('node', [scriptPath], {
    stdio: 'inherit',
    cwd:   ROOT,
    env:   { ...process.env },
    shell: process.platform === 'win32',
  });
  const ms   = Date.now() - start;
  const pass = result.status === 0;

  results.push({ name, pass, warnOnly, ms });

  if (pass) console.log(`${grn}${B}  ✅  ${name} passed${R} ${D}(${(ms / 1000).toFixed(1)}s)${R}`);
  else if (warnOnly) console.log(`${ylw}${B}  ⚠️   ${name} has warnings${R} ${D}(${(ms / 1000).toFixed(1)}s)${R}`);
  else console.log(`${red}${B}  ❌  ${name} failed${R} ${D}(${(ms / 1000).toFixed(1)}s)${R}`);

  return pass;
}

// ── Header ───────────────────────────────────────────────────────────────────

console.log(`\n${B}🚀  Pre-Push Quality Gate${R}`);
console.log(`${D}    Site: https://www.canvexstudio.com${R}`);
if (FULL) console.log(`${ylw}    FULL_AUDIT=1 — Lighthouse CI will run (slow)${R}`);
else      console.log(`${D}    Tip: FULL_AUDIT=1 git push  to include Lighthouse CI${R}`);
console.log('═'.repeat(60));

// ── Gates ────────────────────────────────────────────────────────────────────

const seoOk      = runGate('SEO Audit',       join(__dir, 'seo-check.js'));
const contentOk  = runGate('Content Check',   join(__dir, 'content-check.js'));
const securityOk = runGate('Security Gates',  join(__dir, 'security-gates.js'));

let lhciOk = true;
if (FULL) {
  // Lighthouse CI against live production
  const lhResult = spawnSync('pnpm', ['lhci', 'autorun'], {
    stdio: 'inherit',
    cwd: ROOT,
    shell: process.platform === 'win32',
  });
  lhciOk = lhResult.status === 0;
  results.push({ name: 'Lighthouse CI', pass: lhciOk, warnOnly: false, ms: 0 });
  console.log(lhciOk
    ? `${grn}${B}  ✅  Lighthouse CI passed${R}`
    : `${red}${B}  ❌  Lighthouse CI failed${R}`);
}

// ── Summary ───────────────────────────────────────────────────────────────────

const elapsed = ((Date.now() - START) / 1000).toFixed(1);
console.log('\n' + '═'.repeat(60));
console.log(`\n${B}Results (${elapsed}s total):${R}\n`);

for (const { name, pass, warnOnly, ms } of results) {
  const icon = pass ? `${grn}✅${R}` : warnOnly ? `${ylw}⚠️ ${R}` : `${red}❌${R}`;
  const time = ms > 0 ? ` ${D}${(ms / 1000).toFixed(1)}s${R}` : '';
  console.log(`  ${icon}  ${name}${time}`);
}

const hardFailed = results.filter(r => !r.pass && !r.warnOnly);

console.log('');
if (hardFailed.length === 0) {
  console.log(`${grn}${B}✅  All gates passed — push allowed.${R}\n`);
  process.exit(0);
} else {
  console.log(`${red}${B}🚫  Push blocked — ${hardFailed.length} gate(s) failed:${R}`);
  for (const r of hardFailed) console.log(`   • ${r.name}`);
  console.log(`\n${ylw}💡  To auto-fix with Claude:${R}`);
  console.log(`   pnpm run fix\n`);
  process.exit(1);
}
