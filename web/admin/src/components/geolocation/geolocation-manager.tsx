import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronLeftIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  DataTable,
  DataTablePagination,
  DataTableSection,
} from '@/components/data-table'
import { CreateCityDialog } from '@/components/geolocation/create-city-dialog'
import { CreateCountryDialog } from '@/components/geolocation/create-country-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getAdminCitiesOptions,
  getAdminCountriesOptions,
} from '@/generated/api/@tanstack/react-query.gen'
import type { CityResponse, CountryResponse } from '@/generated/api/types.gen'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

function AliasesCell({ aliases }: { aliases: string[] }) {
  if (aliases.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  if (aliases.length <= 2) {
    return <span>{aliases.join(', ')}</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {aliases.slice(0, 2).map((alias) => (
        <Badge key={alias} variant="secondary">
          {alias}
        </Badge>
      ))}
      <Badge variant="outline">+{aliases.length - 2} more</Badge>
    </div>
  )
}

function CountriesTable({
  selectedCountryId,
  onSelectCountry,
}: {
  selectedCountryId: string | null
  onSelectCountry: (country: CountryResponse) => void
}) {
  const [page, setPage] = useState(0)

  const { data, isPending, isFetching, isError, error } = useQuery({
    ...getAdminCountriesOptions({
      query: {
        page,
        size: PAGE_SIZE,
      },
    }),
  })

  const countries = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const columns = useMemo<ColumnDef<CountryResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => row.original.code ?? '—',
      },
      {
        accessorKey: 'aliases',
        header: 'Aliases',
        cell: ({ row }) => <AliasesCell aliases={row.original.aliases} />,
      },
    ],
    [],
  )

  return (
    <DataTableSection
      title="Countries"
      description="Select a country to view its cities."
      actions={<CreateCountryDialog />}
    >
      <DataTable
        columns={columns}
        data={countries}
        getRowId={(row) => row.id}
        isPending={isPending}
        isFetching={isFetching}
        isError={isError}
        errorMessage={
          error instanceof Error ? error.message : 'Failed to load countries.'
        }
        emptyMessage="No countries found."
        selectedRowId={selectedCountryId}
        onRowClick={onSelectCountry}
        skeletonRowCount={8}
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
          />
        }
      />
    </DataTableSection>
  )
}

function CitiesTable({
  country,
  onClearSelection,
}: {
  country: CountryResponse
  onClearSelection: () => void
}) {
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [country.id])

  const { data, isPending, isFetching, isError, error } = useQuery({
    ...getAdminCitiesOptions({
      query: {
        page,
        size: PAGE_SIZE,
        countryId: country.id,
      },
    }),
  })

  const cities = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const columns = useMemo<ColumnDef<CityResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'aliases',
        header: 'Aliases',
        cell: ({ row }) => <AliasesCell aliases={row.original.aliases} />,
      },
    ],
    [],
  )

  return (
    <DataTableSection
      title={`Cities in ${country.name}`}
      description={
        country.code
          ? `Country code: ${country.code}`
          : 'Viewing all cities for this country.'
      }
      leading={
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-0.5 shrink-0"
          onClick={onClearSelection}
          aria-label="Back to countries"
        >
          <ChevronLeftIcon />
        </Button>
      }
      actions={
        <CreateCityDialog countryId={country.id} countryName={country.name} />
      }
    >
      <DataTable
        columns={columns}
        data={cities}
        getRowId={(row) => row.id}
        isPending={isPending}
        isFetching={isFetching}
        isError={isError}
        errorMessage={
          error instanceof Error ? error.message : 'Failed to load cities.'
        }
        emptyMessage="No cities found for this country."
        skeletonRowCount={8}
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
          />
        }
      />
    </DataTableSection>
  )
}

export function GeolocationManager() {
  const [selectedCountry, setSelectedCountry] = useState<CountryResponse | null>(
    null,
  )

  return (
    <div
      className={cn(
        'grid min-h-0 flex-1',
        selectedCountry
          ? 'grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch'
          : 'grid-cols-1',
      )}
    >
      <div className="min-w-0">
        <CountriesTable
          selectedCountryId={selectedCountry?.id ?? null}
          onSelectCountry={setSelectedCountry}
        />
      </div>
      {selectedCountry ? (
        <div className="min-w-0 rounded-xl border border-border bg-muted/30 p-4 lg:p-6 lg:shadow-sm">
          <CitiesTable
            country={selectedCountry}
            onClearSelection={() => setSelectedCountry(null)}
          />
        </div>
      ) : null}
    </div>
  )
}
