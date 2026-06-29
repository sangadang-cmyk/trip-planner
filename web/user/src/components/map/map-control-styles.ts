import { cn } from '@/lib/utils'

export const mapControlSurfaceClassName = cn(
  'bg-background shadow-lg ring-2 ring-primary/30',
)

export const mapControlButtonClassName = cn(
  'size-10 shrink-0',
  mapControlSurfaceClassName,
  'hover:bg-muted',
)
