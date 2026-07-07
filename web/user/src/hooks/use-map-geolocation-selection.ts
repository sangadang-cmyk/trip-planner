import type { GeoJsonObject } from 'geojson'
import type { Map } from 'leaflet'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { getGeolocationPolygon } from '@/generated/api/sdk.gen'
import type { GeolocationSearchResult } from '@/generated/api/types.gen'
import { normalizePolygonGeoJson } from '@/lib/map-geolocation'

const FLY_DURATION_SECONDS = 1.2

function getSearchResultZoom(addressType: GeolocationSearchResult['addressType']) {
  return addressType === 'country' ? 6 : 11
}

export function useMapGeolocationSelection(map: Map | null) {
  const [polygonGeoJson, setPolygonGeoJson] = useState<GeoJsonObject | null>(null)
  const [isLoadingPolygon, setIsLoadingPolygon] = useState(false)

  const selectSearchResult = useCallback(
    async (result: GeolocationSearchResult) => {
      setPolygonGeoJson(null)

      if (result.osmId == null) {
        toast.error('Missing OSM id for this place. Try searching again.')
        return
      }

      if (map && result.latitude != null && result.longitude != null) {
        map.flyTo(
          [result.latitude, result.longitude],
          getSearchResultZoom(result.addressType),
          {
            duration: FLY_DURATION_SECONDS,
            easeLinearity: 0.25,
          },
        )
      }

      setIsLoadingPolygon(true)

      try {
        const { data } = await getGeolocationPolygon({
          query: {
            osmId: result.osmId,
          },
          throwOnError: true,
        })
        const normalized = normalizePolygonGeoJson(data)

        if (!normalized) {
          throw new Error('Empty polygon response')
        }

        setPolygonGeoJson(normalized)
      } catch {
        setPolygonGeoJson(null)
        toast.error('Could not load place boundary')
      } finally {
        setIsLoadingPolygon(false)
      }
    },
    [map],
  )

  return {
    polygonGeoJson,
    isLoadingPolygon,
    selectSearchResult,
  }
}
