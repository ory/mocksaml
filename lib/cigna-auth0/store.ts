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

// In-memory stores. Use globalThis to survive Next.js dev-mode hot reloads.
const g = globalThis as typeof globalThis & {
  __mockAuthCodes?: Map<string, AuthCodeEntry>;
  __mockAccessTokens?: Map<string, AccessTokenEntry>;
  __mockRefreshTokens?: Map<string, RefreshTokenEntry>;
};

g.__mockAuthCodes ??= new Map<string, AuthCodeEntry>();
g.__mockAccessTokens ??= new Map<string, AccessTokenEntry>();
g.__mockRefreshTokens ??= new Map<string, RefreshTokenEntry>();

export const authCodes = g.__mockAuthCodes;
export const accessTokens = g.__mockAccessTokens;
export const refreshTokens = g.__mockRefreshTokens;

export function generateToken(prefix: string): string {
  return `mock-${prefix}-${crypto.randomBytes(16).toString('hex')}`;
}

export function generateAuthCode(): string {
  return crypto.randomBytes(20).toString('hex');
}
