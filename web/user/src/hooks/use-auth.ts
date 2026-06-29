import { useNavigate } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'

import {
  clearAccessToken,
  getAuthServerSnapshot,
  getAuthSnapshot,
  isAuthenticated,
  subscribeToAuthChanges,
} from '@/lib/auth'

export function useAuth() {
  const navigate = useNavigate()
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

    void navigate({ to: '/login' })
    return false
  }

  return {
    isAuthenticated: authenticated,
    signOut,
    requireAuth,
  }
}
