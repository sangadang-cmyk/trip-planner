import { Marker } from 'react-leaflet'

import type { AnimatedMapMarker } from '@/hooks/use-animated-map-markers'
import { getLocationMarkerIcon } from '@/lib/leaflet-icon'
import { getMapLocationKey } from '@/lib/map-location'
import type { LocationResponse } from '@/generated/api/types.gen'

type MapLocationMarkersProps = {
  markers: AnimatedMapMarker[]
  selectedId: string | null
  onSelect: (location: LocationResponse) => void
}

export function MapLocationMarkers({
  markers,
  selectedId,
  onSelect,
}: MapLocationMarkersProps) {
  return (
    <>
      {markers.map(({ location, phase }) => {
        const locationKey = getMapLocationKey(location)
        const isSelected = selectedId === locationKey

        return (
          <Marker
            key={locationKey}
            position={[location.latitude, location.longitude]}
            icon={getLocationMarkerIcon(isSelected, phase)}
            eventHandlers={{
              click: () => onSelect(location),
            }}
          />
        )
      })}
    </>
  )
}
