import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { TripMap } from '@/components/map/trip-map'

const mapSearchSchema = z.object({
  locationId: z.string().optional(),
})

export const Route = createFileRoute('/_app/')({
  validateSearch: mapSearchSchema,
  component: HomePage,
})

function HomePage() {
  return (
    <div className="relative isolate z-0 min-h-0 flex-1">
      <TripMap className="size-full" />
    </div>
  )
}
