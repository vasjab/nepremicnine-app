import { expect, Page } from '@playwright/test';

interface ListingWizardInput {
  mode: 'rent' | 'sale';
  propertyTypeLabel: 'Apartment' | 'Studio' | 'House';
  title: string;
  city: string;
  address: string;
  postalCode: string;
  price: string;
}

async function clickContinue(page: Page) {
  const continueButton = page.getByRole('button', { name: /^Continue$/ }).last();
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
}

async function expectWizardHeading(page: Page, name: string) {
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible({ timeout: 15_000 });
}

export async function publishListingFromWizard(page: Page, input: ListingWizardInput): Promise<void> {
  await page.goto('/create-listing');
  await expect(page).toHaveURL(/\/create-listing(?:\?.*)?$/);
  await expectWizardHeading(page, 'What do you want to do?');

  await page.getByRole('button', { name: new RegExp(`^${input.mode === 'rent' ? 'For Rent' : 'For Sale'}`) }).click();
  await clickContinue(page);
  await expectWizardHeading(page, 'What are you listing?');

  await page.getByRole('button', { name: new RegExp(`^${input.propertyTypeLabel}`) }).click();
  await clickContinue(page);
  await expectWizardHeading(page, 'Give it a catchy title');

  await page.getByPlaceholder('Cozy 2-bedroom in Södermalm with balcony...').fill(input.title);
  await clickContinue(page);
  await expectWizardHeading(page, 'Where is your property?');

  await page.getByPlaceholder('Start typing a city...').fill(input.city);
  await page.getByPlaceholder('Start typing an address...').fill(input.address);
  await page.getByPlaceholder('111 22').fill(input.postalCode);
  await page.getByRole('button', { name: 'Use my current location' }).click();
  await expect(page.getByText(/Location set manually|Location found|Drag marker/i)).toBeVisible();
  await clickContinue(page);
  await expectWizardHeading(page, 'Set your price');

  await page.getByPlaceholder('0').fill(input.price);
  await clickContinue(page);

  const reviewHeading = page.getByRole('heading', { name: 'Review your listing' });

  for (let step = 0; step < 12; step += 1) {
    if (await reviewHeading.isVisible()) {
      break;
    }
    await clickContinue(page);
  }

  await expect(reviewHeading).toBeVisible();
  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page).toHaveURL(/\/my-listings$/);
}
