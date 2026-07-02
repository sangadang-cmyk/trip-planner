import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { postAuthUserLoginMutation } from '@/generated/api/@tanstack/react-query.gen'
import { setAccessToken } from '@/lib/auth'

type LoginFormProps = {
  initialEmail?: string
  successMessage?: string | null
  onSuccess?: () => void
}

export function LoginForm({
  initialEmail = '',
  successMessage = null,
  onSuccess,
}: LoginFormProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [initialEmail])

  const loginMutation = useMutation({
    ...postAuthUserLoginMutation(),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      toast.success('Signed in successfully')
      if (onSuccess) {
        onSuccess()
        return
      }
      void navigate({ to: '/' })
    },
    onError: () => {
      toast.error('Invalid email or password. Please try again.')
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    loginMutation.mutate({
      body: { email, password },
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {successMessage}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
