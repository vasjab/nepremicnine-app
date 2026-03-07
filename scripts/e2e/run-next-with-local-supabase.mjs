import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function parseEnv(output) {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .reduce((acc, line) => {
      const index = line.indexOf('=');
      const key = line.slice(0, index);
      let value = line.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
      return acc;
    }, {});
}

function runSupabase(args, options = {}) {
  return execFileSync('supabase', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  });
}

function ensureLocalSupabase() {
  try {
    return parseEnv(runSupabase(['status', '-o', 'env']));
  } catch {
    runSupabase(['start'], { stdio: 'inherit' });
    return parseEnv(runSupabase(['status', '-o', 'env']));
  }
}

const localEnv = ensureLocalSupabase();
const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['next', 'dev', '--hostname', '127.0.0.1', '--port', '3100'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: localEnv.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: localEnv.PUBLISHABLE_KEY || localEnv.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: localEnv.SERVICE_ROLE_KEY || localEnv.SECRET_KEY,
    SUPABASE_DB_URL: localEnv.DB_URL,
    MAILPIT_URL: localEnv.MAILPIT_URL || localEnv.INBUCKET_URL,
    NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3100',
    NEXT_DIST_DIR: '.next-e2e',
  },
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
