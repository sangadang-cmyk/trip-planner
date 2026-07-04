import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UpdateTripForm } from '@/components/trips/update-trip-form'
import type { TripResponse } from '@/generated/api/types.gen'

type UpdateTripDialogProps = {
  trip: TripResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (trip: TripResponse) => void
}

export function UpdateTripDialog({
  trip,
  open,
  onOpenChange,
  onSuccess,
}: UpdateTripDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit trip</DialogTitle>
          <DialogDescription>
            Update the trip name, dates, or notes. Changing dates may move
            scheduled stops outside the new range back to unsorted.
          </DialogDescription>
        </DialogHeader>
        <UpdateTripForm
          trip={trip}
          onCancel={() => onOpenChange(false)}
          onSuccess={(updatedTrip) => {
            onSuccess?.(updatedTrip)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
