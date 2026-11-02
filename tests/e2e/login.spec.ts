import { expect, test } from '@playwright/test';
import { buildAuthnRequest, captureAcsPost, sp, validateResponse } from './helpers';

test('IdP-initiated login posts a signed response to the ACS url', async ({ page }) => {
  const acsPost = captureAcsPost(page);

  await page.goto('/saml/login');
  await expect(page.getByRole('heading', { name: 'SAML IdP Login' })).toBeVisible();

  // Placeholders are selectors for downstream suites (Ory cloud e2e, Polis e2e); keep them.
  await page.getByPlaceholder('https://sso.eu.boxyhq.com/api/oauth/saml').fill(sp.acsUrl);
  await page.getByPlaceholder('https://saml.boxyhq.com').fill(sp.entityId);
  await page.getByPlaceholder('jackson').fill('alice');
  await page.getByLabel('Domain').selectOption('example.org');
  await page.getByRole('button', { name: 'Sign In' }).click();

  const { samlResponse } = await acsPost;
  await expect(page.getByText('ACS received')).toBeVisible();

  const profile = await validateResponse(samlResponse);
  expect(profile.issuer).toBe('https://idp.test/entityid');
  expect(profile.claims.email).toBe('alice@example.org');
});

test('SP-initiated login round-trips the request id and relay state', async ({ page }) => {
  const acsPost = captureAcsPost(page);
  const authn = buildAuthnRequest();

  await page.goto(`/api/saml/sso?SAMLRequest=${encodeURIComponent(authn.redirect)}&RelayState=state-e2e`);
  await expect(page.getByRole('heading', { name: 'SAML SSO Login' })).toBeVisible();
  await expect(page.getByLabel('ACS URL')).toHaveCount(0);

  await page.getByRole('button', { name: 'Sign In' }).click();

  const { samlResponse, relayState } = await acsPost;
  expect(relayState).toBe('state-e2e');

  const profile = await validateResponse(samlResponse, { inResponseTo: authn.id });
  expect(profile.claims.email).toBe('jackson@example.com');
});

test('namespaced SP-initiated login uses the namespaced issuer', async ({ page }) => {
  const acsPost = captureAcsPost(page);
  const authn = buildAuthnRequest();

  await page.goto(`/api/namespace/acme/saml/sso?SAMLRequest=${encodeURIComponent(authn.redirect)}`);
  await expect(page).toHaveURL(/\/namespace\/acme\/saml\/login/);

  await page.getByRole('button', { name: 'Sign In' }).click();

  const { samlResponse } = await acsPost;
  const profile = await validateResponse(samlResponse, { inResponseTo: authn.id });
  expect(profile.issuer).toBe('https://idp.test/entityid/acme');
});

// The mocksaml.com Datadog synthetic locates the Sign In button with these selectors; keep them working.
test('Sign In button matches the synthetic monitor locators', async ({ page }) => {
  const authn = buildAuthnRequest({ providerName: 'BoxyHQ' });
  await page.goto(`/api/saml/sso?SAMLRequest=${encodeURIComponent(authn.redirect)}&RelayState=state-dd`);

  const byXPath = page.locator(
    'xpath=/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/form[1]/div[1]/button[1]'
  );
  const byClass = page.locator('.bg-primary');
  const byText = page.getByText('Sign In', { exact: true });
  const byTag = page.locator('button');

  for (const locator of [byXPath, byClass, byText, byTag]) {
    await expect(locator).toHaveCount(1);
    await expect(locator).toHaveAttribute('type', 'submit');
    await expect(locator).toHaveText('Sign In');
  }
});
