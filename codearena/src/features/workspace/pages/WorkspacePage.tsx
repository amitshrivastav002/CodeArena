import Editor from '@monaco-editor/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DifficultyBadge } from '../../../components/Badge'
import { api } from '../../../lib/api'
import Walkthrough from '../../walkthrough/Walkthrough'
import { walkthroughs } from '../../walkthrough/walkthroughs'
import type { Language, Problem, Submission } from '../../../types'

export default function WorkspacePage() {
  const { slug } = useParams()
  const { data: problem, isLoading, error } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => api<Problem>(`/problems/${slug}`),
  })

  if (isLoading) return <p>Loading...</p>
  if (error || !problem) return <p role="alert">Problem not found.</p>
  return <Workspace problem={problem} />
}

function Workspace({ problem }: { problem: Problem }) {
  const [language, setLanguage] = useState<Language>('javascript')
  const [code, setCode] = useState<Record<Language, string>>(problem.starterCode)

  const send = useMutation({
    mutationFn: async (action: 'run' | 'submit') => {
      const { submissionId } = await api<{ submissionId: string }>(
        action === 'run' ? '/submissions/run' : '/submissions',
        { problemSlug: problem.slug, language, sourceCode: code[language] },
      )
      for (let i = 0; i < 60; i++) {
        const s = await api<Submission>(`/submissions/${submissionId}`)
        if (s.status === 'completed') return s
        await new Promise((r) => setTimeout(r, 1000))
      }
      throw new Error('Judging timed out, check My submissions later')
    },
  })
  const result = send.data

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label="Problem">
        <h1 className="text-2xl font-semibold">{problem.title}</h1>
        <div className="my-2 flex gap-2"><DifficultyBadge level={problem.difficulty} /></div>
        <p className="mb-4">{problem.statement}</p>
        <h2 className="font-medium">Examples</h2>
        {problem.examples.map((e, i) => (
          <pre key={i} className="my-2 rounded bg-slate-100 p-2 text-sm">Input: {e.input}{'\n'}Output: {e.expected}</pre>
        ))}
        <h2 className="mt-4 font-medium">Constraints</h2>
        <ul className="list-disc pl-5 text-sm">{problem.constraints.map((c) => <li key={c}>{c}</li>)}</ul>
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">Hints</summary>
          <ul className="list-disc pl-5 text-sm">{problem.hints.map((h) => <li key={h}>{h}</li>)}</ul>
        </details>
        {walkthroughs[problem.slug] && (
          <details className="mt-4" open>
            <summary className="cursor-pointer font-medium">See how it works</summary>
            <div className="mt-2"><Walkthrough slug={problem.slug} /></div>
          </details>
        )}
      </section>

      <section aria-label="Editor">
        <div className="mb-2 flex items-center gap-2">
          <label htmlFor="lang" className="sr-only">Language</label>
          <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="rounded border px-2 py-1">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
          <button onClick={() => send.mutate('run')} disabled={send.isPending} className="rounded bg-slate-200 px-3 py-1 disabled:opacity-50">Run</button>
          <button onClick={() => send.mutate('submit')} disabled={send.isPending} className="rounded bg-indigo-600 px-3 py-1 text-white transition hover:bg-indigo-500 disabled:opacity-50">Submit</button>
        </div>
        <div className="overflow-hidden rounded border">
          <Editor
            height="320px"
            theme="vs-dark"
            language={language}
            value={code[language]}
            onChange={(v) => setCode({ ...code, [language]: v ?? '' })}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>

        <div className="mt-4" aria-live="polite">
          {send.isPending && <p>Judging...</p>}
          {send.error && <p role="alert" className="text-rose-700">{send.error.message}</p>}
          {result && (
            <>
              <p className={`font-semibold ${result.verdict === 'Accepted' ? 'text-emerald-700' : 'text-rose-700'}`}>{result.verdict}</p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
