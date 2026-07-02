import type { Map } from 'leaflet'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { postUserLocationsBoundingBoxMutation } from '@/generated/api/@tanstack/react-query.gen'
import type { BoundingBoxRequest } from '@/generated/api/types.gen'
import { selectVisibleMapLocations } from '@/lib/map-bounds'
import { isMappableLocation } from '@/lib/map-location'
import {
  selectAllMapLocations,
  useMapLocationStore,
} from '@/stores/map-location-store'

const DEBOUNCE_MS = 500
const THROTTLE_MS = 1000

type MapViewport = {
  bounds: BoundingBoxRequest
  zoom: number
}

function getViewportFromMap(map: Map): MapViewport {
  const bounds = map.getBounds()

  return {
    bounds: {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
    },
    zoom: map.getZoom(),
  }
}

export function useMapBoundingBoxLocations(map: Map | null) {
  const [viewport, setViewport] = useState<MapViewport | null>(null)
  const locationsById = useMapLocationStore((state) => state.locationsById)
  const upsertLocations = useMapLocationStore((state) => state.upsertLocations)
  const lastFetchAtRef = useRef(0)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingBoundsRef = useRef<BoundingBoxRequest | null>(null)

  const cachedLocations = useMemo(
    () => selectAllMapLocations(locationsById),
    [locationsById],
  )

  const visibleLocations = useMemo(() => {
    if (!viewport) {
      return []
    }

    return selectVisibleMapLocations(
      cachedLocations,
      viewport.bounds,
      viewport.zoom,
    )
  }, [cachedLocations, viewport])

  const { mutate, isPending, isError, error } = useMutation({
    ...postUserLocationsBoundingBoxMutation(),
    onSuccess: (data) => {
      upsertLocations(data.filter(isMappableLocation))
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
    (bounds: BoundingBoxRequest) => {
      pendingBoundsRef.current = bounds

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

  const handleMapChange = useCallback(
    (nextMap: Map) => {
      const nextViewport = getViewportFromMap(nextMap)
      setViewport(nextViewport)
      scheduleFetch(nextViewport.bounds)
    },
    [scheduleFetch],
  )

  useEffect(() => {
    if (!map) {
      return
    }

    const onMapChange = () => {
      handleMapChange(map)
    }

    onMapChange()

    map.on('moveend', onMapChange)
    map.on('zoomend', onMapChange)

    return () => {
      map.off('moveend', onMapChange)
      map.off('zoomend', onMapChange)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
      }
    }
  }, [map, handleMapChange])

  return {
    locations: visibleLocations,
    cachedLocationCount: cachedLocations.length,
    isPending,
    isError,
    error,
  }
}
