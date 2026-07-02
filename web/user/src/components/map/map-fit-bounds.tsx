import { latLngBounds } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import type { LocationResponse } from '@/generated/api/types.gen'

type MapFitBoundsProps = {
  locations: LocationResponse[]
}

export function MapFitBounds({ locations }: MapFitBoundsProps) {
  const map = useMap()

  useEffect(() => {
    const coordinates = locations.filter(
      (location) => location.latitude != null && location.longitude != null,
    )

    if (coordinates.length === 0) {
      return
    }

    if (coordinates.length === 1) {
      map.setView(
        [coordinates[0].latitude!, coordinates[0].longitude!],
        13,
      )
      return
    }

    const bounds = latLngBounds(
      coordinates.map((location) => [location.latitude!, location.longitude!]),
    )

    map.fitBounds(bounds, { padding: [32, 32] })
  }, [locations, map])

  return null
}
