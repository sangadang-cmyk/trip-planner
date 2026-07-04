import { useRouterState } from '@tanstack/react-router'

import { buildLoginFrom } from '@/lib/login-redirect'

export function useLoginFromSearch(): { from?: string } {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const from = buildLoginFrom(pathname)

  return from ? { from } : {}
}
