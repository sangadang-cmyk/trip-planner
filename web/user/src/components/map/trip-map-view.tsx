import type { Map } from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import { useCallback, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { SidebarMenuTrigger } from '@/components/dashboard/sidebar-menu-trigger'
import { MapController } from '@/components/map/map-controller'
import { MapLocateButton } from '@/components/map/map-locate-button'
import { MapLocationDetailPanel } from '@/components/map/map-location-detail-panel'
import { MapLocationLayer } from '@/components/map/map-location-layer'
import { MapSearchBar } from '@/components/map/map-search-bar'
import { MapTripQuickAccess } from '@/components/map/map-trip-quick-access'
import { MapZoomControls } from '@/components/map/map-zoom-controls'
import type { LocationResponse } from '@/generated/api/types.gen'
import { useMapBoundingBoxLocations } from '@/hooks/use-map-bounding-box-locations'
import { getMapLocationKey } from '@/lib/map-location'
import { cn } from '@/lib/utils'

const DEFAULT_CENTER: LatLngExpression = [10.7769, 106.7009]
const DEFAULT_ZOOM = 13

type TripMapViewProps = {
  className?: string
}

export function TripMapView({ className }: TripMapViewProps) {
  const [map, setMap] = useState<Map | null>(null)
  const [panelLocation, setPanelLocation] = useState<LocationResponse | null>(
    null,
  )
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { locations, isPending } = useMapBoundingBoxLocations(map)

  const handleMapReady = useCallback((nextMap: Map) => {
    setMap(nextMap)
  }, [])

  function handleSelectLocation(location: LocationResponse) {
    const locationKey = getMapLocationKey(location)
    setPanelLocation(location)
    setSelectedMarkerId(locationKey)
    setIsDetailOpen(true)
  }

  function handleCloseDetail() {
    setSelectedMarkerId(null)
    setIsDetailOpen(false)
  }

  function handleDetailClosed() {
    setPanelLocation(null)
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
        <MapLocationLayer
          locations={locations}
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
          <MapSearchBar className="w-[min(100vw-5rem,24rem)]" />
        </div>

        {isPending ? (
          <div className="pointer-events-none absolute top-4 right-4 rounded-md bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            Loading locations…
          </div>
        ) : null}

        {panelLocation ? (
          <MapLocationDetailPanel
            location={panelLocation}
            open={isDetailOpen}
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
