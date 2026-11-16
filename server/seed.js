import bank from './problems/index.js'

export const starter = (args) => ({
  javascript: `function solve(${args}) {\n  // your code\n}\n`,
  python: `def solve(${args}):\n    # your code\n    pass\n`,
})

const problems = [
  { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Map'],
    statement: 'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
    constraints: ['2 <= nums.length <= 10^4', 'Exactly one solution exists'],
    hints: ['Use a hash map to store values you have seen.'],
    examples: [{ input: '[2,7,11,15], 9', expected: '[0,1]' }, { input: '[3,2,4], 6', expected: '[1,2]' }],
    starterCode: starter('nums, target') },
  { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', tags: ['String', 'Stack'],
    statement: 'Given a string of brackets, determine whether it is valid.',
    constraints: ['1 <= s.length <= 10^4'], hints: ['A stack matches the most recent opening bracket.'],
    examples: [{ input: '"()[]{}"', expected: 'true' }, { input: '"(]"', expected: 'false' }],
    starterCode: starter('s') },
  { slug: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium',
    tags: ['String', 'Sliding Window'],
    statement: 'Return the length of the longest substring without repeating characters.',
    constraints: ['0 <= s.length <= 5 * 10^4'], hints: ['Track the last index of each character with two pointers.'],
    examples: [{ input: '"abcabcbb"', expected: '3' }, { input: '"bbbbb"', expected: '1' }],
    starterCode: starter('s') },
  { slug: 'merge-k-lists', title: 'Merge k Sorted Lists', difficulty: 'Hard', tags: ['Linked List', 'Heap'],
    statement: 'Merge k sorted linked lists into one sorted list.',
    constraints: ['0 <= k <= 10^4'], hints: ['A min-heap keeps the smallest head available.'],
    examples: [{ input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' }],
    starterCode: starter('lists') },
]

// Hidden judge cases: input is the JSON array of solve() arguments, expected is the JSON result.
const hidden = {
  'two-sum': [['[[3,3],6]', '[0,1]'], ['[[1,5,9,13],14]', '[1,2]'], ['[[-1,-2,-3,-4,-5],-8]', '[2,4]']],
  'valid-parentheses': [['["{[]}"]', 'true'], ['["((("]', 'false'], ['["([)]"]', 'false']],
  'longest-substring': [['["pwwkew"]', '3'], ['[""]', '0'], ['["dvdf"]', '3']],
  'merge-k-lists': [['[[[1,2],[3]]]', '[1,2,3]'], ['[[[],[]]]', '[]'], ['[[]]', '[]']],
}

const clone = (v) => JSON.parse(JSON.stringify(v))

// Bank problems keep a reference solution; expected outputs are computed from it, never typed by hand.
const fromBank = (b) => {
  const expected = (t) => JSON.stringify(b.ref(...clone(t)))
  return {
    problem: {
      slug: b.slug, title: b.title, difficulty: b.difficulty, tags: b.tags, statement: b.statement,
      constraints: b.constraints, hints: b.hints, starterCode: starter(b.args),
      examples: b.tests.slice(0, 2).map((t) => ({ input: t.map((a) => JSON.stringify(a)).join(', '), expected: expected(t) })),
    },
    hidden: b.tests.slice(2).map((t) => [JSON.stringify(t), expected(t)]),
  }
}

const all = [...problems.map((p) => ({ problem: p, hidden: hidden[p.slug] ?? [] })), ...bank.map(fromBank)]

// Idempotent: adds any problem or test set that is missing, never overwrites existing rows.
export function seedProblems(db) {
  const hasProblem = db.prepare('SELECT 1 FROM problems WHERE slug=?')
  const hasTests = db.prepare('SELECT 1 FROM testcases WHERE problemSlug=?')
  const insProblem = db.prepare(
    'INSERT INTO problems (slug,title,difficulty,tags,statement,constraints,hints,examples,starterCode) VALUES (?,?,?,?,?,?,?,?,?)',
  )
  const insTest = db.prepare('INSERT INTO testcases (problemSlug,input,expected,visibility) VALUES (?,?,?,?)')

  db.exec('BEGIN')
  for (const { problem: p, hidden: h } of all) {
    if (!hasProblem.get(p.slug)) {
      insProblem.run(p.slug, p.title, p.difficulty, JSON.stringify(p.tags), p.statement,
        JSON.stringify(p.constraints), JSON.stringify(p.hints), JSON.stringify(p.examples), JSON.stringify(p.starterCode))
    }
    if (!hasTests.get(p.slug)) {
      for (const e of p.examples) insTest.run(p.slug, `[${e.input}]`, e.expected, 'visible')
      for (const [input, expected] of h) insTest.run(p.slug, input, expected, 'hidden')
    }
  }
  db.exec('COMMIT')
}
