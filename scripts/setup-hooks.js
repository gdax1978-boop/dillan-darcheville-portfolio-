#!/usr/bin/env node
/**
 * Installs the pre-push git hook.
 * Run once after "git init":  node scripts/setup-hooks.js
 */

import { writeFileSync, mkdirSync, chmodSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir  = dirname(fileURLToPath(import.meta.url));
const ROOT   = resolve(__dir, '..');
const HOOKS  = join(ROOT, '.git', 'hooks');

const R = '\x1b[0m', B = '\x1b[1m';
const red = '\x1b[31m', grn = '\x1b[32m', ylw = '\x1b[33m';

if (!existsSync(join(ROOT, '.git'))) {
  console.error(`${red}${B}❌  No .git directory found.${R}`);
  console.error(`   Run "git init" first, then re-run this script.`);
  process.exit(1);
}

mkdirSync(HOOKS, { recursive: true });

const hookContent = `#!/bin/sh
# Pre-push quality gate — runs SEO, content, and security checks.
# Blocks the push if any critical checks fail.
# Override: SKIP_CHECKS=1 git push

if [ "$SKIP_CHECKS" = "1" ]; then
  echo "⚠️  SKIP_CHECKS=1 set — bypassing pre-push gates"
  exit 0
fi

echo ""
echo "🔒  Running pre-push quality gate..."
node scripts/pre-push.js
exit $?
`;

const hookPath = join(HOOKS, 'pre-push');
writeFileSync(hookPath, hookContent, { encoding: 'utf8' });

try {
  chmodSync(hookPath, 0o755);
} catch {
  // Windows doesn't support chmod — git-bash handles it
}

console.log(`${grn}${B}✅  pre-push hook installed at .git/hooks/pre-push${R}`);
console.log(`\nThe hook will run automatically on every "git push".`);
console.log(`To bypass (emergencies only):  ${ylw}SKIP_CHECKS=1 git push${R}`);
console.log(`To run manually:               ${ylw}pnpm run pre-push${R}`);
