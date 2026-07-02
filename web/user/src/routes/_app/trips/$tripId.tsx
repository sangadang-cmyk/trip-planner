import { createFileRoute } from '@tanstack/react-router'

import { TripDetailPage } from '@/components/trips/trip-detail-page'

export const Route = createFileRoute('/_app/trips/$tripId')({
  component: TripDetailRoute,
})

function TripDetailRoute() {
  const { tripId } = Route.useParams()

  return <TripDetailPage tripId={tripId} />
}
