import { expect, test } from '@playwright/test';

test('home page shows the IdP details', async ({ page, baseURL }) => {
  await page.goto('/');

  await expect(page.getByLabel('SSO URL')).toHaveValue(`${baseURL}/api/saml/sso`);
  await expect(page.getByLabel('Entity ID')).toHaveValue('https://idp.test/entityid');
  await expect(page.getByLabel('Certificate')).toHaveValue(/BEGIN CERTIFICATE/);
  await expect(page.getByRole('link', { name: 'Download Metadata' })).toHaveAttribute(
    'href',
    '/api/saml/metadata?download=true'
  );
  await expect(page.getByRole('link', { name: 'Test IdP Login' })).toHaveAttribute('href', '/saml/login');
});

test('namespaced home page scopes the IdP details', async ({ page, baseURL }) => {
  await page.goto('/namespace/acme');

  await expect(page.getByLabel('SSO URL')).toHaveValue(`${baseURL}/api/namespace/acme/saml/sso`);
  await expect(page.getByLabel('Entity ID')).toHaveValue('https://idp.test/entityid/acme');
  await expect(page.getByRole('link', { name: 'Test IdP Login' })).toHaveAttribute(
    'href',
    '/namespace/acme/saml/login'
  );
});

test('invalid namespace is a 404', async ({ page }) => {
  const response = await page.goto('/namespace/not%20valid');
  expect(response?.status()).toBe(404);
});
