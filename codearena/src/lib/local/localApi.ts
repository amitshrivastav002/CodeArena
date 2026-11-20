// Offline stand-in for the Express API (server/app.js), used by the Android build. State lives in localStorage.
import bank from '../problemBank.json'
import { nativeStarters } from './encode'
import { judge } from './runner'

interface BankProblem {
  slug: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; tags: string[]; statement: string
  constraints: string[]; hints: string[]; examples: { input: string; expected: string }[]
  starterCode: Record<string, string>; tests: { input: string; expected: string; visibility: string }[]
}
interface User { id: number; name: string; username: string; email: string; passwordHash: string; role: string; createdAt: string; avatar: string | null }
interface Sub { id: string; userId: number; problemSlug: string; language: string; sourceCode: string; action: string; status: string; verdict: string | null; createdAt: string }
interface Db { nextId: number; users: User[]; subs: Sub[]; resets: Record<string, { otp: string; expiresAt: number; attempts: number }> }

const problems = bank as BankProblem[]
const POINTS = { Easy: 10, Medium: 20, Hard: 30 }
const KEY = 'codearena.localdb'
const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c']

const load = (): Db => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '') } catch { return { nextId: 1, users: [], subs: [], resets: {} } }
}
const save = (db: Db) => localStorage.setItem(KEY, JSON.stringify(db))

const fail = (m: string): never => { throw new Error(m) }

const sha = async (s: string) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`codearena:${s}`)))].map((b) => b.toString(16).padStart(2, '0')).join('')

const publicUser = (u: User) => ({ id: u.id, name: u.name, username: u.username, email: u.email, role: u.role })
const publicProblem = (p: BankProblem) => ({
  slug: p.slug, title: p.title, difficulty: p.difficulty, tags: p.tags, statement: p.statement,
  constraints: p.constraints, hints: p.hints, examples: p.examples,
  starterCode: { ...p.starterCode, ...nativeStarters(p.examples[0]) },
})

export function streaks(days: string[], today: string) {
  const set = new Set(days)
  const step = (d: string, n: number) => new Date(Date.parse(d) + n * 86_400_000).toISOString().slice(0, 10)
  let current = 0
  for (let d = set.has(today) ? today : step(today, -1); set.has(d); d = step(d, -1)) current++
  let longest = 0
  for (const d of set) {
    if (set.has(step(d, -1))) continue
    let n = 0
    for (let x = d; set.has(x); x = step(x, 1)) n++
    longest = Math.max(longest, n)
  }
  return { current, longest }
}

