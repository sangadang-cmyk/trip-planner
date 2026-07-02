import { SearchIcon } from 'lucide-react'

import { mapControlSurfaceClassName } from '@/components/map/map-control-styles'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type MapSearchBarProps = {
  className?: string
}

export function MapSearchBar({ className }: MapSearchBarProps) {
  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search places..."
        aria-label="Search places"
        className={cn(
          'h-10 bg-background pr-3 pl-9',
          mapControlSurfaceClassName,
        )}
      />
    </div>
  )
}
