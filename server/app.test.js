import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from './app.js'
import { openDb } from './db.js'

async function start(judge = async () => 'Accepted') {
  const server = createApp(openDb(':memory:'), { jwtSecret: 'test', judge }).listen(0)
  const base = `http://localhost:${server.address().port}`
  const call = async (path, { token, body } = {}) => {
    const res = await fetch(base + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
    })
    return { status: res.status, data: await res.json() }
  }
  return { server, call }
}

const user = { name: 'A', username: 'a', email: 'a@x.com', password: 'password1' }

test('register, login, me, and duplicate rejection', async () => {
  const { server, call } = await start()
  const reg = await call('/api/auth/register', { body: user })
  assert.equal(reg.status, 201)
  assert.equal((await call('/api/auth/register', { body: user })).status, 409)
  assert.equal((await call('/api/auth/login', { body: { email: user.email, password: 'wrong' } })).status, 401)
  const login = await call('/api/auth/login', { body: { email: user.email, password: user.password } })
  assert.equal((await call('/api/users/me', { token: login.data.token })).data.username, 'a')
  assert.equal((await call('/api/users/me')).status, 401)
  server.close()
})

test('problems list filters; submissions need auth and validation; ownership enforced', async () => {
  const { server, call } = await start()
  const easy = (await call('/api/problems?difficulty=Easy&limit=200')).data
  assert.ok(easy.total > 2 && easy.items.every((p) => p.difficulty === 'Easy'))
  assert.equal((await call('/api/problems?limit=200')).data.total, 103)
  const t1 = (await call('/api/auth/register', { body: user })).data.token
  const t2 = (await call('/api/auth/register', { body: { ...user, username: 'b', email: 'b@x.com' } })).data.token
  const sub = { problemSlug: 'two-sum', language: 'python', sourceCode: 'def solve(): pass' }
  assert.equal((await call('/api/submissions', { body: sub })).status, 401)
  assert.equal((await call('/api/submissions', { token: t1, body: { ...sub, language: 'cobol' } })).status, 400)
  const ok = await call('/api/submissions', { token: t1, body: sub })
  assert.equal(ok.status, 202)
  assert.equal((await call(`/api/submissions/${ok.data.submissionId}`, { token: t1 })).status, 200)
  assert.equal((await call(`/api/submissions/${ok.data.submissionId}`, { token: t2 })).status, 404)
  server.close()
})

test('judge gets visible tests on run, all tests on submit, and verdict is stored', async () => {
  const seen = []
  const { server, call } = await start(async ({ tests }) => (seen.push(tests.length), 'Wrong Answer'))
  const token = (await call('/api/auth/register', { body: user })).data.token
  const sub = { problemSlug: 'two-sum', language: 'python', sourceCode: 'def solve(a, b): pass' }
  await call('/api/submissions/run', { token, body: sub })
  const { data } = await call('/api/submissions', { token, body: sub })
  await new Promise((r) => setTimeout(r, 50))
  assert.deepEqual(seen, [2, 5])
  assert.equal((await call(`/api/submissions/${data.submissionId}`, { token })).data.verdict, 'Wrong Answer')
  server.close()
})

test('rate limit rejects the 11th submission in a minute', async () => {
  const { server, call } = await start()
  const token = (await call('/api/auth/register', { body: user })).data.token
  const sub = { problemSlug: 'two-sum', language: 'python', sourceCode: 'def solve(a, b): pass' }
  for (let i = 0; i < 10; i++) assert.equal((await call('/api/submissions/run', { token, body: sub })).status, 202)
  assert.equal((await call('/api/submissions/run', { token, body: sub })).status, 429)
  server.close()
})

test('profile counts solved problems by topic; unknown user is 404', async () => {
  const { server, call } = await start()
  const token = (await call('/api/auth/register', { body: user })).data.token
  const { data } = await call('/api/submissions', { token, body: { problemSlug: 'two-sum', language: 'python', sourceCode: 'def solve(a, b): pass' } })
  await new Promise((r) => setTimeout(r, 50))
  assert.equal((await call(`/api/submissions/${data.submissionId}`, { token })).data.verdict, 'Accepted')
  const p = await call('/api/users/a/profile')
  assert.deepEqual([p.data.solved, p.data.topics.Array], [1, 1])
  assert.equal((await call('/api/users/nobody/profile')).status, 404)
  server.close()
})

