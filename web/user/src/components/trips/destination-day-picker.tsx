import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  getUserTripsByTripIdDestinationsQueryKey,
  putUserTripsByTripIdDestinationsByDestinationIdMutation,
} from '@/generated/api/@tanstack/react-query.gen'
import type { TripDestinationResponse } from '@/generated/api/types.gen'
import { isVisitDateUnset, parseIsoDateLocal, toIsoDateString } from '@/lib/trip'

type DestinationDayPickerProps = {
  tripId: string
  destination: TripDestinationResponse
  tripStartDate: string
  tripEndDate: string
}

export function DestinationDayPicker({
  tripId,
  destination,
  tripStartDate,
  tripEndDate,
}: DestinationDayPickerProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const tripStart = parseIsoDateLocal(tripStartDate)
  const tripEnd = parseIsoDateLocal(tripEndDate)
  const selectedDate = isVisitDateUnset(destination.visitDate)
    ? null
    : parseIsoDateLocal(destination.visitDate)

  const updateDestinationMutation = useMutation({
    ...putUserTripsByTripIdDestinationsByDestinationIdMutation(),
    onSuccess: () => {
      toast.success('Visit date updated')
      void queryClient.invalidateQueries({
        queryKey: getUserTripsByTripIdDestinationsQueryKey({
          path: { tripId },
        }),
      })
      setOpen(false)
    },
    onError: () => {
      toast.error('Unable to update this destination date.')
    },
  })

  function updateVisitDate(visitDate: string | null) {
    updateDestinationMutation.mutate({
      path: {
        tripId,
        destinationId: destination.id,
      },
      body: { visitDate },
    })
  }

  function handleSelectDate(date: Date | undefined) {
    if (!date) {
      return
    }

    updateVisitDate(toIsoDateString(date))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            aria-label="Assign visit date"
            disabled={updateDestinationMutation.isPending}
          />
        }
      >
        <CalendarIcon />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
        <PopoverHeader className="border-b px-4 py-3">
          <PopoverTitle>Assign visit date</PopoverTitle>
          <PopoverDescription>
            Choose a date within your trip dates.
          </PopoverDescription>
        </PopoverHeader>
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          defaultMonth={selectedDate ?? tripStart}
          startMonth={tripStart}
          endMonth={tripEnd}
          disabled={{ before: tripStart, after: tripEnd }}
          onSelect={handleSelectDate}
        />
        <div className="border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={
              updateDestinationMutation.isPending ||
              isVisitDateUnset(destination.visitDate)
            }
            onClick={() => updateVisitDate(null)}
          >
            Mark as unsorted
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
