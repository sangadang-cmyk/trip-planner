import type { LocationResponse } from '@/generated/api/types.gen'

export function getMapLocationKey(location: LocationResponse): string {
  return (
    location.id ??
    location.googleMapsId ??
    `${location.latitude}-${location.longitude}-${location.name}`
  )
}

export function isMappableLocation(
  location: LocationResponse,
): location is LocationResponse & { latitude: number; longitude: number } {
  return location.latitude != null && location.longitude != null
}
