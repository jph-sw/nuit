import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import * as React from 'react'
import { signInFn, signUpFn } from '../lib/auth'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<'sign-in' | 'sign-up'>('sign-in')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const signIn = useServerFn(signInFn)
  const signUp = useServerFn(signUpFn)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)
    const username = form.get('username') as string
    const password = form.get('password') as string

    try {
      const result =
        mode === 'sign-in'
          ? await signIn({ data: { username, password } })
          : await signUp({ data: { username, password } })

      if (result?.error) {
        setError(result.error)
      } else {
        await router.invalidate()
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="page-wrap flex min-h-[80vh] items-center justify-center px-4">
      <div className="shadow-xl bg-secondary border w-full max-w-sm rounded-2xl px-8 py-10">
        <p className="island-kicker mb-3">
          {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
        </p>
        <h1 className="display-title mb-8 text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
          {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
            Username
            <Input
              name="username"
              type="text"
              required
              autoComplete="username"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
            Password
            <Input
              name="password"
              type="password"
              required
              autoComplete={
                mode === 'sign-in' ? 'current-password' : 'new-password'
              }
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
          >
            {pending ? '…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          {mode === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Button
            type="button"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
              setError(null)
            }}
          >
            {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
          </Button>
        </p>
      </div>
    </main>
  )
}
