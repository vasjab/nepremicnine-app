import { test, expect } from '@playwright/test';
import { completeRenterOnboarding } from './utils/onboarding';
import { createUniqueEmail, signInWithOtp } from './utils/auth';
import { publishListingFromWizard } from './utils/listing-wizard';

test.use({
  geolocation: { latitude: 59.3293, longitude: 18.0686 },
  permissions: ['geolocation'],
});

test('renter completes onboarding, applies to a rental listing, and landlord reviews the application', async ({ browser }) => {
  const landlordContext = await browser.newContext({
    geolocation: { latitude: 59.3293, longitude: 18.0686 },
    permissions: ['geolocation'],
  });
  const renterContext = await browser.newContext();
  const landlordPage = await landlordContext.newPage();
  const renterPage = await renterContext.newPage();

  const landlordEmail = createUniqueEmail('landlord-application');
  const renterEmail = createUniqueEmail('renter-application');
  const listingTitle = `E2E Rental Application ${Date.now()}`;
  const listingAddress = 'Ansokargatan 15';
  const defaultCoverLetter = 'Default onboarding cover letter from the renter.';
  const submittedCoverLetter = 'Custom application cover letter for this rental listing.';
  const privateNotes = 'Strong profile. Follow up for a viewing this week.';

  await signInWithOtp(landlordPage, landlordEmail);
  await publishListingFromWizard(landlordPage, {
    mode: 'rent',
    propertyTypeLabel: 'Apartment',
    title: listingTitle,
    city: 'Stockholm',
    address: listingAddress,
    postalCode: '114 35',
    price: '1890',
  });

  await signInWithOtp(renterPage, renterEmail);
  await renterPage.goto('/profile');
  await expect(renterPage.getByRole('heading', { name: 'My Profile' })).toBeVisible();
  await renterPage.getByLabel('Full Name').fill('E2E Applicant');
  await renterPage.getByLabel('Phone').fill('+46 70 555 1122');
  await renterPage.getByRole('button', { name: 'Save' }).click();
  await expect(renterPage.getByText('Profile updated', { exact: true }).first()).toBeVisible();

  await renterPage.goto('/');
  await renterPage.getByPlaceholder('Search...').fill(listingTitle);
  await renterPage.keyboard.press('Enter');
  const resultCard = renterPage.locator('article.listing-card', { hasText: listingAddress }).first();
  await expect(resultCard).toBeVisible();
  await resultCard.click();
  await expect(renterPage.getByTestId('listing-guest-gate')).toHaveCount(0);

  await renterPage.getByRole('button', { name: 'Apply for This Rental' }).click();
  const applicationDialog = renterPage.getByRole('dialog');
  await expect(applicationDialog.getByText('Complete your profile first')).toBeVisible();
  await applicationDialog.getByRole('button', { name: 'Complete profile' }).click();

  await completeRenterOnboarding(renterPage, defaultCoverLetter);

  await expect(renterPage.getByRole('dialog').getByText('Apply for this rental')).toBeVisible();
  const coverLetterInput = renterPage.getByPlaceholder("Tell the landlord why you'd be a great tenant...");
  await expect(coverLetterInput).toHaveValue(defaultCoverLetter);
  await coverLetterInput.fill(submittedCoverLetter);
  await renterPage.getByRole('button', { name: 'Submit Application' }).click();
  await expect(renterPage.getByText('Application submitted', { exact: true })).toBeVisible();
  await expect(renterPage.getByRole('button', { name: 'Application Submitted' })).toBeVisible();

  await renterPage.goto('/applications');
  await expect(renterPage.getByRole('heading', { name: 'My Applications' })).toBeVisible();
  await expect(renterPage.getByText(listingTitle, { exact: true })).toBeVisible();
  await expect(renterPage.getByText('Applied', { exact: true })).toBeVisible();
  await expect(renterPage.locator('[title=\"Withdraw\"]')).toHaveCount(1);

  await landlordPage.goto('/applications/landlord');
  await expect(landlordPage.getByRole('heading', { name: 'Rental Applications' })).toBeVisible();
  const landlordCard = landlordPage.locator('div.rounded-xl.border', { hasText: listingTitle }).first();
  await expect(landlordCard).toBeVisible();
  await landlordCard.click();

  const detailDialog = landlordPage.getByRole('dialog');
  await expect(detailDialog.getByText('Application Details')).toBeVisible();
  await expect(detailDialog.getByText(submittedCoverLetter, { exact: true })).toBeVisible();
  await expect(detailDialog.getByText('E2E Applicant', { exact: true })).toBeVisible();
  await detailDialog.getByPlaceholder('Add private notes about this applicant...').fill(privateNotes);
  await detailDialog.getByRole('button', { name: 'Save Notes' }).click();
  await landlordPage.keyboard.press('Escape');
  await expect(detailDialog).toHaveCount(0);

  const statusSelect = landlordCard.getByRole('combobox');
  await statusSelect.click();
  await landlordPage.getByRole('option', { name: /Under Review/i }).click();

  await renterPage.reload();
  await expect(renterPage.getByText('Under Review', { exact: true })).toBeVisible();
  await expect(renterPage.locator('[title=\"Withdraw\"]')).toHaveCount(0);

  await landlordCard.getByRole('combobox').click();
  await landlordPage.getByRole('option', { name: /Accepted/i }).click();

  await renterPage.reload();
  await expect(renterPage.getByText('Accepted', { exact: true })).toBeVisible();
  await expect(renterPage.locator('[title=\"Withdraw\"]')).toHaveCount(0);
});
