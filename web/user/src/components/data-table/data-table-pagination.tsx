import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DataTablePaginationState = {
  pageIndex: number
  pageSize: number
  totalPages: number
  totalElements: number
  isPending?: boolean
  isFetching?: boolean
}

type DataTablePaginationProps = {
  pagination: DataTablePaginationState
  onPageChange: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  emptyLabel?: string
}

export function DataTablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  emptyLabel = 'No results to display',
}: DataTablePaginationProps) {
  const {
    pageIndex,
    pageSize,
    totalPages,
    totalElements,
    isPending = false,
    isFetching = false,
  } = pagination

  const pageStart = totalElements === 0 ? 0 : pageIndex * pageSize + 1
  const pageEnd = Math.min((pageIndex + 1) * pageSize, totalElements)
  const isDisabled = isPending || isFetching

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 @md:flex-row @md:items-center @md:justify-between">
      <p className="shrink-0 text-sm whitespace-nowrap text-muted-foreground">
        {totalElements === 0
          ? emptyLabel
          : `Showing ${pageStart}–${pageEnd} of ${totalElements}`}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-2 @md:justify-end @md:gap-4">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => onPageSizeChange(Number(value))}
              items={pageSizeOptions.map((size) => ({
                label: `${size}`,
                value: `${size}`,
              }))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          Page {totalPages === 0 ? 0 : pageIndex + 1} of {totalPages}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden @lg:inline-flex"
            disabled={pageIndex === 0 || isDisabled}
            onClick={() => onPageChange(0)}
          >
            <ChevronsLeftIcon />
            <span className="sr-only">Go to first page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={pageIndex === 0 || isDisabled}
            onClick={() => onPageChange(Math.max(pageIndex - 1, 0))}
          >
            <ChevronLeftIcon />
            <span className="sr-only">Go to previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={
              isDisabled || totalPages === 0 || pageIndex >= totalPages - 1
            }
            onClick={() =>
              onPageChange(
                totalPages === 0
                  ? pageIndex
                  : Math.min(pageIndex + 1, totalPages - 1),
              )
            }
          >
            <ChevronRightIcon />
            <span className="sr-only">Go to next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden @lg:inline-flex"
            disabled={
              isDisabled || totalPages === 0 || pageIndex >= totalPages - 1
            }
            onClick={() => onPageChange(Math.max(totalPages - 1, 0))}
          >
            <ChevronsRightIcon />
            <span className="sr-only">Go to last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
