import { SearchIcon } from 'lucide-react'

import { mapControlSurfaceClassName } from '@/components/map/map-control-styles'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function MapSearchBar() {
  return (
    <div className="relative min-w-0 flex-1">
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
