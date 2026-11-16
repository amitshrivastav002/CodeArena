import bcrypt from 'bcryptjs'
import cors from 'cors'
import { OAuth2Client } from 'google-auth-library'
import { randomBytes, randomInt, randomUUID } from 'node:crypto'
import nodemailer from 'nodemailer'
import express from 'express'
import jwt from 'jsonwebtoken'
import { nativeStarters } from './encode.js'
import { createJudge } from './judge.js'
import { seedProblems, starter } from './seed.js'

const MAX_PER_MINUTE = 10
const MAX_SOURCE = 50_000
const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c']
const parseProblem = (r) => ({
  ...r,
  tags: JSON.parse(r.tags),
  constraints: JSON.parse(r.constraints),
  hints: JSON.parse(r.hints),
  examples: JSON.parse(r.examples),
  starterCode: { ...JSON.parse(r.starterCode), ...nativeStarters(JSON.parse(r.examples)[0]) },
})

// Verifies a Google ID token and returns its payload (throws if invalid or for another client).
const googleVerifier = (clientId) => async (credential) => {
  const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: credential, audience: clientId })
  return ticket.getPayload()
}

const POINTS = { Easy: 10, Medium: 20, Hard: 30 }

// days: 'YYYY-MM-DD' (UTC) strings with an accepted submission. A streak is consecutive days;
// the current one stays alive if the last solve was today or yesterday.
export function streaks(days, today) {
  const set = new Set(days)
  const prev = (d) => new Date(Date.parse(d) - 86_400_000).toISOString().slice(0, 10)
  let current = 0
  for (let d = set.has(today) ? today : prev(today); set.has(d); d = prev(d)) current++
  let longest = 0
  for (const d of set) {
    if (set.has(prev(d))) continue
    let n = 0
    for (let x = d; set.has(x); x = new Date(Date.parse(x) + 86_400_000).toISOString().slice(0, 10)) n++
    longest = Math.max(longest, n)
  }
  return { current, longest }
}

const OTP_TTL_MS =10 * 60_000
const OTP_MAX_ATTEMPTS = 5

// Sends mail through SMTP_URL (e.g. smtps://user:pass@host) when set; otherwise prints it, for local dev.
const defaultSendMail = () => {
  const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null
  return async ({ to, subject, text }) => {
    if (transport) await transport.sendMail({ from: process.env.MAIL_FROM ?? 'CodeArena <no-reply@codearena.local>', to, subject, text })
    else console.log(`[mail] to=${to} ${subject}: ${text}`)
  }
}

