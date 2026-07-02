import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreateTripForm } from '@/components/trips/create-trip-form'
import type { TripResponse } from '@/generated/api/types.gen'

type CreateTripDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (trip: TripResponse) => void
}

export function CreateTripDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTripDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a trip</DialogTitle>
          <DialogDescription>
            Add a new trip to start planning destinations and dates.
          </DialogDescription>
        </DialogHeader>
        <CreateTripForm
          onCancel={() => onOpenChange(false)}
          onSuccess={(trip) => {
            onSuccess?.(trip)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
