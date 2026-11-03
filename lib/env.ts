import { parseAllowedDomains } from './allowed-domains';
import { fetchPrivateKey, fetchPublicKey } from 'utils';

const appUrl =
  process.env.APP_URL ||
  `https://${process.env.VERCEL_BRANCH_URL}` ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` ||
  'http://localhost:4000';
const entityId = process.env.ENTITY_ID || 'https://saml.example.com/entityid';
const allowedEmailDomains = parseAllowedDomains(process.env.ALLOWED_EMAIL_DOMAINS);
const privateKey = fetchPrivateKey();
const publicKey = fetchPublicKey();

const config = {
  appUrl,
  entityId,
  allowedEmailDomains,
  privateKey,
  publicKey,
};

export default config;