export function createApp(
  db,
  {
    jwtSecret = process.env.JWT_SECRET ?? randomBytes(32).toString('hex'),
    judge = createJudge(),
    googleClientId = process.env.GOOGLE_CLIENT_ID,
    verifyGoogle = googleClientId ? googleVerifier(googleClientId) : null,
    sendMail = defaultSendMail(),
  } = {},
) {
  seedProblems(db)
  const app = express()
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5180' }))
  app.use(express.json({ limit: '100kb' }))

  const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer /, '')
    try {
      req.user = jwt.verify(token, jwtSecret)
      next()
    } catch {
      res.status(401).json({ error: 'Unauthorized' })
    }
  }
  const sign = (u) => jwt.sign({ id: u.id, role: u.role }, jwtSecret, { expiresIn: '1d' })
  const publicUser = (u) => ({ id: u.id, name: u.name, username: u.username, email: u.email, role: u.role })

  app.post('/api/auth/register', (req, res) => {
    const { name, username, email, password } = req.body ?? {}
    if (![name, username, email, password].every((v) => typeof v === 'string' && v.trim()) || password.length < 8) {
      return res.status(400).json({ error: 'name, username, email and a password of 8+ characters are required' })
    }
    try {
      const r = db.prepare('INSERT INTO users (name,username,email,passwordHash,createdAt) VALUES (?,?,?,?,?)')
        .run(name, username, email.toLowerCase(), bcrypt.hashSync(password, 10), new Date().toISOString())
      const user = db.prepare('SELECT * FROM users WHERE id=?').get(r.lastInsertRowid)
      res.status(201).json({ token: sign(user), user: publicUser(user) })
    } catch {
      res.status(409).json({ error: 'Username or email already in use' })
    }
  })

  // Public config the UI needs (the Google client ID is not a secret).
  app.get('/api/auth/config', (_req, res) => res.json({ googleClientId: verifyGoogle ? googleClientId ?? null : null }))

  app.post('/api/auth/google', async (req, res) => {
    if (!verifyGoogle) return res.status(501).json({ error: 'Google sign-in is not configured' })
    let g
    try {
      g = await verifyGoogle(req.body?.credential)
    } catch {
      return res.status(401).json({ error: 'Invalid Google credential' })
    }
    if (!g?.email || !g.email_verified) return res.status(401).json({ error: 'Google account email is not verified' })

    const email = g.email.toLowerCase()
    let user = db.prepare('SELECT * FROM users WHERE email=?').get(email)
    if (!user) {
      const base = email.split('@')[0].replace(/[^a-z0-9]/g, '') || 'user'
      let username = base
      for (let i = 1; db.prepare('SELECT 1 FROM users WHERE username=?').get(username); i++) username = `${base}${i}`
      // Google-only accounts get an unguessable password hash, so password login is impossible for them.
      const r = db.prepare('INSERT INTO users (name,username,email,passwordHash,createdAt) VALUES (?,?,?,?,?)')
        .run(g.name || username, username, email, bcrypt.hashSync(randomBytes(24).toString('hex'), 10), new Date().toISOString())
      user = db.prepare('SELECT * FROM users WHERE id=?').get(r.lastInsertRowid)
    }
    res.json({ token: sign(user), user: publicUser(user) })
  })

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {}
    const user = typeof email === 'string' && db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase())
    if (!user || typeof password !== 'string' || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    res.json({ token: sign(user), user: publicUser(user) })
  })

  // Always answers 200 so the endpoint can't be used to discover which emails are registered.
  app.post('/api/auth/forgot-password', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : ''
    if (!email) return res.status(400).json({ error: 'email is required' })
    if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) {
      const otp = String(randomInt(100000, 1000000))
      db.prepare('INSERT OR REPLACE INTO password_resets (email,otpHash,expiresAt,attempts) VALUES (?,?,?,0)')
        .run(email, bcrypt.hashSync(otp, 8), Date.now() + OTP_TTL_MS)
      try {
        await sendMail({ to: email, subject: 'Your CodeArena password reset code', text: `Your code is ${otp}. It expires in 10 minutes.` })
      } catch (e) {
        console.error('forgot-password mail failed:', e.message)
      }
    }
    res.json({ ok: true })
  })

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, otp, password } = req.body ?? {}
    if (![email, otp, password].every((v) => typeof v === 'string') || password.length < 8) {
      return res.status(400).json({ error: 'email, code and a password of 8+ characters are required' })
    }
    const key = email.toLowerCase()
    const row = db.prepare('SELECT * FROM password_resets WHERE email=?').get(key)
    const invalid = () => res.status(400).json({ error: 'Invalid or expired code' })
    if (!row || row.expiresAt < Date.now() || row.attempts >= OTP_MAX_ATTEMPTS) return invalid()
    if (!bcrypt.compareSync(otp, row.otpHash)) {
      db.prepare('UPDATE password_resets SET attempts=attempts+1 WHERE email=?').run(key)
      return invalid()
    }
    db.prepare('UPDATE users SET passwordHash=? WHERE email=?').run(bcrypt.hashSync(password, 10), key)
    db.prepare('DELETE FROM password_resets WHERE email=?').run(key)
    res.json({ ok: true })
  })

  app.get('/api/users/me', auth, (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    res.json(publicUser(user))
  })

  app.put('/api/users/me', auth, (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    if (!name || name.length > 80) return res.status(400).json({ error: 'name is required (max 80 characters)' })
    db.prepare('UPDATE users SET name=? WHERE id=?').run(name, req.user.id)
    res.json(publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id)))
  })

  // Photo arrives already resized by the browser as a small data URL; cap the size and allow only image types.
  app.put('/api/users/me/avatar', auth, (req, res) => {
    const { avatar } = req.body ?? {}
    if (avatar !== null && !(typeof avatar === 'string' && avatar.length <= 80_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar))) {
      return res.status(400).json({ error: 'avatar must be a small JPEG, PNG or WebP image' })
    }
    db.prepare('UPDATE users SET avatar=? WHERE id=?').run(avatar, req.user.id)
    res.json({ ok: true })
  })

  app.post('/api/users/me/password', auth, (req, res) => {
    const { current, password } = req.body ?? {}
    if (typeof current !== 'string' || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'current password and a new password of 8+ characters are required' })
    }
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id)
    if (!user || !bcrypt.compareSync(current, user.passwordHash)) return res.status(403).json({ error: 'Current password is incorrect' })
    db.prepare('UPDATE users SET passwordHash=? WHERE id=?').run(bcrypt.hashSync(password, 10), user.id)
    res.json({ ok: true })
  })

  app.get('/api/problems', (req, res) => {
    const { q = '', difficulty, tag } = req.query
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 10))
    const rows = db.prepare('SELECT * FROM problems ORDER BY id').all().map(parseProblem)
    const filtered = rows.filter(
      (p) =>
        (!difficulty || p.difficulty === difficulty) &&
        (!tag || p.tags.includes(tag)) &&
        (p.title + p.tags.join(' ')).toLowerCase().includes(String(q).toLowerCase()),
    )
    res.json({ total: filtered.length, page, limit, items: filtered.slice((page - 1) * limit, page * limit) })
  })

  const adminOnly = (req, res, next) =>
    req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required' })

  const isJson = (s, wrap = false) => {
    try {
      const v = JSON.parse(wrap ? `[${s}]` : s)
      return !wrap || Array.isArray(v)
    } catch {
      return false
    }
  }
  const strings = (a) => Array.isArray(a) && a.every((x) => typeof x === 'string' && x.trim())
  const cases = (a, wrap) =>
    Array.isArray(a) && a.every((c) => typeof c?.input === 'string' && typeof c?.expected === 'string' && isJson(c.input, wrap) && isJson(c.expected))

  // Returns an error message, or null when the payload is valid.
  const validateProblem = (b = {}) => {
    if (typeof b.title !== 'string' || !b.title.trim() || typeof b.statement !== 'string' || !b.statement.trim()) return 'title and statement are required'
    if (!['Easy', 'Medium', 'Hard'].includes(b.difficulty)) return 'difficulty must be Easy, Medium or Hard'
    if (!strings(b.tags) || !strings(b.constraints) || !strings(b.hints)) return 'tags, constraints and hints must be lists of non-empty strings'
    if (typeof b.args !== 'string' || !/^[\w\s,]*$/.test(b.args)) return 'args must be a comma-separated list of parameter names'
    if (!cases(b.examples, true) || b.examples.length === 0) return 'at least one example is required; input is the comma-separated JSON args, expected is JSON'
    if (!cases(b.hiddenTests, false)) return 'hiddenTests input must be a JSON array of args and expected must be JSON'
    return null
  }

  const saveTests = (slug, b) => {
    db.prepare('DELETE FROM testcases WHERE problemSlug=?').run(slug)
    const ins = db.prepare('INSERT INTO testcases (problemSlug,input,expected,visibility) VALUES (?,?,?,?)')
    for (const e of b.examples) ins.run(slug, `[${e.input}]`, e.expected, 'visible')
    for (const h of b.hiddenTests) ins.run(slug, h.input, h.expected, 'hidden')
  }
  const fields = (b) => [b.title, b.difficulty, JSON.stringify(b.tags), b.statement, JSON.stringify(b.constraints),
    JSON.stringify(b.hints), JSON.stringify(b.examples), JSON.stringify(starter(b.args))]

  app.post('/api/admin/problems', auth, adminOnly, (req, res) => {
    const b = req.body ?? {}
    const err = !/^[a-z0-9-]+$/.test(b.slug ?? '') ? 'slug must be lowercase letters, digits and hyphens' : validateProblem(b)
    if (err) return res.status(400).json({ error: err })
    if (db.prepare('SELECT 1 FROM problems WHERE slug=?').get(b.slug)) return res.status(409).json({ error: 'Slug already exists' })
    db.prepare('INSERT INTO problems (title,difficulty,tags,statement,constraints,hints,examples,starterCode,slug) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(...fields(b), b.slug)
    saveTests(b.slug, b)
    res.status(201).json({ slug: b.slug })
  })

  app.put('/api/admin/problems/:slug', auth, adminOnly, (req, res) => {
    const err = validateProblem(req.body)
    if (err) return res.status(400).json({ error: err })
    const r = db.prepare('UPDATE problems SET title=?,difficulty=?,tags=?,statement=?,constraints=?,hints=?,examples=?,starterCode=? WHERE slug=?')
      .run(...fields(req.body), req.params.slug)
    if (!r.changes) return res.status(404).json({ error: 'Problem not found' })
    saveTests(req.params.slug, req.body)
    res.json({ slug: req.params.slug })
  })

  // Editor view: the public problem plus hidden tests and the parameter list. Admin only.
  app.get('/api/admin/problems/:slug', auth, adminOnly, (req, res) => {
    const row = db.prepare('SELECT * FROM problems WHERE slug=?').get(req.params.slug)
    if (!row) return res.status(404).json({ error: 'Problem not found' })
    const p = parseProblem(row)
    res.json({
      ...p,
      args: /^function solve\((.*)\)/.exec(p.starterCode.javascript)?.[1] ?? '',
      hiddenTests: db.prepare("SELECT input, expected FROM testcases WHERE problemSlug=? AND visibility='hidden'").all(p.slug),
    })
  })

  app.get('/api/problems/:slug', (req, res) => {
    const row = db.prepare('SELECT * FROM problems WHERE slug=?').get(req.params.slug)
    row ? res.json(parseProblem(row)) : res.status(404).json({ error: 'Problem not found' })
  })

  const submit = (action) => (req, res) => {
    const { problemSlug, language, sourceCode } = req.body ?? {}
    if (typeof problemSlug !== 'string' || !db.prepare('SELECT 1 FROM problems WHERE slug=?').get(problemSlug)) {
      return res.status(404).json({ error: 'Problem not found' })
    }
    if (!LANGUAGES.includes(language)) return res.status(400).json({ error: 'Unsupported language' })
    if (typeof sourceCode !== 'string' || !sourceCode.trim() || sourceCode.length > MAX_SOURCE) {
      return res.status(400).json({ error: `sourceCode must be 1-${MAX_SOURCE} characters` })
    }
    const since = new Date(Date.now() - 60_000).toISOString()
    const recent = db.prepare('SELECT COUNT(*) AS n FROM submissions WHERE userId=? AND createdAt>?').get(req.user.id, since).n
    if (recent >= MAX_PER_MINUTE) return res.status(429).json({ error: 'Too many submissions, try again in a minute' })

    const id = `sub_${randomUUID()}`
    db.prepare('INSERT INTO submissions (id,userId,problemSlug,language,sourceCode,action,status,verdict,createdAt) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(id, req.user.id, problemSlug, language, sourceCode, action, 'queued', null, new Date().toISOString())
    res.status(202).json({ submissionId: id, status: 'queued', message: 'Submission received' })

    // Hidden tests run on submit only and never leave the server.
    const tests = db.prepare('SELECT input, expected FROM testcases WHERE problemSlug=? AND (visibility=\'visible\' OR ?)')
      .all(problemSlug, action === 'submit' ? 1 : 0)
    db.prepare("UPDATE submissions SET status='running' WHERE id=?").run(id)
    Promise.resolve(judge({ language, sourceCode, tests }))
      .catch(() => 'System Error')
      .then((verdict) => db.prepare("UPDATE submissions SET status='completed', verdict=? WHERE id=?").run(verdict, id))
  }
  app.post('/api/submissions/run', auth, submit('run'))
  app.post('/api/submissions', auth, submit('submit'))

  const SUB_SELECT = 'SELECT s.*, p.title AS problemTitle FROM submissions s JOIN problems p ON p.slug=s.problemSlug'

  app.get('/api/submissions', auth, (req, res) => {
    res.json(db.prepare(`${SUB_SELECT} WHERE s.userId=? AND s.action='submit' ORDER BY s.createdAt DESC`).all(req.user.id))
  })

  app.get('/api/submissions/:id', auth, (req, res) => {
    const s = db.prepare(`${SUB_SELECT} WHERE s.id=?`).get(req.params.id)
    if (!s || (s.userId !== req.user.id && req.user.role !== 'admin')) {
      return res.status(404).json({ error: 'Submission not found' })
    }
    res.json(s)
  })

  app.get('/api/users/me/progress', auth, (req, res) => {
    const rows = db.prepare("SELECT problemSlug, verdict, createdAt FROM submissions WHERE userId=? AND action='submit'").all(req.user.id)
    const solved = new Set(rows.filter((r) => r.verdict === 'Accepted').map((r) => r.problemSlug))
    res.json({ attempts: rows.length, solved: solved.size })
  })

  app.get('/api/users/:username/profile', (req, res) => {
    const user = db.prepare('SELECT id, name, username, createdAt FROM users WHERE username=?').get(req.params.username)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const rows = db.prepare("SELECT problemSlug, verdict FROM submissions WHERE userId=? AND action='submit'").all(user.id)
    const solvedSlugs = new Set(rows.filter((r) => r.verdict === 'Accepted').map((r) => r.problemSlug))
    const topics = {}
    for (const p of db.prepare('SELECT slug, tags FROM problems').all()) {
      if (solvedSlugs.has(p.slug)) for (const t of JSON.parse(p.tags)) topics[t] = (topics[t] ?? 0) + 1
    }
    const recent = db.prepare(`
      SELECT s.problemSlug AS slug, p.title, MAX(s.createdAt) AS at
      FROM submissions s JOIN problems p ON p.slug=s.problemSlug
      WHERE s.userId=? AND s.action='submit' AND s.verdict='Accepted'
      GROUP BY s.problemSlug ORDER BY at DESC LIMIT 5`).all(user.id)
    const points = db.prepare('SELECT slug, difficulty FROM problems').all()
      .reduce((sum, p) => sum + (solvedSlugs.has(p.slug) ? POINTS[p.difficulty] ?? 0 : 0), 0)
    const days = db.prepare("SELECT DISTINCT substr(createdAt,1,10) AS d FROM submissions WHERE userId=? AND action='submit' AND verdict='Accepted'").all(user.id).map((r) => r.d)
    const { current, longest } = streaks(days, new Date().toISOString().slice(0, 10))
    res.json({
      name: user.name, username: user.username, avatar: db.prepare('SELECT avatar FROM users WHERE id=?').get(user.id).avatar ?? null,
      joinedAt: user.createdAt, attempts: rows.length, solved: solvedSlugs.size, topics, recent, points, streak: current, longestStreak: longest,
    })
  })

  app.get('/api/leaderboard', (_req, res) => {
    const rows = db.prepare(`
      SELECT u.username, COUNT(DISTINCT s.problemSlug) AS solved
      FROM users u LEFT JOIN submissions s ON s.userId=u.id AND s.action='submit' AND s.verdict='Accepted'
      GROUP BY u.id ORDER BY solved DESC, u.username LIMIT 50`).all()
    res.json(rows.map((r, i) => ({ rank: i + 1, ...r })))
  })

  return app
}
