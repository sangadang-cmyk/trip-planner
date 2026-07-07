import type { Map } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

type MapControllerProps = {
  onMapReady: (map: Map) => void
}

export function MapController({ onMapReady }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])

  return null
}
