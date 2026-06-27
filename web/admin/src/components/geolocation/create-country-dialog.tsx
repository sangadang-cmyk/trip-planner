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
  getAdminCountriesQueryKey,
  postAdminCountriesMutation,
} from '@/generated/api/@tanstack/react-query.gen'

function parseAliases(value: string) {
  return value
    .split(',')
    .map((alias) => alias.trim())
    .filter(Boolean)
}

export function CreateCountryDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [aliases, setAliases] = useState('')

  const createCountryMutation = useMutation({
    ...postAdminCountriesMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getAdminCountriesQueryKey(),
      })
      setName('')
      setCode('')
      setAliases('')
      setOpen(false)
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAliases = parseAliases(aliases)

    createCountryMutation.mutate({
      body: {
        name,
        code: code.trim() || undefined,
        aliases: parsedAliases.length > 0 ? parsedAliases : undefined,
      },
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setName('')
      setCode('')
      setAliases('')
      createCountryMutation.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Create country
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create country</DialogTitle>
          <DialogDescription>
            Add a new country to the geolocation catalog.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="country-name">Name</Label>
            <Input
              id="country-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="United States"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country-code">Code</Label>
            <Input
              id="country-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="US"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country-aliases">Aliases</Label>
            <Input
              id="country-aliases"
              value={aliases}
              onChange={(event) => setAliases(event.target.value)}
              placeholder="USA, United States of America"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple aliases with commas.
            </p>
          </div>
          {createCountryMutation.isError ? (
            <p className="text-sm text-destructive">
              Failed to create country. Please check the details and try again.
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createCountryMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCountryMutation.isPending}>
              {createCountryMutation.isPending ? 'Creating…' : 'Create country'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
