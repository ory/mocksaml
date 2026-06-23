import { fetchPrivateKey, fetchPublicKey } from 'utils';

const appUrl =
  process.env.APP_URL ||
  `https://${process.env.VERCEL_BRANCH_URL}` ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` ||
  'http://localhost:4000';
const entityId = process.env.ENTITY_ID || 'https://saml.example.com/entityid';
const defaultDomains = ['example.com', 'example.org'];
const parsedDomains = (process.env.AVAILABLE_DOMAINS || defaultDomains.join(','))
  .split(',')
  .map((d: string) => d.trim())
  .filter(Boolean);
// Fall back to the defaults if AVAILABLE_DOMAINS is set but contains no usable
// entries (e.g. ", ,"), so we never end up with an empty allowlist that blocks
// every login.
const availableDomains = parsedDomains.length > 0 ? parsedDomains : defaultDomains;
const privateKey = fetchPrivateKey();
const publicKey = fetchPublicKey();

const config = {
  appUrl,
  entityId,
  availableDomains,
  privateKey,
  publicKey,
};

export default config;
