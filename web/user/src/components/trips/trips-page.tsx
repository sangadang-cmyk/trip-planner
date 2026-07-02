import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CalendarIcon, ChevronRightIcon, MapPinIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { SidebarMenuTrigger } from '@/components/dashboard/sidebar-menu-trigger'
import { CreateTripDialog } from '@/components/trips/create-trip-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getUserTripsByTripIdDestinationsOptions,
  getUserTripsOptions,
} from '@/generated/api/@tanstack/react-query.gen'
import { useAuth } from '@/hooks/use-auth'
import {
  formatTripDateRange,
  getTripAccent,
  getTripStatus,
  tripStatusVariant,
} from '@/lib/trip'

function TripsPageSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} size="sm">
          <Skeleton className="h-32 w-full rounded-none" />
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TripsPage() {
  const { isAuthenticated } = useAuth()
  const [createTripOpen, setCreateTripOpen] = useState(false)

  const {
    data: trips,
    isPending,
    isError,
  } = useQuery({
    ...getUserTripsOptions(),
    enabled: isAuthenticated,
  })

  const destinationQueries = useQueries({
    queries: (trips ?? []).map((trip) => ({
      ...getUserTripsByTripIdDestinationsOptions({
        path: { tripId: trip.id },
      }),
      enabled: isAuthenticated && Boolean(trips?.length),
    })),
  })

  const destinationCountByTripId = new Map(
    (trips ?? []).map((trip, index) => [
      trip.id,
      destinationQueries[index]?.data?.length ?? 0,
    ]),
  )

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
        <Button
          className="shrink-0 sm:ml-0"
          disabled={!isAuthenticated}
          onClick={() => setCreateTripOpen(true)}
        >
          <PlusIcon />
          New trip
        </Button>
      </div>

      <div className="flex-1 p-4 lg:p-6">
        {!isAuthenticated ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-6">
            <p className="text-sm text-muted-foreground">
              Sign in to view and manage your trips.
            </p>
            <div className="flex gap-2">
              <Button render={<Link to="/login" />}>Sign in</Button>
              <Button variant="outline" render={<Link to="/register" />}>
                Register
              </Button>
            </div>
          </div>
        ) : null}

        {isAuthenticated && isPending ? <TripsPageSkeleton /> : null}

        {isAuthenticated && isError ? (
          <p className="text-sm text-destructive">Failed to load your trips.</p>
        ) : null}

        {isAuthenticated && !isPending && !isError && trips?.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-6">
            <p className="text-sm text-muted-foreground">
              You do not have any trips yet. Create your first trip to get
              started.
            </p>
            <Button onClick={() => setCreateTripOpen(true)}>
              <PlusIcon />
              New trip
            </Button>
          </div>
        ) : null}

        {isAuthenticated && !isPending && trips && trips.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip, index) => {
              const status = getTripStatus(trip.startDate, trip.endDate)
              const destinationCount = destinationCountByTripId.get(trip.id) ?? 0

              return (
                <Link
                  key={trip.id}
                  to="/trips/$tripId"
                  params={{ tripId: trip.id }}
                  className="group block"
                >
                  <Card
                    size="sm"
                    className="cursor-pointer transition-shadow hover:shadow-md"
                  >
                    <div className="relative flex h-32 items-end p-4">
                      {trip.thumbnail ? (
                        <>
                          <img
                            src={trip.thumbnail}
                            alt=""
                            className="absolute inset-0 size-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/5" />
                        </>
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${getTripAccent(trip, index)}`}
                        />
                      )}
                      <Badge
                        variant={tripStatusVariant(status)}
                        className="relative bg-background/90 text-foreground"
                      >
                        {status}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle>{trip.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <CalendarIcon className="size-3.5" />
                        {formatTripDateRange(trip.startDate, trip.endDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pt-0">
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPinIcon className="size-3.5" />
                        {destinationCount}{' '}
                        {destinationCount === 1 ? 'destination' : 'destinations'}
                      </p>
                      <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>

      <CreateTripDialog open={createTripOpen} onOpenChange={setCreateTripOpen} />
    </div>
  )
}
