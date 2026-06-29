const ACCESS_TOKEN_KEY = 'user_access_token'

const authListeners = new Set<() => void>()

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function notifyAuthListeners(): void {
  authListeners.forEach((listener) => listener())
}

export function subscribeToAuthChanges(listener: () => void): () => void {
  authListeners.add(listener)
  return () => authListeners.delete(listener)
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  if (!isBrowser()) {
    return
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  notifyAuthListeners()
}

export function clearAccessToken(): void {
  if (!isBrowser()) {
    return
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  notifyAuthListeners()
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

export function getAuthSnapshot(): boolean {
  return isAuthenticated()
}

export function getAuthServerSnapshot(): boolean {
  return false
}