test('admin can create and edit problems; learners cannot; hidden tests stay private', async () => {
  const db = openDb(':memory:')
  const server = createApp(db, { jwtSecret: 'test', judge: async () => 'Accepted' }).listen(0)
  const base = `http://localhost:${server.address().port}`
  const call = async (method, path, token, body) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
    })
    return { status: res.status, data: await res.json() }
  }
  const learner = (await call('POST', '/api/auth/register', null, user)).data.token
  await call('POST', '/api/auth/register', null, { ...user, username: 'boss', email: 'boss@x.com' })
  db.prepare("UPDATE users SET role='admin' WHERE username='boss'").run()
  // role is read from the token, so log in again to pick up the new role
  const adminToken = (await call('POST', '/api/auth/login', null, { email: 'boss@x.com', password: user.password })).data.token

  const body = {
    slug: 'add', title: 'Add', difficulty: 'Easy', tags: ['Math'], statement: 'Add two numbers.',
    constraints: ['small'], hints: ['plus'], args: 'a, b',
    examples: [{ input: '1, 2', expected: '3' }], hiddenTests: [{ input: '[5,5]', expected: '10' }],
  }
  assert.equal((await call('POST', '/api/admin/problems', learner, body)).status, 403)
  assert.equal((await call('POST', '/api/admin/problems', adminToken, { ...body, hiddenTests: [{ input: 'nope', expected: '1' }] })).status, 400)
  assert.equal((await call('POST', '/api/admin/problems', adminToken, body)).status, 201)
  assert.equal((await call('POST', '/api/admin/problems', adminToken, body)).status, 409)
  assert.equal((await call('PUT', '/api/admin/problems/add', adminToken, { ...body, title: 'Add Numbers' })).status, 200)

  const pub = await call('GET', '/api/problems/add')
  assert.equal(pub.data.title, 'Add Numbers')
  assert.equal(JSON.stringify(pub.data).includes('hiddenTests'), false)
  assert.equal((await call('GET', '/api/admin/problems/add', learner)).status, 403)
  const edit = await call('GET', '/api/admin/problems/add', adminToken)
  assert.deepEqual([edit.data.args, edit.data.hiddenTests.length], ['a, b', 1])
  server.close()
})

test('google sign-in creates or reuses a user, and rejects bad or unverified credentials', async () => {
  const verifyGoogle = async (c) => {
    if (c === 'good') return { email: 'Ann.Lee@x.com', email_verified: true, name: 'Ann Lee' }
    if (c === 'unverified') return { email: 'ann@x.com', email_verified: false }
    throw new Error('bad token')
  }
  const server = createApp(openDb(':memory:'), { jwtSecret: 'test', judge: async () => 'Accepted', googleClientId: 'cid', verifyGoogle }).listen(0)
  const base = `http://localhost:${server.address().port}`
  const post = async (path, body) => {
    const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    return { status: r.status, data: await r.json() }
  }
  assert.equal((await (await fetch(base + '/api/auth/config')).json()).googleClientId, 'cid')
  const first = await post('/api/auth/google', { credential: 'good' })
  assert.equal(first.status, 200)
  assert.deepEqual([first.data.user.username, first.data.user.email, first.data.user.name], ['annlee', 'ann.lee@x.com', 'Ann Lee'])
  const again = await post('/api/auth/google', { credential: 'good' })
  assert.equal(again.data.user.id, first.data.user.id)
  assert.equal((await post('/api/auth/google', { credential: 'nope' })).status, 401)
  assert.equal((await post('/api/auth/google', { credential: 'unverified' })).status, 401)
  assert.equal((await post('/api/auth/login', { email: 'ann.lee@x.com', password: 'anything12' })).status, 401)
  server.close()
})

