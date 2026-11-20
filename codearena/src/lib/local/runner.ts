// On-device judge: JavaScript runs in a Web Worker, Python in Pyodide (bundled), C/C++/Java through Judge0 (needs internet).
import { encodeArgs } from './encode'

export interface Test { input: string; expected: string }
type Outcome = { ok: true; out: string } | { ok: false; verdict: string }

const normalize = (s: string) => {
  try { return JSON.stringify(JSON.parse(s)) } catch { return String(s).trim() }
}

const JS_WORKER = `
onmessage = (e) => {
  const { code, input } = e.data
  let solve
  try { solve = new Function(code + '\\n;return typeof solve === "function" ? solve : undefined')() }
  catch (err) { return postMessage({ verdict: 'Compile Error' }) }
  if (!solve) return postMessage({ verdict: 'Compile Error' })
  try { postMessage({ out: JSON.stringify(solve(...JSON.parse(input))) }) }
  catch (err) { postMessage({ verdict: 'Runtime Error' }) }
}`
const jsWorkerUrl = URL.createObjectURL(new Blob([JS_WORKER], { type: 'text/javascript' }))

function runWorker(worker: Worker, msg: unknown, ms: number): Promise<Outcome> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { worker.terminate(); resolve({ ok: false, verdict: 'Time Limit Exceeded' }) }, ms)
    worker.onmessage = (e) => {
      clearTimeout(timer)
      resolve(e.data.verdict ? { ok: false, verdict: e.data.verdict } : { ok: true, out: e.data.out ?? 'undefined' })
    }
    worker.onerror = () => { clearTimeout(timer); worker.terminate(); resolve({ ok: false, verdict: 'Runtime Error' }) }
    worker.postMessage(msg)
  })
}

const runJs = async (code: string, input: string): Promise<Outcome> => {
  const w = new Worker(jsWorkerUrl)
  const r = await runWorker(w, { code, input }, 3000)
  w.terminate()
  return r
}

let py: Worker | null = null
const runPy = async (code: string, input: string): Promise<Outcome> => {
  if (!py) py = new Worker(new URL('./pyWorker.ts', import.meta.url), { type: 'module' })
  const w = py
  // First call also loads the interpreter, so allow extra time.
  const r = await runWorker(w, { code, input }, 20000)
  if (!r.ok && r.verdict === 'Time Limit Exceeded') py = null
  return r
}

const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)))
const JUDGE0 = 'https://ce.judge0.com'
const LANGUAGE_IDS = { java: 62, cpp: 54, c: 50 } as const
const runJudge0 = async (language: 'java' | 'cpp' | 'c', code: string, input: string): Promise<Outcome> => {
  const res = await fetch(`${JUDGE0}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_code: b64(code), language_id: LANGUAGE_IDS[language], stdin: b64(encodeArgs(JSON.parse(input))), cpu_time_limit: 2 }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Judge0 responded ${res.status}`)
  const r = await res.json()
  const id = r.status?.id
  if (id === 6) return { ok: false, verdict: 'Compile Error' }
  if (id === 5) return { ok: false, verdict: 'Time Limit Exceeded' }
  if (id >= 7) return { ok: false, verdict: 'Runtime Error' }
  return { ok: true, out: r.stdout ? new TextDecoder().decode(Uint8Array.from(atob(r.stdout), (c) => c.charCodeAt(0))) : '' }
}

export async function judge(language: string, code: string, tests: Test[]): Promise<string> {
  try {
    for (const t of tests) {
      const r = language === 'javascript' ? await runJs(code, t.input)
        : language === 'python' ? await runPy(code, t.input)
        : await runJudge0(language as 'java' | 'cpp' | 'c', code, t.input)
      if (!r.ok) return r.verdict
      if (normalize(r.out) !== normalize(t.expected)) return 'Wrong Answer'
    }
    return 'Accepted'
  } catch {
    return language === 'javascript' || language === 'python' ? 'System Error' : 'System Error (Java, C and C++ need an internet connection)'
  }
}
