import { create } from 'zustand'

import type { LocationResponse } from '@/generated/api/types.gen'
import { getMapLocationKey, isMappableLocation } from '@/lib/map-location'

type MapLocationState = {
  locationsById: Record<string, LocationResponse>
  upsertLocations: (locations: LocationResponse[]) => void
  clearLocations: () => void
}

export const useMapLocationStore = create<MapLocationState>((set) => ({
  locationsById: {},
  upsertLocations: (locations) =>
    set((state) => {
      const nextLocationsById = { ...state.locationsById }

      for (const location of locations) {
        if (!isMappableLocation(location)) {
          continue
        }

        nextLocationsById[getMapLocationKey(location)] = location
      }

      return { locationsById: nextLocationsById }
    }),
  clearLocations: () => set({ locationsById: {} }),
}))

export function selectAllMapLocations(
  locationsById: Record<string, LocationResponse>,
): LocationResponse[] {
  return Object.values(locationsById)
}
