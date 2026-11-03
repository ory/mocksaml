const defaultDomains = ['example.com', 'example.org'];

export function parseAllowedDomains(value: string | undefined): string[] {
  const domains = (value || '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return domains.length > 0 ? domains : defaultDomains;
}

export function hasWildcard(allowed: string[]): boolean {
  return allowed.some((d) => d.startsWith('*'));
}

export function isAllowedEmail(email: string, allowed: string[]): boolean {
  const at = email.lastIndexOf('@');
  if (at < 0) {
    return false;
  }

  const domain = email.slice(at + 1).toLowerCase();

  return allowed.some((entry) => {
    if (entry === '*') {
      return true;
    }
    if (entry.startsWith('*.')) {
      return domain.endsWith(entry.slice(1)) && domain.length > entry.length - 1;
    }
    return domain === entry;
  });
}
