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
import { MapZoomControls } from '@/components/map/map-zoom-controls'
import { MOCK_HCM_LOCATIONS } from '@/mocks'
import type { MockLocation } from '@/mocks/types'
import { cn } from '@/lib/utils'

const DEFAULT_CENTER: LatLngExpression = [10.7769, 106.7009]
const DEFAULT_ZOOM = 13

type TripMapViewProps = {
  className?: string
}

export function TripMapView({ className }: TripMapViewProps) {
  const [map, setMap] = useState<Map | null>(null)
  const [panelLocation, setPanelLocation] = useState<MockLocation | null>(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleMapReady = useCallback((nextMap: Map) => {
    setMap(nextMap)
  }, [])

  function handleSelectLocation(location: MockLocation) {
    setPanelLocation(location)
    setSelectedMarkerId(location.id)
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
          locations={MOCK_HCM_LOCATIONS}
          selectedId={selectedMarkerId}
          onSelect={handleSelectLocation}
        />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute top-4 left-4 flex w-[min(100%-2rem,28rem)] items-center gap-2">
          <SidebarMenuTrigger />
          <MapSearchBar />
        </div>

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
