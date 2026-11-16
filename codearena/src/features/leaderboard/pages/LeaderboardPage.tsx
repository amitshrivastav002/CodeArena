import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/api'
import { useAuth } from '../../auth/AuthContext'

interface Row {
  rank: number
  username: string
  solved: number
}

const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm'
const MEDAL = ['🥇', '🥈', '🥉']
const PODIUM = ['border-amber-300 bg-amber-50', 'border-slate-300 bg-slate-50', 'border-orange-300 bg-orange-50']

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useQuery({ queryKey: ['leaderboard'], queryFn: () => api<Row[]>('/leaderboard') })
  const max = Math.max(1, ...(data?.map((u) => u.solved) ?? []))

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <p className="text-sm text-slate-500">Ranked by distinct problems solved.</p>
      </header>
      {isLoading && <div className={`${card} h-64 animate-pulse bg-slate-100`} />}
      {error && <p role="alert" className="text-rose-700">{error.message}</p>}
      {data?.length === 0 && <p className="text-slate-500">No users yet.</p>}
      {data && data.length > 0 && (
        <>
          <section aria-label="Top three" className="grid gap-4 sm:grid-cols-3">
            {data.slice(0, 3).map((u, i) => (
              <Link key={u.username} to={`/profile/${u.username}`} className={`rounded-2xl border p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${PODIUM[i]}`}>
                <div className="text-3xl" aria-label={`Rank ${u.rank}`}>{MEDAL[i]}</div>
                <div className="mt-2 truncate font-semibold">{u.username}</div>
                <div className="text-sm text-slate-600"><span className="font-medium tabular-nums">{u.solved}</span> solved</div>
              </Link>
            ))}
          </section>
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Solved</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u.username} className={u.username === user?.username ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3 tabular-nums text-slate-500">#{u.rank}</td>
                    <td className="px-4 py-3">
                      <Link to={`/profile/${u.username}`} className="font-medium text-indigo-700 hover:underline">{u.username}</Link>
                      {u.username === user?.username && <span className="ml-2 text-xs text-slate-500">(you)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 tabular-nums">{u.solved}</span>
                        <div className="hidden h-2 w-40 rounded-full bg-slate-100 sm:block"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(u.solved / max) * 100}%` }} /></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