const uid = (token: string | null) => {
  const m = /^local\.(\d+)$/.exec(token ?? '')
  return m ? Number(m[1]) : fail('Unauthorized')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handle(path: string, method: string, body: any, token: string | null): Promise<unknown> {
  const url = new URL(path, 'http://x')
  const p = url.pathname
  const q = url.searchParams
  const db = load()
  const me = () => db.users.find((u) => u.id === uid(token)) ?? fail('Unauthorized')
  const sign = (u: User) => ({ token: `local.${u.id}`, user: publicUser(u) })
  let m: RegExpExecArray | null

  if (method === 'POST' && p === '/auth/register') {
    const { name, username, email, password } = body ?? {}
    if (![name, username, email, password].every((v) => typeof v === 'string' && v.trim()) || password.length < 8)
      fail('name, username, email and a password of 8+ characters are required')
    if (db.users.some((u) => u.username === username || u.email === email.toLowerCase())) fail('Username or email already in use')
    const user: User = { id: db.nextId++, name, username, email: email.toLowerCase(), passwordHash: await sha(password), role: 'learner', createdAt: new Date().toISOString(), avatar: null }
    db.users.push(user)
    save(db)
    return sign(user)
  }
  if (p === '/auth/config') return { googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? null }
  if (method === 'POST' && p === '/auth/google') {
    // No server to verify the signature, so check the token's audience, expiry and verified email instead.
    let g: { aud?: string; exp?: number; email?: string; email_verified?: boolean; name?: string } = {}
    try {
      g = JSON.parse(decodeURIComponent(escape(atob(String(body?.credential).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))))
    } catch { fail('Invalid Google credential') }
    if (g.aud !== import.meta.env.VITE_GOOGLE_CLIENT_ID || (g.exp ?? 0) * 1000 < Date.now()) fail('Invalid Google credential')
    if (!g.email || !g.email_verified) fail('Google account email is not verified')
    const email = g.email!.toLowerCase()
    let user = db.users.find((u) => u.email === email)
    if (!user) {
      const base = email.split('@')[0].replace(/[^a-z0-9]/g, '') || 'user'
      let username = base
      for (let i = 1; db.users.some((u) => u.username === username); i++) username = `${base}${i}`
      user = { id: db.nextId++, name: g.name || username, username, email, passwordHash: await sha(crypto.randomUUID()), role: 'learner', createdAt: new Date().toISOString(), avatar: null }
      db.users.push(user)
      save(db)
    }
    return sign(user)
  }
  if (method === 'POST' && p === '/auth/login') {
    const user = db.users.find((u) => u.email === String(body?.email ?? '').toLowerCase())
    if (!user || user.passwordHash !== (await sha(String(body?.password ?? '')))) fail('Invalid credentials')
    return sign(user!)
  }
  if (method === 'POST' && p === '/auth/forgot-password') {
    const email = String(body?.email ?? '').toLowerCase()
    if (!email) fail('email is required')
    if (db.users.some((u) => u.email === email)) {
      const otp = String(100000 + Math.floor(Math.random() * 900000))
      db.resets[email] = { otp, expiresAt: Date.now() + 10 * 60_000, attempts: 0 }
      save(db)
      const { VITE_EMAILJS_SERVICE_ID: service_id, VITE_EMAILJS_TEMPLATE_ID: template_id, VITE_EMAILJS_PUBLIC_KEY: user_id } = import.meta.env
      if (service_id && template_id && user_id) {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service_id, template_id, user_id, template_params: { to_email: email, otp, expires_in: '10 minutes' } }),
        }).catch(() => null)
        if (!res?.ok) fail('Could not send the email. Check your internet connection and try again.')
      } else {
        // No email service configured: show the code on screen instead.
        alert(`Your CodeArena password reset code is ${otp}. It expires in 10 minutes.`)
      }
    }
    return { ok: true }
  }
  if (method === 'POST' && p === '/auth/reset-password') {
    const { email, otp, password } = body ?? {}
    if (![email, otp, password].every((v) => typeof v === 'string') || password.length < 8) fail('email, code and a password of 8+ characters are required')
    const key = email.toLowerCase()
    const row = db.resets[key]
    if (!row || row.expiresAt < Date.now() || row.attempts >= 5) fail('Invalid or expired code')
    if (row.otp !== otp) { row.attempts++; save(db); fail('Invalid or expired code') }
    const user = db.users.find((u) => u.email === key)!
    user.passwordHash = await sha(password)
    delete db.resets[key]
    save(db)
    return { ok: true }
  }
  if (p === '/users/me' && method === 'GET') return publicUser(me())
  if (p === '/users/me' && method === 'PUT') {
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 80) fail('name is required (max 80 characters)')
    const u = me(); u.name = name; save(db)
    return publicUser(u)
  }
  if (p === '/users/me/avatar' && method === 'PUT') {
    const { avatar } = body ?? {}
    if (avatar !== null && !(typeof avatar === 'string' && avatar.length <= 80_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar)))
      fail('avatar must be a small JPEG, PNG or WebP image')
    me().avatar = avatar; save(db)
    return { ok: true }
  }
  if (p === '/users/me/password' && method === 'POST') {
    const { current, password } = body ?? {}
    if (typeof current !== 'string' || typeof password !== 'string' || password.length < 8) fail('current password and a new password of 8+ characters are required')
    const u = me()
    if (u.passwordHash !== (await sha(current))) fail('Current password is incorrect')
    u.passwordHash = await sha(password); save(db)
    return { ok: true }
  }
  if (p === '/users/me/progress') {
    const rows = db.subs.filter((s) => s.userId === me().id && s.action === 'submit')
    return { attempts: rows.length, solved: new Set(rows.filter((r) => r.verdict === 'Accepted').map((r) => r.problemSlug)).size }
  }
  if (p === '/problems' && method === 'GET') {
    const query = (q.get('q') ?? '').toLowerCase()
    const page = Math.max(1, Number(q.get('page')) || 1)
    const limit = Math.min(200, Math.max(1, Number(q.get('limit')) || 10))
    const difficulty = q.get('difficulty'), tag = q.get('tag')
    const filtered = problems.filter((x) => (!difficulty || x.difficulty === difficulty) && (!tag || x.tags.includes(tag)) && (x.title + x.tags.join(' ')).toLowerCase().includes(query))
    return { total: filtered.length, page, limit, items: filtered.slice((page - 1) * limit, page * limit).map(publicProblem) }
  }
  if ((m = /^\/problems\/([^/]+)$/.exec(p))) {
    const x = problems.find((y) => y.slug === m![1])
    return x ? publicProblem(x) : fail('Problem not found')
  }
  if (method === 'POST' && (p === '/submissions' || p === '/submissions/run')) {
    const user = me()
    const { problemSlug, language, sourceCode } = body ?? {}
    const prob = problems.find((x) => x.slug === problemSlug) ?? fail('Problem not found')
    if (!LANGUAGES.includes(language)) fail('Unsupported language')
    if (typeof sourceCode !== 'string' || !sourceCode.trim() || sourceCode.length > 50_000) fail('sourceCode must be 1-50000 characters')
    const since = new Date(Date.now() - 60_000).toISOString()
    if (db.subs.filter((s) => s.userId === user.id && s.createdAt > since).length >= 10) fail('Too many submissions, try again in a minute')
    const action = p === '/submissions' ? 'submit' : 'run'
    const sub: Sub = { id: `sub_${crypto.randomUUID()}`, userId: user.id, problemSlug, language, sourceCode, action, status: 'running', verdict: null, createdAt: new Date().toISOString() }
    db.subs.push(sub)
    save(db)
    const tests = prob.tests.filter((t) => t.visibility === 'visible' || action === 'submit')
    judge(language, sourceCode, tests).then((verdict) => {
      const d = load()
      const s = d.subs.find((x) => x.id === sub.id)
      if (s) { s.status = 'completed'; s.verdict = verdict; save(d) }
    })
    return { submissionId: sub.id, status: 'queued', message: 'Submission received' }
  }
  const withTitle = (s: Sub) => ({ ...s, problemTitle: problems.find((x) => x.slug === s.problemSlug)?.title })
  if (p === '/submissions' && method === 'GET') {
    return db.subs.filter((s) => s.userId === me().id && s.action === 'submit').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(withTitle)
  }
  if ((m = /^\/submissions\/([^/]+)$/.exec(p))) {
    const s = db.subs.find((x) => x.id === m![1])
    return s && s.userId === me().id ? withTitle(s) : fail('Submission not found')
  }
  if ((m = /^\/users\/([^/]+)\/profile$/.exec(p))) {
    const user = db.users.find((u) => u.username === decodeURIComponent(m![1])) ?? fail('User not found')
    const rows = db.subs.filter((s) => s.userId === user.id && s.action === 'submit')
    const accepted = rows.filter((r) => r.verdict === 'Accepted')
    const solvedSlugs = new Set(accepted.map((r) => r.problemSlug))
    const topics: Record<string, number> = {}
    let points = 0
    for (const x of problems) if (solvedSlugs.has(x.slug)) { points += POINTS[x.difficulty]; for (const t of x.tags) topics[t] = (topics[t] ?? 0) + 1 }
    const latest = new Map<string, string>()
    for (const r of accepted) if ((latest.get(r.problemSlug) ?? '') < r.createdAt) latest.set(r.problemSlug, r.createdAt)
    const recent = [...latest].sort((a, b) => b[1].localeCompare(a[1])).slice(0, 5)
      .map(([slug, at]) => ({ slug, title: problems.find((x) => x.slug === slug)?.title, at }))
    const { current, longest } = streaks(accepted.map((r) => r.createdAt.slice(0, 10)), new Date().toISOString().slice(0, 10))
    return { name: user.name, username: user.username, avatar: user.avatar, joinedAt: user.createdAt, attempts: rows.length, solved: solvedSlugs.size, topics, recent, points, streak: current, longestStreak: longest }
  }
  if (p === '/leaderboard') {
    return db.users
      .map((u) => ({ username: u.username, solved: new Set(db.subs.filter((s) => s.userId === u.id && s.action === 'submit' && s.verdict === 'Accepted').map((s) => s.problemSlug)).size }))
      .sort((a, b) => b.solved - a.solved || a.username.localeCompare(b.username)).slice(0, 50).map((r, i) => ({ rank: i + 1, ...r }))
  }
  return fail('Not available in the offline app')
}

export async function localApi<T>(path: string, body: unknown, method: string, token: string | null): Promise<T> {
  return (await handle(path, method, body, token)) as T
}
