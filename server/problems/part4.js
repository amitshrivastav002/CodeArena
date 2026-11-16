// Problems 76-100: Recursion & Backtracking, Trees & Graphs, Dynamic Programming

const cmpArr = (a, b) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
};

const parseBoard = (s) => {
  const rows = [];
  for (let i = 0; i < 9; i++) rows.push([...s.slice(i * 9, i * 9 + 9)].map((c) => (c === '.' ? 0 : Number(c))));
  return rows;
};

const solveSudoku = (board) => {
  const ok = (r, c, v) => {
    for (let i = 0; i < 9; i++) {
      if (board[r][i] === v || board[i][c] === v) return false;
      if (board[3 * Math.floor(r / 3) + Math.floor(i / 3)][3 * Math.floor(c / 3) + (i % 3)] === v) return false;
    }
    return true;
  };
  const go = () => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (board[r][c] === 0) {
          for (let v = 1; v <= 9; v++)
            if (ok(r, c, v)) {
              board[r][c] = v;
              if (go()) return true;
              board[r][c] = 0;
            }
          return false;
        }
    return true;
  };
  go();
  return board;
};

const WIKI = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
const EULER = '003020600900305001001806400008102900700000008006708200002609500800203009005010300';
const wikiPuzzle = () => parseBoard(WIKI);
const wikiSolved = () => solveSudoku(parseBoard(WIKI));
// puzzle with extra clues copied from the unique solution (stays unique)
const wikiMoreClues = () => {
  const sol = wikiSolved();
  const b = wikiPuzzle();
  for (const [r, c] of [[0, 2], [1, 1], [2, 0], [4, 4], [5, 5], [6, 6], [8, 8], [7, 3], [3, 7]]) b[r][c] = sol[r][c];
  return b;
};
const wikiOneEmpty = () => {
  const b = wikiSolved();
  b[4][4] = 0;
  return b;
};

