import { createFileRoute } from '@tanstack/react-router'

import { GeolocationManager } from '@/components/geolocation/geolocation-manager'

export const Route = createFileRoute('/_authenticated/dashboard/geolocation')({
  component: GeolocationPage,
})

function GeolocationPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
      <GeolocationManager />
    </div>
  )
}
