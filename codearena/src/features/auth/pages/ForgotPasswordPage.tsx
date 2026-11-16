import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/api'

const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-2 focus:outline-indigo-200'
const label = 'mb-1 block text-sm font-medium text-slate-700'
const button = 'w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = (action: () => Promise<void>) => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setError('')
    try {
      await action.call(f)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const sendCode = submit(async function (this: FormData) {
    const value = String(this.get('email') ?? '')
    await api('/auth/forgot-password', { email: value })
    setEmail(value)
    setStep('otp')
  })

  const reset = submit(async function (this: FormData) {
    await api('/auth/reset-password', { email, otp: String(this.get('otp') ?? ''), password: String(this.get('password') ?? '') })
    setStep('done')
  })

  const err = error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>

  return (
    <div className="animate-fade-up mx-auto mt-6 max-w-md sm:mt-16">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        {step === 'email' && (
          <form onSubmit={sendCode} className="space-y-4">
            <p className="text-sm text-slate-500">Enter your email and we'll send you a 6-digit code.</p>
            <div>
              <label htmlFor="email" className={label}>Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required autoFocus className={field} />
            </div>
            {err}
            <button disabled={busy} className={button}>{busy ? 'Sending…' : 'Send code'}</button>
          </form>
        )}
        {step === 'otp' && (
          <form onSubmit={reset} className="space-y-4">
            <p className="text-sm text-slate-500">If an account exists for <b>{email}</b>, we've sent a code. It expires in 10 minutes.</p>
            <div>
              <label htmlFor="otp" className={label}>6-digit code</label>
              <input id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus className={`${field} tracking-widest`} />
            </div>
            <div>
              <label htmlFor="password" className={label}>New password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={field} />
            </div>
            {err}
            <button disabled={busy} className={button}>{busy ? 'Resetting…' : 'Reset password'}</button>
            <button type="button" onClick={() => { setError(''); setStep('email') }} className="w-full text-center text-sm text-slate-500 hover:underline">Use a different email</button>
          </form>
        )}
        {step === 'done' && <p role="status" className="text-sm text-slate-600">Password updated. You can now sign in.</p>}
        <p className="text-center text-sm"><Link to="/login" className="font-medium text-indigo-600 hover:underline">Back to sign in</Link></p>
      </div>
    </div>
  )
}
