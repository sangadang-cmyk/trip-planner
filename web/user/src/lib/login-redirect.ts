const DEFAULT_LOGIN_REDIRECT = '/'

function serializeSearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    params.set(key, String(value))
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function sanitizeLoginRedirect(from?: string): string {
  if (!from) {
    return DEFAULT_LOGIN_REDIRECT
  }

  if (!from.startsWith('/') || from.startsWith('//')) {
    return DEFAULT_LOGIN_REDIRECT
  }

  const pathname = from.split('?')[0]?.split('#')[0] ?? from
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return DEFAULT_LOGIN_REDIRECT
  }

  return from
}

export function buildLoginFrom(
  pathname: string,
  search: Record<string, unknown> = {},
): string | undefined {
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return undefined
  }

  return `${pathname}${serializeSearch(search)}`
}
