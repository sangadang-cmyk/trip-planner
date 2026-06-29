import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthShell } from '@/components/auth/auth-shell'
import { RegisterForm } from '@/components/auth/register-form'
import type { PendingVerification } from '@/components/auth/types'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function RegisterPage() {
  const navigate = useNavigate()
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null)

  function handleRegistered(pending: PendingVerification) {
    setPendingVerification(pending)
  }

  function handleVerified(email: string) {
    void navigate({
      to: '/login',
      search: { email, verified: true },
    })
  }

  return (
    <AuthShell>
      <AuthCard>
        {pendingVerification ? (
          <VerifyEmailForm
            pending={pendingVerification}
            onBack={() => setPendingVerification(null)}
            onVerified={handleVerified}
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign up to start planning your trips.
              </p>
            </div>

            <RegisterForm onRegistered={handleRegistered} />

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              render={<Link to="/login" />}
            >
              Sign in instead
            </Button>
          </div>
        )}
      </AuthCard>
    </AuthShell>
  )
}
