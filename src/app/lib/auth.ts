import { getAuthToken } from './api';

export type AuthClaims = {
  userId: string;
  email: string;
  name: string;
  role: string;
  expiresAt?: number;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(
    window
      .atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
      .split('')
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
}

export function getAuthClaims(token = getAuthToken()): AuthClaims | null {
  if (!token) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1] ?? '')) as Record<string, unknown>;
    const roleClaim =
      payload.role ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return {
      userId: String(
        payload.sub ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        '',
      ),
      email: String(
        payload.email ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
        '',
      ),
      name: String(
        payload.name ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
        '',
      ),
      role: String(roleClaim ?? ''),
      expiresAt: typeof payload.exp === 'number' ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const claims = getAuthClaims();
  return Boolean(
    claims &&
    claims.role.toLowerCase() === 'admin' &&
    (!claims.expiresAt || claims.expiresAt * 1000 > Date.now()),
  );
}
