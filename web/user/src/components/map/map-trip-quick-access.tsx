import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { CreateTripDialog } from '@/components/trips/create-trip-dialog'
import { mapControlSurfaceClassName } from '@/components/map/map-control-styles'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getUserTripsOptions } from '@/generated/api/@tanstack/react-query.gen'
import { useAuth } from '@/hooks/use-auth'
import { getTripAccent } from '@/lib/trip'
import { cn } from '@/lib/utils'

const MAX_TRIP_PILLS = 5

function getTripInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export function MapTripQuickAccess() {
  const { isAuthenticated } = useAuth()
  const [createTripOpen, setCreateTripOpen] = useState(false)

  const { data: trips, isPending } = useQuery({
    ...getUserTripsOptions(),
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) {
    return null
  }

  const visibleTrips = (trips ?? []).slice(0, MAX_TRIP_PILLS)

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        {isPending ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="size-10 rounded-md" />
            ))}
          </>
        ) : (
          visibleTrips.map((trip, index) => (
            <Link
              key={trip.id}
              to="/trips/$tripId"
              params={{ tripId: trip.id }}
              aria-label={trip.name}
              title={trip.name}
              className={cn(
                'relative size-10 shrink-0 overflow-hidden rounded-md transition-transform hover:scale-105',
                mapControlSurfaceClassName,
              )}
            >
              {trip.thumbnail ? (
                <img
                  src={trip.thumbnail}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    'flex size-full items-center justify-center bg-gradient-to-br text-sm font-semibold text-white',
                    getTripAccent(trip, index),
                  )}
                >
                  {getTripInitial(trip.name)}
                </div>
              )}
            </Link>
          ))
        )}

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label="Create a trip"
                onClick={() => setCreateTripOpen(true)}
                className={cn(
                  'inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-transparent bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 transition-colors hover:bg-primary/90 hover:ring-primary/50',
                )}
              >
                <PlusIcon className="size-4" />
              </button>
            }
          />
          <TooltipContent side="right">Create a trip</TooltipContent>
        </Tooltip>
      </div>

      <CreateTripDialog
        open={createTripOpen}
        onOpenChange={setCreateTripOpen}
      />
    </>
  )
}
