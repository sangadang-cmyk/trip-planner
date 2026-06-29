import { createFileRoute } from '@tanstack/react-router'

import { TripMap } from '@/components/map/trip-map'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="relative isolate z-0 min-h-0 flex-1">
      <TripMap className="size-full" />
    </div>
  )
}
