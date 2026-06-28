import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { formatDate } from '@/components/accounts/account-detail-sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getAdminLocationsByIdOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { LocationResponse } from '@/generated/api/types.gen'

type LocationDetailSheetProps = {
  locationId: string | null
  onOpenChange: (open: boolean) => void
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

function LocationSourceBadge({ source }: { source: LocationResponse['source'] }) {
  return (
    <Badge variant={source === 'MANUAL' ? 'secondary' : 'outline'}>
      {source}
    </Badge>
  )
}

function LocationDetailContent({ location }: { location: LocationResponse }) {
  return (
    <dl className="grid gap-4 px-4 pb-4">
      <DetailField label="ID" value={location.id} />
      <DetailField label="Name" value={location.name} />
      <DetailField label="City" value={location.cityDisplayName ?? '—'} />
      <DetailField label="Country" value={location.countryDisplayName ?? '—'} />
      <DetailField
        label="City ID"
        value={<span className="font-mono text-xs">{location.cityId}</span>}
      />
      <DetailField
        label="Country ID"
        value={<span className="font-mono text-xs">{location.countryId}</span>}
      />
      <DetailField
        label="Source"
        value={<LocationSourceBadge source={location.source} />}
      />
      <DetailField label="Google Maps ID" value={location.googleMapsId ?? '—'} />
      <DetailField label="Added by" value={location.addedBy ?? '—'} />
      <DetailField
        label="Images"
        value={
          location.images.length === 0 ? (
            '—'
          ) : (
            <ul className="grid gap-1">
              {location.images.map((image) => (
                <li key={image} className="break-all">
                  {image}
                </li>
              ))}
            </ul>
          )
        }
      />
      <DetailField label="Created" value={formatDate(location.createdAt)} />
      <DetailField label="Updated" value={formatDate(location.updatedAt)} />
    </dl>
  )
}

function LocationDetailSkeleton() {
  return (
    <div className="grid gap-4 px-4 pb-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="grid gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      ))}
    </div>
  )
}

export function LocationDetailSheet({
  locationId,
  onOpenChange,
}: LocationDetailSheetProps) {
  const { data, isPending, isError } = useQuery({
    ...getAdminLocationsByIdOptions({
      path: { id: locationId ?? '' },
    }),
    enabled: locationId !== null,
  })

  return (
    <Sheet open={locationId !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Location details</SheetTitle>
          <SheetDescription>
            Full location information loaded from the admin API.
          </SheetDescription>
        </SheetHeader>
        {isPending ? <LocationDetailSkeleton /> : null}
        {isError ? (
          <p className="px-4 pb-4 text-sm text-destructive">
            Failed to load location details.
          </p>
        ) : null}
        {!isPending && !isError && data ? (
          <LocationDetailContent location={data} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

export { LocationSourceBadge }
