import { expect, Page } from '@playwright/test';
import { getLocalSupabaseEnv } from './local-supabase';

interface MailpitMessageSummary {
  ID: string;
  Created: string;
  To?: Array<{ Address?: string }>;
}

interface MailpitMessageDetail {
  Text?: string;
  HTML?: string;
}

const localEnv = getLocalSupabaseEnv();

function matchesRecipient(message: MailpitMessageSummary, email: string) {
  return (message.To || []).some((recipient) => recipient.Address?.toLowerCase() === email.toLowerCase());
}

async function fetchLatestOtp(email: string, since: number): Promise<string | null> {
  const messagesResponse = await fetch(`${localEnv.mailpitUrl}/api/v1/messages`);
  const messagesPayload = await messagesResponse.json() as { messages?: MailpitMessageSummary[] };
  const candidate = (messagesPayload.messages || [])
    .filter((message) => matchesRecipient(message, email))
    .find((message) => new Date(message.Created).getTime() >= since - 1000);

  if (!candidate) {
    return null;
  }

  const detailResponse = await fetch(`${localEnv.mailpitUrl}/api/v1/message/${candidate.ID}`);
  const detail = await detailResponse.json() as MailpitMessageDetail;
  const body = `${detail.Text || ''}\n${detail.HTML || ''}`;
  const code = body.match(/\b\d{6}\b/)?.[0];

  return code || null;
}

export async function waitForOtpCode(email: string, since: number, timeoutMs = 30_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const code = await fetchLatestOtp(email, since);
    if (code) {
      return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for OTP email for ${email}`);
}

export async function requestOtpForEmail(page: Page, email: string): Promise<number> {
  const sentAt = Date.now();
  const currentPathname = new URL(page.url() === 'about:blank' ? 'http://127.0.0.1:3100/' : page.url()).pathname;

  if (!currentPathname.startsWith('/auth')) {
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
  }

  const emailInput = page.getByPlaceholder('you@example.com');
  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);
  await expect(emailInput).toHaveValue(email);
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await expect(page.getByText(`We sent a 6-digit code to`)).toBeVisible();
  return sentAt;
}

export async function completeOtpSignIn(page: Page, email: string, sentAt: number): Promise<void> {
  const otp = await waitForOtpCode(email, sentAt);
  const otpInputs = page.locator('input[inputmode="numeric"]');

  for (const [index, digit] of otp.split('').entries()) {
    const input = otpInputs.nth(index);
    await input.click();
    await input.fill(digit);
    await expect(input).toHaveValue(digit);
  }

  await expect(page).toHaveURL(/\/$/);
  await page.waitForFunction(() => {
    return window.location.pathname === '/' && (
      localStorage.getItem('hemma_remember_me') === 'true' ||
      sessionStorage.getItem('hemma_session_active') === 'true'
    );
  });
  await expect(page.getByPlaceholder('Search...')).toBeVisible();
}

export async function signInWithOtp(page: Page, email: string): Promise<void> {
  const sentAt = await requestOtpForEmail(page, email);
  await completeOtpSignIn(page, email, sentAt);
}

export function createUniqueEmail(prefix: string): string {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${stamp}@hemma.e2e.test`;
}
