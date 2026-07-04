import type { Map } from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { SidebarMenuTrigger } from '@/components/dashboard/sidebar-menu-trigger'
import { MapController } from '@/components/map/map-controller'
import { MapGeolocationPolygonLayer } from '@/components/map/map-geolocation-polygon-layer'
import { MapLocateButton } from '@/components/map/map-locate-button'
import { MapLocationDetailPanel } from '@/components/map/map-location-detail-panel'
import { MapLocationLayer } from '@/components/map/map-location-layer'
import { MapSearchBar } from '@/components/map/map-search-bar'
import { MapTripQuickAccess } from '@/components/map/map-trip-quick-access'
import { MapZoomControls } from '@/components/map/map-zoom-controls'
import { getUserLocationsByIdOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { LocationResponse } from '@/generated/api/types.gen'
import { useMapBoundingBoxLocations } from '@/hooks/use-map-bounding-box-locations'
import { useMapGeolocationSelection } from '@/hooks/use-map-geolocation-selection'
import {
  getMapLocationKey,
  isMappableLocation,
} from '@/lib/map-location'
import { cn } from '@/lib/utils'
import { useMapLocationStore } from '@/stores/map-location-store'

const DEFAULT_CENTER: LatLngExpression = [10.7769, 106.7009]
const DEFAULT_ZOOM = 13

const mapRoute = getRouteApi('/_app/')

type TripMapViewProps = {
  className?: string
}

function findCachedLocation(
  locationId: string,
  locationsById: Record<string, LocationResponse>,
): LocationResponse | undefined {
  if (locationsById[locationId]) {
    return locationsById[locationId]
  }

  return Object.values(locationsById).find((location) => location.id === locationId)
}

export function TripMapView({ className }: TripMapViewProps) {
  const navigate = useNavigate()
  const { locationId } = mapRoute.useSearch()
  const [map, setMap] = useState<Map | null>(null)
  const [panelLocation, setPanelLocation] = useState<LocationResponse | null>(
    null,
  )
  const locationIdRef = useRef(locationId)
  locationIdRef.current = locationId
  const locationsById = useMapLocationStore((state) => state.locationsById)
  const upsertLocations = useMapLocationStore((state) => state.upsertLocations)

  const { locations, isPending } = useMapBoundingBoxLocations(map)
  const { polygonGeoJson, isLoadingPolygon, selectSearchResult } =
    useMapGeolocationSelection(map)

  const cachedLocation = locationId
    ? findCachedLocation(locationId, locationsById)
    : undefined

  const {
    data: fetchedLocation,
    isError: isFetchedLocationError,
    isPending: isFetchedLocationPending,
  } = useQuery({
    ...getUserLocationsByIdOptions({
      path: { id: locationId ?? '' },
    }),
    enabled: Boolean(locationId) && !cachedLocation,
  })

  useEffect(() => {
    if (fetchedLocation && isMappableLocation(fetchedLocation)) {
      upsertLocations([fetchedLocation])
    }
  }, [fetchedLocation, upsertLocations])

  const resolvedLocation = useMemo(() => {
    if (!locationId) {
      return null
    }

    return (
      cachedLocation ??
      fetchedLocation ??
      locations.find((location) => location.id === locationId) ??
      null
    )
  }, [cachedLocation, fetchedLocation, locationId, locations])

  const selectedMarkerId = useMemo(() => {
    if (!resolvedLocation) {
      return null
    }

    return getMapLocationKey(resolvedLocation)
  }, [resolvedLocation])

  const mapLocations = useMemo(() => {
    if (!resolvedLocation || !isMappableLocation(resolvedLocation)) {
      return locations
    }

    const resolvedKey = getMapLocationKey(resolvedLocation)
    if (locations.some((location) => getMapLocationKey(location) === resolvedKey)) {
      return locations
    }

    return [...locations, resolvedLocation]
  }, [locations, resolvedLocation])

  const displayedLocation = useMemo(() => {
    if (!locationId) {
      return panelLocation
    }

    if (resolvedLocation) {
      return resolvedLocation
    }

    if (panelLocation?.id === locationId) {
      return panelLocation
    }

    return null
  }, [locationId, panelLocation, resolvedLocation])

  useEffect(() => {
    if (!locationId) {
      return
    }

    if (isFetchedLocationPending) {
      return
    }

    if (!resolvedLocation) {
      if (isFetchedLocationError) {
        void navigate({ to: '/', search: {}, replace: true })
      }
      return
    }

    setPanelLocation(resolvedLocation)
  }, [
    isFetchedLocationError,
    isFetchedLocationPending,
    locationId,
    navigate,
    resolvedLocation,
  ])

  const handleMapReady = useCallback((nextMap: Map) => {
    setMap(nextMap)
  }, [])

  function handleSelectLocation(location: LocationResponse) {
    if (!location.id) {
      return
    }

    void navigate({
      to: '/',
      search: { locationId: location.id },
    })
  }

  function handleCloseDetail() {
    void navigate({ to: '/', search: {} })
  }

  function handleDetailClosed() {
    if (!locationIdRef.current) {
      setPanelLocation(null)
    }
  }

  return (
    <div className={cn('relative isolate z-0 size-full overflow-hidden', className)}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="size-full"
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController onMapReady={handleMapReady} />
        <MapGeolocationPolygonLayer data={polygonGeoJson} />
        <MapLocationLayer
          locations={mapLocations}
          selectedId={selectedMarkerId}
          onSelect={handleSelectLocation}
        />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute top-4 left-4 flex items-start gap-2">
          <div className="flex flex-col items-start gap-2">
            <SidebarMenuTrigger />
            <MapTripQuickAccess />
          </div>
          <MapSearchBar
            className="w-[min(100vw-5rem,24rem)]"
            onSelectResult={selectSearchResult}
            isSelecting={isLoadingPolygon}
          />
        </div>

        {isPending ? (
          <div className="pointer-events-none absolute top-4 right-4 rounded-md bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            Loading locations…
          </div>
        ) : null}

        {displayedLocation ? (
          <MapLocationDetailPanel
            key={displayedLocation.id}
            location={displayedLocation}
            open={Boolean(locationId)}
            onClose={handleCloseDetail}
            onClosed={handleDetailClosed}
            className="absolute top-[4.5rem] bottom-0 left-4"
          />
        ) : null}

        <div className="pointer-events-auto absolute right-4 bottom-4 flex flex-col items-end gap-2">
          <MapZoomControls map={map} />
          <MapLocateButton map={map} />
        </div>
      </div>
    </div>
  )
}
