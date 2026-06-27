import { createFileRoute } from '@tanstack/react-router'

import { AccountsTable } from '@/components/accounts/accounts-table'

export const Route = createFileRoute('/_authenticated/dashboard/accounts')({
  component: AccountsPage,
})

function AccountsPage() {
  return (
    <div className="flex flex-1 flex-col p-4 lg:p-6">
      <AccountsTable />
    </div>
  )
}
