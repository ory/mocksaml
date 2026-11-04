import { parseAllowedDomains } from './allowed-domains';

const decode = (value: string | undefined) => (value ? Buffer.from(value, 'base64').toString('utf8') : '');

const vercelUrl = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

const config = {
  appUrl: process.env.APP_URL || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:4000'),
  entityId: process.env.ENTITY_ID || 'https://saml.example.com/entityid',
  allowedEmailDomains: parseAllowedDomains(process.env.ALLOWED_EMAIL_DOMAINS),
  privateKey: decode(process.env.PRIVATE_KEY),
  publicKey: decode(process.env.PUBLIC_KEY),
};

export default config;
