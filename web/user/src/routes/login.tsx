import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { LoginPage } from '@/components/auth/login-page'
import { isAuthenticated } from '@/lib/auth'

const loginSearchSchema = z.object({
  email: z.string().default(''),
  verified: z.boolean().default(false),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    if (isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})
