import type { Map } from 'leaflet'
import { MinusIcon, PlusIcon } from 'lucide-react'

import {
  mapControlButtonClassName,
  mapControlSurfaceClassName,
} from '@/components/map/map-control-styles'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MapZoomControlsProps = {
  map: Map | null
}

export function MapZoomControls({ map }: MapZoomControlsProps) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-md',
        mapControlSurfaceClassName,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Zoom in"
        disabled={!map}
        className={cn(mapControlButtonClassName, 'rounded-none shadow-none ring-0')}
        onClick={() => map?.zoomIn()}
      >
        <PlusIcon />
      </Button>
      <div className="h-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Zoom out"
        disabled={!map}
        className={cn(mapControlButtonClassName, 'rounded-none shadow-none ring-0')}
        onClick={() => map?.zoomOut()}
      >
        <MinusIcon />
      </Button>
    </div>
  )
}
