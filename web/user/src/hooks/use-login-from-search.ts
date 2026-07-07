import { useRouterState } from '@tanstack/react-router'

import { buildLoginFrom } from '@/lib/login-redirect'

export function useLoginFromSearch(): { from?: string } {
  const from = useRouterState({
    select: (state) =>
      buildLoginFrom(state.location.pathname, state.location.search),
  })

  return from ? { from } : {}
}
