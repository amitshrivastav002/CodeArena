const A = 'Arrays', S = 'Strings', SS = 'Searching & Sorting';

export default [
  {
    slug: 'find-frequency-of-each-element',
    title: 'Find Frequency of Each Element',
    difficulty: 'Easy',
    tags: [A, 'Hash Map'],
    statement: 'Given an array of integers nums, count how many times each distinct value appears. Return an array of [value, count] pairs, one pair per distinct value, sorted by value in ascending order.',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Use a map from value to count.', 'Sort the distinct values numerically before building the result.'],
    args: 'nums',
    tests: [
      [[1, 2, 2, 3, 3, 3]],
      [[5, -1, 5, -1, 0]],
      [[]],
      [[7]],
      [[4, 4, 4, 4]],
      [[10, -10, 3, 3, -10, 10, 0, 0, 0]],
    ],
    ref: (nums) => {
      const m = new Map();
      for (const x of nums) m.set(x, (m.get(x) || 0) + 1);
      return [...m.entries()].sort((a, b) => a[0] - b[0]);
    },
  },
  {
    slug: 'find-pair-with-given-sum',
    title: 'Find Pair with Given Sum',
    difficulty: 'Easy',
    tags: [A, 'Hash Map'],
    statement: 'Given an array of integers nums and an integer target, find indices i and j with i < j such that nums[i] + nums[j] == target. If several pairs exist, return the lexicographically smallest [i, j] (smallest i first, then smallest j). If no pair exists, return [-1, -1].',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4', '-2*10^4 <= target <= 2*10^4'],
    hints: ['A double loop with i < j visits pairs in lexicographic order already.', 'A hash map can find the complement in O(n) but be careful to keep the smallest i.'],
    args: 'nums, target',
    tests: [
      [[2, 7, 11, 15], 9],
      [[3, 2, 4], 6],
      [[1, 2, 3], 100],
      [[], 5],
      [[5], 10],
      [[3, 3, 3], 6],
      [[-3, 4, 3, 90], 0],
      [[1, 5, 1, 5, 6], 6],
    ],
    ref: (nums, target) => {
      for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
          if (nums[i] + nums[j] === target) return [i, j];
      return [-1, -1];
    },
  },
  {
    slug: 'merge-two-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    difficulty: 'Easy',
    tags: [A, 'Two Pointers'],
    statement: 'Given two integer arrays a and b, each sorted in non-decreasing order, return a single array containing all elements of both arrays, sorted in non-decreasing order. Duplicates are kept.',
    constraints: ['0 <= a.length, b.length <= 1000', '-10^4 <= a[i], b[i] <= 10^4'],
    hints: ['Keep one pointer in each array and always take the smaller current element.', 'Append the leftovers once one array is exhausted.'],
    args: 'a, b',
    tests: [
      [[1, 3, 5], [2, 4, 6]],
      [[1, 2, 2], [2, 3]],
      [[], [1, 2]],
      [[], []],
      [[-5, -1, 0], [-3, 0, 4]],
      [[1], [1]],
      [[1, 2, 3], [10, 20]],
    ],
    ref: (a, b) => {
      const r = [];
      let i = 0, j = 0;
      while (i < a.length && j < b.length) r.push(a[i] <= b[j] ? a[i++] : b[j++]);
      while (i < a.length) r.push(a[i++]);
      while (j < b.length) r.push(b[j++]);
      return r;
    },
  },
  {
    slug: 'maximum-subarray-sum',
    title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    tags: [A, 'Dynamic Programming'],
    statement: 'Given a non-empty array of integers nums, find the contiguous subarray (containing at least one element) with the largest sum and return that sum.',
    constraints: ['1 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Track the best sum of a subarray ending at the current index.', 'At each element, either extend the previous subarray or start fresh.'],
    args: 'nums',
    tests: [
      [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
      [[1]],
      [[5, 4, -1, 7, 8]],
      [[-3, -2, -5]],
      [[0, 0, 0]],
      [[-1, 2, -1, 2, -1]],
      [[10000, -10000, 10000]],
    ],
    ref: (nums) => {
      let cur = nums[0], best = nums[0];
      for (let i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
      }
      return best;
    },
  },
  {
    slug: 'sort-an-array-of-0s-1s-and-2s',
    title: 'Sort an Array of 0s, 1s and 2s',
    difficulty: 'Medium',
    tags: [A, 'Two Pointers'],
    statement: 'Given an array nums containing only the values 0, 1 and 2, return the array sorted in ascending order (all 0s, then all 1s, then all 2s). Try to do it in a single pass (Dutch national flag).',
    constraints: ['0 <= nums.length <= 1000', 'nums[i] is 0, 1 or 2'],
    hints: ['Keep three regions using low, mid and high pointers.', 'Counting each value and rebuilding also works.'],
    args: 'nums',
    tests: [
      [[2, 0, 2, 1, 1, 0]],
      [[2, 0, 1]],
      [[]],
      [[1]],
      [[0, 0, 0]],
      [[2, 2, 1, 1, 0, 0]],
      [[1, 2, 0, 1, 2, 0, 1, 0, 2]],
    ],
    ref: (nums) => {
      let lo = 0, mid = 0, hi = nums.length - 1;
      while (mid <= hi) {
        if (nums[mid] === 0) { [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; lo++; mid++; }
        else if (nums[mid] === 1) mid++;
        else { [nums[mid], nums[hi]] = [nums[hi], nums[mid]]; hi--; }
      }
      return nums;
    },
  },
  {
    slug: 'reverse-a-string',
    title: 'Reverse a String',
    difficulty: 'Easy',
    tags: [S, 'Two Pointers'],
    statement: 'Given a string s, return a new string with the characters of s in reverse order. All characters, including spaces, are kept.',
    constraints: ['0 <= s.length <= 1000', 's contains printable ASCII characters'],
    hints: ['Walk from the last index to the first and build the result.', 'Two pointers swapping from both ends also works.'],
    args: 's',
    tests: [
      ['hello'],
      ['Hello World'],
      [''],
      ['a'],
      ['racecar'],
      ['  ab c  '],
      ['12345!@'],
    ],
    ref: (s) => s.split('').reverse().join(''),
  },
  {
    slug: 'check-palindrome-string',
    title: 'Check Palindrome String',
    difficulty: 'Easy',
    tags: [S, 'Two Pointers'],
    statement: 'Given a string s, return true if it reads the same forwards and backwards, otherwise false. The comparison is case-sensitive and every character (including spaces and punctuation) counts. An empty string is a palindrome.',
    constraints: ['0 <= s.length <= 1000', 's contains printable ASCII characters'],
    hints: ['Compare s[i] with s[n-1-i] for the first half.', 'Or compare s with its reverse.'],
    args: 's',
    tests: [
      ['madam'],
      ['hello'],
      [''],
      ['a'],
      ['Madam'],
      ['abba'],
      ['ab ba'],
      ['a b'],
    ],
    ref: (s) => {
      for (let i = 0, j = s.length - 1; i < j; i++, j--) if (s[i] !== s[j]) return false;
      return true;
    },
  },
  {
    slug: 'count-vowels-and-consonants',
    title: 'Count Vowels and Consonants',
    difficulty: 'Easy',
    tags: [S, 'Counting'],
    statement: 'Given a string s, return [vowels, consonants] where vowels is the number of letters in s that are a, e, i, o or u (case-insensitive) and consonants is the number of other English letters (a-z, A-Z). Digits, spaces and symbols are ignored.',
    constraints: ['0 <= s.length <= 1000', 's contains printable ASCII characters'],
    hints: ['Lowercase each character first.', 'Check whether it is a letter before deciding vowel or consonant.'],
    args: 's',
    tests: [
      ['Hello World'],
      ['AEIOU'],
      [''],
      ['xyz'],
      ['123 !@#'],
      ['Programming is fun 2 do'],
      ['bcdfg'],
    ],
    ref: (s) => {
      let v = 0, c = 0;
      for (const ch of s.toLowerCase()) {
        if (ch < 'a' || ch > 'z') continue;
        if ('aeiou'.includes(ch)) v++; else c++;
      }
      return [v, c];
    },
  },
  {
    slug: 'find-duplicate-characters',
    title: 'Find Duplicate Characters',
    difficulty: 'Easy',
    tags: [S, 'Hash Map'],
    statement: 'Given a string s, return an array of the characters that appear more than once in s. Each such character appears once in the result as a 1-character string, and the result is sorted by character code in ascending order. The comparison is case-sensitive and spaces count as characters. If there are none, return an empty array.',
    constraints: ['0 <= s.length <= 1000', 's contains printable ASCII characters'],
    hints: ['Count occurrences of each character.', 'Keep those with count > 1 and sort them.'],
    args: 's',
    tests: [
      ['programming'],
      ['abcdef'],
      [''],
      ['aabbcc'],
      ['Aa'],
      ['hello world'],
      ['zzzzz'],
    ],
    ref: (s) => {
      const m = new Map();
      for (const ch of s) m.set(ch, (m.get(ch) || 0) + 1);
      return [...m.entries()].filter(e => e[1] > 1).map(e => e[0]).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    },
  },
  {
    slug: 'find-first-non-repeating-character',
    title: 'Find First Non-Repeating Character',
    difficulty: 'Easy',
    tags: [S, 'Hash Map'],
    statement: 'Given a string s, return the first character (reading left to right) that appears exactly once in s, as a 1-character string. If no such character exists, return the empty string "". The comparison is case-sensitive.',
    constraints: ['0 <= s.length <= 1000', 's contains printable ASCII characters'],
    hints: ['Count characters in a first pass.', 'Scan again and return the first one with count 1.'],
    args: 's',
    tests: [
      ['leetcode'],
      ['aabb'],
      [''],
      ['x'],
      ['aabbc'],
      ['swiss'],
      ['Aa'],
    ],
    ref: (s) => {
      const m = new Map();
      for (const ch of s) m.set(ch, (m.get(ch) || 0) + 1);
      for (const ch of s) if (m.get(ch) === 1) return ch;
      return '';
    },
  },
  {
    slug: 'check-anagram-strings',
    title: 'Check Anagram Strings',
    difficulty: 'Easy',
    tags: [S, 'Hash Map'],
    statement: 'Given two strings a and b, return true if b is an anagram of a, meaning b can be formed by rearranging all the characters of a using each character exactly as many times as it appears. The comparison is case-sensitive and spaces count as characters. Otherwise return false.',
    constraints: ['0 <= a.length, b.length <= 1000', 'Strings contain printable ASCII characters'],
    hints: ['If the lengths differ the answer is false.', 'Compare character counts, or compare the sorted strings.'],
    args: 'a, b',
    tests: [
      ['listen', 'silent'],
      ['rat', 'car'],
      ['', ''],
      ['a', 'a'],
      ['abc', 'abcd'],
      ['Listen', 'silent'],
      ['aab', 'abb'],
      ['dormitory', 'dirtyroom'],
    ],
    ref: (a, b) => a.split('').sort().join('') === b.split('').sort().join(''),
  },
  {
    slug: 'remove-spaces-from-string',
    title: 'Remove Spaces from String',
    difficulty: 'Easy',
    tags: [S, 'String Manipulation'],
    statement: 'Given a string s, return a new string with every space character (" ") removed. All other characters keep their original order.',
    constraints: ['0 <= s.length <= 1000', 's contains printable ASCII characters'],
    hints: ['Build the result by skipping characters equal to a space.'],
    args: 's',
    tests: [
      ['hello world'],
      ['  a  b  c  '],
      [''],
      ['   '],
      ['nospaces'],
      ['1 2 3 + 4'],
    ],
    ref: (s) => s.split(' ').join(''),
  },
  {
    slug: 'find-frequency-of-characters',
    title: 'Find Frequency of Characters',
    difficulty: 'Easy',
    tags: [S, 'Hash Map'],
    statement: 'Given a string s, return an array of [char, count] pairs, one pair per distinct character in s, where char is a 1-character string and count is how many times it appears. Sort the pairs by character code in ascending order. The comparison is case-sensitive and spaces count as characters.',
    constraints: ['0 <= s.length <= 1000', 's contains printable ASCII characters'],
    hints: ['Use a map from character to count.', 'Sort the distinct characters by their character code.'],
    args: 's',
    tests: [
      ['hello'],
      ['aAbB'],
      [''],
      ['a'],
      ['a b a'],
      ['mississippi'],
    ],
    ref: (s) => {
      const m = new Map();
      for (const ch of s) m.set(ch, (m.get(ch) || 0) + 1);
      return [...m.entries()].sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
    },
  },
  {
    slug: 'reverse-words-in-a-sentence',
    title: 'Reverse Words in a Sentence',
    difficulty: 'Easy',
    tags: [S, 'String Manipulation'],
    statement: 'Given a sentence s made of words separated by single spaces (no leading or trailing spaces), return the sentence with the order of the words reversed. The letters inside each word stay as they are, and words in the result are separated by single spaces. An empty sentence returns an empty string.',
    constraints: ['0 <= s.length <= 1000', 'Words are separated by exactly one space', 's has no leading or trailing spaces'],
    hints: ['Split the sentence on spaces.', 'Reverse the list of words and join with a space.'],
    args: 's',
    tests: [
      ['the sky is blue'],
      ['hello world'],
      [''],
      ['single'],
      ['a b c d e'],
      ['I love coding'],
    ],
    ref: (s) => (s === '' ? '' : s.split(' ').reverse().join(' ')),
  },
  {
    slug: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    difficulty: 'Easy',
    tags: [S, 'Arrays'],
    statement: 'Given an array of strings strs, return the longest string that is a prefix of every string in the array. If there is no common prefix, return the empty string "". If strs is empty, return "".',
    constraints: ['0 <= strs.length <= 200', '0 <= strs[i].length <= 100', 'strs[i] contains lowercase English letters'],
    hints: ['Start with the first string as the prefix.', 'Shorten it until every other string starts with it.'],
    args: 'strs',
    tests: [
      [['flower', 'flow', 'flight']],
      [['dog', 'racecar', 'car']],
      [[]],
      [['alone']],
      [['abc', 'abc', 'abc']],
      [['', 'abc']],
      [['interview', 'internet', 'interval', 'internal']],
    ],
    ref: (strs) => {
      if (strs.length === 0) return '';
      let p = strs[0];
      for (const s of strs) while (!s.startsWith(p)) p = p.slice(0, -1);
      return p;
    },
  },
  {
    slug: 'linear-search',
    title: 'Linear Search',
    difficulty: 'Medium',
    tags: [SS, 'Arrays'],
    statement: 'Given an integer array nums and an integer target, scan the array from left to right and return the index of the first element equal to target. If target is not present, return -1.',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i], target <= 10^4'],
    hints: ['Check each element in order and stop at the first match.'],
    args: 'nums, target',
    tests: [
      [[4, 2, 7, 1], 7],
      [[4, 2, 7, 1], 9],
      [[], 1],
      [[5, 5, 5], 5],
      [[-3, 0, 3], -3],
      [[1, 2, 3, 4], 4],
    ],
    ref: (nums, target) => nums.indexOf(target),
  },
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Medium',
    tags: [SS, 'Binary Search'],
    statement: 'Given an integer array nums sorted in strictly ascending order (all values distinct) and an integer target, return the index of target in nums using binary search. If target is not present, return -1.',
    constraints: ['0 <= nums.length <= 10^4', 'nums is strictly increasing', '-10^4 <= nums[i], target <= 10^4'],
    hints: ['Keep lo and hi bounds and look at the middle element.', 'Discard the half that cannot contain target.'],
    args: 'nums, target',
    tests: [
      [[-1, 0, 3, 5, 9, 12], 9],
      [[-1, 0, 3, 5, 9, 12], 2],
      [[], 4],
      [[5], 5],
      [[5], 3],
      [[1, 2, 3, 4, 5, 6, 7], 1],
      [[1, 2, 3, 4, 5, 6, 7], 7],
    ],
    ref: (nums, target) => {
      let lo = 0, hi = nums.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
      }
      return -1;
    },
  },
  {
    slug: 'first-and-last-position-of-element',
    title: 'First and Last Position of Element',
    difficulty: 'Medium',
    tags: [SS, 'Binary Search'],
    statement: 'Given an integer array nums sorted in non-decreasing order (duplicates allowed) and an integer target, return [first, last] where first and last are the lowest and highest indices at which target appears. If target is not present, return [-1, -1].',
    constraints: ['0 <= nums.length <= 10^4', 'nums is sorted in non-decreasing order', '-10^4 <= nums[i], target <= 10^4'],
    hints: ['Run a binary search twice: once for the leftmost and once for the rightmost position.', 'When you find a match, keep searching on one side.'],
    args: 'nums, target',
    tests: [
      [[5, 7, 7, 8, 8, 10], 8],
      [[5, 7, 7, 8, 8, 10], 6],
      [[], 0],
      [[1], 1],
      [[2, 2, 2, 2], 2],
      [[1, 2, 3], 3],
      [[1, 1, 2, 3, 3, 3], 1],
    ],
    ref: (nums, target) => {
      const first = nums.indexOf(target);
      if (first === -1) return [-1, -1];
      return [first, nums.lastIndexOf(target)];
    },
  },
  {
    slug: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: [SS, 'Binary Search'],
    statement: 'A strictly ascending array of distinct integers was rotated at an unknown pivot, for example [0,1,2,4,5,6,7] may become [4,5,6,7,0,1,2]. Given the rotated array nums and an integer target, return the index of target in nums, or -1 if it is not present. Aim for O(log n) time.',
    constraints: ['0 <= nums.length <= 5000', 'All values in nums are distinct', '-10^4 <= nums[i], target <= 10^4'],
    hints: ['At every step, one half of the current range is sorted.', 'Check whether target lies inside the sorted half to choose which half to keep.'],
    args: 'nums, target',
    tests: [
      [[4, 5, 6, 7, 0, 1, 2], 0],
      [[4, 5, 6, 7, 0, 1, 2], 3],
      [[1], 0],
      [[1], 1],
      [[], 5],
      [[3, 1], 1],
      [[1, 2, 3, 4, 5], 4],
      [[6, 7, 1, 2, 3, 4, 5], 6],
    ],
    ref: (nums, target) => {
      let lo = 0, hi = nums.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[lo] <= nums[mid]) {
          if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
        } else {
          if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
        }
      }
      return -1;
    },
  },
  {
    slug: 'bubble-sort',
    title: 'Bubble Sort',
    difficulty: 'Medium',
    tags: [SS, 'Sorting'],
    statement: 'Sort the integer array nums in ascending order using bubble sort (repeatedly swap adjacent elements that are out of order) and return the sorted array.',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['After each pass the largest remaining element reaches its final position.', 'Stop early if a pass makes no swaps.'],
    args: 'nums',
    tests: [
      [[5, 1, 4, 2, 8]],
      [[3, 2, 1]],
      [[]],
      [[7]],
      [[1, 2, 3, 4]],
      [[2, 2, 1, 1, 0, -1]],
      [[-5, 10, -5, 0, 3]],
    ],
    ref: (nums) => {
      const n = nums.length;
      for (let i = 0; i < n - 1; i++) {
        let sw = false;
        for (let j = 0; j < n - 1 - i; j++)
          if (nums[j] > nums[j + 1]) { [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]]; sw = true; }
        if (!sw) break;
      }
      return nums;
    },
  },
  {
    slug: 'selection-sort',
    title: 'Selection Sort',
    difficulty: 'Medium',
    tags: [SS, 'Sorting'],
    statement: 'Sort the integer array nums in ascending order using selection sort (repeatedly select the minimum of the unsorted part and move it to the front) and return the sorted array.',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['For each position i, find the index of the smallest element in nums[i..].', 'Swap it into position i.'],
    args: 'nums',
    tests: [
      [[64, 25, 12, 22, 11]],
      [[3, 1, 2]],
      [[]],
      [[9]],
      [[1, 1, 1]],
      [[5, 4, 3, 2, 1]],
      [[0, -2, 8, -2, 4]],
    ],
    ref: (nums) => {
      for (let i = 0; i < nums.length - 1; i++) {
        let m = i;
        for (let j = i + 1; j < nums.length; j++) if (nums[j] < nums[m]) m = j;
        [nums[i], nums[m]] = [nums[m], nums[i]];
      }
      return nums;
    },
  },
  {
    slug: 'insertion-sort',
    title: 'Insertion Sort',
    difficulty: 'Medium',
    tags: [SS, 'Sorting'],
    statement: 'Sort the integer array nums in ascending order using insertion sort (grow a sorted prefix by inserting each next element into its correct place) and return the sorted array.',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Take nums[i] as a key and shift larger elements of the sorted prefix one step right.', 'Drop the key into the gap.'],
    args: 'nums',
    tests: [
      [[12, 11, 13, 5, 6]],
      [[4, 3, 2, 1]],
      [[]],
      [[2]],
      [[1, 2, 3]],
      [[3, 3, 1, 1, 2]],
      [[-1, -10, 5, 0]],
    ],
    ref: (nums) => {
      for (let i = 1; i < nums.length; i++) {
        const key = nums[i];
        let j = i - 1;
        while (j >= 0 && nums[j] > key) { nums[j + 1] = nums[j]; j--; }
        nums[j + 1] = key;
      }
      return nums;
    },
  },
  {
    slug: 'merge-sort',
    title: 'Merge Sort',
    difficulty: 'Medium',
    tags: [SS, 'Sorting', 'Divide and Conquer'],
    statement: 'Sort the integer array nums in ascending order using merge sort (split in halves, sort each half recursively, then merge) and return the sorted array.',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['The base case is an array of length 0 or 1.', 'Merging two sorted halves takes linear time with two pointers.'],
    args: 'nums',
    tests: [
      [[38, 27, 43, 3, 9, 82, 10]],
      [[5, 2, 4, 6, 1, 3]],
      [[]],
      [[1]],
      [[2, 1]],
      [[4, 4, 4, 1, 1]],
      [[-3, 7, -8, 0, 7, -3]],
    ],
    ref: (nums) => {
      const sort = (a) => {
        if (a.length <= 1) return a;
        const mid = a.length >> 1;
        const l = sort(a.slice(0, mid)), r = sort(a.slice(mid));
        const out = [];
        let i = 0, j = 0;
        while (i < l.length && j < r.length) out.push(l[i] <= r[j] ? l[i++] : r[j++]);
        while (i < l.length) out.push(l[i++]);
        while (j < r.length) out.push(r[j++]);
        return out;
      };
      return sort(nums);
    },
  },
  {
    slug: 'quick-sort',
    title: 'Quick Sort',
    difficulty: 'Medium',
    tags: [SS, 'Sorting', 'Divide and Conquer'],
    statement: 'Sort the integer array nums in ascending order using quick sort (pick a pivot, partition the elements around it, and sort the two sides recursively) and return the sorted array.',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Partition so that smaller elements come before the pivot and larger ones after.', 'Recurse on the left and right parts.'],
    args: 'nums',
    tests: [
      [[10, 7, 8, 9, 1, 5]],
      [[3, 6, 8, 10, 1, 2, 1]],
      [[]],
      [[42]],
      [[1, 2, 3, 4, 5]],
      [[5, 4, 3, 2, 1]],
      [[0, 0, -1, -1, 2, 2]],
    ],
    ref: (nums) => {
      const qs = (lo, hi) => {
        if (lo >= hi) return;
        const p = nums[hi];
        let i = lo;
        for (let j = lo; j < hi; j++)
          if (nums[j] < p) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; }
        [nums[i], nums[hi]] = [nums[hi], nums[i]];
        qs(lo, i - 1);
        qs(i + 1, hi);
      };
      qs(0, nums.length - 1);
      return nums;
    },
  },
  {
    slug: 'find-kth-largest-element',
    title: 'Find Kth Largest Element',
    difficulty: 'Medium',
    tags: [SS, 'Sorting'],
    statement: 'Given an integer array nums and an integer k, return the kth largest value in nums, where k = 1 means the largest. Duplicates are counted separately: in [3,3,2], the 1st and 2nd largest are both 3 and the 3rd largest is 2.',
    constraints: ['1 <= k <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Sorting in descending order and taking index k-1 works.', 'A min-heap of size k or quickselect is faster.'],
    args: 'nums, k',
    tests: [
      [[3, 2, 1, 5, 6, 4], 2],
      [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4],
      [[1], 1],
      [[3, 3, 2], 2],
      [[3, 3, 2], 3],
      [[-1, -5, -3], 1],
      [[7, 7, 7, 7], 4],
    ],
    ref: (nums, k) => nums.slice().sort((a, b) => b - a)[k - 1],
  },
];
