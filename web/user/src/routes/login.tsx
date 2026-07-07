import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { LoginPage } from '@/components/auth/login-page'
import { isAuthenticated } from '@/lib/auth'
import { sanitizeLoginRedirect } from '@/lib/login-redirect'

const loginSearchSchema = z.object({
  email: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  from: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ search }) => {
    if (typeof window === 'undefined') {
      return
    }

    if (isAuthenticated()) {
      throw redirect({ href: sanitizeLoginRedirect(search.from) })
    }
  },
  component: LoginPage,
})
