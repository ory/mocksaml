import { fetchPrivateKey, fetchPublicKey } from 'utils';

const appUrl =
  process.env.APP_URL ||
  `https://${process.env.VERCEL_BRANCH_URL}` ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` ||
  'http://localhost:4000';
const entityId = process.env.ENTITY_ID || 'https://saml.example.com/entityid';
const audience = process.env.SAML_AUDIENCE || 'https://saml.boxyhq.com';
const privateKey = fetchPrivateKey();
const publicKey = fetchPublicKey();

// Extra SAML attributes from SAML_ATTRIBUTE_<name>=<value> env vars.
// Values may contain {id}, {email}, {firstName}, {lastName} placeholders.
const extraAttributes: Record<string, string> = {};
for (const [key, value] of Object.entries(process.env)) {
  if (key.startsWith('SAML_ATTRIBUTE_') && value !== undefined) {
    const attrName = key.slice('SAML_ATTRIBUTE_'.length);
    if (attrName) {
      extraAttributes[attrName] = value;
    }
  }
}

const config = {
  appUrl,
  entityId,
  audience,
  privateKey,
  publicKey,
  extraAttributes,
};

export default config;