test('google sign-in reports not configured when no client ID is set', async () => {
  const server = createApp(openDb(':memory:'), { jwtSecret: 'test', googleClientId: undefined, verifyGoogle: null }).listen(0)
  const base = `http://localhost:${server.address().port}`
  const r = await fetch(base + '/api/auth/google', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
  assert.equal(r.status, 501)
  assert.equal((await (await fetch(base + '/api/auth/config')).json()).googleClientId, null)
  server.close()
})

test('forgot/reset password: OTP works once, wrong or unknown is rejected, old password stops working', async () => {
  const mails = []
  const server = createApp(openDb(':memory:'), { jwtSecret: 'test', sendMail: async (m) => mails.push(m) }).listen(0)
  const base = `http://localhost:${server.address().port}`
  const post = async (path, body) => {
    const res = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    return res.status
  }
  await post('/api/auth/register', user)
  assert.equal(await post('/api/auth/forgot-password', { email: 'nobody@x.com' }), 200)
  assert.equal(mails.length, 0)
  assert.equal(await post('/api/auth/forgot-password', { email: user.email }), 200)
  const otp = mails[0].text.match(/\d{6}/)[0]
  assert.equal(await post('/api/auth/reset-password', { email: user.email, otp: '000000', password: 'newpass123' }), 400)
  assert.equal(await post('/api/auth/reset-password', { email: user.email, otp, password: 'newpass123' }), 200)
  assert.equal(await post('/api/auth/reset-password', { email: user.email, otp, password: 'another123' }), 400)
  assert.equal(await post('/api/auth/login', { email: user.email, password: user.password }), 401)
  assert.equal(await post('/api/auth/login', { email: user.email, password: 'newpass123' }), 200)
  server.close()
})

test('profile edit: rename, change password needs current one, profile shows joinedAt and recent', async () => {
  const { server, call } = await start()
  const token = (await call('/api/auth/register', { body: user })).data.token
  const put = (path, body, method = 'POST') =>
    fetch(`http://localhost:${server.address().port}${path}`, {
      method, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(body),
    })
  assert.equal((await put('/api/users/me', { name: ' ' }, 'PUT')).status, 400)
  const renamed = await put('/api/users/me', { name: 'New Name' }, 'PUT')
  assert.equal((await renamed.json()).name, 'New Name')
  assert.equal((await put('/api/users/me/password', { current: 'wrong', password: 'newpass123' })).status, 403)
  assert.equal((await put('/api/users/me/password', { current: user.password, password: 'newpass123' })).status, 200)
  assert.equal((await call('/api/auth/login', { body: { email: user.email, password: 'newpass123' } })).status, 200)
  const profile = (await call('/api/users/a/profile')).data
  assert.ok(profile.joinedAt && Array.isArray(profile.recent))
  server.close()
})

test('streaks count consecutive days; current survives until a day is missed', async () => {
  const { streaks } = await import('./app.js')
  assert.deepEqual(streaks([], '2026-01-10'), { current: 0, longest: 0 })
  assert.deepEqual(streaks(['2026-01-08', '2026-01-09', '2026-01-10'], '2026-01-10'), { current: 3, longest: 3 })
  assert.deepEqual(streaks(['2026-01-08', '2026-01-09'], '2026-01-10'), { current: 2, longest: 2 })
  assert.deepEqual(streaks(['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-08'], '2026-01-10'), { current: 0, longest: 3 })
})

test('avatar: accepts small images, rejects other data, shows on profile', async () => {
  const { server, call } = await start()
  const token = (await call('/api/auth/register', { body: user })).data.token
  const put = async (avatar) =>
    (await fetch(`http://localhost:${server.address().port}/api/users/me/avatar`, {
      method: 'PUT', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ avatar }),
    })).status
  assert.equal(await put('data:text/html;base64,AAAA'), 400)
  assert.equal(await put('data:image/jpeg;base64,/9j/4AAQ'), 200)
  const profile = (await call('/api/users/a/profile')).data
  assert.equal(profile.avatar, 'data:image/jpeg;base64,/9j/4AAQ')
  assert.deepEqual([profile.points, profile.streak], [0, 0])
  assert.equal(await put(null), 200)
  server.close()
})
