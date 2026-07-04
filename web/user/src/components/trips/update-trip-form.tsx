import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getUserTripsByIdQueryKey,
  getUserTripsByTripIdDestinationsQueryKey,
  getUserTripsQueryKey,
  putUserTripsByIdMutation,
} from '@/generated/api/@tanstack/react-query.gen'
import type { TripResponse } from '@/generated/api/types.gen'

type UpdateTripFormProps = {
  trip: TripResponse
  onCancel?: () => void
  onSuccess?: (trip: TripResponse) => void
  showCancel?: boolean
  submitLabel?: string
}

export function UpdateTripForm({
  trip,
  onCancel,
  onSuccess,
  showCancel = true,
  submitLabel = 'Save changes',
}: UpdateTripFormProps) {
  const queryClient = useQueryClient()
  const [tripName, setTripName] = useState(trip.name)
  const [startDate, setStartDate] = useState(trip.startDate)
  const [endDate, setEndDate] = useState(trip.endDate)
  const [notes, setNotes] = useState(trip.notes ?? '')

  useEffect(() => {
    setTripName(trip.name)
    setStartDate(trip.startDate)
    setEndDate(trip.endDate)
    setNotes(trip.notes ?? '')
  }, [trip])

  const updateTripMutation = useMutation({
    ...putUserTripsByIdMutation(),
    onSuccess: (updatedTrip) => {
      toast.success('Trip updated')
      void queryClient.invalidateQueries({
        queryKey: getUserTripsByIdQueryKey({ path: { id: trip.id } }),
      })
      void queryClient.invalidateQueries({ queryKey: getUserTripsQueryKey() })
      void queryClient.invalidateQueries({
        queryKey: getUserTripsByTripIdDestinationsQueryKey({
          path: { tripId: trip.id },
        }),
      })
      onSuccess?.(updatedTrip)
    },
    onError: () => {
      toast.error('Unable to update trip.')
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!tripName.trim()) {
      toast.error('Trip name is required.')
      return
    }

    if (startDate > endDate) {
      toast.error('End date must be on or after the start date.')
      return
    }

    updateTripMutation.mutate({
      path: { id: trip.id },
      body: {
        name: tripName.trim(),
        startDate,
        endDate,
        notes: notes.trim(),
      },
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="update-trip-name">Trip name</Label>
        <Input
          id="update-trip-name"
          value={tripName}
          onChange={(event) => setTripName(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="update-trip-start-date">Start date</Label>
          <Input
            id="update-trip-start-date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-trip-end-date">End date</Label>
          <Input
            id="update-trip-end-date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="update-trip-notes">Notes</Label>
        <Input
          id="update-trip-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional trip notes"
        />
      </div>
      <div className="flex gap-2">
        {showCancel ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          className={showCancel ? 'flex-1' : 'w-full'}
          disabled={updateTripMutation.isPending}
        >
          {updateTripMutation.isPending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
