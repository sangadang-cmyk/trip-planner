import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/locations')({
  component: LocationsPage,
})

function LocationsPage() {
  return <div className="flex flex-1 flex-col p-4 lg:p-6" />
}
