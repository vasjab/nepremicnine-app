import { test, expect } from '@playwright/test';
import { createUniqueEmail, signInWithOtp } from './utils/auth';
import { publishListingFromWizard } from './utils/listing-wizard';

test.use({
  geolocation: { latitude: 57.70887, longitude: 11.97456 },
  permissions: ['geolocation'],
});

test('creates a sale listing and marks it as sold', async ({ page }) => {
  const landlordEmail = createUniqueEmail('landlord-sale');
  const title = `E2E Sale Flow ${Date.now()}`;
  const address = 'Saljgatan 4';

  await signInWithOtp(page, landlordEmail);
  await publishListingFromWizard(page, {
    mode: 'sale',
    propertyTypeLabel: 'Apartment',
    title,
    city: 'Gothenburg',
    address,
    postalCode: '411 17',
    price: '430000',
  });

  const card = page.locator('.glass-card', { hasText: title }).first();
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: /Mark as Sold/i }).click();

  await page.getByRole('button', { name: /Continue/i }).click();
  await page.getByLabel(/Final Sale Price/i).fill('438000');
  await page.getByRole('button', { name: /Save Price/i }).click();

  await page.getByRole('tab', { name: /Sold \/ Rented/i }).click();
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText(/Sold/i).first()).toBeVisible();

  await page.goto('/sold-rented');
  await expect(page.getByText(address, { exact: true })).toBeVisible();
});
