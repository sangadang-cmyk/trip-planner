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
  getAdminCitiesQueryKey,
  postAdminCitiesMutation,
} from '@/generated/api/@tanstack/react-query.gen'

function parseAliases(value: string) {
  return value
    .split(',')
    .map((alias) => alias.trim())
    .filter(Boolean)
}

type CreateCityDialogProps = {
  countryId: string
  countryName: string
}

export function CreateCityDialog({
  countryId,
  countryName,
}: CreateCityDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [aliases, setAliases] = useState('')

  const createCityMutation = useMutation({
    ...postAdminCitiesMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getAdminCitiesQueryKey(),
      })
      setName('')
      setAliases('')
      setOpen(false)
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAliases = parseAliases(aliases)

    createCityMutation.mutate({
      body: {
        name,
        countryId,
        aliases: parsedAliases.length > 0 ? parsedAliases : undefined,
      },
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setName('')
      setAliases('')
      createCityMutation.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Create city
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create city</DialogTitle>
          <DialogDescription>
            Add a new city to {countryName}.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="city-name">Name</Label>
            <Input
              id="city-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New York"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city-aliases">Aliases</Label>
            <Input
              id="city-aliases"
              value={aliases}
              onChange={(event) => setAliases(event.target.value)}
              placeholder="NYC, New York City"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple aliases with commas.
            </p>
          </div>
          {createCityMutation.isError ? (
            <p className="text-sm text-destructive">
              Failed to create city. Please check the details and try again.
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createCityMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCityMutation.isPending}>
              {createCityMutation.isPending ? 'Creating…' : 'Create city'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
