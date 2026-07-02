import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getUserTripsQueryKey,
  postUserTripsMutation,
} from '@/generated/api/@tanstack/react-query.gen'
import type { TripResponse } from '@/generated/api/types.gen'
import { getDefaultTripDates } from '@/lib/trip'

type CreateTripFormProps = {
  onCancel?: () => void
  onSuccess?: (trip: TripResponse) => void
  showCancel?: boolean
  submitLabel?: string
}

export function CreateTripForm({
  onCancel,
  onSuccess,
  showCancel = true,
  submitLabel = 'Create trip',
}: CreateTripFormProps) {
  const queryClient = useQueryClient()
  const defaultDates = getDefaultTripDates()
  const [tripName, setTripName] = useState('')
  const [startDate, setStartDate] = useState(defaultDates.startDate)
  const [endDate, setEndDate] = useState(defaultDates.endDate)

  const createTripMutation = useMutation({
    ...postUserTripsMutation(),
    onSuccess: (trip) => {
      toast.success('Trip created')
      void queryClient.invalidateQueries({ queryKey: getUserTripsQueryKey() })
      setTripName('')
      setStartDate(defaultDates.startDate)
      setEndDate(defaultDates.endDate)
      onSuccess?.(trip)
    },
    onError: () => {
      toast.error('Unable to create trip.')
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

    createTripMutation.mutate({
      body: {
        name: tripName.trim(),
        startDate,
        endDate,
      },
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="create-trip-name">Trip name</Label>
        <Input
          id="create-trip-name"
          value={tripName}
          onChange={(event) => setTripName(event.target.value)}
          placeholder="Summer in Japan"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="create-trip-start-date">Start date</Label>
          <Input
            id="create-trip-start-date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-trip-end-date">End date</Label>
          <Input
            id="create-trip-end-date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </div>
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
          disabled={createTripMutation.isPending}
        >
          {createTripMutation.isPending ? 'Creating…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
