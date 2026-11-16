export interface WalkStep {
  line: number // 0-based index into code
  note: string
  vars: Record<string, string>
  index?: number // highlighted index in the array strip
}

export interface Walkthrough {
  title: string
  array: number[]
  code: string[]
  steps: WalkStep[]
}

export const walkthroughs: Record<string, Walkthrough> = {
  'two-sum': {
    title: 'Two Sum with a hash map',
    array: [2, 7, 11, 15],
    code: [
      'function twoSum(nums, target) {',
      '  const seen = new Map()',
      '  for (let i = 0; i < nums.length; i++) {',
      '    const need = target - nums[i]',
      '    if (seen.has(need)) return [seen.get(need), i]',
      '    seen.set(nums[i], i)',
      '  }',
      '}',
    ],
    steps: [
      { line: 1, note: 'Start with an empty map. It remembers every number we have already looked at, and where.', vars: { target: '9', seen: '{ }' } },
      { line: 2, note: 'Walk through the array one number at a time. First stop: index 0.', vars: { target: '9', i: '0', seen: '{ }' }, index: 0 },
      { line: 3, note: 'Which number would pair with 2 to reach 9? 9 - 2 = 7.', vars: { target: '9', i: '0', need: '7', seen: '{ }' }, index: 0 },
      { line: 4, note: 'Have we seen 7 yet? No, the map is empty, so keep going.', vars: { target: '9', i: '0', need: '7', seen: '{ }' }, index: 0 },
      { line: 5, note: 'Remember 2 and its index, so a later number can find it.', vars: { target: '9', i: '0', need: '7', seen: '{ 2: 0 }' }, index: 0 },
      { line: 2, note: 'Next number, index 1.', vars: { target: '9', i: '1', seen: '{ 2: 0 }' }, index: 1 },
      { line: 3, note: 'Which number pairs with 7? 9 - 7 = 2.', vars: { target: '9', i: '1', need: '2', seen: '{ 2: 0 }' }, index: 1 },
      { line: 4, note: 'We have seen 2 at index 0. Return [0, 1]. Solved in one pass.', vars: { target: '9', i: '1', need: '2', seen: '{ 2: 0 }', result: '[0, 1]' }, index: 1 },
    ],
  },
}
