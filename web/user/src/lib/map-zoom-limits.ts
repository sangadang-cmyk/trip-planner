export const MAP_ZOOM_VISIBILITY_LIMITS = {
  worldMaxZoom: 4,
  regionMaxZoom: 8,
  cityMaxZoom: 12,
  regionMaxLocations: 20,
  cityMaxLocations: 50,
  streetMaxLocations: 100,
} as const

export function getMaxVisibleLocationsForZoom(zoom: number): number {
  if (zoom <= MAP_ZOOM_VISIBILITY_LIMITS.worldMaxZoom) {
    return 0
  }

  if (zoom <= MAP_ZOOM_VISIBILITY_LIMITS.regionMaxZoom) {
    return MAP_ZOOM_VISIBILITY_LIMITS.regionMaxLocations
  }

  if (zoom <= MAP_ZOOM_VISIBILITY_LIMITS.cityMaxZoom) {
    return MAP_ZOOM_VISIBILITY_LIMITS.cityMaxLocations
  }

  return MAP_ZOOM_VISIBILITY_LIMITS.streetMaxLocations
}
