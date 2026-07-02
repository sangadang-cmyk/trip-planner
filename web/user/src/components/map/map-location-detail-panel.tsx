import { MapPinIcon, StarIcon, XIcon } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { mapControlSurfaceClassName } from '@/components/map/map-control-styles'
import { AddLocationToTripDialog } from '@/components/map/add-location-to-trip-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserLocationsDetailsByIdOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { LocationDetailsResponse, LocationResponse } from '@/generated/api/types.gen'
import { cn } from '@/lib/utils'

type MapLocationDetailPanelProps = {
  location: LocationResponse
  open: boolean
  onClose: () => void
  onClosed: () => void
  className?: string
  slideFrom?: 'left' | 'right'
  layout?: 'floating' | 'embedded'
  showAddToTrip?: boolean
}

function formatKindLabel(kind: string) {
  return kind
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getHeroImageUrl(details: LocationDetailsResponse | undefined) {
  if (!details) {
    return null
  }

  return details.images[0] ?? details.previewImages[0] ?? null
}

const DESCRIPTION_TRUNCATE_LENGTH = 180

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const shouldTruncate = text.length > DESCRIPTION_TRUNCATE_LENGTH

  return (
    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
      {expanded || !shouldTruncate ? (
        <>
          {text}
          {shouldTruncate ? (
            <>
              {' '}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="font-medium text-primary hover:underline"
                aria-expanded
              >
                Show less
              </button>
            </>
          ) : null}
        </>
      ) : (
        <>
          {text.slice(0, DESCRIPTION_TRUNCATE_LENGTH).trimEnd()}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="font-medium text-primary hover:underline"
            aria-expanded={false}
            aria-label="Show full description"
          >
            …
          </button>
        </>
      )}
    </p>
  )
}

function TruncatedKindTags({ kinds }: { kinds: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overflowMeasureRef = useRef<HTMLSpanElement>(null)
  const [visibleCount, setVisibleCount] = useState(kinds.length)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const updateVisibleCount = () => {
      const badges = Array.from(
        container.querySelectorAll<HTMLElement>('[data-kind-badge]'),
      )

      if (badges.length === 0) {
        setVisibleCount(kinds.length)
        return
      }

      const containerWidth = container.clientWidth
      const gap = 6
      const overflowBadgeWidth = overflowMeasureRef.current?.offsetWidth ?? 36
      let usedWidth = 0
      let count = 0

      for (let index = 0; index < badges.length; index += 1) {
        const badgeWidth = badges[index].offsetWidth
        const remaining = kinds.length - (index + 1)
        const reserve = remaining > 0 ? overflowBadgeWidth + gap : 0
        const nextWidth = usedWidth + (index > 0 ? gap : 0) + badgeWidth + reserve

        if (nextWidth > containerWidth) {
          break
        }

        usedWidth += (index > 0 ? gap : 0) + badgeWidth
        count = index + 1
      }

      setVisibleCount(count)
    }

    updateVisibleCount()

    const observer = new ResizeObserver(updateVisibleCount)
    observer.observe(container)

    return () => observer.disconnect()
  }, [kinds])

  const hiddenCount = Math.max(kinds.length - visibleCount, 0)

  return (
    <div
      ref={containerRef}
      className="flex flex-nowrap items-center gap-1.5 overflow-hidden"
    >
      {kinds.map((kind, index) => (
        <Badge
          key={kind}
          data-kind-badge
          variant="outline"
          className={cn(
            'shrink-0 text-xs',
            index >= visibleCount && 'pointer-events-none invisible absolute',
          )}
        >
          {formatKindLabel(kind)}
        </Badge>
      ))}
      <span
        ref={overflowMeasureRef}
        className="pointer-events-none invisible absolute inline-flex h-5 shrink-0 items-center rounded-4xl border border-border px-2 text-xs font-medium whitespace-nowrap"
        aria-hidden
      >
        +{kinds.length}
      </span>
      {hiddenCount > 0 ? (
        <Badge variant="outline" className="shrink-0 text-xs">
          +{hiddenCount}
        </Badge>
      ) : null}
    </div>
  )
}

function LocationDetailsSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-3/4" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

export function MapLocationDetailPanel({
  location,
  open,
  onClose,
  onClosed,
  className,
  slideFrom = 'left',
  layout = 'floating',
  showAddToTrip = true,
}: MapLocationDetailPanelProps) {
  const [visible, setVisible] = useState(false)
  const [addToTripOpen, setAddToTripOpen] = useState(false)

  const {
    data: details,
    isPending,
    isError,
  } = useQuery({
    ...getUserLocationsDetailsByIdOptions({
      path: { id: location.id },
    }),
    enabled: open && Boolean(location.id),
  })

  const heroImageUrl = getHeroImageUrl(details)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }

    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [open])

  function handleTransitionEnd(event: React.TransitionEvent<HTMLElement>) {
    if (event.propertyName !== 'transform') {
      return
    }

    if (!visible) {
      onClosed()
    }
  }

  const showDetailsContent = Boolean(location.id) && !isPending
  const popularity = details?.popularity ?? location.popularity
  const sourceLabel = details?.source ?? location.source

  const slideHiddenClassName =
    slideFrom === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'

  return (
    <aside
      aria-hidden={!open && !visible}
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        'pointer-events-auto flex flex-col overflow-hidden',
        layout === 'floating'
          ? cn(
              'w-[min(100vw-2rem,26rem)] rounded-xl',
              mapControlSurfaceClassName,
            )
          : 'size-full bg-background',
        'transition-[transform,opacity] duration-300 ease-out will-change-transform',
        visible ? 'translate-x-0 opacity-100' : slideHiddenClassName,
        className,
      )}
    >
      <div
        className={cn(
          'relative shrink-0 bg-muted',
          layout === 'embedded' ? 'h-56' : 'h-44',
        )}
      >
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={location.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <MapPinIcon className="size-8 text-primary/60" />
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label="Close location details"
          className="absolute top-2 right-2 bg-background/90 shadow-sm backdrop-blur-sm"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </div>

      {!location.id ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{location.source}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                {location.popularity}
              </span>
            </div>
            <h2 className="text-lg font-semibold leading-tight">{location.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Detailed information is not available for this location yet.
          </p>
        </div>
      ) : isPending ? (
        <LocationDetailsSkeleton />
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{sourceLabel}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                  {popularity}
                </span>
              </div>
              <h2 className="text-lg font-semibold leading-tight">{location.name}</h2>
              {details && details.kinds.length > 0 ? (
                <TruncatedKindTags kinds={details.kinds} />
              ) : null}
            </div>

            {isError ? (
              <p className="text-sm text-destructive">
                Failed to load additional location details.
              </p>
            ) : null}

            {showDetailsContent && details?.description ? (
              <ExpandableDescription
                key={location.id}
                text={details.description}
              />
            ) : null}
          </div>

          {showAddToTrip ? (
            <div className="shrink-0 border-t p-4">
              <Button className="w-full" onClick={() => setAddToTripOpen(true)}>
                Add to trip
              </Button>
              <AddLocationToTripDialog
                location={location}
                open={addToTripOpen}
                onOpenChange={setAddToTripOpen}
              />
            </div>
          ) : null}
        </>
      )}
    </aside>
  )
}
