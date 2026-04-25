// src/helper/helper.ts

// JWT payload base fields
export interface JwtBasePayload {
    iat?: number;
    exp?: number;
  }
  
  // Payload we issued from the backend
  export interface UserPayload extends JwtBasePayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }
  
  const TOKEN_KEY = 'auth_token';
  const ROLE_KEY = 'auth_role';
  
  function base64UrlDecode(input: string): string {
    // base64url -> base64
    const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
    // pad with =
    const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
    const b64Padded = b64 + '='.repeat(pad);
    if (typeof window === 'undefined') {
      // SSR-safe
      return Buffer.from(b64Padded, 'base64').toString('utf8');
    }
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(b64Padded), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
  
  export function decodeJwt<T = unknown>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadJson = base64UrlDecode(parts[1]);
      return JSON.parse(payloadJson) as T;
    } catch {
      return null;
    }
  }
  
  export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }
  
  export function getUserFromToken(token: string): UserPayload | null {
    const payload = decodeJwt<UserPayload>(token);
    if (!payload) return null;
    // Check expiration if present
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    // Minimal shape validation
    if (!payload.id || !payload.email) return null;
    return payload;
  }
  
  export function getCurrentUser(): UserPayload | null {
    const token = getAuthToken();
    if (!token) return null;
    return getUserFromToken(token);
  }
  
  export function isAuthenticated(): boolean {
    return !!getCurrentUser();
  }
  
  export function getAuthHeader(): Record<string, string> {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Set token in localStorage and cookie so middleware can read it
  export function setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    try {
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; samesite=lax`;
    } catch {}
  }

  // Refresh token cookie with proper security settings
  export function refreshTokenCookie(token: string) {
    if (typeof window === 'undefined') return;
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; samesite=lax; expires=${expires.toUTCString()}; secure=${location.protocol === 'https:'}`;
    } catch (e) {
      console.error('Failed to refresh token cookie:', e);
    }
  }

  // Remove token from both localStorage and cookie
  export function removeToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    try {
      document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/; samesite=lax`;
      document.cookie = `${ROLE_KEY}=; Max-Age=0; path=/; samesite=lax`;
    } catch {}
  }

  // Fetch with Authorization header when token is present
  export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const token = getAuthToken();
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }

  // Role helpers for admin gating in frontend and middleware
  export const ROLE_IDS = {
    SUPER_ADMIN: '68bed8982bb19cac89def499',
    ADMIN: '68bed8982bb19cac89def49b',
    INVOICE_MANAGER: '68bed8982bb19cac89def49d',
    HR_MANAGER: '68bed8992bb19cac89def4a3',
    ACCOUNTANT: '68bed8992bb19cac89def49f',
    CUSTOMER_SERVICE: '68bed89a2bb19cac89def4a7',
    SALES_REP: '68bed8992bb19cac89def4a1',
    New_User_Role: '68bedb7fff7fc8961da7a3f8',
    
  } as const;

  export type RoleId = typeof ROLE_IDS[keyof typeof ROLE_IDS];

  export function getRoleId(): string | null {
    if (typeof window === 'undefined') return null;
    const roleId = localStorage.getItem(ROLE_KEY);
    return roleId ?? null;
  }

  export function setRoleId(roleId: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ROLE_KEY, roleId);
    try {
      // Set cookie with longer expiry (7 days) to match token expiry
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `${ROLE_KEY}=${encodeURIComponent(roleId)}; path=/; samesite=lax; expires=${expires.toUTCString()}`;
      console.log('✅ Role cookie set:', roleId);
    } catch (e) {
      console.error('Failed to set role cookie:', e);
    }
  }

  export function removeRole() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ROLE_KEY);
    try {
      document.cookie = `${ROLE_KEY}=; Max-Age=0; path=/; samesite=lax`;
    } catch {}
  }

  export function isAdmin(): boolean {
    const roleId = getRoleId();
    return roleId === ROLE_IDS.ADMIN || roleId === ROLE_IDS.SUPER_ADMIN;
  }

  export function isSuperAdmin(): boolean {
    const roleId = getRoleId();
    return roleId === ROLE_IDS.SUPER_ADMIN;
  }

  export function canAccessAdminRoutes(): boolean {
    const roleId = getRoleId();
    return roleId === ROLE_IDS.ADMIN || roleId === ROLE_IDS.SUPER_ADMIN;
  }

  export function getUserRoleIdFromToken(): string | null {
    const token = getAuthToken();
    if (!token) return null;
    
    const payload = decodeJwt<UserPayload & { roleId?: string }>(token);
    if (!payload || !payload.roleId) return null;
    
    return payload.roleId;
  }
  
  // Backward compatibility aliases
  export const getRole = getRoleId;
  export const setRole = setRoleId;