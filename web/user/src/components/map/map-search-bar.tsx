import { useQuery } from '@tanstack/react-query'
import { Building2Icon, GlobeIcon, Loader2Icon, SearchIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { mapControlSurfaceClassName } from '@/components/map/map-control-styles'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getGeolocationSearchOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { GeolocationSearchResult } from '@/generated/api/types.gen'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'

const SEARCH_DEBOUNCE_MS = 1000

type MapSearchBarProps = {
  className?: string
  onSelectResult?: (result: GeolocationSearchResult) => void
  isSelecting?: boolean
}

function getResultKey(result: GeolocationSearchResult, index: number) {
  return `${result.addressType}-${result.osmId}-${index}`
}

function formatAddressType(addressType: GeolocationSearchResult['addressType']) {
  return addressType === 'country' ? 'Country' : 'City'
}

export function MapSearchBar({
  className,
  onSelectResult,
  isSelecting = false,
}: MapSearchBarProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const trimmedQuery = query.trim()
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS)
  const isDebouncing = trimmedQuery !== debouncedQuery && trimmedQuery.length > 0

  const { data: results = [], isFetching, isError } = useQuery({
    ...getGeolocationSearchOptions({
      query: { q: debouncedQuery },
    }),
    enabled: debouncedQuery.length > 0,
  })

  const showPanel = isOpen && trimmedQuery.length > 0
  const showLoading = isDebouncing || isFetching
  const showEmptyState =
    showPanel && !showLoading && !isError && debouncedQuery.length > 0 && results.length === 0

  useEffect(() => {
    if (!showPanel) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [showPanel])

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative min-w-0 flex-1', className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listboxId : undefined}
        placeholder="Search places..."
        aria-label="Search places"
        value={query}
        autoComplete="off"
        className={cn(
          'h-10 bg-background pr-3 pl-9',
          mapControlSurfaceClassName,
        )}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => {
          if (trimmedQuery.length > 0) {
            setIsOpen(true)
          }
        }}
        onKeyDown={handleInputKeyDown}
      />

      {showPanel ? (
        <div
          className={cn(
            'absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 overflow-hidden rounded-md bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10',
            mapControlSurfaceClassName,
          )}
        >
          {showLoading ? (
            <div className="flex flex-col gap-2 p-2" aria-live="polite">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                <Loader2Icon className="size-3.5 animate-spin" />
                Searching…
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full rounded-sm" />
              ))}
            </div>
          ) : null}

          {isError ? (
            <p className="px-3 py-4 text-sm text-destructive">
              Search failed. Please try again.
            </p>
          ) : null}

          {showEmptyState ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No countries or cities found for &ldquo;{debouncedQuery}&rdquo;
            </p>
          ) : null}

          {!showLoading && !isError && results.length > 0 ? (
            <ul
              id={listboxId}
              aria-label="Search results"
              className="max-h-72 overflow-y-auto py-1"
            >
              {results.map((result, index) => (
                <li key={getResultKey(result, index)}>
                  <button
                    type="button"
                    disabled={isSelecting}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/80 disabled:cursor-wait disabled:opacity-70"
                    onClick={() => {
                      onSelectResult?.(result)
                      setQuery(result.name)
                      setIsOpen(false)
                    }}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {result.addressType === 'country' ? (
                        <GlobeIcon className="size-4" />
                      ) : (
                        <Building2Icon className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {result.name}
                      </span>
                    </span>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {formatAddressType(result.addressType)}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
