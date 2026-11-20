// Runs Python via the Pyodide files copied into dist/pyodide by scripts/copy-pyodide.mjs.
let ready: Promise<{ runPython: (c: string) => unknown; globals: { set: (k: string, v: unknown) => void } }> | undefined

const load = () =>
  (ready ??= (async () => {
    const base = new URL('/pyodide/', self.location.origin).href
    const { loadPyodide } = await import(/* @vite-ignore */ `${base}pyodide.mjs`)
    return loadPyodide({ indexURL: base })
  })())

self.onmessage = async (e: MessageEvent<{ code: string; input: string }>) => {
  try {
    const p = await load()
    p.globals.set('__code', e.data.code)
    p.globals.set('__input', e.data.input)
    const out = p.runPython(`
import json
__ns = {}
try:
    exec(compile(__code, '<solution>', 'exec'), __ns)
except SyntaxError:
    __res = ['verdict', 'Compile Error']
else:
    if 'solve' not in __ns:
        __res = ['verdict', 'Compile Error']
    else:
        try:
            __res = ['out', json.dumps(__ns['solve'](*json.loads(__input)), separators=(',', ':'))]
        except BaseException:
            __res = ['verdict', 'Runtime Error']
__res
`) as { toJs: () => string[] }
    const [k, v] = out.toJs()
    self.postMessage({ [k]: v })
  } catch {
    self.postMessage({ verdict: 'System Error' })
  }
}
