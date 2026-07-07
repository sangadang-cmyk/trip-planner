import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getAdminLocationsQueryKey,
  postAdminLocationsManualMutation,
} from '@/generated/api/@tanstack/react-query.gen'

export function CreateLocationDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [popularity, setPopularity] = useState('')

  const createLocationMutation = useMutation({
    ...postAdminLocationsManualMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getAdminLocationsQueryKey(),
      })
      resetForm()
      setOpen(false)
    },
  })

  function resetForm() {
    setName('')
    setLatitude('')
    setLongitude('')
    setPopularity('')
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    createLocationMutation.mutate({
      body: {
        name,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        popularity: popularity ? Number(popularity) : undefined,
      },
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
      createLocationMutation.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Create location
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create location</DialogTitle>
          <DialogDescription>
            Add a new manual location to the catalog.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="location-name">Name</Label>
            <Input
              id="location-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Central Park"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location-latitude">Latitude</Label>
            <Input
              id="location-latitude"
              inputMode="decimal"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="40.7829"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location-longitude">Longitude</Label>
            <Input
              id="location-longitude"
              inputMode="decimal"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="-73.9654"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location-popularity">Popularity</Label>
            <Input
              id="location-popularity"
              inputMode="numeric"
              value={popularity}
              onChange={(event) => setPopularity(event.target.value)}
              placeholder="0"
            />
          </div>
          {createLocationMutation.isError ? (
            <p className="text-sm text-destructive">
              Failed to create location. Please check the details and try again.
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createLocationMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLocationMutation.isPending}>
              {createLocationMutation.isPending ? 'Creating…' : 'Create location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
