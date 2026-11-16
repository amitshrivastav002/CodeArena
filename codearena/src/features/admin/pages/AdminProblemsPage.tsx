import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../../../lib/api'
import type { Problem, TestCase } from '../../../types'

interface AdminProblem extends Problem {
  args: string
  hiddenTests: TestCase[]
}

// Examples are "input => expected" per line (input: comma-separated JSON args).
// Hidden tests are "[json args array] => expected" per line.
const toLines = (cases: TestCase[]) => cases.map((c) => `${c.input} => ${c.expected}`).join('\n')
const fromLines = (text: string): TestCase[] =>
  text.split('\n').filter((l) => l.trim()).map((l) => {
    const [input, expected = ''] = l.split('=>').map((s) => s.trim())
    return { input, expected }
  })
const list = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean)

const empty = {
  slug: '', title: '', difficulty: 'Easy', tags: '', statement: '', constraints: '', hints: '',
  args: '', examples: '', hiddenTests: '',
}

export default function AdminProblemsPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['problems', 'all'], queryFn: () => api<{ items: Problem[] }>('/problems?limit=200') })
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  const edit = async (slug: string) => {
    setError('')
    setMessage('')
    try {
      const p = await api<AdminProblem>(`/admin/problems/${slug}`)
      setEditing(slug)
      setForm({
        slug, title: p.title, difficulty: p.difficulty, tags: p.tags.join(', '), statement: p.statement,
        constraints: p.constraints.join('\n'), hints: p.hints.join('\n'), args: p.args,
        examples: toLines(p.examples), hiddenTests: toLines(p.hiddenTests),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load problem')
    }
  }

  const reset = () => { setEditing(null); setForm(empty) }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    const body = {
      slug: form.slug, title: form.title, difficulty: form.difficulty,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      statement: form.statement, constraints: list(form.constraints), hints: list(form.hints),
      args: form.args, examples: fromLines(form.examples), hiddenTests: fromLines(form.hiddenTests),
    }
    try {
      if (editing) await api(`/admin/problems/${editing}`, body, 'PUT')
      else await api('/admin/problems', body)
      setMessage(`Saved ${form.slug}`)
      reset()
      queryClient.invalidateQueries({ queryKey: ['problems'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const field = 'w-full rounded border px-3 py-2'
  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <section aria-label="Problems">
        <h1 className="mb-3 text-2xl font-semibold">Problem management</h1>
        <button onClick={reset} className="mb-3 rounded bg-indigo-600 px-3 py-1 text-white transition hover:bg-indigo-500">New problem</button>
        <ul className="divide-y rounded-2xl border border-slate-200 bg-white shadow-sm">
          {data?.items.map((p) => (
            <li key={p.slug}>
              <button onClick={() => edit(p.slug)} className="w-full p-2 text-left text-sm hover:bg-slate-50">{p.title}</button>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={save} className="space-y-3">
        <h2 className="text-xl font-semibold">{editing ? `Edit ${editing}` : 'New problem'}</h2>
        <div>
          <label htmlFor="slug" className="block text-sm">Slug</label>
          <input id="slug" required disabled={!!editing} pattern="[a-z0-9\-]+" value={form.slug} onChange={set('slug')} className={field} />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm">Title</label>
          <input id="title" required value={form.title} onChange={set('title')} className={field} />
        </div>
        <div>
          <label htmlFor="difficulty" className="block text-sm">Difficulty</label>
          <select id="difficulty" value={form.difficulty} onChange={set('difficulty')} className={field}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm">Tags (comma-separated)</label>
          <input id="tags" value={form.tags} onChange={set('tags')} className={field} />
        </div>
        <div>
          <label htmlFor="args" className="block text-sm">solve() parameters (e.g. nums, target)</label>
          <input id="args" value={form.args} onChange={set('args')} className={field} />
        </div>
        <div>
          <label htmlFor="statement" className="block text-sm">Statement</label>
          <textarea id="statement" required rows={4} value={form.statement} onChange={set('statement')} className={field} />
        </div>
        <div>
          <label htmlFor="constraints" className="block text-sm">Constraints (one per line)</label>
          <textarea id="constraints" rows={2} value={form.constraints} onChange={set('constraints')} className={field} />
        </div>
        <div>
          <label htmlFor="hints" className="block text-sm">Hints (one per line)</label>
          <textarea id="hints" rows={2} value={form.hints} onChange={set('hints')} className={field} />
        </div>
        <div>
          <label htmlFor="examples" className="block text-sm">Examples, shown to users (one per line: <code>[2,7], 9 =&gt; [0,1]</code>)</label>
          <textarea id="examples" required rows={3} value={form.examples} onChange={set('examples')} className={`${field} font-mono text-sm`} />
        </div>
        <div>
          <label htmlFor="hidden" className="block text-sm">Hidden tests, never shown (one per line: <code>[[3,3],6] =&gt; [0,1]</code>)</label>
          <textarea id="hidden" rows={3} value={form.hiddenTests} onChange={set('hiddenTests')} className={`${field} font-mono text-sm`} />
        </div>
        <button className="rounded bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500">{editing ? 'Save changes' : 'Create problem'}</button>
        {message && <p role="status" className="text-emerald-700">{message}</p>}
        {error && <p role="alert" className="text-rose-700">{error}</p>}
      </form>
    </div>
  )
}
