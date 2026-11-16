import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { VerdictBadge } from '../../../components/Badge'
import { api } from '../../../lib/api'
import type { Submission } from '../../../types'

const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm'
const LANG: Record<string, string> = { javascript: 'JavaScript', python: 'Python', java: 'Java', cpp: 'C++', c: 'C' }

export default function SubmissionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => api<Submission[]>('/submissions'),
  })
  const accepted = data?.filter((s) => s.verdict === 'Accepted').length ?? 0

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">My submissions</h1>
        {!!data?.length && <p className="text-sm text-slate-500">{data.length} total · {accepted} accepted</p>}
      </header>
      {isLoading && <div className={`${card} h-64 animate-pulse bg-slate-100`} />}
      {error && <p role="alert" className="text-rose-700">{error.message}</p>}
      {data?.length === 0 && (
        <div className={`${card} p-8 text-center`}>
          <p className="font-medium">No submissions yet</p>
          <Link to="/problems" className="mt-2 inline-block text-sm font-medium text-indigo-700 hover:underline">Solve a problem</Link>
        </div>
      )}
      {data && data.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Problem</th><th className="px-4 py-3">Language</th><th className="px-4 py-3">Verdict</th><th className="px-4 py-3">When</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/submissions/${s.id}`} className="font-medium text-indigo-700 hover:underline">{s.problemTitle}</Link>
                    {s.action === 'run' && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">run</span>}
                  </td>
                  <td className="px-4 py-3">{LANG[s.language] ?? s.language}</td>
                  <td className="px-4 py-3"><VerdictBadge value={s.verdict} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
