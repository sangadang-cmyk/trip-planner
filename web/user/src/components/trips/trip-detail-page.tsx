import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChevronRightIcon,
  InboxIcon,
  MapIcon,
  MapPinIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { SidebarMenuTrigger } from '@/components/dashboard/sidebar-menu-trigger'
import { MapLocationDetailPanel } from '@/components/map/map-location-detail-panel'
import { TripDestinationsMap } from '@/components/map/trip-destinations-map'
import { DestinationDayPicker } from '@/components/trips/destination-day-picker'
import { UpdateTripDialog } from '@/components/trips/update-trip-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ResizableSplitPane } from '@/components/ui/resizable-split-pane'
import { Skeleton } from '@/components/ui/skeleton'
import {
  deleteUserTripsByIdMutation,
  deleteUserTripsByTripIdDestinationsByDestinationIdMutation,
  getUserTripsByIdOptions,
  getUserTripsByTripIdDestinationsQueryKey,
  getUserTripsQueryKey,
} from '@/generated/api/@tanstack/react-query.gen'
import type {
  LocationResponse,
  TripDestinationResponse,
} from '@/generated/api/types.gen'
import type { TripDestinationWithLocation } from '@/hooks/use-trip-destination-locations'
import { useTripDestinationLocations } from '@/hooks/use-trip-destination-locations'
import {
  formatDestinationDayLabel,
  formatTripDateRange,
  getTripStatus,
  isVisitDateUnset,
  tripStatusVariant,
} from '@/lib/trip'
import { cn } from '@/lib/utils'

type TripDetailPageProps = {
  tripId: string
}

type DestinationRowProps = {
  entry: TripDestinationWithLocation
  index?: number
  isSelected: boolean
  tripId: string
  tripStartDate: string
  tripEndDate: string
  onSelectLocation: (location: LocationResponse) => void
  onDelete: (destination: TripDestinationResponse) => void
}

function DestinationRow({
  entry: { destination, location },
  index,
  isSelected,
  tripId,
  tripStartDate,
  tripEndDate,
  onSelectLocation,
  onDelete,
}: DestinationRowProps) {
  const isUnsorted = isVisitDateUnset(destination.visitDate)

  return (
    <li
      className={cn('flex items-center gap-1', isSelected && 'bg-muted/50')}
    >
      <button
        type="button"
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
          !location && 'cursor-not-allowed opacity-60',
        )}
        disabled={!location}
        onClick={() => {
          if (location) {
            onSelectLocation(location)
          }
        }}
      >
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium',
            isUnsorted
              ? 'border border-dashed border-muted-foreground/40 text-muted-foreground'
              : 'bg-primary/10 text-primary',
          )}
        >
          {isUnsorted ? '–' : (index ?? 0) + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {location?.name ?? 'Unknown location'}
          </p>
          <p className="text-xs text-muted-foreground">
            {!isUnsorted
              ? formatDestinationDayLabel(destination.visitDate)
              : 'Use the calendar button to schedule this stop'}
            {destination.notes ? ` · ${destination.notes}` : ''}
          </p>
        </div>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <DestinationDayPicker
        tripId={tripId}
        destination={destination}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
      />

      <Button
        variant="ghost"
        size="icon-sm"
        className="mr-2 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label="Remove destination"
        onClick={() => onDelete(destination)}
      >
        <Trash2Icon />
      </Button>
    </li>
  )
}

