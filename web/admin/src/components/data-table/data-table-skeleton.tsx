import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

type DataTableSkeletonProps = {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
}: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }).map((__, columnIndex) => (
            <TableCell key={columnIndex}>
              <Skeleton className="h-4 w-full max-w-48" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
