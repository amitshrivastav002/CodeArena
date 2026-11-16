import type { Difficulty } from '../types'

const colors: Record<Difficulty, string> = {
  Easy: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  Hard: 'bg-rose-100 text-rose-800',
}

export function VerdictBadge({ value }: { value: string | null }) {
  const style = !value ? 'bg-slate-100 text-slate-600' : value === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>{value ?? 'Pending'}</span>
}

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[level]}`}>{level}</span>
}
