import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

import { MapLocationMarkers } from '@/components/map/map-location-markers'
import type { LocationResponse } from '@/generated/api/types.gen'
import { getMapLocationKey } from '@/lib/map-location'

const SELECT_ZOOM = 16
const FLY_DURATION_SECONDS = 1.2

type MapLocationLayerProps = {
  locations: LocationResponse[]
  selectedId: string | null
  onSelect: (location: LocationResponse) => void
}

export function MapLocationLayer({
  locations,
  selectedId,
  onSelect,
}: MapLocationLayerProps) {
  const map = useMap()

  useEffect(() => {
    const selected = locations.find(
      (location) => getMapLocationKey(location) === selectedId,
    )
    if (!selected || selected.latitude == null || selected.longitude == null) {
      return
    }

    map.flyTo([selected.latitude, selected.longitude], SELECT_ZOOM, {
      duration: FLY_DURATION_SECONDS,
      easeLinearity: 0.25,
    })
  }, [locations, map, selectedId])

  return (
    <MapLocationMarkers
      locations={locations}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  )
}
