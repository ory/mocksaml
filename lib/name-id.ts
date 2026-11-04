const formats = {
  emailAddress: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  persistent: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
} as const;

export type NameIdFormat = keyof typeof formats;

export function parseNameIdFormat(value: string | undefined): NameIdFormat {
  const format = (value || '').trim();

  if (format === '') {
    return 'emailAddress';
  }

  if (!Object.hasOwn(formats, format)) {
    throw new Error(`NAME_ID_FORMAT must be emailAddress or persistent, not "${format}"`);
  }

  return format as NameIdFormat;
}

// The persistent NameID is the user's id, a stable hash of their email.
export function nameIdFor(format: NameIdFormat, user: { id: string; email: string }) {
  return {
    value: format === 'persistent' ? user.id : user.email,
    format: formats[format],
  };
}
