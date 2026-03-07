import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const playwrightCacheDir = path.join(repoRoot, 'playwright', '.cache');

export interface LocalSupabaseEnv {
  apiUrl: string;
  publishableKey: string;
  serviceRoleKey: string;
  mailpitUrl: string;
  dbUrl: string;
}

function parseEnvOutput(output: string): Record<string, string> {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .reduce<Record<string, string>>((env, line) => {
      const index = line.indexOf('=');
      const key = line.slice(0, index);
      let value = line.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
      return env;
    }, {});
}

function runSupabase(args: string[], stdio: 'pipe' | 'inherit' = 'pipe'): string {
  return execFileSync('supabase', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: stdio === 'inherit' ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });
}

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function getLocalSupabaseEnv(): LocalSupabaseEnv {
  const vars = parseEnvOutput(runSupabase(['status', '-o', 'env']));

  return {
    apiUrl: vars.API_URL,
    publishableKey: vars.PUBLISHABLE_KEY || vars.ANON_KEY,
    serviceRoleKey: vars.SERVICE_ROLE_KEY || vars.SECRET_KEY,
    mailpitUrl: vars.MAILPIT_URL || vars.INBUCKET_URL,
    dbUrl: vars.DB_URL,
  };
}

export function ensureLocalSupabase(): LocalSupabaseEnv {
  try {
    return getLocalSupabaseEnv();
  } catch {
    runSupabase(['start'], 'inherit');
    return getLocalSupabaseEnv();
  }
}

export function resetLocalDatabase(): void {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      runSupabase(['db', 'reset', '--local', '--no-seed', '--yes'], 'inherit');
      return;
    } catch (error) {
      lastError = error;

      if (attempt === 3) {
        break;
      }

      sleep(1500 * attempt);

      try {
        runSupabase(['start'], 'inherit');
      } catch {
        // Keep retrying the reset; the next attempt will fail with the original error if recovery did not help.
      }
    }
  }

  throw lastError;
}
