import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import GoogleButton from './GoogleButton'

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/dashboard'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isRegister = mode === 'register'

  const finish = () => navigate(from, { replace: true })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) ?? '')
    setBusy(true)
    setError('')
    try {
      if (isRegister) {
        await register({ name: get('name'), username: get('username'), email: get('email'), password: get('password') })
      } else {
        await login(get('email'), get('password'))
      }
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-2 focus:outline-indigo-200'
  const label = 'mb-1 block text-sm font-medium text-slate-700'
  return (
    <div className="animate-fade-up mx-auto mt-4 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 sm:mt-12 md:grid md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-slate-300 md:flex md:flex-col md:justify-between">
        <div aria-hidden className="animate-float absolute -right-16 -top-16 size-64 rounded-full bg-indigo-500/30 blur-3xl" />
        <div aria-hidden className="animate-float absolute -bottom-20 -left-10 size-64 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2 text-lg font-bold text-white">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-sm">{'</>'}</span>
          CodeArena
        </div>
        <div className="relative">
          <p className="text-3xl font-semibold leading-tight text-white">Practice. Submit. <span className="text-shine">Level up.</span></p>
          <ul className="mt-6 space-y-3 text-sm">
            <li>✓ 100+ coding problems across every difficulty</li>
            <li>✓ Run code in JavaScript, Python, Java, C and C++</li>
            <li>✓ Track progress and climb the leaderboard</li>
          </ul>
        </div>
      </aside>
      <form onSubmit={onSubmit} aria-busy={busy} className="space-y-4 p-6 sm:p-10">
        <header>
          <h1 className="text-2xl font-semibold">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister ? 'Start solving problems on CodeArena.' : 'Sign in to continue to CodeArena.'}
          </p>
        </header>
        {isRegister && (
          <>
            <div>
              <label htmlFor="name" className={label}>Name</label>
              <input id="name" name="name" autoComplete="name" required className={field} />
            </div>
            <div>
              <label htmlFor="username" className={label}>Username</label>
              <input id="username" name="username" autoComplete="username" required className={field} />
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required autoFocus className={field} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className={label}>Password</label>
            {!isRegister && (
              <Link to="/forgot-password" className="mb-1 text-xs font-medium text-indigo-600 hover:underline">Forgot password?</Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={8}
              aria-describedby={isRegister ? 'password-hint' : undefined}
              className={`${field} pr-16`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-400"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {isRegister && <p id="password-hint" className="mt-1 text-xs text-slate-500">At least 8 characters.</p>}
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (isRegister ? 'Creating account…' : 'Signing in…') : isRegister ? 'Create account' : 'Sign in'}
        </button>
        <GoogleButton onDone={finish} onError={setError} />
        <p className="text-center text-sm text-slate-500">
          {isRegister ? (
            <>Have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link></>
          ) : (
            <>New here? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Create an account</Link></>
          )}
        </p>
      </form>
    </div>
  )
}
