import { test, expect } from '@playwright/test';
import { authUserExistsInDb } from './utils/auth-db';
import { completeOtpSignIn, createUniqueEmail, requestOtpForEmail } from './utils/auth';
import { readSeedData } from './utils/seed';

test('guests can browse listings but must sign in to unlock full details', async ({ page }) => {
  const seed = readSeedData();

  await page.goto(`/listing/${seed.listings.rentalParking.id}`);

  await expect(page.getByRole('heading', { name: seed.listings.rentalParking.title, exact: true })).toBeVisible();
  await expect(page.getByTestId('listing-guest-gate')).toBeVisible();
  await expect(page.getByText('Exact address available after sign in')).toBeVisible();
  await expect(page.getByText('Unlock the full listing')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Property Details' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Location' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Apply for This Rental' })).toHaveCount(0);
});

test('verifies the email before creating a new user account', async ({ page }) => {
  const email = createUniqueEmail('verify-first');

  await expect.poll(async () => authUserExistsInDb(email)).toBe(false);

  await page.goto('/auth');
  const firstOtpSentAt = await requestOtpForEmail(page, email);

  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByTestId('auth-intent-copy')).toContainText('before creating your account');
  expect(await page.evaluate(() => localStorage.getItem('hemma_remember_me'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('hemma_session_active'))).toBeNull();
  await expect.poll(async () => authUserExistsInDb(email)).toBe(false);

  await completeOtpSignIn(page, email, firstOtpSentAt);
  await expect.poll(async () => authUserExistsInDb(email)).toBe(true);

  await page.goto('/profile');
  const signOutButton = page.getByRole('button', { name: 'Sign Out' });
  await signOutButton.scrollIntoViewIfNeeded();
  await signOutButton.click();
  await expect(page).toHaveURL(/\/auth$/);

  await page.goto('/auth');
  await requestOtpForEmail(page, email);
  await expect(page.getByTestId('auth-intent-copy')).toContainText('sign in with your verified email');
  await expect.poll(async () => authUserExistsInDb(email)).toBe(true);
});
