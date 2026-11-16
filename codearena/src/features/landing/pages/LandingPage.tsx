import { Link } from 'react-router-dom'
import Walkthrough from '../../walkthrough/Walkthrough'

const features = [
  { title: 'Learn by watching', body: 'Step through a solution line by line and see every variable change.' },
  { title: 'Real editor', body: 'Write JavaScript or Python in a VS Code style editor.' },
  { title: 'Judged securely', body: 'Code runs in an isolated sandbox. Hidden tests keep it honest.' },
  { title: 'Track progress', body: 'Submission history, solved topics and a live leaderboard.' },
]

export default function LandingPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-white sm:px-12">
        <div aria-hidden="true" className="animate-float absolute -left-16 -top-16 -z-10 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div aria-hidden="true" className="animate-float absolute -bottom-20 right-0 -z-10 size-80 rounded-full bg-sky-500/20 blur-3xl [animation-delay:3s]" />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="mb-3 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
              Practice. Understand. Level up.
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Don't just solve problems. <span className="text-shine">See how they work.</span>
            </h1>
            <p className="mt-4 max-w-lg text-slate-300">
              CodeArena pairs coding challenges with animated walkthroughs, so every solution makes sense, not just passes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/problems" className="rounded-xl bg-indigo-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400">
                Browse problems
              </Link>
              <Link to="/register" className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 font-medium transition hover:bg-white/10">
                Create free account
              </Link>
            </div>
          </div>
          <div className="animate-fade-up [animation-delay:150ms]">
            <Walkthrough slug="two-sum" />
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Features">
        {features.map((f, i) => (
          <div
            key={f.title}
            style={{ animationDelay: `${i * 90}ms` }}
            className="animate-fade-up rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
