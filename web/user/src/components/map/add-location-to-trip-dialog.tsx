import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { CreateTripForm } from '@/components/trips/create-trip-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getUserTripsByTripIdDestinationsQueryKey,
  getUserTripsOptions,
  postUserTripsByTripIdDestinationsMutation,
} from '@/generated/api/@tanstack/react-query.gen'
import type { LocationResponse, TripResponse } from '@/generated/api/types.gen'
import { useAuth } from '@/hooks/use-auth'
import { formatTripDateRange } from '@/lib/trip'

type AddLocationToTripDialogProps = {
  location: LocationResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AuthDialogContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        className="w-full"
        render={<Link to="/login" onClick={onNavigate} />}
      >
        Sign in
      </Button>
      <Button
        variant="outline"
        className="w-full"
        render={<Link to="/register" onClick={onNavigate} />}
      >
        Register
      </Button>
    </div>
  )
}

function TripPickerContent({
  location,
  onClose,
}: {
  location: LocationResponse
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [showCreateTrip, setShowCreateTrip] = useState(false)

  const {
    data: trips,
    isPending,
    isError,
  } = useQuery({
    ...getUserTripsOptions(),
    enabled: Boolean(location.id),
  })

  const addDestinationMutation = useMutation({
    ...postUserTripsByTripIdDestinationsMutation(),
    onSuccess: (_data, variables) => {
      toast.success('Location added to trip')
      void queryClient.invalidateQueries({
        queryKey: getUserTripsByTripIdDestinationsQueryKey({
          path: { tripId: variables.path.tripId },
        }),
      })
      onClose()
    },
    onError: () => {
      toast.error('Unable to add this location to the trip.')
    },
  })

  function handleAddToTrip(trip: TripResponse) {
    if (!location.id) {
      toast.error('This location must be saved before it can be added to a trip.')
      return
    }

    addDestinationMutation.mutate({
      path: { tripId: trip.id },
      body: {
        locationId: location.id,
        dayNumber: 1,
        sortOrder: 0,
      },
    })
  }

  if (!location.id) {
    return (
      <p className="text-sm text-muted-foreground">
        This location is not saved yet, so it cannot be added to a trip.
      </p>
    )
  }

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
          {trips.map((trip) => (
            <button
              key={trip.id}
              type="button"
              className="flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={addDestinationMutation.isPending}
              onClick={() => handleAddToTrip(trip)}
            >
              <span className="font-medium">{trip.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="size-3.5" />
                {formatTripDateRange(trip.startDate, trip.endDate)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function AddLocationToTripDialog({
  location,
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
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <AuthDialogContent onNavigate={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
