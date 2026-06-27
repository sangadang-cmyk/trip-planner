import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { postAuthAdminLoginMutation } from '@/generated/api/@tanstack/react-query.gen'
import { isAuthenticated, setAccessToken } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    if (isAuthenticated()) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    ...postAuthAdminLoginMutation(),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      void navigate({ to: '/dashboard' })
    },
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    loginMutation.mutate({
      body: { email, password },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>Sign in to manage Trip Planner.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {loginMutation.isError ? (
              <p className="text-sm text-destructive">
                Invalid email or password. Please try again.
              </p>
            ) : null}
            <Button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
