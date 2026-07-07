import { useMutation } from '@tanstack/react-query'
import { ArrowLeftIcon, MailCheckIcon } from 'lucide-react'
import { useState } from 'react'

import type { PendingVerification } from '@/components/auth/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  postAuthResendVerificationMutation,
  postAuthVerifyEmailMutation,
} from '@/generated/api/@tanstack/react-query.gen'

type VerifyEmailFormProps = {
  pending: PendingVerification
  onBack: () => void
  onVerified: (email: string) => void
}

export function VerifyEmailForm({
  pending,
  onBack,
  onVerified,
}: VerifyEmailFormProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const verifyMutation = useMutation({
    ...postAuthVerifyEmailMutation(),
    onSuccess: () => {
      onVerified(pending.email)
    },
  })

  const resendMutation = useMutation({
    ...postAuthResendVerificationMutation(),
    onSuccess: (data) => {
      setResendMessage(data.message ?? 'Verification email sent.')
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResendMessage(null)

    verifyMutation.mutate({
      body: {
        email: pending.email,
        challenge: pending.challenge,
        verificationCode: verificationCode.trim().toUpperCase(),
      },
    })
  }

  function handleResend() {
    setResendMessage(null)

    resendMutation.mutate({
      body: {
        email: pending.email,
        challenge: pending.challenge,
      },
    })
  }

  const verifyError = verifyMutation.isError
    ? 'Invalid or expired verification code. Please try again.'
    : null

  const resendError = resendMutation.isError
    ? 'Unable to resend right now. Please wait a moment and try again.'
    : null

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </button>

      <div className="space-y-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheckIcon className="size-5" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a 5-character verification code to{' '}
          <span className="font-medium text-foreground">{pending.email}</span>.
          Enter it below to activate your account.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="verification-code">Verification code</Label>
          <Input
            id="verification-code"
            inputMode="text"
            autoComplete="one-time-code"
            required
            minLength={5}
            maxLength={5}
            value={verificationCode}
            onChange={(event) =>
              setVerificationCode(event.target.value.toUpperCase().slice(0, 5))
            }
            placeholder="ABCDE"
            className="text-center font-mono text-lg tracking-[0.35em] uppercase"
          />
        </div>
        {verifyError ? <p className="text-sm text-destructive">{verifyError}</p> : null}
        {resendMessage ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{resendMessage}</p>
        ) : null}
        {resendError ? <p className="text-sm text-destructive">{resendError}</p> : null}
        <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
          {verifyMutation.isPending ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>

      <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>Did not receive the code?</p>
        <Button
          type="button"
          variant="link"
          className="h-auto px-0"
          disabled={resendMutation.isPending}
          onClick={handleResend}
        >
          {resendMutation.isPending ? 'Sending…' : 'Resend verification email'}
        </Button>
      </div>
    </div>
  )
}
