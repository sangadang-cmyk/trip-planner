import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { isAuthenticated } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    if (!isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
