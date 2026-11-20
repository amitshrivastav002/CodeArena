import { cpSync, mkdirSync } from 'node:fs'

mkdirSync('dist/pyodide', { recursive: true })
for (const f of ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) {
  try { cpSync(`node_modules/pyodide/${f}`, `dist/pyodide/${f}`) } catch { /* not present in this pyodide version */ }
}
