import { useState } from 'react'
import type { Submission } from '../../../types'

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
const DAYS = 14

const dayKey = (d: Date) => d.toLocaleDateString('en-CA')

// Submissions per day for the last 14 days, as thin bars with a hover tooltip per bar.
export function ActivityChart({ submissions }: { submissions: Submission[] }) {
  const [today] = useState(() => new Date())
  const counts = new Map<string, number>()
  submissions.forEach((s) => counts.set(dayKey(new Date(s.createdAt)), (counts.get(dayKey(new Date(s.createdAt))) ?? 0) + 1))
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (DAYS - 1 - i))
    return { d, n: counts.get(dayKey(d)) ?? 0 }
  })
  const max = Math.max(1, ...days.map((x) => x.n))
  const total = days.reduce((a, x) => a + x.n, 0)

  return (
    <section className={card} aria-labelledby="activity-h">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 id="activity-h" className="font-medium">Activity</h2>
        <span className="text-xs text-slate-500">{total} submission{total === 1 ? '' : 's'} · last {DAYS} days</span>
      </div>
      <div role="img" aria-label={`Submissions per day over the last ${DAYS} days: ${days.map((x) => `${x.d.toLocaleDateString()} ${x.n}`).join(', ')}`} className="flex h-40 items-end gap-0.5 border-b border-slate-200">
        {days.map(({ d, n }) => (
          <div key={d.toISOString()} className="group relative flex h-full flex-1 items-end justify-center">
            <div
              className={`w-full max-w-5 rounded-t-md transition-colors ${n ? 'bg-indigo-500 group-hover:bg-indigo-600' : 'bg-slate-100'}`}
              style={{ height: n ? `${Math.max(6, (n / max) * 100)}%` : '3px' }}
            />
            <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow group-hover:block">
              {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {n}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500" aria-hidden>
        <span>{days[0].d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span>Peak {max}/day</span>
        <span>Today</span>
      </div>
    </section>
  )
}

const VERDICT_STYLE: Record<string, string> = {
  Accepted: 'bg-emerald-500',
  'Wrong Answer': 'bg-rose-500',
  Other: 'bg-slate-400',
}

// Share of graded submissions by outcome: a 2px-gapped stacked bar plus a legend carrying the numbers.
export function VerdictBreakdown({ submissions }: { submissions: Submission[] }) {
  const graded = submissions.filter((s) => s.action === 'submit' && s.verdict)
  const tally: Record<string, number> = { Accepted: 0, 'Wrong Answer': 0, Other: 0 }
  graded.forEach((s) => { tally[s.verdict! in tally ? s.verdict! : 'Other']++ })
  const rows = Object.entries(tally).filter(([, n]) => n > 0)

  return (
    <section className={card} aria-labelledby="verdict-h">
      <h2 id="verdict-h" className="mb-4 font-medium">Results</h2>
      {graded.length === 0 ? (
        <p className="text-sm text-slate-500">Submit a solution to see your results.</p>
      ) : (
        <>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={rows.map(([k, n]) => `${k} ${n}`).join(', ')}>
            {rows.map(([k, n]) => <div key={k} title={`${k}: ${n}`} className={VERDICT_STYLE[k]} style={{ flex: n }} />)}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {rows.map(([k, n]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className={`size-2.5 rounded-sm ${VERDICT_STYLE[k]}`} />{k}</span>
                <span className="tabular-nums text-slate-600">{n} · {Math.round((n / graded.length) * 100)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

const LANG_LABEL: Record<string, string> = { javascript: 'JavaScript', python: 'Python', java: 'Java', cpp: 'C++', c: 'C' }

// Submissions per language as horizontal bars, labeled with the count.
export function LanguageUsage({ submissions }: { submissions: Submission[] }) {
  const tally = new Map<string, number>()
  submissions.forEach((s) => tally.set(s.language, (tally.get(s.language) ?? 0) + 1))
  const rows = [...tally].sort((a, b) => b[1] - a[1])
  const max = rows[0]?.[1] ?? 1

  return (
    <section className={card} aria-labelledby="lang-h">
      <h2 id="lang-h" className="mb-4 font-medium">Languages</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No submissions yet.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {rows.map(([lang, n]) => (
            <li key={lang}>
              <div className="mb-1 flex justify-between"><span>{LANG_LABEL[lang] ?? lang}</span><span className="tabular-nums text-slate-600">{n}</span></div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
