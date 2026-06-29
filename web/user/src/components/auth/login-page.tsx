import { Link } from '@tanstack/react-router'
import { getRouteApi } from '@tanstack/react-router'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const loginRoute = getRouteApi('/login')

export function LoginPage() {
  const { email, verified } = loginRoute.useSearch()
  const successMessage = verified
    ? 'Your email is verified. Sign in to start planning your trip.'
    : null

  return (
    <AuthShell>
      <AuthCard>
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          <LoginForm initialEmail={email} successMessage={successMessage} />

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full"
            render={<Link to="/register" />}
          >
            Create new account
          </Button>
        </div>
      </AuthCard>
    </AuthShell>
  )
}
