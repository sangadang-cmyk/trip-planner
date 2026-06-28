import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  DataTable,
  DataTablePagination,
  DataTableSection,
} from '@/components/data-table'
import { formatDate } from '@/components/accounts/account-detail-sheet'
import { CreateLocationDialog } from '@/components/locations/create-location-dialog'
import {
  LocationDetailSheet,
  LocationSourceBadge,
} from '@/components/locations/location-detail-sheet'
import { getAdminLocationsOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { LocationResponse } from '@/generated/api/types.gen'

const PAGE_SIZE = 20

export function LocationsTable() {
  const [page, setPage] = useState(0)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  )

  const { data, isPending, isFetching, isError, error } = useQuery({
    ...getAdminLocationsOptions({
      query: {
        page,
        size: PAGE_SIZE,
      },
    }),
  })

  const locations = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const columns = useMemo<ColumnDef<LocationResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => (
          <LocationSourceBadge source={row.original.source} />
        ),
      },
      {
        accessorKey: 'cityDisplayName',
        header: 'City',
        cell: ({ row }) => row.original.cityDisplayName ?? '—',
      },
      {
        accessorKey: 'countryDisplayName',
        header: 'Country',
        cell: ({ row }) => row.original.countryDisplayName ?? '—',
      },
      {
        accessorKey: 'images',
        header: 'Images',
        cell: ({ row }) =>
          row.original.images.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            row.original.images.length
          ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [],
  )

  return (
    <>
      <DataTableSection
        title="Locations"
        description="Browse and inspect locations in the catalog."
        actions={<CreateLocationDialog />}
      >
        <DataTable
          columns={columns}
          data={locations}
          getRowId={(row) => row.id}
          isPending={isPending}
          isFetching={isFetching}
          isError={isError}
          errorMessage={
            error instanceof Error ? error.message : 'Failed to load locations.'
          }
          emptyMessage="No locations found."
          onRowClick={(location) => {
            setSelectedLocationId(location.id)
          }}
          footer={
            <DataTablePagination
              pagination={{
                pageIndex: page,
                pageSize: PAGE_SIZE,
                totalPages,
                totalElements,
                isPending,
                isFetching,
              }}
              onPageChange={setPage}
              emptyLabel="No locations to display"
            />
          }
        />
      </DataTableSection>

      <LocationDetailSheet
        locationId={selectedLocationId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLocationId(null)
          }
        }}
      />
    </>
  )
}
