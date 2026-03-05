import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';

export function getAdminToken(): string {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}:${password}:hemma-admin-salt-2024`);
  let hash = 0;
  for (const byte of data) {
    hash = ((hash << 5) - hash + byte) | 0;
  }
  return `admin_${Math.abs(hash).toString(36)}`;
}

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return false;
  const expectedToken = getAdminToken();
  if (!expectedToken) return false;
  return sessionCookie.value === expectedToken;
}
