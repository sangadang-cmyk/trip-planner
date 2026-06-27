import type { ReactNode } from 'react'

type DataTableSectionProps = {
  title: string
  description?: string
  leading?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function DataTableSection({
  title,
  description,
  leading,
  actions,
  children,
}: DataTableSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {leading}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}
