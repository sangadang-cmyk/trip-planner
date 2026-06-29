import type { ReactNode } from 'react'

type AuthCardProps = {
  children: ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      {children}
    </div>
  )
}