function DestinationList({
  items,
  emptyMessage,
  listClassName,
  showIndex,
  tripId,
  tripStartDate,
  tripEndDate,
  selectedLocationId,
  onSelectLocation,
  onDelete,
}: {
  items: TripDestinationWithLocation[]
  emptyMessage: string
  listClassName?: string
  showIndex: boolean
  tripId: string
  tripStartDate: string
  tripEndDate: string
  selectedLocationId?: string
  onSelectLocation: (location: LocationResponse) => void
  onDelete: (destination: TripDestinationResponse) => void
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul className={cn('divide-y rounded-lg border', listClassName)}>
      {items.map((entry, index) => (
        <DestinationRow
          key={entry.destination.id}
          entry={entry}
          index={showIndex ? index : undefined}
          isSelected={selectedLocationId === entry.location?.id}
          tripId={tripId}
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
          onSelectLocation={onSelectLocation}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
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
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [detailLocation, setDetailLocation] = useState<LocationResponse | null>(
    null,
  )
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  )
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [deletingDestination, setDeletingDestination] =
    useState<TripDestinationResponse | null>(null)
  const [updateTripOpen, setUpdateTripOpen] = useState(false)
  const [deleteTripOpen, setDeleteTripOpen] = useState(false)

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

  const { sortedDestinations, unsortedDestinations } = useMemo(() => {
    const sorted: TripDestinationWithLocation[] = []
    const unsorted: TripDestinationWithLocation[] = []

    for (const entry of destinations) {
      if (isVisitDateUnset(entry.destination.visitDate)) {
        unsorted.push(entry)
      } else {
        sorted.push(entry)
      }
    }

    return {
      sortedDestinations: sorted,
      unsortedDestinations: unsorted,
    }
  }, [destinations])

  const deleteDestinationMutation = useMutation({
    ...deleteUserTripsByTripIdDestinationsByDestinationIdMutation(),
    onSuccess: () => {
      toast.success('Destination removed from trip')
      void queryClient.invalidateQueries({
        queryKey: getUserTripsByTripIdDestinationsQueryKey({
          path: { tripId },
        }),
      })
      void queryClient.invalidateQueries({ queryKey: getUserTripsQueryKey() })

      if (selectedLocationId === deletingDestination?.locationId) {
        setIsDetailOpen(false)
        setSelectedLocationId(null)
        setDetailLocation(null)
      }

      setDeletingDestination(null)
    },
    onError: () => {
      toast.error('Unable to remove this destination.')
    },
  })

  const deleteTripMutation = useMutation({
    ...deleteUserTripsByIdMutation(),
    onSuccess: () => {
      toast.success('Trip deleted')
      void queryClient.invalidateQueries({ queryKey: getUserTripsQueryKey() })
      setDeleteTripOpen(false)
      void navigate({ to: '/trips' })
    },
    onError: () => {
      toast.error('Unable to delete this trip.')
    },
  })

  function handleSelectLocation(location: LocationResponse) {
    setDetailLocation(location)
    setSelectedLocationId(location.id)
    setIsDetailOpen(true)
  }

  function handleCloseDetail() {
    setSelectedLocationId(null)
    setIsDetailOpen(false)
  }

  function handleDetailClosed() {
    setDetailLocation(null)
  }

  function handleConfirmDeleteTrip() {
    deleteTripMutation.mutate({
      path: { id: tripId },
    })
  }

  function handleConfirmDelete() {
    if (!deletingDestination) {
      return
    }

    deleteDestinationMutation.mutate({
      path: {
        tripId,
        destinationId: deletingDestination.id,
      },
    })
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
              render={<Link to="/" />}
            >
              <MapIcon />
              Map
            </Button>
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
            selectedLocation={
              selectedLocationId
                ? (locations.find(
                    (location) => location.id === selectedLocationId,
                  ) ?? null)
                : null
            }
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
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant={tripStatusVariant(status)}>{status}</Badge>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpdateTripOpen(true)}
                  >
                    <PencilIcon />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTripOpen(true)}
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight break-words">
                  {trip.name}
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarIcon className="size-3.5 shrink-0" />
                  {formatTripDateRange(trip.startDate, trip.endDate)}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5 shrink-0" />
                  {destinations.length}{' '}
                  {destinations.length === 1 ? 'destination' : 'destinations'}
                </p>
                {trip.notes ? (
                  <p className="text-sm text-muted-foreground break-words">
                    {trip.notes}
                  </p>
                ) : null}
              </div>
            </div>

            <section className="space-y-3">
              {destinations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No destinations added to this trip yet.
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="flex items-center gap-2 font-medium">
                        <CalendarDaysIcon className="size-4 text-muted-foreground" />
                        Itinerary
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Stops scheduled by day
                      </p>
                    </div>
                    <DestinationList
                      items={sortedDestinations}
                      emptyMessage="No stops scheduled yet. Assign days to locations below."
                      showIndex
                      tripId={tripId}
                      tripStartDate={trip.startDate}
                      tripEndDate={trip.endDate}
                      selectedLocationId={selectedLocationId ?? undefined}
                      onSelectLocation={handleSelectLocation}
                      onDelete={setDeletingDestination}
                    />
                  </div>

                  {unsortedDestinations.length > 0 ? (
                    <div className="space-y-3">
                      <div>
                        <h3 className="flex items-center gap-2 font-medium">
                          <InboxIcon className="size-4 text-muted-foreground" />
                          Unsorted
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Saved locations not yet placed on your itinerary
                        </p>
                      </div>
                      <DestinationList
                        items={unsortedDestinations}
                        emptyMessage="No unsorted locations."
                        listClassName="border-dashed bg-muted/20"
                        showIndex={false}
                        tripId={tripId}
                        tripStartDate={trip.startDate}
                        tripEndDate={trip.endDate}
                        selectedLocationId={selectedLocationId ?? undefined}
                        onSelectLocation={handleSelectLocation}
                        onDelete={setDeletingDestination}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          </div>
        }
        right={
          detailLocation ? (
            <MapLocationDetailPanel
              location={detailLocation}
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

      <UpdateTripDialog
        trip={trip}
        open={updateTripOpen}
        onOpenChange={setUpdateTripOpen}
      />

      <Dialog open={deleteTripOpen} onOpenChange={setDeleteTripOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete trip</DialogTitle>
            <DialogDescription>
              This will remove &ldquo;{trip.name}&rdquo; from your trips. Your
              saved locations will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTripOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteTripMutation.isPending}
              onClick={handleConfirmDeleteTrip}
            >
              Delete trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingDestination != null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingDestination(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove destination</DialogTitle>
            <DialogDescription>
              This will remove the destination from the trip. The location itself
              will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingDestination(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteDestinationMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
