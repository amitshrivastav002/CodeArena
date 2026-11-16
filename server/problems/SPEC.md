# Problem bank format

Each part file `partN.js` is an ES module: `export default [ ...problems ]`.

```js
{
  slug: 'two-sum',                 // lowercase kebab-case of the title (letters, digits, hyphens)
  title: 'Two Sum',
  difficulty: 'Easy',              // 'Easy' | 'Medium' | 'Hard'
  tags: ['Arrays', 'Hash Map'],    // 1-3 non-empty strings; FIRST tag is the level topic (see below)
  statement: 'Given ...',          // clear, self-contained, 40+ chars. State exactly how every input and the output are represented.
  constraints: ['2 <= nums.length <= 10^4'],   // 1+ strings
  hints: ['Use a hash map.'],                  // 1+ strings
  args: 'nums, target',            // comma-separated parameter names of solve(); '' if none
  tests: [                         // 5-8 argument lists. The first 2 become visible examples, the rest are hidden judge tests.
    [[2, 7, 11, 15], 9],           // each entry = the arguments, as a JS array, in order
    [[3, 2, 4], 6],
    [[3, 3], 6],                   // include edge cases in the hidden ones (empty, single item, negatives, zero, duplicates, large-ish)
    ...
  ],
  ref: (nums, target) => { ... },  // trusted reference solution. Its return value (JSON.stringify'd) is the expected output.
}
```

## Hard rules (the validator enforces most of them)

- Pure JSON values only: numbers (integers only), strings, booleans, arrays, nested arrays. **No `null`, no floats, no objects, no `undefined`, no NaN/Infinity** in any input or output.
- Use the sentinel **-1** instead of null (e.g. "absent child", "no answer"). Say so in the statement.
- `ref` must be deterministic, must return a value (never undefined), and may mutate its arguments (the validator clones them).
- The answer must be **unique**. If several answers are valid, change the problem so it is not: ask for a count, the lexicographically smallest, or require a sorted output order, and say so in the statement.
- Problems that are not naturally functions must be recast as one `solve(...)` that takes data and returns data:
  - "Print Hello World" -> `solve()` returns the string `"Hello, World!"`.
  - Data structures (stack, queue, min stack...) -> `solve(ops, values)`: operations are strings like `"push"`, `"pop"`, `"top"`, `"getMin"`; `values[i]` is the argument list for `ops[i]` (empty list if none); return the array of results, using -1 for operations that return nothing or on empty.
  - Linked lists -> the list is given as an array of its values (head first); return the resulting array. For cycle detection also take `pos` (index the tail links to, -1 for none).
  - Binary trees -> level-order array, absent node = -1 (node values are non-negative).
  - Graphs -> `n` plus an edge list or adjacency list (state which); outputs in a defined order (e.g. visit neighbours in ascending order).
  - Sorting algorithm problems -> return the sorted array.
  - Permutations/subsets/combinations -> return all results sorted lexicographically (state it).
  - Series (Fibonacci, etc.) -> return the array of terms.
- Keep inputs small enough that the reference runs instantly.
- Statements are plain text, no markdown. Write for a learner.

## Level topics (use as the FIRST tag)

1-15 `Basics`, 16-30 `Arrays`, 31-40 `Strings`, 41-50 `Searching & Sorting`, 51-60 `Linked List`,
61-70 `Stack & Queue`, 71-80 `Recursion & Backtracking`, 81-90 `Trees & Graphs`, 91-100 `Dynamic Programming`.

## Check your work

From `D:\codeplatform\server` run `node problems/validate.js problems/partN.js` (repeat until it prints `OK`).
Write your own correct reference solutions; do not copy a solution you have not reasoned through.
