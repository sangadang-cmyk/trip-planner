import { Marker } from 'react-leaflet'

import type { LocationResponse } from '@/generated/api/types.gen'
import { getLocationMarkerIcon } from '@/lib/leaflet-icon'
import { getMapLocationKey } from '@/lib/map-location'

type MapLocationMarkersProps = {
  locations: LocationResponse[]
  selectedId: string | null
  onSelect: (location: LocationResponse) => void
}

export function MapLocationMarkers({
  locations,
  selectedId,
  onSelect,
}: MapLocationMarkersProps) {
  return (
    <>
      {locations.map((location) => {
        const locationKey = getMapLocationKey(location)
        const isSelected = selectedId === locationKey

        return (
          <Marker
            key={locationKey}
            position={[location.latitude, location.longitude]}
            icon={getLocationMarkerIcon(isSelected)}
            eventHandlers={{
              click: () => onSelect(location),
            }}
          />
        )
      })}
    </>
  )
}
