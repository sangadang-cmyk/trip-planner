import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type TripMapProps = {
  className?: string
}

export function TripMap({ className }: TripMapProps) {
  const [TripMapView, setTripMapView] = useState<
    typeof import('@/components/map/trip-map-view').TripMapView | null
  >(null)

  useEffect(() => {
    void import('@/components/map/trip-map-view').then((module) => {
      setTripMapView(() => module.TripMapView)
    })
  }, [])

  if (!TripMapView) {
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

  return <TripMapView className={className} />
}
