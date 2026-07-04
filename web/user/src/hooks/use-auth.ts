import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'

import {
  clearAccessToken,
  getAuthServerSnapshot,
  getAuthSnapshot,
  isAuthenticated,
  subscribeToAuthChanges,
} from '@/lib/auth'
import { buildLoginFrom } from '@/lib/login-redirect'

export function useAuth() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const authenticated = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getAuthServerSnapshot,
  )

  function signOut() {
    clearAccessToken()
    toast.success('Signed out successfully')
    void navigate({ to: '/' })
  }

  function requireAuth(): boolean {
    if (isAuthenticated()) {
      return true
    }

    const from = buildLoginFrom(pathname)
    void navigate({
      to: '/login',
      search: from ? { from } : {},
    })
    return false
  }

  return {
    isAuthenticated: authenticated,
    signOut,
    requireAuth,
  }
}
