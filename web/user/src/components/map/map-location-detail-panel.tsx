import { MapPinIcon, StarIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { mapControlSurfaceClassName } from '@/components/map/map-control-styles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import type { MockLocation } from '@/mocks/types'
import { cn } from '@/lib/utils'

type MapLocationDetailPanelProps = {
  location: MockLocation
  open: boolean
  onClose: () => void
  onClosed: () => void
  className?: string
}

type DetailRow = {
  label: string
  value: string
}

export function MapLocationDetailPanel({
  location,
  open,
  onClose,
  onClosed,
  className,
}: MapLocationDetailPanelProps) {
  const [visible, setVisible] = useState(false)
  const imageUrl = location.images[0]

  const detailRows = useMemo<DetailRow[]>(
    () => [
      {
        label: 'Address',
        value: `${location.address}, ${location.cityDisplayName}, ${location.countryDisplayName}`,
      },
      { label: 'Phone', value: location.phone },
      { label: 'Email', value: location.email },
      { label: 'Website', value: location.website },
      { label: 'Hours', value: location.hours },
      { label: 'Category', value: location.category },
    ],
    [location],
  )

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

  return (
    <aside
      aria-hidden={!open && !visible}
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        'pointer-events-auto flex w-[min(100vw-2rem,26rem)] flex-col overflow-hidden rounded-xl',
        mapControlSurfaceClassName,
        'transition-[transform,opacity] duration-300 ease-out will-change-transform',
        visible
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0',
        className,
      )}
    >
      <div className="relative h-44 shrink-0 bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" />
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{location.category}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <StarIcon className="size-3 fill-amber-400 text-amber-400" />
              4.6 (mock)
            </span>
          </div>
          <h2 className="text-lg font-semibold leading-tight">{location.name}</h2>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">
          {location.description}
        </p>

        <Table>
          <TableBody>
            {detailRows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="w-24 align-top font-medium whitespace-normal text-muted-foreground">
                  {row.label}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {row.label === 'Website' ? (
                    <span className="text-primary">{row.value}</span>
                  ) : (
                    row.value
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-auto border-t pt-3">
          <Button className="w-full" disabled>
            Add to trip
          </Button>
        </div>
      </div>
    </aside>
  )
}
