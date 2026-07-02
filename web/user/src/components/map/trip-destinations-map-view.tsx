import type { LatLngExpression } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { MapFitBounds } from '@/components/map/map-fit-bounds'
import { MapLocationLayer } from '@/components/map/map-location-layer'
import type { LocationResponse } from '@/generated/api/types.gen'
import { getMapLocationKey } from '@/lib/map-location'
import { cn } from '@/lib/utils'

const DEFAULT_CENTER: LatLngExpression = [10.7769, 106.7009]
const DEFAULT_ZOOM = 13

type TripDestinationsMapViewProps = {
  className?: string
  locations: LocationResponse[]
  selectedLocation: LocationResponse | null
  onSelectLocation: (location: LocationResponse) => void
}

export function TripDestinationsMapView({
  className,
  locations,
  selectedLocation,
  onSelectLocation,
}: TripDestinationsMapViewProps) {
  const selectedMarkerId = selectedLocation
    ? getMapLocationKey(selectedLocation)
    : null

  return (
    <div className={cn('relative isolate z-0 size-full overflow-hidden', className)}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="size-full"
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapFitBounds locations={locations} />
        <MapLocationLayer
          locations={locations}
          selectedId={selectedMarkerId}
          onSelect={onSelectLocation}
        />
      </MapContainer>
    </div>
  )
}
