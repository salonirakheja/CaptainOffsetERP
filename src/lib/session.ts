export interface SessionData {
  personId: number;
  personName: string;
  factoryId: number;
  role: string;
}

const SESSION_KEY = 'co_session';

export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function setSession(data: SessionData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  // Keep legacy key for any components still reading it during transition
  localStorage.setItem('co_user', data.personName);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('co_user');
}

export function getPersonIdFromSession(): number | null {
  const session = getSession();
  return session?.personId ?? null;
}

export function getFactoryIdFromSession(): number | null {
  const session = getSession();
  return session?.factoryId ?? null;
}
