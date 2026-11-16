import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../../lib/api'
import { useAuth } from '../../auth/AuthContext'

interface Profile {
  name: string
  username: string
  attempts: number
  solved: number
  topics: Record<string, number>
  joinedAt: string
  avatar: string | null
  points: number
  streak: number
  longestStreak: number
  recent: { slug: string; title: string; at: string }[]
}

const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm'
const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-2 focus:outline-indigo-200'
const primary = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60'

function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
  return ok ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{ok}</p> : null
}

// Crops to a centered square and shrinks to 256px JPEG so the stored photo stays a few KB.
async function toAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file')
  const img = await createImageBitmap(file)
  const size = Math.min(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  canvas.getContext('2d')!.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 256, 256)
  return canvas.toDataURL('image/jpeg', 0.8)
}

// Own-profile settings: photo, rename, and change password (needs the current one).
function EditPanel({ name, username, hasPhoto, onClose }: { name: string; username: string; hasPhoto: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const photo = useMutation({
    mutationFn: async (file: File | null) => api('/users/me/avatar', { avatar: file ? await toAvatar(file) : null }, 'PUT'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', username] }),
  })
  const rename = useMutation({
    mutationFn: (n: string) => api('/users/me', { name: n }, 'PUT'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', username] }),
  })
  const change = useMutation({ mutationFn: (v: { current: string; password: string }) => api('/users/me/password', v) })

  const onRename = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    rename.mutate(String(new FormData(e.currentTarget).get('name') ?? ''))
  }
  const onPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    change.mutate({ current: String(f.get('current') ?? ''), password: String(f.get('password') ?? '') }, { onSuccess: () => form.reset() })
  }

  return (
    <section className={`${card} p-6`} aria-labelledby="settings-h">
      <div className="flex items-center justify-between">
        <h2 id="settings-h" className="font-medium">Edit profile</h2>
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">Close</button>
      </div>
      <div className="mt-4 space-y-2">
        <label htmlFor="photo" className="block text-sm font-medium text-slate-700">Profile photo</label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="photo"
            type="file"
            accept="image/*"
            disabled={photo.isPending}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) photo.mutate(f); e.target.value = '' }}
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {hasPhoto && <button type="button" disabled={photo.isPending} onClick={() => photo.mutate(null)} className="text-sm text-rose-700 hover:underline">Remove photo</button>}
        </div>
        <Notice ok={photo.isSuccess ? 'Photo updated.' : undefined} error={photo.error?.message} />
      </div>
      {(
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form onSubmit={onRename} className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Display name</label>
              <input id="name" name="name" defaultValue={name} required maxLength={80} className={field} />
            </div>
            <Notice ok={rename.isSuccess ? 'Name updated.' : undefined} error={rename.error?.message} />
            <button disabled={rename.isPending} className={primary}>{rename.isPending ? 'Saving…' : 'Save name'}</button>
          </form>
          <form onSubmit={onPassword} className="space-y-3">
            <div>
              <label htmlFor="current" className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
              <input id="current" name="current" type="password" autoComplete="current-password" required className={field} />
            </div>
            <div>
              <label htmlFor="newpw" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
              <input id="newpw" name="password" type="password" autoComplete="new-password" minLength={8} required className={field} />
            </div>
            <Notice ok={change.isSuccess ? 'Password changed.' : undefined} error={change.error?.message} />
            <button disabled={change.isPending} className={primary}>{change.isPending ? 'Updating…' : 'Change password'}</button>
          </form>
        </div>
      )}
    </section>
  )
}

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api<Profile>(`/users/${username}/profile`),
  })

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy>
        <div className={`${card} h-40 animate-pulse bg-slate-100`} />
        <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className={`${card} h-24 animate-pulse bg-slate-100`} />)}</div>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className={`${card} p-8 text-center`}>
        <p role="alert" className="font-medium">User not found</p>
        <Link to="/leaderboard" className="mt-2 inline-block text-sm text-indigo-700 hover:underline">Browse the leaderboard</Link>
      </div>
    )
  }

  const topics = Object.entries(data.topics).sort((a, b) => b[1] - a[1])
  const max = topics[0]?.[1] ?? 1
  const isMe = user?.username === data.username
  const stats = [
    { label: 'Points', value: data.points, hint: 'Easy 10 · Medium 20 · Hard 30' },
    { label: 'Day streak 🔥', value: data.streak, hint: `Longest: ${data.longestStreak} day${data.longestStreak === 1 ? '' : 's'}` },
    { label: 'Problems solved', value: data.solved },
    { label: 'Submissions', value: data.attempts },
  ]

  return (
    <div className="animate-fade-up space-y-6">
      <header className={`${card} overflow-hidden`}>
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400" />
        <div className="flex flex-wrap items-end justify-between gap-3 px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            {data.avatar ? (
              <img src={data.avatar} alt={`${data.name}'s photo`} className="size-20 shrink-0 rounded-2xl border-4 border-white bg-white object-cover shadow" />
            ) : (
              <div aria-hidden className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-slate-900 text-3xl font-semibold text-white shadow">
                {data.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-2xl font-semibold leading-tight">{data.name}</h1>
              <p className="text-sm text-slate-500">@{data.username} · Joined {new Date(data.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          {isMe && (
            <button
              onClick={() => setEditing((v) => !v)}
              aria-expanded={editing}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-400"
            >
              {editing ? 'Close' : '✎ Edit profile'}
            </button>
          )}
        </div>
      </header>

      <section aria-label="Stats" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} p-5`}>
            <div className="text-3xl font-semibold tabular-nums">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            {s.hint && <div className="mt-1 text-xs text-slate-400">{s.hint}</div>}
          </div>
        ))}
      </section>

      {isMe && editing && <EditPanel name={data.name} username={data.username} hasPhoto={!!data.avatar} onClose={() => setEditing(false)} />}

      <section className={`${card} p-6`} aria-labelledby="recent-h">
        <h2 id="recent-h" className="mb-3 font-medium">Recently solved</h2>
        {data.recent.length === 0 ? (
          <p className="text-sm text-slate-500">No accepted solutions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((r) => (
              <li key={r.slug} className="flex items-center justify-between py-2 text-sm">
                <Link to={`/problems/${r.slug}`} className="font-medium text-slate-900 hover:text-indigo-700">{r.title}</Link>
                <span className="text-slate-500">{new Date(r.at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${card} p-6`} aria-labelledby="topics-h">
        <h2 id="topics-h" className="mb-4 font-medium">Solved by topic</h2>
        {topics.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-slate-500">Nothing solved yet.</p>
            {isMe && <Link to="/problems" className="mt-2 inline-block text-sm font-medium text-indigo-700 hover:underline">Solve your first problem</Link>}
          </div>
        ) : (
          <ul className="space-y-3">
            {topics.map(([name, count]) => (
              <li key={name}>
                <div className="mb-1 flex justify-between text-sm"><span>{name}</span><span className="tabular-nums text-slate-600">{count}</span></div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(count / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
