import { createFileRoute, redirect } from '@tanstack/react-router'

import { RegisterPage } from '@/components/auth/register-page'
import { isAuthenticated } from '@/lib/auth'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    if (isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})
