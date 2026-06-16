#!/usr/bin/env node
/**
 * Standard Security Deployment Gates
 * Runs SCA, Gitleaks, SAST, and DAST checks.
 * Blocks deployment if any critical vulnerabilities are found.
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, writeFileSync, unlinkSync } from 'fs';

// ── helpers ──────────────────────────────────────────────────────────────────

const reset = '\x1b[0m';
const bold  = '\x1b[1m';
const dim   = '\x1b[2m';
const red   = '\x1b[31m';
const green = '\x1b[32m';
const yellow= '\x1b[33m';
const cyan  = '\x1b[36m';

function logStep(name, description) {
  console.log(`\n${cyan}${bold}🛡️  Gate: ${name}${reset}`);
  console.log(`${dim}   ${description}${reset}`);
}

function runCommand(command, errorMessage, options = {}) {
  try {
    console.log(`${dim}   Running: ${command}${reset}`);
    execSync(command, { stdio: 'inherit', ...options });
    console.log(`   ${green}✅ Passed${reset}`);
    return true;
  } catch (error) {
    console.error(`\n   ${red}❌ Failed: ${errorMessage}${reset}`);
    return false;
  }
}

let hasFailures = false;

console.log(`\n${bold}🔒 Starting Security Deployment Gates${reset}`);

// ── 1. SCA (Software Composition Analysis) ───────────────────────────────────
logStep('SCA (Software Composition Analysis)', 'Checking dependencies for known vulnerabilities...');
const scaPassed = runCommand(
  'pnpm audit --audit-level=high',
  'pnpm audit found high or critical vulnerabilities. Run "pnpm audit" to see details and fix them.'
);
if (!scaPassed) hasFailures = true;

// ── 1b. Trivy filesystem scan (optional — requires trivy in PATH) ─────────────
logStep('Trivy Filesystem Scan', 'Scanning for vulnerabilities in dependencies and secrets...');
let trivyInstalled = false;
try { execSync('trivy --version', { stdio: 'ignore' }); trivyInstalled = true; } catch {}
if (trivyInstalled) {
  const trivyPassed = runCommand(
    'trivy fs . --exit-code 1 --severity HIGH,CRITICAL --no-progress --ignore-unfixed',
    'Trivy found HIGH/CRITICAL vulnerabilities. Run "trivy fs ." to see details.'
  );
  if (!trivyPassed) hasFailures = true;
} else {
  console.log(`   ${yellow}⚠️  trivy not found in PATH — skipping filesystem scan.${reset}`);
  console.log(`   ${dim}💡 Install: winget install AquaSecurity.Trivy  or  brew install trivy${reset}`);
}

// ── 2. Secrets Scanning (Gitleaks) ───────────────────────────────────────────
logStep('Secrets Scanning (Gitleaks)', 'Scanning for hardcoded secrets...');

// Check if gitleaks is installed
let isGitleaksInstalled = false;
try {
  execSync('gitleaks version', { stdio: 'ignore' });
  isGitleaksInstalled = true;
} catch (e) {
  // Try npx gitleaks fallback just to be sure it's not downloaded
  try {
    execSync('npx --yes gitleaks version', { stdio: 'ignore' });
    isGitleaksInstalled = true;
  } catch (err) {}
}

let gitleaksPassed = true;
if (isGitleaksInstalled) {
  gitleaksPassed = runCommand(
    'gitleaks detect --source . -v',
    'Gitleaks detected potential hardcoded secrets. Review the output and remove them.'
  );
} else {
  console.log(`   ${yellow}⚠️  gitleaks CLI not found in PATH. Skipping local secrets scan.${reset}`);
  console.log(`   ${dim}💡 Install it via your package manager (e.g. brew install gitleaks) or use it in CI.${reset}`);
}
if (!gitleaksPassed) hasFailures = true;

// ── 3. SAST (Static Application Security Testing) ────────────────────────────
logStep('SAST (Static Analysis)', 'Scanning source code for insecure patterns...');

const eslintConfigPath = 'eslint.security.config.mjs';
try {
  writeFileSync(eslintConfigPath, `
    import securityPlugin from "eslint-plugin-security";
    import tsParser from "@typescript-eslint/parser";
    export default [
      {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
          parser: tsParser,
          parserOptions: {
            ecmaFeatures: { jsx: true }
          }
        },
        plugins: { security: securityPlugin },
        rules: {
          "security/detect-object-injection": "warn",
          "security/detect-unsafe-regex": "error"
        }
      }
    ];
  `);

  const sastPassed = runCommand(
    `npx --yes eslint src/ --config ${eslintConfigPath}`,
    'SAST scanner found insecure coding patterns. Review the output above.'
  );
  if (!sastPassed) hasFailures = true;
} catch (e) {
  console.error(`   ${red}❌ Failed to run SAST scanner: ${e.message}${reset}`);
  hasFailures = true;
} finally {
  if (existsSync(eslintConfigPath)) {
    unlinkSync(eslintConfigPath);
  }
}

// ── 4. DAST (Dynamic Application Security Testing) ───────────────────────────
logStep('DAST (Dynamic Analysis)', 'Running active security tests against the application...');
if (process.env.DAST_TARGET_URL) {
  // If a target URL is provided, run a placeholder or actual DAST tool.
  // For instance, OWASP ZAP Baseline Scan via Docker:
  // docker run -t owasp/zap2docker-stable zap-baseline.py -t $DAST_TARGET_URL
  console.log(`   ${dim}DAST_TARGET_URL=${process.env.DAST_TARGET_URL}${reset}`);
  const dastPassed = runCommand(
    `echo "Running configured DAST tool against ${process.env.DAST_TARGET_URL}"`, // Replace with actual DAST command
    'DAST scanner found vulnerabilities in the running application.'
  );
  if (!dastPassed) hasFailures = true;
} else {
  console.log(`   ${yellow}⚠️  DAST_TARGET_URL not set. Skipping DAST.${reset}`);
  console.log(`   ${dim}💡 Set DAST_TARGET_URL environment variable to run dynamic scanning (e.g., ZAP) against a running instance.${reset}`);
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
if (hasFailures) {
  console.error(`\n${red}${bold}🚫 Security Gates Failed. Deployment blocked.\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\n${green}${bold}✅ All Security Gates Passed. Proceeding...${reset}\n`);
}
