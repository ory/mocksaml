import type { ParsedUrlQuery } from 'querystring';

export const defaultAcsUrl = 'https://sso.eu.boxyhq.com/api/oauth/saml';
export const defaultAudience = 'https://saml.boxyhq.com';

// The query carries the SP's SAML request; the ACS URL and audience fall back to the IdP-initiated form fields.
export function authRequestBody(form: FormData, query: ParsedUrlQuery) {
  const { id, audience, acsUrl, providerName, relayState } = query;

  return {
    email: `${form.get('username')}@${form.get('domain')}`,
    id,
    audience: audience || (form.get('audience') ?? defaultAudience),
    acsUrl: acsUrl || (form.get('acsUrl') ?? defaultAcsUrl),
    providerName,
    relayState,
  };
}
