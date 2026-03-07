import { test, expect } from '@playwright/test';
import { createUniqueEmail, signInWithOtp } from './utils/auth';
import { publishListingFromWizard } from './utils/listing-wizard';

test.use({
  geolocation: { latitude: 59.3293, longitude: 18.0686 },
  permissions: ['geolocation'],
});

test('creates and deletes a rental listing', async ({ page }) => {
  const landlordEmail = createUniqueEmail('landlord-rent');
  const title = `E2E Rental Flow ${Date.now()}`;

  await signInWithOtp(page, landlordEmail);
  await publishListingFromWizard(page, {
    mode: 'rent',
    propertyTypeLabel: 'Apartment',
    title,
    city: 'Stockholm',
    address: 'Testgatan 10',
    postalCode: '113 30',
    price: '1650',
  });

  const card = page.locator('.glass-card', { hasText: title }).first();
  await expect(card).toBeVisible();

  await card.getByRole('button').last().click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText(title)).toHaveCount(0);
});
