import type { Map } from 'leaflet'
import { LocateFixedIcon, LocateOffIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { mapControlButtonClassName } from '@/components/map/map-control-styles'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LOCATION_ZOOM = 14
const FLY_DURATION_SECONDS = 1.5

type LocateStatus = 'idle' | 'locating' | 'denied'

type MapLocateButtonProps = {
  map: Map | null
}

export function MapLocateButton({ map }: MapLocateButtonProps) {
  const [status, setStatus] = useState<LocateStatus>('idle')
  const isDenied = status === 'denied'
  const isLocating = status === 'locating'

  function handleLocate() {
    if (!map) {
      return
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.')
      return
    }

    setStatus('locating')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        map.flyTo([latitude, longitude], LOCATION_ZOOM, {
          duration: FLY_DURATION_SECONDS,
          easeLinearity: 0.25,
        })
        setStatus('idle')
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied')
          return
        }

        setStatus('idle')
        toast.error('Unable to get your location. Please try again.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        isDenied
          ? 'Location access denied. Tap to try again.'
          : 'Go to my location'
      }
      disabled={!map || isLocating}
      className={cn(
        mapControlButtonClassName,
        'rounded-md',
        isDenied &&
          'text-destructive ring-destructive/40 hover:bg-destructive/10 hover:text-destructive',
        isLocating && 'text-primary ring-primary/40',
      )}
      onClick={handleLocate}
    >
      {isDenied ? (
        <LocateOffIcon className="size-4" />
      ) : (
        <LocateFixedIcon className={cn('size-4', isLocating && 'animate-pulse')} />
      )}
    </Button>
  )
}
