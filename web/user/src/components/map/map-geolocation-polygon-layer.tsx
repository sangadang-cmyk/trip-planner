import type { GeoJsonObject } from 'geojson'
import type { PathOptions } from 'leaflet'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

const POLYGON_STYLE: PathOptions = {
  color: '#1d4ed8',
  weight: 3,
  opacity: 1,
  fillColor: '#3b82f6',
  fillOpacity: 0.28,
}

type MapGeolocationPolygonLayerProps = {
  data: GeoJsonObject | null
}

export function MapGeolocationPolygonLayer({
  data,
}: MapGeolocationPolygonLayerProps) {
  const map = useMap()
  const layerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
      layerRef.current = null
    }

    if (!data) {
      return
    }

    const layer = L.geoJSON(data, {
      style: () => POLYGON_STYLE,
      interactive: false,
    })

    layer.addTo(map)
    layerRef.current = layer

    const bounds = layer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [data, map])

  return null
}