export default [
  // ---------------------------------------------------------------- 76
  {
    slug: 'generate-all-permutations',
    title: 'Generate All Permutations',
    difficulty: 'Medium',
    tags: ['Recursion & Backtracking', 'Permutations'],
    statement:
      'Given an array nums of distinct non-negative integers, return every possible permutation (ordering) of its elements as an array of arrays. The list of permutations must be sorted lexicographically: compare two permutations element by element as numbers, and the first position where they differ decides which comes first.',
    constraints: ['1 <= nums.length <= 6', '0 <= nums[i] <= 100', 'All values in nums are distinct'],
    hints: [
      'Build a permutation one position at a time, tracking which elements are already used.',
      'Backtrack: choose an unused element, recurse, then undo the choice.',
      'If you sort nums first and try elements in order, results come out already sorted.',
    ],
    args: 'nums',
    tests: [[[1, 2, 3]], [[5, 4]], [[7]], [[3, 1, 2, 4]], [[0, 10, 5]], [[2, 1, 4, 3, 5]], [[10, 9, 100]]],
    ref: (nums) => {
      const a = [...nums].sort((x, y) => x - y);
      const res = [];
      const used = new Array(a.length).fill(false);
      const cur = [];
      const go = () => {
        if (cur.length === a.length) {
          res.push([...cur]);
          return;
        }
        for (let i = 0; i < a.length; i++) {
          if (used[i]) continue;
          used[i] = true;
          cur.push(a[i]);
          go();
          cur.pop();
          used[i] = false;
        }
      };
      go();
      return res;
    },
  },
  // ---------------------------------------------------------------- 77
  {
    slug: 'combination-sum',
    title: 'Combination Sum',
    difficulty: 'Medium',
    tags: ['Recursion & Backtracking', 'Combinations'],
    statement:
      'Given an array candidates of distinct positive integers and a positive integer target, return all unique combinations of candidates whose sum equals target. Each candidate may be used any number of times. Two combinations are the same if they use each number the same number of times, so order inside a combination does not matter: write every combination in ascending order. Return the list of combinations sorted lexicographically (compare element by element as numbers; a shorter combination that is a prefix of a longer one comes first). If no combination exists, return an empty array.',
    constraints: ['1 <= candidates.length <= 8', '1 <= candidates[i] <= 30, all distinct', '1 <= target <= 30'],
    hints: [
      'Sort the candidates, then at each step decide which candidate index to use next.',
      'Recurse with the same index to allow reuse; move to a later index to avoid duplicate combinations.',
      'Stop exploring when the remaining target becomes negative.',
    ],
    args: 'candidates, target',
    tests: [
      [[2, 3, 6, 7], 7],
      [[2, 3, 5], 8],
      [[2], 1],
      [[1], 3],
      [[7, 3, 2], 18],
      [[5, 10], 4],
      [[4, 2, 8], 8],
      [[1, 2, 3], 6],
    ],
    ref: (candidates, target) => {
      const c = [...candidates].sort((a, b) => a - b);
      const res = [];
      const cur = [];
      const go = (start, rem) => {
        if (rem === 0) {
          res.push([...cur]);
          return;
        }
        for (let i = start; i < c.length; i++) {
          if (c[i] > rem) break;
          cur.push(c[i]);
          go(i, rem - c[i]);
          cur.pop();
        }
      };
      go(0, target);
      const cmp = (a, b) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
        return a.length - b.length;
      };
      return res.sort(cmp);
    },
  },
  // ---------------------------------------------------------------- 78
  {
    slug: 'rat-in-a-maze',
    title: 'Rat in a Maze',
    difficulty: 'Medium',
    tags: ['Recursion & Backtracking', 'Matrix'],
    statement:
      'A rat starts at the top-left cell of a grid and wants to reach the bottom-right cell. The grid maze is an array of rows where 1 means an open cell and 0 means a blocked cell. The rat may move Down (D), Left (L), Right (R) or Up (U) into an open cell inside the grid, and it must never visit the same cell twice within a single path. Return all possible paths as strings of moves (for example "DDRR"), sorted in lexicographic (alphabetical) order. If the start or end cell is blocked, or no path exists, return an empty array. If the grid is a single open cell, the only path is the empty string, so return [""].',
    constraints: ['1 <= rows, cols <= 5', 'maze[i][j] is 0 or 1'],
    hints: [
      'Use DFS with a visited marker for the current path.',
      'Try the moves in the order D, L, R, U; then the collected paths come out sorted.',
      'Unmark a cell when you backtrack out of it.',
    ],
    args: 'maze',
    tests: [
      [[[1, 0, 0, 0], [1, 1, 0, 1], [0, 1, 0, 0], [1, 1, 1, 1]]],
      [[[1, 1], [1, 1]]],
      [[[0]]],
      [[[1]]],
      [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]],
      [[[1, 0], [0, 1]]],
      [[[1, 1, 0], [0, 1, 1], [0, 0, 0]]],
      [[[1, 1, 1, 1]]],
    ],
    ref: (maze) => {
      const R = maze.length;
      const C = maze[0].length;
      const res = [];
      if (maze[0][0] === 0 || maze[R - 1][C - 1] === 0) return res;
      const seen = maze.map((r) => r.map(() => false));
      const dirs = [['D', 1, 0], ['L', 0, -1], ['R', 0, 1], ['U', -1, 0]];
      const go = (r, c, path) => {
        if (r === R - 1 && c === C - 1) {
          res.push(path);
          return;
        }
        seen[r][c] = true;
        for (const [ch, dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
          if (maze[nr][nc] === 0 || seen[nr][nc]) continue;
          go(nr, nc, path + ch);
        }
        seen[r][c] = false;
      };
      go(0, 0, '');
      return res.sort();
    },
  },
  // ---------------------------------------------------------------- 79
  {
    slug: 'n-queens-problem',
    title: 'N-Queens Problem',
    difficulty: 'Hard',
    tags: ['Recursion & Backtracking', 'Backtracking'],
    statement:
      'Place n queens on an n x n chessboard so that no two queens attack each other (no two share a row, a column, or a diagonal). Given the integer n, return the number of distinct ways to place the queens. If no placement exists, return 0.',
    constraints: ['1 <= n <= 9'],
    hints: [
      'Place one queen per row and choose its column.',
      'Track used columns and both diagonals (row - col and row + col) in sets or arrays.',
      'Backtrack after exploring each column choice.',
    ],
    args: 'n',
    tests: [[4], [1], [2], [3], [5], [6], [8]],
    ref: (n) => {
      const cols = new Set();
      const d1 = new Set();
      const d2 = new Set();
      const go = (r) => {
        if (r === n) return 1;
        let cnt = 0;
        for (let c = 0; c < n; c++) {
          if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
          cols.add(c);
          d1.add(r - c);
          d2.add(r + c);
          cnt += go(r + 1);
          cols.delete(c);
          d1.delete(r - c);
          d2.delete(r + c);
        }
        return cnt;
      };
      return go(0);
    },
  },
  // ---------------------------------------------------------------- 80
  {
    slug: 'sudoku-solver',
    title: 'Sudoku Solver',
    difficulty: 'Hard',
    tags: ['Recursion & Backtracking', 'Matrix'],
    statement:
      'Given a 9 x 9 Sudoku board as an array of 9 rows of 9 integers, where 0 means an empty cell and 1-9 are given digits, fill the empty cells so that every row, every column and every 3 x 3 box contains each digit 1-9 exactly once. Return the completed board in the same format. Every input puzzle has exactly one solution.',
    constraints: ['board is 9 x 9', '0 <= board[i][j] <= 9', 'The puzzle has exactly one valid solution'],
    hints: [
      'Find the next empty cell and try digits 1 to 9 that do not conflict with its row, column or box.',
      'Recurse; if a branch fails, reset the cell to 0 and try the next digit.',
      'Return as soon as one branch fills the whole board.',
    ],
    args: 'board',
    tests: [
      [wikiPuzzle()],
      [parseBoard(EULER)],
      [wikiMoreClues()],
      [wikiOneEmpty()],
      [wikiSolved()],
    ],
    ref: (board) => {
      const ok = (r, c, v) => {
        for (let i = 0; i < 9; i++) {
          if (board[r][i] === v || board[i][c] === v) return false;
          if (board[3 * Math.floor(r / 3) + Math.floor(i / 3)][3 * Math.floor(c / 3) + (i % 3)] === v) return false;
        }
        return true;
      };
      const go = () => {
        for (let r = 0; r < 9; r++)
          for (let c = 0; c < 9; c++)
            if (board[r][c] === 0) {
              for (let v = 1; v <= 9; v++)
                if (ok(r, c, v)) {
                  board[r][c] = v;
                  if (go()) return true;
                  board[r][c] = 0;
                }
              return false;
            }
        return true;
      };
      go();
      return board;
    },
  },
  // ---------------------------------------------------------------- 81
  {
    slug: 'binary-tree-traversals',
    title: 'Binary Tree Traversals',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'Binary Tree'],
    statement:
      'A binary tree is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). Node values are non-negative. For example [1,2,3,-1,4] is a root 1 with left child 2 and right child 3, where 2 has no left child and has right child 4. Return an array of three arrays [inorder, preorder, postorder] holding the node values of the three depth-first traversals. An empty tree [] gives [[],[],[]].',
    constraints: ['0 <= number of entries <= 200', 'Node values are non-negative integers; -1 marks an absent node'],
    hints: [
      'First build node objects from the level-order array using a queue.',
      'Inorder: left, node, right. Preorder: node, left, right. Postorder: left, right, node.',
    ],
    args: 'tree',
    tests: [
      [[1, 2, 3, 4, 5, 6, 7]],
      [[1, 2, 3, -1, 4]],
      [[]],
      [[5]],
      [[1, -1, 2, -1, 3, -1, 4]],
      [[3, 9, 20, -1, -1, 15, 7]],
      [[10, 5, 15, 3, 7, -1, 18]],
    ],
    ref: (tree) => {
      const build = (arr) => {
        if (!arr.length || arr[0] === -1) return null;
        const root = { v: arr[0], l: null, r: null };
        const q = [root];
        let i = 1;
        while (q.length && i < arr.length) {
          const n = q.shift();
          if (i < arr.length && arr[i] !== -1) { n.l = { v: arr[i], l: null, r: null }; q.push(n.l); }
          i++;
          if (i < arr.length && arr[i] !== -1) { n.r = { v: arr[i], l: null, r: null }; q.push(n.r); }
          i++;
        }
        return root;
      };
      const root = build(tree);
      const ino = [];
      const pre = [];
      const post = [];
      const go = (n) => {
        if (!n) return;
        pre.push(n.v);
        go(n.l);
        ino.push(n.v);
        go(n.r);
        post.push(n.v);
      };
      go(root);
      return [ino, pre, post];
    },
  },
  // ---------------------------------------------------------------- 82
  {
    slug: 'find-height-of-binary-tree',
    title: 'Find Height of Binary Tree',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'Binary Tree'],
    statement:
      'A binary tree is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). Node values are non-negative. Return the height of the tree, defined as the number of nodes on the longest path from the root down to a leaf. An empty tree [] has height 0.',
    constraints: ['0 <= number of entries <= 200', 'Node values are non-negative integers; -1 marks an absent node'],
    hints: [
      'Height of a node = 1 + max(height of left, height of right).',
      'An absent node has height 0.',
    ],
    args: 'tree',
    tests: [
      [[3, 9, 20, -1, -1, 15, 7]],
      [[1, 2, 3, 4, 5, 6, 7]],
      [[]],
      [[1]],
      [[1, 2, -1, 3, -1, 4]],
      [[1, -1, 2, -1, 3, -1, 4, -1, 5]],
      [[8, 4, 12, 2, 6, 10, 14, 1]],
    ],
    ref: (tree) => {
      const build = (arr) => {
        if (!arr.length || arr[0] === -1) return null;
        const root = { v: arr[0], l: null, r: null };
        const q = [root];
        let i = 1;
        while (q.length && i < arr.length) {
          const n = q.shift();
          if (i < arr.length && arr[i] !== -1) { n.l = { v: arr[i], l: null, r: null }; q.push(n.l); }
          i++;
          if (i < arr.length && arr[i] !== -1) { n.r = { v: arr[i], l: null, r: null }; q.push(n.r); }
          i++;
        }
        return root;
      };
      const h = (n) => (n ? 1 + Math.max(h(n.l), h(n.r)) : 0);
      return h(build(tree));
    },
  },
  // ---------------------------------------------------------------- 83
  {
    slug: 'count-nodes-in-binary-tree',
    title: 'Count Nodes in Binary Tree',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'Binary Tree'],
    statement:
      'A binary tree is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). Node values are non-negative. Return the total number of nodes in the tree. An empty tree [] has 0 nodes. Note that -1 entries are placeholders, not nodes.',
    constraints: ['0 <= number of entries <= 200', 'Node values are non-negative integers; -1 marks an absent node'],
    hints: [
      'Count = 1 + count(left) + count(right), and 0 for an absent node.',
      'Build the tree with a queue before recursing.',
    ],
    args: 'tree',
    tests: [
      [[1, 2, 3, 4, 5, 6]],
      [[1, -1, 2, -1, 3]],
      [[]],
      [[7]],
      [[3, 9, 20, -1, -1, 15, 7]],
      [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [[1, 2, 3, -1, 4, -1, 5, 6, -1, -1, 7]],
    ],
    ref: (tree) => {
      const build = (arr) => {
        if (!arr.length || arr[0] === -1) return null;
        const root = { v: arr[0], l: null, r: null };
        const q = [root];
        let i = 1;
        while (q.length && i < arr.length) {
          const n = q.shift();
          if (i < arr.length && arr[i] !== -1) { n.l = { v: arr[i], l: null, r: null }; q.push(n.l); }
          i++;
          if (i < arr.length && arr[i] !== -1) { n.r = { v: arr[i], l: null, r: null }; q.push(n.r); }
          i++;
        }
        return root;
      };
      const c = (n) => (n ? 1 + c(n.l) + c(n.r) : 0);
      return c(build(tree));
    },
  },
  // ---------------------------------------------------------------- 84
  {
    slug: 'level-order-traversal',
    title: 'Level Order Traversal',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'BFS'],
    statement:
      'A binary tree is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). Node values are non-negative. Return the level order traversal as an array of arrays: one inner array per depth, listing that level\'s node values from left to right. An empty tree [] returns [].',
    constraints: ['0 <= number of entries <= 200', 'Node values are non-negative integers; -1 marks an absent node'],
    hints: [
      'Use a queue; process exactly queue.length nodes for each level.',
      'Push the left then right child of every node you process.',
    ],
    args: 'tree',
    tests: [
      [[3, 9, 20, -1, -1, 15, 7]],
      [[1, 2, 3, 4, 5, 6, 7]],
      [[]],
      [[1]],
      [[1, 2, -1, 3, -1, 4]],
      [[1, -1, 2, -1, 3, -1, 4]],
      [[5, 3, 8, 2, 4, 7, 9, 1]],
    ],
    ref: (tree) => {
      if (!tree.length || tree[0] === -1) return [];
      const root = { v: tree[0], l: null, r: null };
      const q = [root];
      let i = 1;
      while (q.length && i < tree.length) {
        const n = q.shift();
        if (i < tree.length && tree[i] !== -1) { n.l = { v: tree[i], l: null, r: null }; q.push(n.l); }
        i++;
        if (i < tree.length && tree[i] !== -1) { n.r = { v: tree[i], l: null, r: null }; q.push(n.r); }
        i++;
      }
      const res = [];
      let cur = [root];
      while (cur.length) {
        res.push(cur.map((n) => n.v));
        const next = [];
        for (const n of cur) {
          if (n.l) next.push(n.l);
          if (n.r) next.push(n.r);
        }
        cur = next;
      }
      return res;
    },
  },
  // ---------------------------------------------------------------- 85
  {
    slug: 'check-balanced-binary-tree',
    title: 'Check Balanced Binary Tree',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'Binary Tree'],
    statement:
      'A binary tree is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). Node values are non-negative. A tree is height-balanced if, for every node, the heights of its left and right subtrees differ by at most 1. Return true if the tree is height-balanced, otherwise false. An empty tree [] is balanced.',
    constraints: ['0 <= number of entries <= 200', 'Node values are non-negative integers; -1 marks an absent node'],
    hints: [
      'Compute heights bottom-up and compare at every node.',
      'Return a sentinel such as -1 from the height function as soon as an imbalance is found, to avoid recomputation.',
    ],
    args: 'tree',
    tests: [
      [[3, 9, 20, -1, -1, 15, 7]],
      [[1, 2, 2, 3, 3, -1, -1, 4, 4]],
      [[]],
      [[1]],
      [[1, 2, -1]],
      [[1, 2, -1, 3]],
      [[1, 2, 3, 4, -1, -1, 5, 6]],
    ],
    ref: (tree) => {
      if (!tree.length || tree[0] === -1) return true;
      const root = { v: tree[0], l: null, r: null };
      const q = [root];
      let i = 1;
      while (q.length && i < tree.length) {
        const n = q.shift();
        if (i < tree.length && tree[i] !== -1) { n.l = { v: tree[i], l: null, r: null }; q.push(n.l); }
        i++;
        if (i < tree.length && tree[i] !== -1) { n.r = { v: tree[i], l: null, r: null }; q.push(n.r); }
        i++;
      }
      let bal = true;
      const h = (n) => {
        if (!n) return 0;
        const a = h(n.l);
        const b = h(n.r);
        if (Math.abs(a - b) > 1) bal = false;
        return 1 + Math.max(a, b);
      };
      h(root);
      return bal;
    },
  },
  // ---------------------------------------------------------------- 86
  {
    slug: 'lowest-common-ancestor',
    title: 'Lowest Common Ancestor',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'Binary Tree'],
    statement:
      'A general binary tree (not necessarily a search tree) is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). All node values are distinct non-negative integers, and both p and q are values present in the tree. Return the value of the lowest common ancestor of p and q: the deepest node that has both p and q in its subtree, where a node counts as a descendant of itself. If p equals q, the answer is p.',
    constraints: ['1 <= number of entries <= 200', 'Node values are distinct non-negative integers; -1 marks an absent node', 'p and q exist in the tree'],
    hints: [
      'Recurse: if the current node is p or q, return it.',
      'If both the left and right recursive calls find something, the current node is the LCA.',
      'Otherwise return whichever side found something.',
    ],
    args: 'tree, p, q',
    tests: [
      [[3, 5, 1, 6, 2, 0, 8, -1, -1, 7, 4], 5, 1],
      [[3, 5, 1, 6, 2, 0, 8, -1, -1, 7, 4], 5, 4],
      [[1, 2], 1, 2],
      [[1], 1, 1],
      [[6, 2, 8, 0, 4, 7, 9, -1, 3, 5], 3, 5],
      [[6, 2, 8, 0, 4, 7, 9, -1, 3, 5], 0, 9],
      [[10, 20, 30, 40, -1, -1, 50, 60], 60, 40],
    ],
    ref: (tree, p, q) => {
      const root = { v: tree[0], l: null, r: null };
      const qu = [root];
      let i = 1;
      while (qu.length && i < tree.length) {
        const n = qu.shift();
        if (i < tree.length && tree[i] !== -1) { n.l = { v: tree[i], l: null, r: null }; qu.push(n.l); }
        i++;
        if (i < tree.length && tree[i] !== -1) { n.r = { v: tree[i], l: null, r: null }; qu.push(n.r); }
        i++;
      }
      const go = (n) => {
        if (!n) return null;
        if (n.v === p || n.v === q) return n;
        const a = go(n.l);
        const b = go(n.r);
        if (a && b) return n;
        return a || b;
      };
      return go(root).v;
    },
  },
  // ---------------------------------------------------------------- 87
  {
    slug: 'binary-search-tree-search',
    title: 'Binary Search Tree Search',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'Binary Search Tree'],
    statement:
      'A binary search tree (all values in the left subtree are smaller than a node, all values in the right subtree are larger; values are distinct and non-negative) is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). Search for the node whose value equals target. Return the subtree rooted at that node, written in the same level-order format: list nodes level by level, giving each existing node\'s left and right child (using -1 for an absent child), and remove trailing -1 values at the end. If target is not in the tree, return an empty array [].',
    constraints: ['0 <= number of entries <= 200', 'Node values are distinct non-negative integers; -1 marks an absent node', '0 <= target <= 1000'],
    hints: [
      'Walk down from the root: go left if target is smaller, right if larger.',
      'Once found, run a level-order walk from that node, writing -1 for each missing child, then trim trailing -1 values.',
    ],
    args: 'tree, target',
    tests: [
      [[4, 2, 7, 1, 3], 2],
      [[4, 2, 7, 1, 3], 5],
      [[], 3],
      [[8], 8],
      [[5, 3, 8, -1, 4, 7, -1], 8],
      [[5, 3, 8, -1, 4, 7, -1], 5],
      [[10, 5, 15, 2, 7, -1, 20, -1, -1, 6], 5],
      [[10, 5, 15, 2, 7, -1, 20, -1, -1, 6], 20],
    ],
    ref: (tree, target) => {
      if (!tree.length || tree[0] === -1) return [];
      const root = { v: tree[0], l: null, r: null };
      const qu = [root];
      let i = 1;
      while (qu.length && i < tree.length) {
        const n = qu.shift();
        if (i < tree.length && tree[i] !== -1) { n.l = { v: tree[i], l: null, r: null }; qu.push(n.l); }
        i++;
        if (i < tree.length && tree[i] !== -1) { n.r = { v: tree[i], l: null, r: null }; qu.push(n.r); }
        i++;
      }
      let cur = root;
      while (cur && cur.v !== target) cur = target < cur.v ? cur.l : cur.r;
      if (!cur) return [];
      const out = [cur.v];
      const q = [cur];
      while (q.length) {
        const n = q.shift();
        out.push(n.l ? n.l.v : -1);
        if (n.l) q.push(n.l);
        out.push(n.r ? n.r.v : -1);
        if (n.r) q.push(n.r);
      }
      while (out.length && out[out.length - 1] === -1) out.pop();
      return out;
    },
  },
  // ---------------------------------------------------------------- 88
  {
    slug: 'graph-bfs',
    title: 'Graph BFS',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'BFS'],
    statement:
      'An undirected graph has n nodes numbered 0 to n-1 and is given as an edge list: each edge [u, v] connects u and v in both directions. Starting from node start, perform a breadth-first search, always visiting the neighbours of a node in ascending order of node number. Return the array of nodes in the order they are first visited. Only nodes reachable from start appear in the answer.',
    constraints: ['1 <= n <= 50', '0 <= start < n', 'No self-loops or duplicate edges', '0 <= edges.length <= 200'],
    hints: [
      'Build an adjacency list and sort each list ascending.',
      'Use a queue and mark a node visited when you enqueue it.',
    ],
    args: 'n, edges, start',
    tests: [
      [5, [[0, 1], [0, 2], [1, 3], [2, 4]], 0],
      [4, [[0, 1], [2, 3]], 0],
      [1, [], 0],
      [6, [[5, 4], [4, 3], [3, 2], [2, 1], [1, 0]], 3],
      [5, [[0, 4], [0, 3], [0, 2], [0, 1], [1, 2], [3, 4]], 0],
      [7, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], 2],
      [3, [], 2],
    ],
    ref: (n, edges, start) => {
      const adj = Array.from({ length: n }, () => []);
      for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
      }
      adj.forEach((a) => a.sort((x, y) => x - y));
      const seen = new Array(n).fill(false);
      const order = [];
      const q = [start];
      seen[start] = true;
      while (q.length) {
        const u = q.shift();
        order.push(u);
        for (const v of adj[u])
          if (!seen[v]) {
            seen[v] = true;
            q.push(v);
          }
      }
      return order;
    },
  },
  // ---------------------------------------------------------------- 89
  {
    slug: 'graph-dfs',
    title: 'Graph DFS',
    difficulty: 'Medium',
    tags: ['Trees & Graphs', 'DFS'],
    statement:
      'An undirected graph has n nodes numbered 0 to n-1 and is given as an edge list: each edge [u, v] connects u and v in both directions. Starting from node start, perform a depth-first search, always exploring the neighbours of a node in ascending order of node number and going as deep as possible before backtracking. Return the array of nodes in the order they are first visited (preorder). Only nodes reachable from start appear in the answer.',
    constraints: ['1 <= n <= 50', '0 <= start < n', 'No self-loops or duplicate edges', '0 <= edges.length <= 200'],
    hints: [
      'Build an adjacency list and sort each list ascending.',
      'Recurse into each unvisited neighbour; mark a node visited when you first enter it.',
    ],
    args: 'n, edges, start',
    tests: [
      [5, [[0, 1], [0, 2], [1, 3], [2, 4]], 0],
      [4, [[0, 1], [2, 3]], 2],
      [1, [], 0],
      [6, [[5, 4], [4, 3], [3, 2], [2, 1], [1, 0]], 3],
      [5, [[0, 4], [0, 3], [0, 2], [0, 1], [1, 2], [3, 4]], 0],
      [7, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], 0],
      [6, [[0, 5], [5, 1], [1, 4], [4, 2], [2, 3]], 0],
    ],
    ref: (n, edges, start) => {
      const adj = Array.from({ length: n }, () => []);
      for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
      }
      adj.forEach((a) => a.sort((x, y) => x - y));
      const seen = new Array(n).fill(false);
      const order = [];
      const go = (u) => {
        seen[u] = true;
        order.push(u);
        for (const v of adj[u]) if (!seen[v]) go(v);
      };
      go(start);
      return order;
    },
  },
  // ---------------------------------------------------------------- 90
  {
    slug: 'detect-cycle-in-graph',
    title: 'Detect Cycle in Graph',
    difficulty: 'Hard',
    tags: ['Trees & Graphs', 'Graph'],
    statement:
      'An undirected graph has n nodes numbered 0 to n-1 and is given as an edge list: each edge [u, v] connects u and v in both directions. The graph may be disconnected. Return true if the graph contains at least one cycle (a path of three or more distinct nodes that returns to its starting node), otherwise return false.',
    constraints: ['1 <= n <= 50', 'No self-loops or duplicate edges', '0 <= edges.length <= 200'],
    hints: [
      'Union-Find: if an edge joins two nodes already in the same set, there is a cycle.',
      'Alternatively run DFS from every unvisited node and remember the parent; meeting a visited non-parent neighbour means a cycle.',
    ],
    args: 'n, edges',
    tests: [
      [4, [[0, 1], [1, 2], [2, 0], [2, 3]]],
      [4, [[0, 1], [1, 2], [2, 3]]],
      [1, []],
      [5, [[0, 1], [2, 3], [3, 4], [4, 2]]],
      [5, [[0, 1], [2, 3]]],
      [6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]],
      [2, [[0, 1]]],
    ],
    ref: (n, edges) => {
      const p = Array.from({ length: n }, (_, i) => i);
      const find = (x) => {
        while (p[x] !== x) {
          p[x] = p[p[x]];
          x = p[x];
        }
        return x;
      };
      for (const [u, v] of edges) {
        const a = find(u);
        const b = find(v);
        if (a === b) return true;
        p[a] = b;
      }
      return false;
    },
  },
  // ---------------------------------------------------------------- 91
  {
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', '1D DP'],
    statement:
      'You are climbing a staircase with n steps. Each move you may climb either 1 or 2 steps. Given n, return the number of distinct sequences of moves that take you exactly to the top. For n = 0 there is exactly one way (do nothing).',
    constraints: ['0 <= n <= 40'],
    hints: [
      'The ways to reach step i come from step i-1 or step i-2.',
      'ways[i] = ways[i-1] + ways[i-2], like Fibonacci.',
    ],
    args: 'n',
    tests: [[2], [3], [0], [1], [5], [10], [40]],
    ref: (n) => {
      let a = 1;
      let b = 1;
      for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
      return b;
    },
  },
  // ---------------------------------------------------------------- 92
  {
    slug: 'house-robber',
    title: 'House Robber',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', '1D DP'],
    statement:
      'A row of houses holds the amounts of money given in the array nums (nums[i] is the money in house i). You cannot rob two adjacent houses. Return the maximum total amount you can rob. If there are no houses, return 0.',
    constraints: ['0 <= nums.length <= 100', '0 <= nums[i] <= 1000'],
    hints: [
      'For each house choose: skip it (keep the best so far) or rob it (best from two houses back plus its money).',
      'Only the previous two values are needed.',
    ],
    args: 'nums',
    tests: [[[1, 2, 3, 1]], [[2, 7, 9, 3, 1]], [[]], [[5]], [[2, 1]], [[0, 0, 0]], [[100, 1, 1, 100]], [[6, 1, 1, 6, 1, 1, 6]]],
    ref: (nums) => {
      let take = 0;
      let skip = 0;
      for (const x of nums) [take, skip] = [skip + x, Math.max(take, skip)];
      return Math.max(take, skip);
    },
  },
  // ---------------------------------------------------------------- 93
  {
    slug: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Unbounded Knapsack'],
    statement:
      'Given an array coins of positive coin denominations (each can be used any number of times) and a non-negative integer amount, return the fewest number of coins needed to make exactly that amount. If it is impossible, return -1. For amount 0 the answer is 0.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 1000', '0 <= amount <= 5000'],
    hints: [
      'Let dp[a] be the fewest coins for amount a; dp[0] = 0.',
      'dp[a] = min over coins c <= a of dp[a - c] + 1.',
      'Greedy does not always work, e.g. coins [1,3,4] and amount 6.',
    ],
    args: 'coins, amount',
    tests: [
      [[1, 2, 5], 11],
      [[2], 3],
      [[1], 0],
      [[1, 3, 4], 6],
      [[186, 419, 83, 408], 6249],
      [[5, 10], 7],
      [[7, 2, 3], 1000],
      [[3], 9],
    ],
    ref: (coins, amount) => {
      const dp = new Array(amount + 1).fill(Infinity);
      dp[0] = 0;
      for (let a = 1; a <= amount; a++)
        for (const c of coins) if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
      return dp[amount] === Infinity ? -1 : dp[amount];
    },
  },
  // ---------------------------------------------------------------- 94
  {
    slug: 'longest-common-subsequence',
    title: 'Longest Common Subsequence',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', '2D DP', 'Strings'],
    statement:
      'Given two strings a and b, return the length of their longest common subsequence. A subsequence keeps the relative order of characters but may skip characters (it need not be contiguous). If the strings share no characters, or one is empty, return 0.',
    constraints: ['0 <= a.length, b.length <= 200', 'Strings contain lowercase English letters'],
    hints: [
      'dp[i][j] = LCS length of the first i characters of a and the first j characters of b.',
      'If a[i-1] == b[j-1], dp[i][j] = dp[i-1][j-1] + 1; otherwise take the max of dp[i-1][j] and dp[i][j-1].',
    ],
    args: 'a, b',
    tests: [
      ['abcde', 'ace'],
      ['abc', 'def'],
      ['', 'abc'],
      ['abc', 'abc'],
      ['AGGTAB'.toLowerCase(), 'GXTXAYB'.toLowerCase()],
      ['aaaa', 'aa'],
      ['bsbininm', 'jmjkbkjkv'],
      ['a', 'a'],
    ],
    ref: (a, b) => {
      const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
      for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
          dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      return dp[a.length][b.length];
    },
  },
  // ---------------------------------------------------------------- 95
  {
    slug: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', '1D DP'],
    statement:
      'Given an integer array nums, return the length of the longest strictly increasing subsequence (a sequence of elements in original order, not necessarily contiguous, where each element is strictly greater than the previous). For an empty array return 0.',
    constraints: ['0 <= nums.length <= 500', '-10^4 <= nums[i] <= 10^4'],
    hints: [
      'dp[i] = length of the longest increasing subsequence ending at index i.',
      'dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i].',
      'A faster O(n log n) approach uses a "tails" array and binary search.',
    ],
    args: 'nums',
    tests: [
      [[10, 9, 2, 5, 3, 7, 101, 18]],
      [[0, 1, 0, 3, 2, 3]],
      [[]],
      [[7]],
      [[7, 7, 7, 7]],
      [[5, 4, 3, 2, 1]],
      [[-3, -2, -1, 0, 1]],
      [[1, 3, 6, 7, 9, 4, 10, 5, 6]],
    ],
    ref: (nums) => {
      const dp = nums.map(() => 1);
      let best = 0;
      for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < i; j++) if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
        if (dp[i] > best) best = dp[i];
      }
      return best;
    },
  },
  // ---------------------------------------------------------------- 96
  {
    slug: '0-1-knapsack',
    title: '0/1 Knapsack',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Knapsack'],
    statement:
      'You have n items; item i has weight weights[i] and value values[i]. A knapsack can carry total weight at most capacity. Each item can be taken at most once (0/1). Return the maximum total value you can carry.',
    constraints: ['0 <= n <= 100', '1 <= weights[i] <= 100', '0 <= values[i] <= 1000', '0 <= capacity <= 1000', 'weights and values have the same length'],
    hints: [
      'dp[w] = best value using capacity w.',
      'Process items one by one and iterate w from capacity down to the item weight so each item is used once.',
    ],
    args: 'weights, values, capacity',
    tests: [
      [[1, 3, 4, 5], [1, 4, 5, 7], 7],
      [[10, 20, 30], [60, 100, 120], 50],
      [[], [], 10],
      [[5], [10], 4],
      [[5], [10], 5],
      [[2, 3, 4], [3, 4, 5], 0],
      [[1, 1, 1, 1], [1, 2, 3, 4], 2],
      [[12, 7, 11, 8, 9], [24, 13, 23, 15, 16], 26],
    ],
    ref: (weights, values, capacity) => {
      const dp = new Array(capacity + 1).fill(0);
      for (let i = 0; i < weights.length; i++)
        for (let w = capacity; w >= weights[i]; w--) dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
      return dp[capacity];
    },
  },
  // ---------------------------------------------------------------- 97
  {
    slug: 'matrix-chain-multiplication',
    title: 'Matrix Chain Multiplication',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Interval DP'],
    statement:
      'You are given a chain of matrices to multiply in order. The array dims describes them: matrix i has dims[i] rows and dims[i+1] columns, so there are dims.length - 1 matrices. Multiplying a matrix of size p x q by one of size q x r costs p * q * r scalar multiplications. Matrix multiplication is associative, so you may choose any parenthesization. Return the minimum total number of scalar multiplications needed to compute the whole product. With a single matrix the cost is 0.',
    constraints: ['2 <= dims.length <= 30', '1 <= dims[i] <= 100'],
    hints: [
      'Let dp[i][j] be the min cost to multiply matrices i..j.',
      'Try every split point k: dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1].',
      'Fill by increasing chain length.',
    ],
    args: 'dims',
    tests: [
      [[10, 30, 5, 60]],
      [[40, 20, 30, 10, 30]],
      [[5, 10]],
      [[10, 20, 30]],
      [[1, 2, 3, 4, 3]],
      [[10, 20, 30, 40, 30]],
      [[5, 4, 6, 2, 7]],
      [[2, 2, 2, 2, 2, 2]],
    ],
    ref: (dims) => {
      const n = dims.length - 1;
      const dp = Array.from({ length: n }, () => new Array(n).fill(0));
      for (let len = 2; len <= n; len++)
        for (let i = 0; i + len - 1 < n; i++) {
          const j = i + len - 1;
          dp[i][j] = Infinity;
          for (let k = i; k < j; k++) {
            const c = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
            if (c < dp[i][j]) dp[i][j] = c;
          }
        }
      return dp[0][n - 1];
    },
  },
  // ---------------------------------------------------------------- 98
  {
    slug: 'edit-distance',
    title: 'Edit Distance',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', '2D DP', 'Strings'],
    statement:
      'Given two strings a and b, return the minimum number of single-character operations needed to convert a into b. The allowed operations are: insert a character, delete a character, or replace a character. Either string may be empty.',
    constraints: ['0 <= a.length, b.length <= 200', 'Strings contain lowercase English letters'],
    hints: [
      'dp[i][j] = edit distance between the first i characters of a and the first j of b.',
      'Base cases: dp[i][0] = i and dp[0][j] = j.',
      'If characters match, dp[i][j] = dp[i-1][j-1]; otherwise 1 + min(insert, delete, replace).',
    ],
    args: 'a, b',
    tests: [
      ['horse', 'ros'],
      ['intention', 'execution'],
      ['', ''],
      ['', 'abc'],
      ['abc', ''],
      ['same', 'same'],
      ['kitten', 'sitting'],
      ['a', 'b'],
    ],
    ref: (a, b) => {
      const dp = Array.from({ length: a.length + 1 }, (_, i) => {
        const row = new Array(b.length + 1).fill(0);
        row[0] = i;
        return row;
      });
      for (let j = 0; j <= b.length; j++) dp[0][j] = j;
      for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
          dp[i][j] =
            a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      return dp[a.length][b.length];
    },
  },
  // ---------------------------------------------------------------- 99
  {
    slug: 'word-break-problem',
    title: 'Word Break Problem',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Strings'],
    statement:
      'Given a string s and an array of words (a dictionary), return true if s can be split into a sequence of one or more dictionary words concatenated together with no leftover characters, otherwise return false. Dictionary words may be reused any number of times. An empty string s can always be formed (return true).',
    constraints: ['0 <= s.length <= 300', '1 <= words.length <= 20', '1 <= words[i].length <= 20', 'All strings are lowercase English letters'],
    hints: [
      'dp[i] is true if the first i characters can be segmented; dp[0] = true.',
      'dp[i] is true if some j < i has dp[j] true and s.slice(j, i) is in the dictionary.',
    ],
    args: 's, words',
    tests: [
      ['leetcode', ['leet', 'code']],
      ['applepenapple', ['apple', 'pen']],
      ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']],
      ['', ['a']],
      ['aaaaaaa', ['aaaa', 'aaa']],
      ['a', ['b']],
      ['cars', ['car', 'ca', 'rs']],
      ['aaaaaaaaaab', ['a', 'aa', 'aaa', 'aaaa']],
    ],
    ref: (s, words) => {
      const dict = new Set(words);
      const dp = new Array(s.length + 1).fill(false);
      dp[0] = true;
      for (let i = 1; i <= s.length; i++)
        for (let j = 0; j < i; j++)
          if (dp[j] && dict.has(s.slice(j, i))) {
            dp[i] = true;
            break;
          }
      return dp[s.length];
    },
  },
  // ---------------------------------------------------------------- 100
  {
    slug: 'maximum-path-sum-in-binary-tree',
    title: 'Maximum Path Sum in Binary Tree',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Binary Tree'],
    statement:
      'A binary tree is given as a level-order array: the first value is the root, and then, going level by level and left to right, each existing node is followed by its left child and right child, where -1 means that child is absent (absent nodes have no children listed). All node values are non-negative. A path is any sequence of connected nodes that follows parent-child edges, visits each node at most once, and may start and end at any node (it does not need to pass through the root). Return the largest possible sum of node values along such a path. An empty tree [] returns 0.',
    constraints: ['0 <= number of entries <= 200', 'Node values are integers between 0 and 1000; -1 marks an absent node'],
    hints: [
      'For each node compute the best downward path starting at it: value + max(left gain, right gain).',
      'The best path that bends at a node is value + left gain + right gain; track the maximum over all nodes.',
    ],
    args: 'tree',
    tests: [
      [[1, 2, 3]],
      [[10, 9, 20, -1, -1, 15, 7]],
      [[]],
      [[5]],
      [[0, 0, 0]],
      [[1, 2, -1, 3, -1, 4]],
      [[5, 4, 8, 11, -1, 13, 4, 7, 2, -1, -1, -1, 1]],
      [[2, 100, 1, 3, 4]],
    ],
    ref: (tree) => {
      if (!tree.length || tree[0] === -1) return 0;
      const root = { v: tree[0], l: null, r: null };
      const q = [root];
      let i = 1;
      while (q.length && i < tree.length) {
        const n = q.shift();
        if (i < tree.length && tree[i] !== -1) { n.l = { v: tree[i], l: null, r: null }; q.push(n.l); }
        i++;
        if (i < tree.length && tree[i] !== -1) { n.r = { v: tree[i], l: null, r: null }; q.push(n.r); }
        i++;
      }
      let best = 0;
      const gain = (n) => {
        if (!n) return 0;
        const a = gain(n.l);
        const b = gain(n.r);
        best = Math.max(best, n.v + a + b);
        return n.v + Math.max(a, b);
      };
      gain(root);
      return best;
    },
  },
];
