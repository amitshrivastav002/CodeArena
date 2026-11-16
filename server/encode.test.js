import assert from 'node:assert/strict'
import { test } from 'node:test'
import { encodeArgs, nativeStarters } from './encode.js'

test('encodes args as plain stdin text', () => {
  assert.equal(encodeArgs([[2, 7, 11, 15], 9]), '4\n2 7 11 15\n9\n')
  assert.equal(encodeArgs(['()[]{}']), '()[]{}\n')
  assert.equal(encodeArgs([[[1, 2], [3]]]), '2\n2\n1 2\n1\n3\n')
  assert.equal(encodeArgs([[]]), '0\n\n')
})

test('native starters include a sample input taken from the first example', () => {
  const s = nativeStarters({ input: '[2,7], 9', expected: '[0,1]' })
  assert.match(s.cpp, /int main\(\)/)
  assert.match(s.java, /public class Main/)
  assert.match(s.c, /\/\/   2 7\n\/\/   9/)
  assert.match(s.c, /Expected output: \[0,1\]/)
})
