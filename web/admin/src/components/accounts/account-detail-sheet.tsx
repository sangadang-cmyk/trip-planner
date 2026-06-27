import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getAdminAccountsByIdOptions } from '@/generated/api/@tanstack/react-query.gen'
import type { AccountResponse } from '@/generated/api/types.gen'

type AccountDetailSheetProps = {
  accountId: string | null
  onOpenChange: (open: boolean) => void
}

function formatDate(value?: string) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

function AccountDetailContent({ account }: { account: AccountResponse }) {
  return (
    <dl className="grid gap-4 px-4 pb-4">
      <DetailField label="ID" value={account.id ?? '—'} />
      <DetailField label="Name" value={account.name ?? '—'} />
      <DetailField label="Email" value={account.email ?? '—'} />
      <DetailField
        label="Role"
        value={
          account.role ? (
            <Badge variant={account.role === 'ADMIN' ? 'default' : 'secondary'}>
              {account.role}
            </Badge>
          ) : (
            '—'
          )
        }
      />
      <DetailField label="Created" value={formatDate(account.createdAt)} />
    </dl>
  )
}

function AccountDetailSkeleton() {
  return (
    <div className="grid gap-4 px-4 pb-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      ))}
    </div>
  )
}

export function AccountDetailSheet({
  accountId,
  onOpenChange,
}: AccountDetailSheetProps) {
  const { data, isPending, isError } = useQuery({
    ...getAdminAccountsByIdOptions({
      path: { id: accountId ?? '' },
    }),
    enabled: accountId !== null,
  })

  return (
    <Sheet open={accountId !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Account details</SheetTitle>
          <SheetDescription>
            Full account information loaded from the admin API.
          </SheetDescription>
        </SheetHeader>
        {isPending ? <AccountDetailSkeleton /> : null}
        {isError ? (
          <p className="px-4 pb-4 text-sm text-destructive">
            Failed to load account details.
          </p>
        ) : null}
        {!isPending && !isError && data ? (
          <AccountDetailContent account={data} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

export { formatDate }
