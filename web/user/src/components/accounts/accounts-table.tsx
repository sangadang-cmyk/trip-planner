import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  AccountDetailSheet,
  formatDate,
} from '@/components/accounts/account-detail-sheet'
import {
  DataTable,
  DataTablePagination,
  DataTableSection,
} from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { getAdminAccountsOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { AccountResponse } from '@/generated/api/types.gen'

const PAGE_SIZE = 20

function AccountRoleBadge({ role }: { role?: AccountResponse['role'] }) {
  if (!role) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>{role}</Badge>
  )
}

export function AccountsTable() {
  const [page, setPage] = useState(0)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const { data, isPending, isFetching, isError, error } = useQuery({
    ...getAdminAccountsOptions({
      query: {
        page,
        size: PAGE_SIZE,
      },
    }),
  })

  const accounts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const columns = useMemo<ColumnDef<AccountResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email ?? '—',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => <AccountRoleBadge role={row.original.role} />,
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
        title="Accounts"
        description="Browse and inspect registered user accounts."
      >
        <DataTable
          columns={columns}
          data={accounts}
          getRowId={(row) => row.id ?? row.email ?? ''}
          isPending={isPending}
          isFetching={isFetching}
          isError={isError}
          errorMessage={
            error instanceof Error ? error.message : 'Failed to load accounts.'
          }
          emptyMessage="No accounts found."
          onRowClick={(account) => {
            if (account.id) {
              setSelectedAccountId(account.id)
            }
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
              emptyLabel="No accounts to display"
            />
          }
        />
      </DataTableSection>

      <AccountDetailSheet
        accountId={selectedAccountId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAccountId(null)
          }
        }}
      />
    </>
  )
}
