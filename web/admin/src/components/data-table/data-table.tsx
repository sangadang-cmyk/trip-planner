import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId: (row: TData) => string
  isPending?: boolean
  isFetching?: boolean
  isError?: boolean
  errorMessage?: string
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  selectedRowId?: string | null
  skeletonRowCount?: number
  toolbar?: ReactNode
  footer?: ReactNode
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  isPending = false,
  isFetching = false,
  isError = false,
  errorMessage = 'Failed to load data.',
  emptyMessage = 'No results found.',
  onRowClick,
  selectedRowId,
  skeletonRowCount = 5,
  toolbar,
  footer,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  })

  const columnCount = columns.length
  const rows = table.getRowModel().rows

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {toolbar ? (
        <div className="flex items-center justify-end gap-2">{toolbar}</div>
      ) : null}
      <div className="@container overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              <DataTableSkeleton
                columnCount={columnCount}
                rowCount={skeletonRowCount}
              />
            ) : null}

            {!isPending && isError ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </TableCell>
              </TableRow>
            ) : null}

            {!isPending && !isError && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : null}

            {!isPending && !isError
              ? rows.map((row) => {
                  const rowId = getRowId(row.original)

                  return (
                    <TableRow
                      key={row.id}
                      data-state={
                        selectedRowId === rowId ? 'selected' : undefined
                      }
                      className={cn(
                        onRowClick && 'cursor-pointer',
                        selectedRowId === rowId && 'bg-muted/60',
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              : null}
          </TableBody>
        </Table>

        {isFetching && !isPending ? (
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            Refreshing…
          </div>
        ) : null}

        {footer}
      </div>
    </div>
  )
}
