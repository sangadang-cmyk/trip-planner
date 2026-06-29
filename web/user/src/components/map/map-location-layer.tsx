import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

import { MapLocationMarkers } from '@/components/map/map-location-markers'
import type { MockLocation } from '@/mocks/types'

const SELECT_ZOOM = 16
const FLY_DURATION_SECONDS = 1.2

type MapLocationLayerProps = {
  locations: MockLocation[]
  selectedId: string | null
  onSelect: (location: MockLocation) => void
}

export function MapLocationLayer({
  locations,
  selectedId,
  onSelect,
}: MapLocationLayerProps) {
  const map = useMap()

  useEffect(() => {
    const selected = locations.find((location) => location.id === selectedId)
    if (!selected) {
      return
    }

    map.flyTo([selected.latitude, selected.longitude], SELECT_ZOOM, {
      duration: FLY_DURATION_SECONDS,
      easeLinearity: 0.25,
    })
  }, [locations, map, selectedId])

  function handleSelect(location: MockLocation) {
    onSelect(location)
  }

  return (
    <MapLocationMarkers
      locations={locations}
      selectedId={selectedId}
      onSelect={handleSelect}
    />
  )
}
