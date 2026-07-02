import { useEffect, useRef, useState } from 'react'

import type { LocationResponse } from '@/generated/api/types.gen'
import { getMapLocationKey, isMappableLocation } from '@/lib/map-location'

export const MARKER_ANIMATION_MS = 280

export type MapMarkerAnimationPhase = 'enter' | 'stable' | 'exit'

export type AnimatedMapMarker = {
  location: LocationResponse & { latitude: number; longitude: number }
  phase: MapMarkerAnimationPhase
}

export function useAnimatedMapMarkers(
  visibleLocations: LocationResponse[],
): AnimatedMapMarker[] {
  const [markersByKey, setMarkersByKey] = useState<
    Map<string, AnimatedMapMarker>
  >(new Map())
  const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )
  const enterTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )

  useEffect(() => {
    const visibleByKey = new Map<
      string,
      LocationResponse & { latitude: number; longitude: number }
    >()

    for (const location of visibleLocations) {
      if (isMappableLocation(location)) {
        visibleByKey.set(getMapLocationKey(location), location)
      }
    }

    setMarkersByKey((previousMarkers) => {
      const nextMarkers = new Map(previousMarkers)

      for (const [key, location] of visibleByKey) {
        const existing = nextMarkers.get(key)

        if (existing?.phase === 'exit') {
          const exitTimer = exitTimersRef.current.get(key)
          if (exitTimer) {
            clearTimeout(exitTimer)
            exitTimersRef.current.delete(key)
          }
        }

        if (!existing || existing.phase === 'exit') {
          nextMarkers.set(key, { location, phase: 'enter' })
        } else {
          nextMarkers.set(key, {
            location,
            phase: existing.phase === 'enter' ? 'enter' : 'stable',
          })
        }
      }

      for (const [key, marker] of nextMarkers) {
        if (!visibleByKey.has(key) && marker.phase !== 'exit') {
          nextMarkers.set(key, { ...marker, phase: 'exit' })
        }
      }

      return nextMarkers
    })
  }, [visibleLocations])

  useEffect(() => {
    for (const [key, marker] of markersByKey) {
      if (marker.phase === 'enter' && !enterTimersRef.current.has(key)) {
        enterTimersRef.current.set(
          key,
          setTimeout(() => {
            enterTimersRef.current.delete(key)
            setMarkersByKey((previousMarkers) => {
              const currentMarker = previousMarkers.get(key)
              if (!currentMarker || currentMarker.phase !== 'enter') {
                return previousMarkers
              }

              const nextMarkers = new Map(previousMarkers)
              nextMarkers.set(key, { ...currentMarker, phase: 'stable' })
              return nextMarkers
            })
          }, MARKER_ANIMATION_MS),
        )
      }

      if (marker.phase === 'exit' && !exitTimersRef.current.has(key)) {
        exitTimersRef.current.set(
          key,
          setTimeout(() => {
            exitTimersRef.current.delete(key)
            setMarkersByKey((previousMarkers) => {
              if (!previousMarkers.has(key)) {
                return previousMarkers
              }

              const nextMarkers = new Map(previousMarkers)
              nextMarkers.delete(key)
              return nextMarkers
            })
          }, MARKER_ANIMATION_MS),
        )
      }
    }
  }, [markersByKey])

  useEffect(() => {
    const exitTimers = exitTimersRef.current
    const enterTimers = enterTimersRef.current

    return () => {
      for (const timer of exitTimers.values()) {
        clearTimeout(timer)
      }

      for (const timer of enterTimers.values()) {
        clearTimeout(timer)
      }
    }
  }, [])

  return Array.from(markersByKey.values())
}
