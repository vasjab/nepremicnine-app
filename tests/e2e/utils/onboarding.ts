import { expect, Page } from '@playwright/test';

async function clickContinue(page: Page) {
  const continueButton = page.getByRole('dialog').getByRole('button', { name: /^Continue$/ }).last();
  await continueButton.scrollIntoViewIfNeeded();
  await continueButton.click();
}

export async function completeRenterOnboarding(page: Page, coverLetter: string): Promise<void> {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('What brings you here? Select all that apply.')).toBeVisible();

  await dialog.getByRole('button', { name: /I want to rent/i }).click();
  await clickContinue(page);

  await expect(dialog.getByText('Help landlords understand your situation.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Employed', exact: true }).click();
  await dialog.getByRole('button', { name: 'Within 1 month', exact: true }).click();
  await clickContinue(page);

  await expect(dialog.getByRole('heading', { name: 'A bit more about you' })).toBeVisible();
  await clickContinue(page);

  await expect(dialog.getByRole('heading', { name: 'References' })).toBeVisible();
  await clickContinue(page);

  await expect(dialog.getByRole('heading', { name: 'Default cover letter' })).toBeVisible();
  await dialog.getByPlaceholder("Hi, I'm looking for a comfortable place to call home. I work as... and am a reliable, tidy tenant...").fill(coverLetter);
  await clickContinue(page);

  await expect(dialog.getByText("You're all set!")).toBeVisible();
  await page.getByRole('button', { name: 'Save & Continue' }).click();
  await expect(page.getByRole('button', { name: 'Save & Continue' })).toHaveCount(0);
}
