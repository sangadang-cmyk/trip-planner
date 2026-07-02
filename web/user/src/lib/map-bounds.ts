import type { BoundingBoxRequest, LocationResponse } from '@/generated/api/types.gen'
import { getMapLocationKey, isMappableLocation } from '@/lib/map-location'
import { getMaxVisibleLocationsForZoom } from '@/lib/map-zoom-limits'

export const MAP_RENDER_BOUNDS_PADDING = 0.25

export function expandBoundingBox(
  bounds: BoundingBoxRequest,
  paddingRatio: number = MAP_RENDER_BOUNDS_PADDING,
): BoundingBoxRequest {
  const latSpan = bounds.maxLat - bounds.minLat
  const lngSpan = bounds.maxLng - bounds.minLng
  const latPadding = latSpan * paddingRatio
  const lngPadding = lngSpan * paddingRatio

  return {
    minLat: bounds.minLat - latPadding,
    maxLat: bounds.maxLat + latPadding,
    minLng: bounds.minLng - lngPadding,
    maxLng: bounds.maxLng + lngPadding,
  }
}

export function isLocationInsideBounds(
  location: LocationResponse,
  bounds: BoundingBoxRequest,
): boolean {
  if (!isMappableLocation(location)) {
    return false
  }

  return (
    location.latitude >= bounds.minLat &&
    location.latitude <= bounds.maxLat &&
    location.longitude >= bounds.minLng &&
    location.longitude <= bounds.maxLng
  )
}

export function selectVisibleMapLocations(
  locations: LocationResponse[],
  bounds: BoundingBoxRequest,
  zoom: number,
  boundsPaddingRatio: number = MAP_RENDER_BOUNDS_PADDING,
): LocationResponse[] {
  const maxVisibleLocations = getMaxVisibleLocationsForZoom(zoom)
  if (maxVisibleLocations === 0) {
    return []
  }

  const renderBounds = expandBoundingBox(bounds, boundsPaddingRatio)
  const strictViewportKeys = new Set(
    locations
      .filter((location) => isLocationInsideBounds(location, bounds))
      .map((location) => getMapLocationKey(location)),
  )

  return locations
    .filter((location) => isLocationInsideBounds(location, renderBounds))
    .sort((left, right) => {
      const leftInViewport = strictViewportKeys.has(getMapLocationKey(left))
      const rightInViewport = strictViewportKeys.has(getMapLocationKey(right))

      if (leftInViewport !== rightInViewport) {
        return leftInViewport ? -1 : 1
      }

      return right.popularity - left.popularity
    })
    .slice(0, maxVisibleLocations)
}
