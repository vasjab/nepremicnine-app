import { execFileSync } from 'node:child_process';
import { getLocalSupabaseEnv } from './local-supabase';

function sqlEscape(value: string) {
  return value.replace(/'/g, "''");
}

export function authUserExistsInDb(email: string): boolean {
  const { dbUrl } = getLocalSupabaseEnv();
  const query = `select exists(select 1 from auth.users where email = '${sqlEscape(email)}');`;
  const output = execFileSync('psql', [dbUrl, '-tAc', query], {
    encoding: 'utf8',
  }).trim();

  return output === 't';
}
