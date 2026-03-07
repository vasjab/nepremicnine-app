import { test, expect } from '@playwright/test';
import { readSeedData } from './utils/seed';

test('searches listings, applies filters, and navigates from the map', async ({ page }) => {
  const seed = readSeedData();

  await page.goto('/');
  await expect(page.getByRole('img', { name: new RegExp(seed.listings.rentalParking.title, 'i') })).toBeVisible();

  await page.getByPlaceholder('Search...').fill(seed.listings.rentalParking.title);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('img', { name: new RegExp(seed.listings.rentalParking.title, 'i') })).toBeVisible();
  await expect(page.getByRole('img', { name: new RegExp(seed.listings.rentalCompact.title, 'i') })).toHaveCount(0);

  await page.getByPlaceholder('Search...').fill('');
  await page.keyboard.press('Enter');

  await page.getByTestId('filters-trigger').click();
  const filtersDialog = page.getByRole('dialog');
  await expect(filtersDialog).toBeVisible();
  await filtersDialog.getByRole('button', { name: 'Apartment' }).click();
  await filtersDialog.getByRole('combobox').click();
  await page.getByRole('option', { name: '2+ rooms' }).click();
  await filtersDialog.getByRole('button', { name: /Apply Filters|Show \d+ listings?/i }).click();

  await expect(page.getByRole('img', { name: new RegExp(seed.listings.rentalParking.title, 'i') })).toBeVisible();
  await expect(page.getByRole('img', { name: new RegExp(seed.listings.rentalCompact.title, 'i') })).toHaveCount(0);

  await expect(page.locator('.mapboxgl-marker')).toHaveCount(1);
  const marker = page.locator('.mapboxgl-marker').first();
  await expect(marker).toBeVisible();
  await marker.click();

  const popup = page.locator('.mapboxgl-popup').filter({ hasText: seed.listings.rentalParking.address }).first();
  await expect(popup).toBeVisible();
  await popup.click();

  await expect(page).toHaveURL(new RegExp(`/listing/${seed.listings.rentalParking.id}$`));
  await expect(page.getByRole('heading', { name: seed.listings.rentalParking.title, exact: true })).toBeVisible();
});
