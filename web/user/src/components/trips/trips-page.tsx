import { CalendarIcon, MapPinIcon, PlusIcon } from 'lucide-react'

import { SidebarMenuTrigger } from '@/components/dashboard/sidebar-menu-trigger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type MockTrip = {
  id: string
  name: string
  startDate: string
  endDate: string
  destinations: number
  status: 'Upcoming' | 'Planning' | 'Completed'
  accent: string
}

const MOCK_TRIPS: MockTrip[] = [
  {
    id: '1',
    name: 'Summer in Japan',
    startDate: 'Jul 10, 2026',
    endDate: 'Jul 24, 2026',
    destinations: 5,
    status: 'Upcoming',
    accent: 'from-sky-500/80 to-indigo-600/80',
  },
  {
    id: '2',
    name: 'Pacific Coast Road Trip',
    startDate: 'Sep 2, 2026',
    endDate: 'Sep 16, 2026',
    destinations: 8,
    status: 'Planning',
    accent: 'from-orange-400/80 to-rose-500/80',
  },
  {
    id: '3',
    name: 'Weekend in Lisbon',
    startDate: 'Mar 14, 2026',
    endDate: 'Mar 17, 2026',
    destinations: 3,
    status: 'Completed',
    accent: 'from-emerald-400/80 to-teal-600/80',
  },
  {
    id: '4',
    name: 'Northern Lights Escape',
    startDate: 'Jan 8, 2027',
    endDate: 'Jan 15, 2027',
    destinations: 4,
    status: 'Planning',
    accent: 'from-violet-500/80 to-fuchsia-600/80',
  },
]

function statusVariant(
  status: MockTrip['status'],
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'Upcoming':
      return 'default'
    case 'Planning':
      return 'secondary'
    case 'Completed':
      return 'outline'
  }
}

export function TripsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="flex flex-col gap-4 border-b px-4 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-start gap-3">
          <SidebarMenuTrigger className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Your trips</h1>
            <p className="text-sm text-muted-foreground">
              Plan itineraries, save destinations, and keep every detail in one
              place.
            </p>
          </div>
        </div>
        <Button className="shrink-0 sm:ml-0" disabled>
          <PlusIcon />
          New trip
        </Button>
      </div>

      <div className="flex-1 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_TRIPS.map((trip) => (
            <Card
              key={trip.id}
              size="sm"
              className="cursor-default transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-32 items-end bg-gradient-to-br p-4 ${trip.accent}`}
              >
                <Badge
                  variant={statusVariant(trip.status)}
                  className="bg-background/90 text-foreground"
                >
                  {trip.status}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{trip.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  {trip.startDate} – {trip.endDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5" />
                  {trip.destinations} destinations
                </p>
              </CardContent>
              <CardFooter className="border-t">
                <Button variant="outline" size="sm" className="w-full" disabled>
                  View trip
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
