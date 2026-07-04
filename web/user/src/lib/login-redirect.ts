const DEFAULT_LOGIN_REDIRECT = '/'

export function sanitizeLoginRedirect(from?: string): string {
  if (!from) {
    return DEFAULT_LOGIN_REDIRECT
  }

  if (!from.startsWith('/') || from.startsWith('//')) {
    return DEFAULT_LOGIN_REDIRECT
  }

  if (from.startsWith('/login') || from.startsWith('/register')) {
    return DEFAULT_LOGIN_REDIRECT
  }

  return from
}

export function buildLoginFrom(pathname: string): string | undefined {
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return undefined
  }

  return pathname
}
