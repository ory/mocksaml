import crypto from 'crypto';

export interface AuthCodeEntry {
  userId: string;
  redirectUri: string;
  state: string;
  expiresAt: number;
}

export interface AccessTokenEntry {
  userId: string;
  expiresAt: number;
}

export interface RefreshTokenEntry {
  userId: string;
}

// In-memory stores. These persist across requests in Next.js standalone mode
// (single long-running Node process). In dev mode (next dev), module hot-reload
// may clear these — that's acceptable for a mock service.
export const authCodes = new Map<string, AuthCodeEntry>();
export const accessTokens = new Map<string, AccessTokenEntry>();
export const refreshTokens = new Map<string, RefreshTokenEntry>();

export function generateToken(prefix: string): string {
  return `mock-${prefix}-${crypto.randomBytes(16).toString('hex')}`;
}

export function generateAuthCode(): string {
  return crypto.randomBytes(20).toString('hex');
}
