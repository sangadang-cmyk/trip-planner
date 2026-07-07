import { useEffect, useState } from 'react'

import type { LocationResponse } from '@/generated/api/types.gen'
import { cn } from '@/lib/utils'

type TripDestinationsMapProps = {
  className?: string
  locations: LocationResponse[]
  selectedLocation: LocationResponse | null
  onSelectLocation: (location: LocationResponse) => void
}

export function TripDestinationsMap({
  className,
  ...props
}: TripDestinationsMapProps) {
  const [TripDestinationsMapView, setTripDestinationsMapView] = useState<
    typeof import('@/components/map/trip-destinations-map-view').TripDestinationsMapView | null
  >(null)

  useEffect(() => {
    void import('@/components/map/trip-destinations-map-view').then((module) => {
      setTripDestinationsMapView(() => module.TripDestinationsMapView)
    })
  }, [])

  if (!TripDestinationsMapView) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/20 text-sm text-muted-foreground',
          className,
        )}
      >
        Loading map…
      </div>
    )
  }

  return <TripDestinationsMapView className={className} {...props} />
}
