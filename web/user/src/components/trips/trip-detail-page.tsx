import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronRightIcon,
  MapPinIcon,
} from 'lucide-react'
import { useState } from 'react'

import { SidebarMenuTrigger } from '@/components/dashboard/sidebar-menu-trigger'
import { MapLocationDetailPanel } from '@/components/map/map-location-detail-panel'
import { TripDestinationsMap } from '@/components/map/trip-destinations-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResizableSplitPane } from '@/components/ui/resizable-split-pane'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserTripsByIdOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { LocationResponse } from '@/generated/api/types.gen'
import { useTripDestinationLocations } from '@/hooks/use-trip-destination-locations'
import {
  formatTripDateRange,
  getTripStatus,
  tripStatusVariant,
} from '@/lib/trip'
import { cn } from '@/lib/utils'

type TripDetailPageProps = {
  tripId: string
}

function TripDetailSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Skeleton className="h-72 w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="space-y-4 p-4 lg:p-6 lg:flex-1">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="min-h-96 w-full lg:w-[28rem] xl:w-[32rem]" />
      </div>
    </div>
  )
}

export function TripDetailPage({ tripId }: TripDetailPageProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResponse | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const {
    data: trip,
    isPending: isTripPending,
    isError: isTripError,
  } = useQuery({
    ...getUserTripsByIdOptions({
      path: { id: tripId },
    }),
  })

  const {
    destinations,
    locations,
    isPending: areDestinationsPending,
    isError: areDestinationsError,
  } = useTripDestinationLocations(tripId)

  function handleSelectLocation(location: LocationResponse) {
    setSelectedLocation(location)
    setIsDetailOpen(true)
  }

  function handleCloseDetail() {
    setIsDetailOpen(false)
  }

  function handleDetailClosed() {
    setSelectedLocation(null)
  }

  if (isTripPending || areDestinationsPending) {
    return <TripDetailSkeleton />
  }

  if (isTripError || !trip) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <Button
          variant="ghost"
          className="w-fit"
          render={<Link to="/trips" />}
        >
          <ArrowLeftIcon />
          Back to trips
        </Button>
        <p className="text-sm text-destructive">Failed to load this trip.</p>
      </div>
    )
  }

  const status = getTripStatus(trip.startDate, trip.endDate)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="relative h-72 shrink-0 border-b">
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="pointer-events-auto absolute top-4 left-4 flex items-center gap-2">
            <SidebarMenuTrigger />
            <Button
              variant="secondary"
              size="sm"
              className="bg-background/90 shadow-lg ring-2 ring-primary/30 hover:bg-background hover:ring-primary/50"
              render={<Link to="/trips" />}
            >
              <ArrowLeftIcon />
              Back to trips
            </Button>
          </div>
        </div>
        {locations.length > 0 ? (
          <TripDestinationsMap
            className="size-full"
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
            {areDestinationsError
              ? 'Failed to load destinations.'
              : 'No destinations with map coordinates yet.'}
          </div>
        )}
      </div>

      <ResizableSplitPane
        left={
          <div className="space-y-6 p-4 lg:p-6">
            <div className="space-y-2">
              <Badge variant={tripStatusVariant(status)}>{status}</Badge>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {trip.name}
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarIcon className="size-3.5" />
                  {formatTripDateRange(trip.startDate, trip.endDate)}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5" />
                  {destinations.length}{' '}
                  {destinations.length === 1 ? 'destination' : 'destinations'}
                </p>
              {trip.notes ? (
                <p className="text-sm text-muted-foreground">{trip.notes}</p>
              ) : null}
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">Destinations</h2>

              {destinations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No destinations added to this trip yet.
                </p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {destinations.map(({ destination, location }) => {
                    const isSelected = selectedLocation?.id === location?.id

                    return (
                      <li key={destination.id}>
                        <button
                          type="button"
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                            isSelected && 'bg-muted/50',
                            !location && 'cursor-not-allowed opacity-60',
                          )}
                          disabled={!location}
                          onClick={() => {
                            if (location) {
                              handleSelectLocation(location)
                            }
                          }}
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {destination.dayNumber}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {location?.name ?? 'Unknown location'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Day {destination.dayNumber}
                              {destination.notes
                                ? ` · ${destination.notes}`
                                : ''}
                            </p>
                          </div>
                          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        }
        right={
          selectedLocation ? (
            <MapLocationDetailPanel
              location={selectedLocation}
              open={isDetailOpen}
              onClose={handleCloseDetail}
              onClosed={handleDetailClosed}
              slideFrom="right"
              layout="embedded"
              showAddToTrip={false}
              className="absolute inset-0"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Select a destination on the map or from the list to view details.
            </div>
          )
        }
      />
    </div>
  )
}
