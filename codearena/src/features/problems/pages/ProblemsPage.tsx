import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DifficultyBadge } from '../../../components/Badge'
import { api } from '../../../lib/api'
import type { Difficulty, Problem } from '../../../types'

const PAGE_SIZE = 10

interface ProblemList {
  total: number
  items: Problem[]
}

export default function ProblemsPage() {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['problems', query, difficulty, page],
    queryFn: () =>
      api<ProblemList>(`/problems?${new URLSearchParams({ q: query, difficulty, page: String(page), limit: String(PAGE_SIZE) })}`),
  })
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-semibold">Problem explorer</h1>
      <p className="mb-4 text-sm text-slate-500">{data ? `${data.total} problem${data.total === 1 ? '' : 's'}` : 'Pick a problem to practice'}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="q">Search problems</label>
        <input
          id="q"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          placeholder="Search by title or tag"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-2 focus:outline-indigo-200"
        />
        <label className="sr-only" htmlFor="d">Difficulty</label>
        <select
          id="d"
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value as Difficulty | ''); setPage(1) }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-2 focus:outline-indigo-200"
        >
          <option value="">All difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      {isLoading && <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />}
      {error && <p role="alert" className="text-rose-700">Could not load problems: {error.message}</p>}
      {data && data.items.length === 0 && (
        <p className="rounded border border-dashed p-6 text-center text-slate-500">No problems match your filters.</p>
      )}
      {data && data.items.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {data.items.map((p) => (
            <li key={p.slug} className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50">
              <div>
                <Link to={`/problems/${p.slug}`} className="font-medium text-slate-900 hover:text-indigo-700">{p.title}</Link>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t}</span>
                  ))}
                </div>
              </div>
              <DifficultyBadge level={p.difficulty} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-3 text-sm">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm transition hover:bg-slate-50 disabled:opacity-40">Prev</button>
        <span>Page {page} of {pages}</span>
        <button disabled={page === pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 shadow-sm transition hover:bg-slate-50 disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}
