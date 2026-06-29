import { Marker } from 'react-leaflet'

import { getLocationMarkerIcon } from '@/lib/leaflet-icon'
import type { MockLocation } from '@/mocks/types'

type MapLocationMarkersProps = {
  locations: MockLocation[]
  selectedId: string | null
  onSelect: (location: MockLocation) => void
}

export function MapLocationMarkers({
  locations,
  selectedId,
  onSelect,
}: MapLocationMarkersProps) {
  return (
    <>
      {locations.map((location) => {
        const isSelected = selectedId === location.id

        return (
          <Marker
            key={location.id}
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
