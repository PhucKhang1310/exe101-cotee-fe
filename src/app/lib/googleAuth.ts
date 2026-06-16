import { API_BASE_URL, googleLogin } from './api';
import { getAuthClaims } from './auth';
import { signInWithToken } from './store';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_AUTH_STATE_KEY = 'cotee_google_auth_state';
const GOOGLE_AUTH_NONCE_KEY = 'cotee_google_auth_nonce';
const GOOGLE_AUTH_REDIRECT_KEY = 'cotee_google_auth_redirect';

function createRandomValue() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return window
    .btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function getGoogleCallbackUrl() {
  return `${window.location.origin}/auth/google/callback`;
}

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

function getJwtPayload(token: string): Record<string, unknown> {
  return JSON.parse(decodeBase64Url(token.split('.')[1] ?? '')) as Record<string, unknown>;
}

export function redirectToGoogleSignIn(returnTo: string) {
  const state = createRandomValue();
  const nonce = createRandomValue();

  window.sessionStorage.setItem(GOOGLE_AUTH_STATE_KEY, state);
  window.sessionStorage.setItem(GOOGLE_AUTH_NONCE_KEY, nonce);
  window.sessionStorage.setItem(GOOGLE_AUTH_REDIRECT_KEY, returnTo || '/');

  const params = new URLSearchParams({
    redirectUri: getGoogleCallbackUrl(),
    state,
    nonce,
  });

  window.location.assign(`${API_BASE_URL}/api/Auth/google-redirect?${params.toString()}`);
}

export async function completeGoogleRedirectSignIn() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);
  const idToken = params.get('id_token') ?? queryParams.get('id_token');
  const state = params.get('state') ?? queryParams.get('state');
  const error = params.get('error') ?? queryParams.get('error');
  const expectedState = window.sessionStorage.getItem(GOOGLE_AUTH_STATE_KEY);
  const expectedNonce = window.sessionStorage.getItem(GOOGLE_AUTH_NONCE_KEY);
  const returnTo = window.sessionStorage.getItem(GOOGLE_AUTH_REDIRECT_KEY) || '/';

  window.sessionStorage.removeItem(GOOGLE_AUTH_STATE_KEY);
  window.sessionStorage.removeItem(GOOGLE_AUTH_NONCE_KEY);
  window.sessionStorage.removeItem(GOOGLE_AUTH_REDIRECT_KEY);

  if (error) {
    throw new Error(`Google sign-in failed: ${error}.`);
  }

  if (!idToken || !state || state !== expectedState) {
    throw new Error('Google sign-in response could not be verified.');
  }

  const payload = getJwtPayload(idToken);
  if (payload.nonce !== expectedNonce) {
    throw new Error('Google sign-in nonce could not be verified.');
  }

  const response = await googleLogin(idToken);
  if (!response.token) {
    throw new Error(response.message ?? 'Google login did not return an auth token.');
  }

  const email = response.user?.email ?? getAuthClaims(response.token)?.email ?? '';
  signInWithToken(email, response.token);

  return { response, returnTo };
}
