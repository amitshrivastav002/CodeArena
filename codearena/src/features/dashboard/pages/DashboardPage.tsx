import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/api'
import type { Submission } from '../../../types'
import { useAuth } from '../../auth/AuthContext'
import { ActivityChart, LanguageUsage, VerdictBreakdown } from '../components/Charts'

const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm'

function Verdict({ value }: { value: string | null }) {
  const ok = value === 'Accepted'
  const style = !value ? 'bg-slate-100 text-slate-600' : ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>{value ?? 'Pending'}</span>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const progress = useQuery({ queryKey: ['progress'], queryFn: () => api<{ attempts: number; solved: number }>('/users/me/progress') })
  const recent = useQuery({ queryKey: ['submissions'], queryFn: () => api<Submission[]>('/submissions') })

  const graded = recent.data?.filter((s) => s.action === 'submit' && s.verdict) ?? []
  const accepted = graded.filter((s) => s.verdict === 'Accepted').length
  const stats = progress.data && [
    { label: 'Problems solved', value: progress.data.solved, tone: 'from-emerald-500 to-teal-400' },
    { label: 'Total submissions', value: progress.data.attempts, tone: 'from-indigo-500 to-sky-400' },
    { label: 'Acceptance rate', value: graded.length ? `${Math.round((accepted / graded.length) * 100)}%` : '—', tone: 'from-amber-500 to-orange-400' },
  ]

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
          <p className="text-sm text-slate-500">Here's how your practice is going.</p>
        </div>
        <Link to="/problems" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
          Browse problems →
        </Link>
      </header>

      {progress.error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{progress.error.message}</p>}

      <section aria-label="Stats" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {progress.isLoading
          ? [0, 1, 2].map((i) => <div key={i} className={`${card} h-24 animate-pulse bg-slate-100`} />)
          : stats?.map((s) => (
              <div key={s.label} className={`${card} relative overflow-hidden p-5`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.tone}`} />
                <div className="text-3xl font-semibold tabular-nums">{s.value}</div>
                <div className="mt-1 text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
      </section>

      {recent.data && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><ActivityChart submissions={recent.data} /></div>
          <VerdictBreakdown submissions={recent.data} />
          <div className="lg:col-span-3"><LanguageUsage submissions={recent.data} /></div>
        </div>
      )}

      <section aria-labelledby="recent-heading">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="recent-heading" className="font-medium">Recent submissions</h2>
          <Link to="/submissions" className="text-sm text-indigo-700 hover:underline">View all</Link>
        </div>
        {recent.isLoading && <div className={`${card} h-40 animate-pulse bg-slate-100`} />}
        {recent.error && <p role="alert" className="text-sm text-rose-700">{recent.error.message}</p>}
        {recent.data?.length === 0 && (
          <div className={`${card} p-8 text-center`}>
            <p className="font-medium">No submissions yet</p>
            <p className="mt-1 text-sm text-slate-500">Solve your first problem to see it here.</p>
            <Link to="/problems" className="mt-4 inline-block text-sm font-medium text-indigo-700 hover:underline">Pick a problem</Link>
          </div>
        )}
        {!!recent.data?.length && (
          <ul className={`${card} divide-y divide-slate-100`}>
            {recent.data.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link to={`/submissions/${s.id}`} className="flex items-center justify-between gap-3 p-4 text-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-400">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-900">{s.problemTitle}</span>
                    <span className="text-xs text-slate-500">{s.language} · {new Date(s.createdAt).toLocaleDateString()}</span>
                  </span>
                  <Verdict value={s.verdict} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
