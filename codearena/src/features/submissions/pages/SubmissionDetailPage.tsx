import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../../lib/api'
import type { Submission } from '../../../types'

export default function SubmissionDetailPage() {
  const { id } = useParams()
  const { data: s, isLoading, error } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => api<Submission>(`/submissions/${id}`),
  })

  if (isLoading) return <p>Loading...</p>
  if (error || !s) return <p role="alert">Submission not found. <Link to="/submissions" className="text-indigo-700 underline">Back</Link></p>

  return (
    <div>
      <h1 className="text-2xl font-semibold">Submission result</h1>
      <p className="mt-2">
        <Link to={`/problems/${s.problemSlug}`} className="text-indigo-700 hover:underline">{s.problemTitle}</Link>
        {' - '}{s.language}{' - '}
        <span className={s.verdict === 'Accepted' ? 'text-emerald-700' : 'text-rose-700'}>{s.verdict}</span>
      </p>
      <p className="text-sm text-slate-500">{new Date(s.createdAt).toLocaleString()}</p>
      <pre className="mt-4 overflow-x-auto rounded bg-slate-900 p-4 text-sm text-slate-100">{s.sourceCode}</pre>
    </div>
  )
}
