import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getAdminCitiesOptions,
  getAdminCountriesOptions,
  getAdminLocationsQueryKey,
  postAdminLocationsManualMutation,
} from '@/generated/api/@tanstack/react-query.gen'

const LOOKUP_PAGE_SIZE = 100

function parseImages(value: string) {
  return value
    .split(',')
    .map((image) => image.trim())
    .filter(Boolean)
}

export function CreateLocationDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [countryId, setCountryId] = useState<string | null>(null)
  const [cityId, setCityId] = useState<string | null>(null)
  const [images, setImages] = useState('')

  const { data: countriesData, isPending: isCountriesPending } = useQuery({
    ...getAdminCountriesOptions({
      query: {
        page: 0,
        size: LOOKUP_PAGE_SIZE,
      },
    }),
    enabled: open,
  })

  const { data: citiesData, isPending: isCitiesPending } = useQuery({
    ...getAdminCitiesOptions({
      query: {
        page: 0,
        size: LOOKUP_PAGE_SIZE,
        countryId: countryId ?? undefined,
      },
    }),
    enabled: open && countryId !== null,
  })

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

  const countries = countriesData?.content ?? []
  const cities = citiesData?.content ?? []

  function resetForm() {
    setName('')
    setCountryId(null)
    setCityId(null)
    setImages('')
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!countryId || !cityId) {
      return
    }

    const parsedImages = parseImages(images)

    createLocationMutation.mutate({
      body: {
        name,
        countryId,
        cityId,
        images: parsedImages.length > 0 ? parsedImages : undefined,
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

  function handleCountryChange(value: string | null) {
    setCountryId(value)
    setCityId(null)
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
            <Label htmlFor="location-country">Country</Label>
            <Select
              value={countryId}
              onValueChange={handleCountryChange}
              disabled={isCountriesPending}
              items={countries.map((country) => ({
                label: country.name,
                value: country.id,
              }))}
            >
              <SelectTrigger id="location-country" className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location-city">City</Label>
            <Select
              value={cityId}
              onValueChange={setCityId}
              disabled={countryId === null || isCitiesPending}
              items={cities.map((city) => ({
                label: city.name,
                value: city.id,
              }))}
            >
              <SelectTrigger id="location-city" className="w-full">
                <SelectValue
                  placeholder={
                    countryId === null
                      ? 'Select a country first'
                      : 'Select a city'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location-images">Images</Label>
            <Input
              id="location-images"
              value={images}
              onChange={(event) => setImages(event.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple image URLs with commas.
            </p>
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
            <Button
              type="submit"
              disabled={
                createLocationMutation.isPending ||
                countryId === null ||
                cityId === null
              }
            >
              {createLocationMutation.isPending ? 'Creating…' : 'Create location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
