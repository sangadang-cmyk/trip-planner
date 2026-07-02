import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import {
  getUserLocationsByIdOptions,
  getUserTripsByTripIdDestinationsOptions,
} from '@/generated/api/@tanstack/react-query.gen'
import type { LocationResponse, TripDestinationResponse } from '@/generated/api/types.gen'

export type TripDestinationWithLocation = {
  destination: TripDestinationResponse
  location: LocationResponse | null
}

export function useTripDestinationLocations(tripId: string) {
  const destinationsQuery = useQuery({
    ...getUserTripsByTripIdDestinationsOptions({
      path: { tripId },
    }),
  })

  const locationQueries = useQueries({
    queries: (destinationsQuery.data ?? []).map((destination) => ({
      ...getUserLocationsByIdOptions({
        path: { id: destination.locationId },
      }),
      enabled: Boolean(destination.locationId),
    })),
  })

  const destinationsWithLocations = useMemo(() => {
    return (destinationsQuery.data ?? []).map((destination, index) => ({
      destination,
      location: locationQueries[index]?.data ?? null,
    }))
  }, [destinationsQuery.data, locationQueries])

  const locations = useMemo(
    () =>
      destinationsWithLocations
        .map((entry) => entry.location)
        .filter(
          (location): location is LocationResponse =>
            location != null &&
            location.latitude != null &&
            location.longitude != null,
        ),
    [destinationsWithLocations],
  )

  const isPending =
    destinationsQuery.isPending ||
    locationQueries.some((query) => query.isPending)

  const isError =
    destinationsQuery.isError || locationQueries.some((query) => query.isError)

  return {
    destinations: destinationsWithLocations,
    locations,
    isPending,
    isError,
  }
}
