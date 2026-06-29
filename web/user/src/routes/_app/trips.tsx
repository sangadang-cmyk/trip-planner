import { createFileRoute } from '@tanstack/react-router'

import { TripsPage } from '@/components/trips/trips-page'

export const Route = createFileRoute('/_app/trips')({
  component: TripsPage,
})
