import { useEffect, useState } from 'react'
import { walkthroughs } from './walkthroughs'

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export default function Walkthrough({ slug }: { slug: string }) {
  const w = walkthroughs[slug]
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(() => !reduceMotion())

  const last = (w?.steps.length ?? 1) - 1
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      if (step >= last) setPlaying(false)
      else setStep(step + 1)
    }, 2200)
    return () => clearTimeout(t)
  }, [playing, step, last])

  if (!w) return null
  const s = w.steps[step]
  const btn = 'rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/15 disabled:opacity-40'

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-slate-200 shadow-2xl shadow-indigo-500/10">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-rose-400" />
          <span className="size-3 rounded-full bg-amber-400" />
          <span className="size-3 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs text-slate-400">{w.title}</span>
      </div>

      <div className="flex gap-2 px-4 pt-4" aria-label="Input array">
        {w.array.map((n, i) => (
          <div
            key={i}
            className={`flex size-11 flex-col items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-500 ${
              s.index === i ? 'scale-110 border-indigo-400 bg-indigo-500/30 text-white' : 'border-white/10 bg-white/5 text-slate-300'
            }`}
          >
            {n}
            <span className="text-[10px] font-normal text-slate-500">{i}</span>
          </div>
        ))}
      </div>

      <pre className="overflow-x-auto px-0 py-4 font-mono text-[13px] leading-7">
        {w.code.map((line, i) => (
          <div
            key={i}
            className={`border-l-2 px-4 transition-colors duration-300 ${
              i === s.line ? 'border-indigo-400 bg-indigo-500/20 text-white' : 'border-transparent text-slate-400'
            }`}
          >
            <span className="mr-3 inline-block w-4 select-none text-right text-slate-600">{i + 1}</span>
            {line}
          </div>
        ))}
      </pre>

      <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2">
        <p key={step} className="animate-fade-up text-sm leading-6 text-slate-200" aria-live="polite">{s.note}</p>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(s.vars).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/5 px-2 py-1.5">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-mono text-emerald-300">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
        <button className={btn} onClick={() => { setPlaying(false); setStep(Math.max(0, step - 1)) }} disabled={step === 0}>Back</button>
        <button className={btn} onClick={() => { if (step >= last) setStep(0); setPlaying(!playing) }}>
          {playing ? 'Pause' : step >= last ? 'Replay' : 'Play'}
        </button>
        <button className={btn} onClick={() => { setPlaying(false); setStep(Math.min(last, step + 1)) }} disabled={step === last}>Next</button>
        <span className="ml-auto text-xs text-slate-500">Step {step + 1} / {w.steps.length}</span>
      </div>
    </div>
  )
}
