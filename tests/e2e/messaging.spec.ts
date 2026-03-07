import { test, expect } from '@playwright/test';
import { createUniqueEmail, signInWithOtp } from './utils/auth';
import { publishListingFromWizard } from './utils/listing-wizard';

test('sends messages between renter and landlord', async ({ browser }) => {
  const renterContext = await browser.newContext();
  const landlordContext = await browser.newContext();
  const renterPage = await renterContext.newPage();
  const landlordPage = await landlordContext.newPage();
  const landlordEmail = createUniqueEmail('landlord-chat');
  const renterEmail = createUniqueEmail('renter-chat');
  const listingTitle = `E2E Chat Listing ${Date.now()}`;
  const listingAddress = 'Chatgatan 12';
  const landlordReply = `Landlord reply ${Date.now()}`;
  const renterFollowUp = `Renter follow up ${Date.now()}`;

  await landlordContext.grantPermissions(['geolocation']);
  await landlordContext.setGeolocation({ latitude: 59.3293, longitude: 18.0686 });
  await signInWithOtp(landlordPage, landlordEmail);
  await publishListingFromWizard(landlordPage, {
    mode: 'rent',
    propertyTypeLabel: 'Apartment',
    title: listingTitle,
    city: 'Stockholm',
    address: listingAddress,
    postalCode: '111 22',
    price: '1450',
  });

  await signInWithOtp(renterPage, renterEmail);
  await renterPage.goto('/');
  await renterPage.getByPlaceholder('Search...').fill(listingTitle);
  await renterPage.keyboard.press('Enter');
  const searchResultCard = renterPage.locator('article.listing-card', { hasText: listingAddress }).first();
  await expect(searchResultCard).toBeVisible();
  await searchResultCard.click();
  await renterPage.getByRole('button', { name: 'Is this still available?' }).click();
  await expect(renterPage).toHaveURL(/\/messages\?conversation=/);
  await expect(renterPage.getByText('Is this still available?', { exact: true }).last()).toBeVisible();

  await landlordPage.goto('/messages');
  await landlordPage.getByText(listingTitle).first().click();
  await landlordPage.getByTestId('message-composer').fill(landlordReply);
  await landlordPage.getByTestId('message-send').click();
  await expect(landlordPage.getByText(landlordReply, { exact: true }).last()).toBeVisible();

  await renterPage.reload();
  await expect(renterPage.getByText(landlordReply, { exact: true }).last()).toBeVisible();
  await renterPage.getByTestId('message-composer').fill(renterFollowUp);
  await renterPage.getByTestId('message-send').click();
  await expect(renterPage.getByText(renterFollowUp, { exact: true }).last()).toBeVisible();

  await landlordPage.reload();
  await expect(landlordPage.getByText(renterFollowUp, { exact: true }).last()).toBeVisible();
});
