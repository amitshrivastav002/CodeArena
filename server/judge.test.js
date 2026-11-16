import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createJudge } from './judge.js'

const real = globalThis.fetch
afterEach(() => { globalThis.fetch = real })

const stub = (responses) => {
  globalThis.fetch = async () => ({ ok: true, json: async () => responses.shift() })
}
const args = { language: 'python', sourceCode: 'x', tests: [{ input: '[1]', expected: '[1,2]' }] }

test('accepts when stdout matches expected JSON', async () => {
  stub([{ status: { id: 3 }, stdout: '[1, 2]\n' }])
  assert.equal(await createJudge({ url: 'http://j' })(args), 'Accepted')
})

test('maps Judge0 statuses to verdicts', async () => {
  const judge = createJudge({ url: 'http://j' })
  stub([{ status: { id: 3 }, stdout: '[2]' }])
  assert.equal(await judge(args), 'Wrong Answer')
  stub([{ status: { id: 6 } }])
  assert.equal(await judge(args), 'Compile Error')
  stub([{ status: { id: 5 } }])
  assert.equal(await judge(args), 'Time Limit Exceeded')
  stub([{ status: { id: 11 } }])
  assert.equal(await judge(args), 'Runtime Error')
})

test('reports System Error when Judge0 is not configured or unreachable', async () => {
  assert.equal(await createJudge({ url: '' })(args), 'System Error')
  globalThis.fetch = async () => { throw new Error('down') }
  assert.equal(await createJudge({ url: 'http://j' })(args), 'System Error')
})

test('C-family languages send the raw source with plain-text stdin and the right language id', async () => {
  const sent = []
  globalThis.fetch = async (_u, opts) => {
    sent.push(JSON.parse(opts.body))
    return { ok: true, json: async () => ({ status: { id: 3 }, stdout: '[0,1]\n' }) }
  }
  const judge = createJudge({ url: 'http://j' })
  const tests = [{ input: '[[2,7],9]', expected: '[0,1]' }]
  for (const [language, id] of [['java', 62], ['cpp', 54], ['c', 50]]) {
    assert.equal(await judge({ language, sourceCode: 'SRC', tests }), 'Accepted')
    const body = sent.at(-1)
    assert.deepEqual([body.language_id, body.source_code, body.stdin], [id, 'SRC', '2\n2 7\n9\n'])
  }
})
