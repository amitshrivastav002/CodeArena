// Usage: node problems/validate.js problems/part1.js [problems/part2.js ...]
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const files = process.argv.slice(2)
const errors = []
const slugs = new Set()
let count = 0

const bad = (p, msg) => errors.push(`${p?.slug ?? p?.title ?? '?'}: ${msg}`)
const strs = (a) => Array.isArray(a) && a.length > 0 && a.every((s) => typeof s === 'string' && s.trim())
const clone = (v) => JSON.parse(JSON.stringify(v))

const checkValue = (v, where) => {
  const s = JSON.stringify(v)
  if (s === undefined) return `${where} is undefined`
  if (/null/.test(s)) return `${where} contains null/NaN/Infinity: ${s.slice(0, 60)}`
  if (/\d\.\d|\de[+-]?\d/i.test(s.replace(/"(?:[^"\\]|\\.)*"/g, '""'))) return `${where} contains a non-integer number: ${s.slice(0, 60)}`
  return null
}

for (const f of files) {
  const mod = await import(pathToFileURL(resolve(f)).href)
  if (!Array.isArray(mod.default)) {
    errors.push(`${f}: default export must be an array`)
    continue
  }
  for (const p of mod.default) {
    count++
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug ?? '')) bad(p, 'bad slug')
    if (slugs.has(p.slug)) bad(p, 'duplicate slug')
    slugs.add(p.slug)
    if (typeof p.title !== 'string' || !p.title.trim()) bad(p, 'missing title')
    if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) bad(p, 'bad difficulty')
    if (!strs(p.tags) || p.tags.length > 3) bad(p, 'tags must be 1-3 non-empty strings')
    if (typeof p.statement !== 'string' || p.statement.trim().length < 40) bad(p, 'statement too short')
    if (!strs(p.constraints)) bad(p, 'constraints must be a non-empty list of strings')
    if (!strs(p.hints)) bad(p, 'hints must be a non-empty list of strings')
    if (typeof p.args !== 'string' || !/^[A-Za-z_]\w*(\s*,\s*[A-Za-z_]\w*)*$|^$/.test(p.args)) bad(p, 'bad args')
    if (typeof p.ref !== 'function') {
      bad(p, 'ref must be a function')
      continue
    }
    if (!Array.isArray(p.tests) || p.tests.length < 5 || p.tests.length > 8) {
      bad(p, 'tests must have 5-8 entries')
      continue
    }
    const arity = p.args.split(',').filter((s) => s.trim()).length
    const seen = new Set()
    p.tests.forEach((t, i) => {
      if (!Array.isArray(t) || t.length !== arity) return bad(p, `test ${i} must be an array of ${arity} argument(s)`)
      const key = JSON.stringify(t)
      if (seen.has(key)) bad(p, `test ${i} is a duplicate`)
      seen.add(key)
      const inErr = checkValue(t, `test ${i} input`)
      if (inErr && !(t.length === 0)) return bad(p, inErr)
      try {
        const a = p.ref(...clone(t))
        const b = p.ref(...clone(t))
        const outErr = checkValue(a, `test ${i} output`)
        if (outErr) return bad(p, outErr)
        if (JSON.stringify(a) !== JSON.stringify(b)) bad(p, `test ${i} is not deterministic`)
      } catch (e) {
        bad(p, `ref threw on test ${i}: ${e.message}`)
      }
    })
    const outs = new Set(p.tests.map((t) => { try { return JSON.stringify(p.ref(...clone(t))) } catch { return 'x' } }))
    if (outs.size < 2) bad(p, 'all tests have the same expected output; make them varied')
  }
}

if (errors.length) {
  console.log(errors.join('\n'))
  console.log(`\n${errors.length} problem(s) with errors, ${count} checked`)
  process.exit(1)
}
console.log(`OK (${count} problems)`)
