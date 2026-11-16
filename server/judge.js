// Runs submitted code on a Judge0 instance (isolated sandbox). The API process never executes user code.
// Config: JUDGE0_URL (required), JUDGE0_KEY (optional, sent as X-Auth-Token).
import { encodeArgs } from './encode.js'

const LANGUAGE_IDS = { javascript: 63, python: 71, java: 62, cpp: 54, c: 50 }

// Wraps the user's solve() so Judge0 can feed JSON args on stdin and read the JSON result from stdout.
const harness = {
  javascript: (code) =>
    `${code}\n;(() => { const a = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(JSON.stringify(solve(...a))) })()\n`,
  python: (code) =>
    `${code}\nimport sys, json\nprint(json.dumps(solve(*json.loads(sys.stdin.read())), separators=(',', ':')))\n`,
}

const normalize = (s) => {
  try {
    return JSON.stringify(JSON.parse(s))
  } catch {
    return String(s).trim()
  }
}

async function runOne({ url, key }, language, sourceCode, input) {
  const stdin = harness[language] ? input : encodeArgs(JSON.parse(input))
  const res = await fetch(`${url}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(key && { 'X-Auth-Token': key }) },
    body: JSON.stringify({
      source_code: harness[language]?.(sourceCode) ?? sourceCode,
      language_id: LANGUAGE_IDS[language],
      stdin,
      cpu_time_limit: 2,
      memory_limit: language === 'java' ? 256000 : 128000,
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Judge0 responded ${res.status}`)
  return res.json()
}

// tests: [{ input, expected }] where input is the JSON args array as a string. Returns a verdict string.
export function createJudge({ url = process.env.JUDGE0_URL, key = process.env.JUDGE0_KEY } = {}) {
  return async function judge({ language, sourceCode, tests }) {
    if (!url) return 'System Error'
    try {
      for (const t of tests) {
        const r = await runOne({ url, key }, language, sourceCode, t.input)
        const id = r.status?.id
        if (id === 6) return 'Compile Error'
        if (id === 5) return 'Time Limit Exceeded'
        if (id >= 7) return 'Runtime Error'
        if (id !== 3 || normalize(r.stdout ?? '') !== normalize(t.expected)) return 'Wrong Answer'
      }
      return 'Accepted'
    } catch {
      return 'System Error'
    }
  }
}
