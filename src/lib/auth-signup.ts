import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getServerDbPool } from '@/lib/server-db';

const SIGNUP_CODE_TTL_MS = 10 * 60 * 1000;
const MAX_SIGNUP_CODE_ATTEMPTS = 5;

export type AuthStartFlow = 'signin' | 'signup';

function createPublicAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateTemporaryPassword() {
  return `${crypto.randomBytes(24).toString('base64url')}Aa1!`;
}

export async function getAuthUserByEmail(email: string) {
  const pool = getServerDbPool();
  const result = await pool.query<{
    id: string;
    email_confirmed_at: string | null;
  }>(
    `
      select id, email_confirmed_at
      from auth.users
      where lower(email) = lower($1)
      limit 1
    `,
    [normalizeEmail(email)]
  );

  return result.rows[0] || null;
}

export async function deleteUnconfirmedAuthUser(email: string) {
  const pool = getServerDbPool();
  await pool.query(
    `
      delete from auth.users
      where lower(email) = lower($1)
        and email_confirmed_at is null
    `,
    [normalizeEmail(email)]
  );
}

export async function startEmailAuthFlow(email: string): Promise<{ flow: AuthStartFlow; code?: string }> {
  const normalizedEmail = normalizeEmail(email);
  const authUser = await getAuthUserByEmail(normalizedEmail);

  if (authUser?.email_confirmed_at) {
    return { flow: 'signin' };
  }

  if (authUser && !authUser.email_confirmed_at) {
    await deleteUnconfirmedAuthUser(normalizedEmail);
  }

  const pool = getServerDbPool();
  const code = generateVerificationCode();

  await pool.query(
    `
      delete from public.email_verification_challenges
      where lower(email) = lower($1)
        and consumed_at is null
    `,
    [normalizedEmail]
  );

  await pool.query(
    `
      insert into public.email_verification_challenges (
        email,
        code_hash,
        expires_at
      )
      values ($1, $2, $3)
    `,
    [
      normalizedEmail,
      hashCode(code),
      new Date(Date.now() + SIGNUP_CODE_TTL_MS).toISOString(),
    ]
  );

  return { flow: 'signup', code };
}

async function getLatestChallenge(email: string) {
  const pool = getServerDbPool();
  const result = await pool.query<{
    id: string;
    code_hash: string;
    attempts: number;
    expires_at: string;
    verified_at: string | null;
  }>(
    `
      select id, code_hash, attempts, expires_at, verified_at
      from public.email_verification_challenges
      where lower(email) = lower($1)
        and consumed_at is null
      order by created_at desc
      limit 1
    `,
    [normalizeEmail(email)]
  );

  return result.rows[0] || null;
}

async function recordInvalidAttempt(challengeId: string, attempts: number) {
  const pool = getServerDbPool();
  const shouldConsume = attempts + 1 >= MAX_SIGNUP_CODE_ATTEMPTS;

  await pool.query(
    `
      update public.email_verification_challenges
      set
        attempts = attempts + 1,
        consumed_at = case when $2 then now() else consumed_at end,
        updated_at = now()
      where id = $1
    `,
    [challengeId, shouldConsume]
  );
}

async function confirmAuthUserEmail(email: string) {
  const pool = getServerDbPool();
  const normalizedEmail = normalizeEmail(email);

  await pool.query(
    `
      update auth.users
      set
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_set(
          coalesce(raw_user_meta_data, '{}'::jsonb),
          '{email_verified}',
          'true'::jsonb,
          true
        ),
        updated_at = now()
      where lower(email) = lower($1)
    `,
    [normalizedEmail]
  );

  await pool.query(
    `
      update auth.identities
      set
        identity_data = jsonb_set(
          coalesce(identity_data, '{}'::jsonb),
          '{email_verified}',
          'true'::jsonb,
          true
        ),
        updated_at = now()
      where email = lower($1)
    `,
    [normalizedEmail]
  );
}

async function markChallengeConsumed(challengeId: string) {
  const pool = getServerDbPool();
  await pool.query(
    `
      update public.email_verification_challenges
      set
        verified_at = coalesce(verified_at, now()),
        consumed_at = now(),
        updated_at = now()
      where id = $1
    `,
    [challengeId]
  );
}

export async function completeVerifiedSignup(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedCode = code.trim();
  const challenge = await getLatestChallenge(normalizedEmail);

  if (!challenge) {
    throw new Error('No verification request was found. Please request a new code.');
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    await markChallengeConsumed(challenge.id);
    throw new Error('This verification code has expired. Please request a new one.');
  }

  if (challenge.code_hash !== hashCode(trimmedCode)) {
    await recordInvalidAttempt(challenge.id, challenge.attempts);
    throw new Error('Invalid verification code.');
  }

  const existingUser = await getAuthUserByEmail(normalizedEmail);
  if (existingUser?.email_confirmed_at) {
    await markChallengeConsumed(challenge.id);
    throw new Error('This email already has an account. Please sign in instead.');
  }

  if (existingUser && !existingUser.email_confirmed_at) {
    await deleteUnconfirmedAuthUser(normalizedEmail);
  }

  const temporaryPassword = generateTemporaryPassword();
  const publicAuthClient = createPublicAuthClient();
  const { error } = await publicAuthClient.auth.signUp({
    email: normalizedEmail,
    password: temporaryPassword,
  });

  if (error) {
    throw error;
  }

  await confirmAuthUserEmail(normalizedEmail);
  await markChallengeConsumed(challenge.id);

  return { temporaryPassword };
}
