import { test, expect } from '@playwright/test';
import { createUniqueEmail, signInWithOtp } from './utils/auth';
import { readSeedData } from './utils/seed';

test('registers a brand new user with email OTP', async ({ page }) => {
  const email = createUniqueEmail('signup');

  await signInWithOtp(page, email);

  await expect(page.getByText('hemma')).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('logs in, fills out the profile, and updates regional settings', async ({ page }) => {
  const loginEmail = createUniqueEmail('login-profile');
  const seed = readSeedData();

  await signInWithOtp(page, loginEmail);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();
  const signOutButton = page.getByRole('button', { name: 'Sign Out' });
  await signOutButton.scrollIntoViewIfNeeded();
  await signOutButton.click();
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();

  await signInWithOtp(page, loginEmail);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();

  await page.getByLabel('Full Name').fill('E2E Renter Updated');
  await page.getByLabel('Phone').fill('+46 70 123 4567');
  await page.getByPlaceholder('Tell us a bit about yourself...').fill('I am testing the profile flow end to end.');

  await page.getByRole('button', { name: /I want to rent/i }).click();
  await page.getByRole('button', { name: "I'm selling", exact: true }).click();
  await expect(page.getByText('Renter Details')).toBeVisible();
  await expect(page.getByText('Landlord Details')).toBeVisible();
  await page.getByRole('button', { name: 'Employed', exact: true }).click();
  await page.getByRole('button', { name: 'Within 1 month', exact: true }).click();
  await page.getByRole('button', { name: 'I have pets', exact: true }).click();
  await page.getByPlaceholder('What pets do you have? (e.g. 1 small dog)').fill('One calm cat');
  await page.getByRole('button', { name: 'Private owner', exact: true }).click();
  await page.getByRole('button', { name: 'Same day', exact: true }).click();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Profile updated', { exact: true }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Full Name')).toHaveValue('E2E Renter Updated');
  await expect(page.getByLabel('Phone')).toHaveValue('+46 70 123 4567');
  await expect(page.getByPlaceholder('What pets do you have? (e.g. 1 small dog)')).toHaveValue('One calm cat');

  await page.goto('/');
  await page.getByTestId('user-menu-trigger').click();
  await page.getByTestId('international-settings-trigger').click();
  const internationalDialog = page.getByRole('dialog');
  await expect(internationalDialog).toBeVisible();
  await internationalDialog.getByRole('button', { name: /USD/i }).click();
  await internationalDialog.getByRole('button', { name: /ft²/i }).click();
  await internationalDialog.getByRole('button', { name: /Per week/i }).click();
  await page.keyboard.press('Escape');

  await page.goto(`/listing/${seed.listings.rentalParking.id}`);

  await expect(page.getByText(seed.listings.rentalParking.title, { exact: true })).toBeVisible();
  await expect(page.locator('body')).toContainText('$/wk');
  await expect(page.locator('body')).toContainText('ft²');
});
