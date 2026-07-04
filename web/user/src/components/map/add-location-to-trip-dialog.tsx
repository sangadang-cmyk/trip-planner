import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon, CheckIcon, ExternalLinkIcon, PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { CreateTripForm } from '@/components/trips/create-trip-form'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getUserTripsByLocationByLocationIdOptions,
  getUserTripsByLocationByLocationIdQueryKey,
  getUserTripsByTripIdDestinationsQueryKey,
  getUserTripsOptions,
  postUserTripsByTripIdDestinationsMutation,
} from '@/generated/api/@tanstack/react-query.gen'
import type { LocationResponse, TripResponse } from '@/generated/api/types.gen'
import { useAuth } from '@/hooks/use-auth'
import { formatTripDateRange } from '@/lib/trip'
import { cn } from '@/lib/utils'

type AddLocationToTripDialogProps = {
  location: LocationResponse
  locationId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AuthDialogContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/login"
        onClick={onNavigate}
        className={cn(buttonVariants(), 'w-full')}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        onClick={onNavigate}
        className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
      >
        Register
      </Link>
    </div>
  )
}

function TripPickerContent({
  location,
  locationId,
  onNavigateToTrip,
}: {
  location: LocationResponse
  locationId?: string
  onNavigateToTrip: () => void
}) {
  const queryClient = useQueryClient()
  const [showCreateTrip, setShowCreateTrip] = useState(false)
  const resolvedLocationId = locationId ?? location.id

  const {
    data: trips,
    isPending: areTripsPending,
    isError: areTripsError,
  } = useQuery({
    ...getUserTripsOptions(),
    enabled: Boolean(resolvedLocationId),
  })

  const {
    data: containingTripIds,
    isPending: areContainingTripIdsPending,
    isError: areContainingTripIdsError,
  } = useQuery({
    ...getUserTripsByLocationByLocationIdOptions({
      path: { locationId: resolvedLocationId! },
    }),
    enabled: Boolean(resolvedLocationId),
  })

  const tripsContainingLocation = useMemo(
    () => new Set(containingTripIds ?? []),
    [containingTripIds],
  )

  const addDestinationMutation = useMutation({
    ...postUserTripsByTripIdDestinationsMutation(),
    onSuccess: (_data, variables) => {
      toast.success('Location added to trip')
      void queryClient.invalidateQueries({
        queryKey: getUserTripsByTripIdDestinationsQueryKey({
          path: { tripId: variables.path.tripId },
        }),
      })
      if (resolvedLocationId) {
        void queryClient.invalidateQueries({
          queryKey: getUserTripsByLocationByLocationIdQueryKey({
            path: { locationId: resolvedLocationId },
          }),
        })
      }
    },
    onError: () => {
      toast.error('Unable to add this location to the trip.')
    },
  })

  function handleAddToTrip(trip: TripResponse) {
    if (tripsContainingLocation.has(trip.id)) {
      return
    }

    if (!resolvedLocationId) {
      toast.error('This location must be saved before it can be added to a trip.')
      return
    }

    addDestinationMutation.mutate({
      path: { tripId: trip.id },
      body: {
        locationId: resolvedLocationId,
        visitDate: null,
        sortOrder: 0,
      },
    })
  }

  if (!resolvedLocationId) {
    return (
      <p className="text-sm text-muted-foreground">
        This location is not saved yet, so it cannot be added to a trip.
      </p>
    )
  }

  const isPending =
    areTripsPending || (Boolean(resolvedLocationId) && areContainingTripIdsPending)
  const isError = areTripsError || areContainingTripIdsError

  if (showCreateTrip) {
    return (
      <CreateTripForm
        onCancel={() => setShowCreateTrip(false)}
        onSuccess={(trip) => {
          setShowCreateTrip(false)
          handleAddToTrip(trip)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setShowCreateTrip(true)}
      >
        <PlusIcon />
        Create new trip
      </Button>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">Failed to load your trips.</p>
      ) : null}

      {!isPending && !isError && trips && trips.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You do not have any trips yet. Create one to add this location.
        </p>
      ) : null}

      {!isPending && trips && trips.length > 0 ? (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {trips.map((trip) => {
            const isAlreadyAdded = tripsContainingLocation.has(trip.id)

            return (
              <div
                key={trip.id}
                className={cn(
                  'flex items-stretch gap-1 rounded-lg border',
                  isAlreadyAdded && 'border-primary/40 bg-primary/5',
                )}
              >
                <button
                  type="button"
                  className={cn(
                    'flex min-w-0 flex-1 flex-col gap-1 p-3 text-left transition-colors',
                    isAlreadyAdded
                      ? 'cursor-not-allowed'
                      : 'hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60',
                  )}
                  disabled={isAlreadyAdded || addDestinationMutation.isPending}
                  onClick={() => handleAddToTrip(trip)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{trip.name}</span>
                    {isAlreadyAdded ? (
                      <Badge variant="secondary" className="shrink-0 gap-1">
                        <CheckIcon className="size-3" />
                        Added
                      </Badge>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="size-3.5" />
                    {formatTripDateRange(trip.startDate, trip.endDate)}
                  </span>
                </button>

                <Link
                  to="/trips/$tripId"
                  params={{ tripId: trip.id }}
                  onClick={onNavigateToTrip}
                  aria-label={`View ${trip.name}`}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'xs' }),
                    'my-2 mr-2 shrink-0 self-center',
                  )}
                >
                  <ExternalLinkIcon />
                  View
                </Link>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function AddLocationToTripDialog({
  location,
  locationId,
  open,
  onOpenChange,
}: AddLocationToTripDialogProps) {
  const { isAuthenticated } = useAuth()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAuthenticated ? 'Add to trip' : 'Sign in to continue'}
          </DialogTitle>
          <DialogDescription>
            {isAuthenticated
              ? `Choose a trip for ${location.name}.`
              : 'Sign in or create an account to save this location to a trip.'}
          </DialogDescription>
        </DialogHeader>

        {isAuthenticated ? (
          <TripPickerContent
            location={location}
            locationId={locationId}
            onNavigateToTrip={() => onOpenChange(false)}
          />
        ) : (
          <AuthDialogContent onNavigate={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
