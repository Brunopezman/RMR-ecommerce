import type { AuthUser, AuthState } from '../types/auth';

const AUTH_TOKEN_KEY = 'authToken';
const USER_EMAIL_KEY = 'userEmail';

/**
 * Optional configuration that can be injected via window.__RMR_CONFIG__
 * to toggle mock authentication mode.
 */
interface RmrConfig {
  USE_MOCK_AUTH?: boolean;
}

/**
 * Retrieve the app configuration from the global scope in a type-safe way.
 */
function getConfig(): RmrConfig {
  if (typeof window === 'undefined') return {};
  const cfg = (window as { __RMR_CONFIG__?: RmrConfig }).__RMR_CONFIG__;
  return cfg ?? {};
}

/**
 * Check if mock auth is enabled via window.__RMR_CONFIG__.
 */
function isMockAuth(): boolean {
  try {
    return getConfig().USE_MOCK_AUTH === true;
  } catch {
    return false;
  }
}

/**
 * Attempt login with email/password.
 * In mock mode, accepts any credentials and stores a demo token.
 * In real mode, makes a POST request to the configured API endpoint.
 */
export async function login(
  email: string,
  password: string,
  apiBase?: string,
): Promise<{ user: AuthUser; token: string }> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Email y contraseña son obligatorios.');
  }

  if (isMockAuth() || !apiBase) {
    // Demo mode: accept any credentials
    const token = 'demo-token';
    const user: AuthUser = {
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0] || trimmedEmail,
    };
    return { user, token };
  }

  // Real API login
  const endpoint = `${apiBase}/api/auth/login`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
  });

  let data: Record<string, unknown> = {};
  try {
    data = await response.json();
  } catch {
    data = { msg: 'Respuesta inesperada del servidor.' };
  }

  if (!response.ok) {
    const errorMsg =
      (data.msg as string) || (data.error as string) || 'Credenciales inválidas.';
    throw new Error(errorMsg);
  }

  const token = (data.token as string) || (data.accessToken as string) || '';
  const user: AuthUser = {
    email: trimmedEmail,
    name: trimmedEmail.split('@')[0] || trimmedEmail,
  };

  return { user, token };
}

/**
 * Load saved auth state from localStorage.
 */
export function loadAuthState(): AuthState {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const email = localStorage.getItem(USER_EMAIL_KEY);

    if (token && email) {
      return {
        user: { email, name: email.split('@')[0] || email },
        token,
        isAuthenticated: true,
      };
    }
  } catch {
    // localStorage unavailable
  }

  return { user: null, token: null, isAuthenticated: false };
}

/**
 * Save auth state to localStorage.
 */
export function saveAuthState(user: AuthUser, token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_EMAIL_KEY, user.email);
  } catch {
    // localStorage unavailable
  }
}

/**
 * Clear auth state from localStorage.
 */
export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  } catch {
    // noop
  }
}
