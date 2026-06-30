import type { Map } from 'leaflet'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { postUserLocationsBoundingBoxMutation } from '@/generated/api/@tanstack/react-query.gen'
import type { BoundingBoxRequest, LocationResponse } from '@/generated/api/types.gen'
import { isMappableLocation } from '@/lib/map-location'

const DEBOUNCE_MS = 500
const THROTTLE_MS = 1000

function getBoundingBoxFromMap(map: Map): BoundingBoxRequest {
  const bounds = map.getBounds()

  return {
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
    minLng: bounds.getWest(),
    maxLng: bounds.getEast(),
  }
}

export function useMapBoundingBoxLocations(map: Map | null) {
  const [locations, setLocations] = useState<LocationResponse[]>([])
  const lastFetchAtRef = useRef(0)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingBoundsRef = useRef<BoundingBoxRequest | null>(null)

  const { mutate, isPending, isError, error } = useMutation({
    ...postUserLocationsBoundingBoxMutation(),
    onSuccess: (data) => {
      setLocations(data.filter(isMappableLocation))
    },
  })

  const fetchForBounds = useCallback(
    (bounds: BoundingBoxRequest) => {
      mutate({ body: bounds })
      lastFetchAtRef.current = Date.now()
      pendingBoundsRef.current = null
    },
    [mutate],
  )

  const scheduleFetch = useCallback(
    (nextMap: Map) => {
      pendingBoundsRef.current = getBoundingBoxFromMap(nextMap)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        const pending = pendingBoundsRef.current
        if (!pending) {
          return
        }

        const elapsed = Date.now() - lastFetchAtRef.current
        if (elapsed < THROTTLE_MS) {
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current)
          }

          throttleTimerRef.current = setTimeout(() => {
            const latestPending = pendingBoundsRef.current
            if (latestPending) {
              fetchForBounds(latestPending)
            }
          }, THROTTLE_MS - elapsed)
          return
        }

        fetchForBounds(pending)
      }, DEBOUNCE_MS)
    },
    [fetchForBounds],
  )

  useEffect(() => {
    if (!map) {
      return
    }

    const handleMapChange = () => {
      scheduleFetch(map)
    }

    scheduleFetch(map)

    map.on('moveend', handleMapChange)
    map.on('zoomend', handleMapChange)

    return () => {
      map.off('moveend', handleMapChange)
      map.off('zoomend', handleMapChange)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
      }
    }
  }, [map, scheduleFetch])

  return {
    locations,
    isPending,
    isError,
    error,
  }
}
