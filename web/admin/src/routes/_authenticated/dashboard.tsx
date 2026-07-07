import { createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardLayout,
})
