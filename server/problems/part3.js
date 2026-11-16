const simStack = (ops, values) => {
  const s = [], out = [];
  ops.forEach((op, i) => {
    const v = values[i];
    if (op === 'push') { s.push(v[0]); out.push(-1); }
    else if (op === 'pop') out.push(s.length ? s.pop() : -1);
    else if (op === 'peek') out.push(s.length ? s[s.length - 1] : -1);
    else if (op === 'isEmpty') out.push(s.length ? 0 : 1);
    else out.push(s.length);
  });
  return out;
};

export default [
  {
    slug: 'create-a-linked-list',
    title: 'Create a Linked List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Simulation'],
    statement: 'You start with an empty singly linked list. Given an array values, insert each value one by one at the HEAD of the list, in the given order (first value first). After all insertions, return the list read from head to tail as an array. A linked list is represented as an array of its values, head first.',
    constraints: ['0 <= values.length <= 1000', '-10^4 <= values[i] <= 10^4'],
    hints: ['Each insertion at the head makes the new node the first node.', 'The last inserted value ends up at the head.'],
    args: 'values',
    tests: [[[1, 2, 3]], [[5, 10]], [[]], [[7]], [[4, 4, 1, 4]], [[-1, 0, 9, -5, 2]]],
    ref: (values) => {
      let head = null;
      for (const v of values) head = { v, next: head };
      const out = [];
      for (let p = head; p; p = p.next) out.push(p.v);
      return out;
    },
  },
  {
    slug: 'insert-node-at-beginning',
    title: 'Insert Node at Beginning',
    difficulty: 'Medium',
    tags: ['Linked List'],
    statement: 'A singly linked list is given as an array values (head first). Insert a new node holding the value x at the beginning of the list and return the resulting list as an array (head first).',
    constraints: ['0 <= values.length <= 1000', '-10^4 <= values[i], x <= 10^4'],
    hints: ['The new node becomes the new head and points to the old head.'],
    args: 'values, x',
    tests: [[[2, 3, 4], 1], [[5], 9], [[], 7], [[1, 1, 1], 1], [[-3, 0], -8], [[10, 20, 30, 40, 50], 0]],
    ref: (values, x) => [x, ...values],
  },
  {
    slug: 'insert-node-at-end',
    title: 'Insert Node at End',
    difficulty: 'Medium',
    tags: ['Linked List'],
    statement: 'A singly linked list is given as an array values (head first). Insert a new node holding the value x at the end (tail) of the list and return the resulting list as an array (head first).',
    constraints: ['0 <= values.length <= 1000', '-10^4 <= values[i], x <= 10^4'],
    hints: ['Walk to the last node and attach the new node.', 'Handle the empty list: the new node becomes the head.'],
    args: 'values, x',
    tests: [[[1, 2, 3], 4], [[5], 5], [[], 7], [[1, 1], 1], [[-3, 0], -8], [[10, 20, 30, 40, 50], 0]],
    ref: (values, x) => [...values, x],
  },
  {
    slug: 'delete-a-node',
    title: 'Delete a Node',
    difficulty: 'Medium',
    tags: ['Linked List'],
    statement: 'A singly linked list is given as an array values (head first). Delete the FIRST node whose value equals x and return the resulting list as an array. If no node holds x, return the list unchanged.',
    constraints: ['0 <= values.length <= 1000', '-10^4 <= values[i], x <= 10^4'],
    hints: ['Deleting the head is a special case.', 'Keep a pointer to the previous node so you can relink around the deleted one.'],
    args: 'values, x',
    tests: [[[1, 2, 3, 4], 3], [[1, 2, 3], 1], [[4, 5, 4, 5], 5], [[9], 9], [[], 3], [[1, 2, 3], 8], [[2, 2, 2], 2], [[1, 2, 3, 4], 4]],
    ref: (values, x) => {
      const r = values.slice();
      const i = r.indexOf(x);
      if (i >= 0) r.splice(i, 1);
      return r;
    },
  },
  {
    slug: 'search-an-element',
    title: 'Search an Element',
    difficulty: 'Medium',
    tags: ['Linked List', 'Searching'],
    statement: 'A singly linked list is given as an array values (head first). Return the 0-based position of the first node whose value equals x, counting from the head. If no node holds x, return -1.',
    constraints: ['0 <= values.length <= 1000', '-10^4 <= values[i], x <= 10^4'],
    hints: ['Traverse from the head while counting the index.', 'Stop at the first match.'],
    args: 'values, x',
    tests: [[[10, 20, 30], 20], [[5, 6, 7], 9], [[], 1], [[3, 3, 3], 3], [[1, 2, 3, 4, 5], 5], [[-4, 0, 4], -4], [[8], 8]],
    ref: (values, x) => values.indexOf(x),
  },
  {
    slug: 'reverse-a-linked-list',
    title: 'Reverse a Linked List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    statement: 'A singly linked list is given as an array values (head first). Reverse the list by reversing the direction of its links and return the reversed list as an array (head first).',
    constraints: ['0 <= values.length <= 5000', '-10^4 <= values[i] <= 10^4'],
    hints: ['Keep prev, curr and next pointers.', 'Point each node to the previous one while walking forward.'],
    args: 'values',
    tests: [[[1, 2, 3, 4, 5]], [[1, 2]], [[]], [[7]], [[1, 1, 2, 2]], [[-1, 0, 1]]],
    ref: (values) => values.slice().reverse(),
  },
  {
    slug: 'find-middle-of-linked-list',
    title: 'Find Middle of Linked List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    statement: 'A non-empty singly linked list is given as an array values (head first). Return the value of its middle node. If the list has an even number of nodes there are two middle nodes; return the value of the SECOND one.',
    constraints: ['1 <= values.length <= 1000', '-10^4 <= values[i] <= 10^4'],
    hints: ['Move a slow pointer by one and a fast pointer by two.', 'When fast reaches the end, slow is at the middle.'],
    args: 'values',
    tests: [[[1, 2, 3, 4, 5]], [[1, 2, 3, 4, 5, 6]], [[9]], [[4, 8]], [[-5, 0, 5, 10]], [[2, 2, 2, 3, 2, 2, 2]]],
    ref: (values) => values[Math.floor(values.length / 2)],
  },
  {
    slug: 'detect-cycle-in-linked-list',
    title: 'Detect Cycle in Linked List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    statement: 'A singly linked list is given as an array values (head first). The integer pos tells where the tail node links to: the tail\'s next pointer points to the node at 0-based index pos. If pos is -1, the tail points to nothing and there is no cycle. Return true if the list contains a cycle, otherwise false.',
    constraints: ['0 <= values.length <= 10^4', '-1 <= pos < values.length', 'pos is -1 when values is empty'],
    hints: ['Floyd cycle detection: a slow pointer moves 1 step, a fast pointer 2 steps.', 'If they ever meet there is a cycle; if fast reaches the end there is none.'],
    args: 'values, pos',
    tests: [[[3, 2, 0, -4], 1], [[1, 2], 0], [[1], -1], [[], -1], [[1, 2, 3, 4, 5], -1], [[1], 0], [[1, 2, 3, 4, 5], 4]],
    ref: (values, pos) => {
      const n = values.length;
      if (n === 0) return false;
      const nxt = (i) => (i === -1 ? -1 : i === n - 1 ? pos : i + 1);
      let slow = 0, fast = 0;
      while (fast !== -1 && nxt(fast) !== -1) {
        slow = nxt(slow);
        fast = nxt(nxt(fast));
        if (slow === fast) return true;
      }
      return false;
    },
  },
  {
    slug: 'remove-nth-node-from-end',
    title: 'Remove Nth Node from End',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    statement: 'A singly linked list is given as an array values (head first). Remove the n-th node counting from the END of the list (n = 1 is the last node) and return the resulting list as an array (head first).',
    constraints: ['1 <= values.length <= 1000', '1 <= n <= values.length', '-10^4 <= values[i] <= 10^4'],
    hints: ['Advance a fast pointer n steps ahead, then move both pointers together.', 'Removing the head is a special case; a dummy node helps.'],
    args: 'values, n',
    tests: [[[1, 2, 3, 4, 5], 2], [[1], 1], [[1, 2], 1], [[1, 2], 2], [[5, 6, 7, 8], 4], [[3, 3, 3], 2], [[1, 2, 3, 4, 5, 6], 6]],
    ref: (values, n) => {
      const r = values.slice();
      r.splice(r.length - n, 1);
      return r;
    },
  },
  {
    slug: 'merge-two-sorted-linked-lists',
    title: 'Merge Two Sorted Linked Lists',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    statement: 'Two singly linked lists a and b are given as arrays (head first), each sorted in non-decreasing order. Merge them into one sorted list and return it as an array (head first).',
    constraints: ['0 <= a.length, b.length <= 1000', '-10^4 <= a[i], b[i] <= 10^4', 'both lists are sorted in non-decreasing order'],
    hints: ['Compare the two current heads and take the smaller one.', 'When one list runs out, append the rest of the other.'],
    args: 'a, b',
    tests: [[[1, 2, 4], [1, 3, 4]], [[], []], [[], [0]], [[5, 6], []], [[1, 1, 1], [1, 1]], [[-5, 0, 7], [-6, 3, 8, 9]], [[1, 2, 3], [4, 5, 6]]],
    ref: (a, b) => {
      const out = [];
      let i = 0, j = 0;
      while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
      while (i < a.length) out.push(a[i++]);
      while (j < b.length) out.push(b[j++]);
      return out;
    },
  },
  {
    slug: 'implement-stack-using-array',
    title: 'Implement Stack Using Array',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Design'],
    statement: 'Implement a stack (last in, first out) backed by an array, then run a sequence of operations on it. ops[i] is the operation name and values[i] is its argument list (empty if none). Operations: "push" (argument: a value to push; result -1), "pop" (remove and return the top value, or -1 if the stack is empty), "peek" (return the top value without removing it, or -1 if empty), "isEmpty" (return 1 if the stack is empty, else 0), "size" (return the number of elements). Return the array of results, one per operation. Pushed values are non-negative.',
    constraints: ['1 <= ops.length <= 1000', '0 <= pushed value <= 10^4', 'ops.length == values.length'],
    hints: ['Use an array and its end as the top of the stack.', 'Check for emptiness before pop and peek.'],
    args: 'ops, values',
    tests: [
      [['push', 'push', 'peek', 'pop', 'size'], [[1], [2], [], [], []]],
      [['isEmpty', 'push', 'isEmpty', 'pop', 'isEmpty'], [[], [5], [], [], []]],
      [['pop', 'peek', 'size'], [[], [], []]],
      [['push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'], [[0], [10], [20], [], [], [], []]],
      [['push', 'pop', 'push', 'peek', 'size'], [[3], [], [4], [], []]],
      [['push', 'push', 'size', 'peek', 'peek'], [[7], [7], [], [], []]],
    ],
    ref: simStack,
  },
  {
    slug: 'implement-queue-using-array',
    title: 'Implement Queue Using Array',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Design'],
    statement: 'Implement a queue (first in, first out) backed by an array, then run a sequence of operations on it. ops[i] is the operation name and values[i] is its argument list (empty if none). Operations: "enqueue" (argument: a value to add at the back; result -1), "dequeue" (remove and return the front value, or -1 if the queue is empty), "front" (return the front value without removing it, or -1 if empty), "isEmpty" (return 1 if empty, else 0), "size" (return the number of elements). Return the array of results, one per operation. Enqueued values are non-negative.',
    constraints: ['1 <= ops.length <= 1000', '0 <= enqueued value <= 10^4', 'ops.length == values.length'],
    hints: ['Keep an array plus a front index, or use shift().', 'Check for emptiness before dequeue and front.'],
    args: 'ops, values',
    tests: [
      [['enqueue', 'enqueue', 'front', 'dequeue', 'size'], [[1], [2], [], [], []]],
      [['isEmpty', 'enqueue', 'isEmpty', 'dequeue', 'isEmpty'], [[], [5], [], [], []]],
      [['dequeue', 'front', 'size'], [[], [], []]],
      [['enqueue', 'enqueue', 'enqueue', 'dequeue', 'dequeue', 'dequeue', 'dequeue'], [[0], [10], [20], [], [], [], []]],
      [['enqueue', 'dequeue', 'enqueue', 'front', 'size'], [[3], [], [4], [], []]],
      [['enqueue', 'enqueue', 'dequeue', 'enqueue', 'front', 'size'], [[1], [2], [], [3], [], []]],
    ],
    ref: (ops, values) => {
      const q = [], out = [];
      ops.forEach((op, i) => {
        if (op === 'enqueue') { q.push(values[i][0]); out.push(-1); }
        else if (op === 'dequeue') out.push(q.length ? q.shift() : -1);
        else if (op === 'front') out.push(q.length ? q[0] : -1);
        else if (op === 'isEmpty') out.push(q.length ? 0 : 1);
        else out.push(q.length);
      });
      return out;
    },
  },
  {
    slug: 'implement-stack-using-linked-list',
    title: 'Implement Stack Using Linked List',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Linked List', 'Design'],
    statement: 'Implement a stack using a singly linked list (the head is the top), then run a sequence of operations. ops[i] is the operation name and values[i] is its argument list (empty if none). Operations: "push" (argument: a value; inserts a new head node and returns the NEW size of the stack), "pop" (remove the head and return its value, or -1 if empty), "top" (return the head value without removing it, or -1 if empty), "isEmpty" (1 if empty, else 0), "size" (number of nodes). Return the array of results, one per operation. Pushed values are non-negative.',
    constraints: ['1 <= ops.length <= 1000', '0 <= pushed value <= 10^4', 'ops.length == values.length'],
    hints: ['Push: create a node whose next is the old head, then make it the head.', 'Keep a counter for the size.'],
    args: 'ops, values',
    tests: [
      [['push', 'push', 'top', 'pop', 'size'], [[1], [2], [], [], []]],
      [['isEmpty', 'push', 'isEmpty', 'pop', 'isEmpty'], [[], [5], [], [], []]],
      [['pop', 'top', 'size'], [[], [], []]],
      [['push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'], [[0], [10], [20], [], [], [], []]],
      [['push', 'pop', 'push', 'top', 'size'], [[3], [], [4], [], []]],
      [['push', 'push', 'push', 'size'], [[7], [7], [7], []]],
    ],
    ref: (ops, values) => {
      let head = null, n = 0;
      const out = [];
      ops.forEach((op, i) => {
        if (op === 'push') { head = { v: values[i][0], next: head }; n++; out.push(n); }
        else if (op === 'pop') {
          if (head) { out.push(head.v); head = head.next; n--; } else out.push(-1);
        }
        else if (op === 'top') out.push(head ? head.v : -1);
        else if (op === 'isEmpty') out.push(head ? 0 : 1);
        else out.push(n);
      });
      return out;
    },
  },
  {
    slug: 'implement-queue-using-linked-list',
    title: 'Implement Queue Using Linked List',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Linked List', 'Design'],
    statement: 'Implement a queue using a singly linked list with head and tail pointers, then run a sequence of operations. ops[i] is the operation name and values[i] is its argument list (empty if none). Operations: "enqueue" (argument: a value; appends a node at the tail and returns the NEW size of the queue), "dequeue" (remove the head and return its value, or -1 if empty), "front" (return the head value without removing it, or -1 if empty), "isEmpty" (1 if empty, else 0), "size" (number of nodes). Return the array of results, one per operation. Enqueued values are non-negative.',
    constraints: ['1 <= ops.length <= 1000', '0 <= enqueued value <= 10^4', 'ops.length == values.length'],
    hints: ['Enqueue at the tail, dequeue from the head.', 'When the last node is dequeued, the tail must also become empty.'],
    args: 'ops, values',
    tests: [
      [['enqueue', 'enqueue', 'front', 'dequeue', 'size'], [[1], [2], [], [], []]],
      [['isEmpty', 'enqueue', 'isEmpty', 'dequeue', 'isEmpty'], [[], [5], [], [], []]],
      [['dequeue', 'front', 'size'], [[], [], []]],
      [['enqueue', 'enqueue', 'enqueue', 'dequeue', 'dequeue', 'dequeue', 'dequeue'], [[0], [10], [20], [], [], [], []]],
      [['enqueue', 'dequeue', 'enqueue', 'front', 'size'], [[3], [], [4], [], []]],
      [['enqueue', 'dequeue', 'dequeue', 'enqueue', 'enqueue', 'dequeue'], [[9], [], [], [8], [6], []]],
    ],
    ref: (ops, values) => {
      let head = null, tail = null, n = 0;
      const out = [];
      ops.forEach((op, i) => {
        if (op === 'enqueue') {
          const node = { v: values[i][0], next: null };
          if (tail) tail.next = node; else head = node;
          tail = node; n++; out.push(n);
        } else if (op === 'dequeue') {
          if (head) { out.push(head.v); head = head.next; if (!head) tail = null; n--; } else out.push(-1);
        }
        else if (op === 'front') out.push(head ? head.v : -1);
        else if (op === 'isEmpty') out.push(head ? 0 : 1);
        else out.push(n);
      });
      return out;
    },
  },
  {
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Strings'],
    statement: 'Given a string s containing only the characters ( ) [ ] { }, return true if the brackets are valid, otherwise false. A string is valid if every opening bracket is closed by the same type of bracket and brackets are closed in the correct order. The empty string is valid.',
    constraints: ['0 <= s.length <= 10^4', 's consists only of ()[]{}'],
    hints: ['Push opening brackets onto a stack.', 'On a closing bracket, the stack top must be its matching opener.', 'The stack must be empty at the end.'],
    args: 's',
    tests: [['()'], ['()[]{}'], ['(]'], ['([)]'], ['{[]}'], [''], ['((('], ['){']],
    ref: (s) => {
      const m = { ')': '(', ']': '[', '}': '{' };
      const st = [];
      for (const c of s) {
        if (m[c]) { if (st.pop() !== m[c]) return false; }
        else st.push(c);
      }
      return st.length === 0;
    },
  },
  {
    slug: 'next-greater-element',
    title: 'Next Greater Element',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Monotonic Stack'],
    statement: 'Given an array nums, return an array res of the same length where res[i] is the first element to the right of index i that is strictly greater than nums[i]. If there is no such element, res[i] is -1.',
    constraints: ['0 <= nums.length <= 10^4', '0 <= nums[i] <= 10^4'],
    hints: ['A brute force double loop is O(n^2).', 'Keep a stack of indices whose answer is not found yet; when a bigger value arrives, pop and resolve them.'],
    args: 'nums',
    tests: [[[4, 5, 2, 25]], [[13, 7, 6, 12]], [[]], [[5]], [[3, 3, 3]], [[1, 2, 3, 4, 5]], [[5, 4, 3, 2, 1]], [[2, 7, 3, 5, 4, 6, 8]]],
    ref: (nums) => {
      const res = new Array(nums.length).fill(-1);
      const st = [];
      for (let i = 0; i < nums.length; i++) {
        while (st.length && nums[st[st.length - 1]] < nums[i]) res[st.pop()] = nums[i];
        st.push(i);
      }
      return res;
    },
  },
  {
    slug: 'min-stack',
    title: 'Min Stack',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Design'],
    statement: 'Design a stack that supports retrieving its minimum element in constant time, then run a sequence of operations. ops[i] is the operation name and values[i] is its argument list (empty if none). Operations: "push" (argument: a value; result -1), "pop" (remove the top and return it, or -1 if empty), "top" (return the top without removing it, or -1 if empty), "getMin" (return the minimum value currently in the stack, or -1 if empty). Return the array of results, one per operation. Pushed values are non-negative.',
    constraints: ['1 <= ops.length <= 1000', '0 <= pushed value <= 10^4', 'ops.length == values.length'],
    hints: ['Store, with each element, the minimum of the stack up to that element.', 'Or keep a second stack of minimums.'],
    args: 'ops, values',
    tests: [
      [['push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'], [[5], [3], [7], [], [], [], []]],
      [['getMin', 'top', 'pop'], [[], [], []]],
      [['push', 'push', 'push', 'pop', 'getMin'], [[2], [2], [1], [], []]],
      [['push', 'getMin', 'pop', 'getMin'], [[0], [], [], []]],
      [['push', 'push', 'pop', 'getMin', 'push', 'getMin'], [[4], [1], [], [], [9], []]],
      [['push', 'push', 'push', 'pop', 'pop', 'getMin'], [[1], [2], [3], [], [], []]],
    ],
    ref: (ops, values) => {
      const st = [], out = [];
      ops.forEach((op, i) => {
        if (op === 'push') {
          const v = values[i][0];
          st.push([v, st.length ? Math.min(v, st[st.length - 1][1]) : v]);
          out.push(-1);
        } else if (op === 'pop') out.push(st.length ? st.pop()[0] : -1);
        else if (op === 'top') out.push(st.length ? st[st.length - 1][0] : -1);
        else out.push(st.length ? st[st.length - 1][1] : -1);
      });
      return out;
    },
  },
  {
    slug: 'implement-queue-using-two-stacks',
    title: 'Implement Queue Using Two Stacks',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Design'],
    statement: 'Implement a first-in-first-out queue using only two stacks, then run a sequence of operations. ops[i] is the operation name and values[i] is its argument list (empty if none). Operations: "push" (argument: a value added to the back of the queue; result -1), "pop" (remove and return the front element, or -1 if the queue is empty), "peek" (return the front element without removing it, or -1 if empty), "empty" (return 1 if the queue is empty, else 0). Return the array of results, one per operation. Pushed values are non-negative.',
    constraints: ['1 <= ops.length <= 1000', '0 <= pushed value <= 10^4', 'ops.length == values.length'],
    hints: ['Push onto an input stack.', 'When the output stack is empty, move everything from the input stack onto it; this reverses the order.'],
    args: 'ops, values',
    tests: [
      [['push', 'push', 'peek', 'pop', 'empty'], [[1], [2], [], [], []]],
      [['empty', 'push', 'empty', 'pop', 'empty'], [[], [5], [], [], []]],
      [['pop', 'peek', 'empty'], [[], [], []]],
      [['push', 'push', 'push', 'pop', 'push', 'pop', 'pop', 'pop', 'pop'], [[1], [2], [3], [], [4], [], [], [], []]],
      [['push', 'pop', 'push', 'peek'], [[0], [], [8], []]],
      [['push', 'push', 'peek', 'peek', 'pop', 'peek'], [[6], [7], [], [], [], []]],
    ],
    ref: (ops, values) => {
      const inS = [], outS = [], res = [];
      const shift = () => { if (!outS.length) while (inS.length) outS.push(inS.pop()); };
      ops.forEach((op, i) => {
        if (op === 'push') { inS.push(values[i][0]); res.push(-1); }
        else if (op === 'pop') { shift(); res.push(outS.length ? outS.pop() : -1); }
        else if (op === 'peek') { shift(); res.push(outS.length ? outS[outS.length - 1] : -1); }
        else res.push(inS.length + outS.length ? 0 : 1);
      });
      return res;
    },
  },
  {
    slug: 'sliding-window-maximum',
    title: 'Sliding Window Maximum',
    difficulty: 'Medium',
    tags: ['Stack & Queue', 'Deque', 'Sliding Window'],
    statement: 'Given an integer array nums and a window size k, a window of k consecutive elements slides from the left end to the right end of the array, one position at a time. Return an array containing the maximum of each window, in order. The result has nums.length - k + 1 elements.',
    constraints: ['1 <= k <= nums.length <= 10^4', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Brute force is O(n*k).', 'Keep a deque of indices whose values are in decreasing order; the front is always the window maximum.', 'Drop the front when it leaves the window.'],
    args: 'nums, k',
    tests: [[[1, 3, -1, -3, 5, 3, 6, 7], 3], [[1], 1], [[1, -1], 1], [[9, 11], 2], [[4, 3, 2, 1], 2], [[1, 2, 3, 4, 5], 3], [[-7, -8, 7, 5, 7, 1, 6, 0], 4], [[2, 2, 2, 2], 4]],
    ref: (nums, k) => {
      const dq = [], res = [];
      for (let i = 0; i < nums.length; i++) {
        while (dq.length && dq[0] <= i - k) dq.shift();
        while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
        dq.push(i);
        if (i >= k - 1) res.push(nums[dq[0]]);
      }
      return res;
    },
  },
  {
    slug: 'largest-rectangle-in-histogram',
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    tags: ['Stack & Queue', 'Monotonic Stack'],
    statement: 'Given an array heights where heights[i] is the height of the i-th bar of a histogram and every bar has width 1, return the area of the largest rectangle that fits entirely inside the histogram (the rectangle is made of consecutive bars).',
    constraints: ['1 <= heights.length <= 10^4', '0 <= heights[i] <= 10^4'],
    hints: ['For each bar, find how far left and right it can extend while staying the minimum.', 'A stack of increasing heights finds those boundaries in one pass; append a 0 bar at the end to flush the stack.'],
    args: 'heights',
    tests: [[[2, 1, 5, 6, 2, 3]], [[2, 4]], [[1]], [[0]], [[3, 3, 3, 3]], [[5, 4, 3, 2, 1]], [[1, 2, 3, 4, 5]], [[6, 2, 5, 4, 5, 1, 6]]],
    ref: (heights) => {
      const h = [...heights, 0];
      const st = [];
      let best = 0;
      for (let i = 0; i < h.length; i++) {
        while (st.length && h[st[st.length - 1]] >= h[i]) {
          const height = h[st.pop()];
          const left = st.length ? st[st.length - 1] : -1;
          best = Math.max(best, height * (i - left - 1));
        }
        st.push(i);
      }
      return best;
    },
  },
  {
    slug: 'factorial-using-recursion',
    title: 'Factorial Using Recursion',
    difficulty: 'Easy',
    tags: ['Recursion & Backtracking', 'Math'],
    statement: 'Given a non-negative integer n, return n! (n factorial) computed recursively. n! = n * (n-1)!, and 0! = 1.',
    constraints: ['0 <= n <= 12'],
    hints: ['Base case: n is 0 or 1 returns 1.', 'Recursive case: n * factorial(n - 1).'],
    args: 'n',
    tests: [[5], [0], [1], [2], [7], [10], [12]],
    ref: (n) => { const f = (m) => (m <= 1 ? 1 : m * f(m - 1)); return f(n); },
  },
  {
    slug: 'fibonacci-using-recursion',
    title: 'Fibonacci Using Recursion',
    difficulty: 'Easy',
    tags: ['Recursion & Backtracking', 'Math'],
    statement: 'Given a non-negative integer n, return the n-th Fibonacci number computed recursively, where F(0) = 0, F(1) = 1 and F(n) = F(n-1) + F(n-2).',
    constraints: ['0 <= n <= 25'],
    hints: ['Two base cases: F(0) = 0 and F(1) = 1.', 'The plain recursion is exponential; memoization makes it linear.'],
    args: 'n',
    tests: [[0], [1], [2], [5], [10], [15], [20], [25]],
    ref: (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; },
  },
  {
    slug: 'sum-of-array-using-recursion',
    title: 'Sum of Array Using Recursion',
    difficulty: 'Easy',
    tags: ['Recursion & Backtracking', 'Arrays'],
    statement: 'Given an integer array nums, return the sum of all its elements computed recursively (the sum of an empty array is 0).',
    constraints: ['0 <= nums.length <= 1000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Base case: an empty array sums to 0.', 'sum(nums, i) = nums[i] + sum(nums, i + 1).'],
    args: 'nums',
    tests: [[[1, 2, 3, 4]], [[]], [[5]], [[-1, -2, -3]], [[10, -10]], [[0, 0, 0]], [[10000, 10000, 10000, -5]]],
    ref: (nums) => nums.reduce((a, b) => a + b, 0),
  },
  {
    slug: 'reverse-string-using-recursion',
    title: 'Reverse String Using Recursion',
    difficulty: 'Easy',
    tags: ['Recursion & Backtracking', 'Strings'],
    statement: 'Given a string s, return the string reversed, computed recursively (for example, "abc" becomes "cba"). The empty string stays empty.',
    constraints: ['0 <= s.length <= 1000', 's consists of printable ASCII characters'],
    hints: ['Base case: an empty string returns itself.', 'reverse(s) = reverse(s without its first character) + first character.'],
    args: 's',
    tests: [['hello'], [''], ['a'], ['ab'], ['racecar'], ['Hello World'], ['12345!']],
    ref: (s) => s.split('').reverse().join(''),
  },
  {
    slug: 'generate-all-subsets',
    title: 'Generate All Subsets',
    difficulty: 'Medium',
    tags: ['Recursion & Backtracking', 'Backtracking'],
    statement: 'Given an array nums of distinct integers, return all possible subsets (the power set), including the empty subset. Each subset must list its elements in ascending order. Return the list of subsets sorted lexicographically: compare subsets element by element, and a subset that is a prefix of another comes first (so the empty subset is first).',
    constraints: ['0 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'all elements of nums are distinct'],
    hints: ['For each element decide: include it or skip it.', 'Sort nums first; backtracking in index order then produces subsets already in lexicographic order.'],
    args: 'nums',
    tests: [[[1, 2, 3]], [[]], [[0]], [[3, 1]], [[-1, 2, 0]], [[5, 4, 3, 2]], [[1, 2, 3, 4, 5]]],
    ref: (nums) => {
      const a = nums.slice().sort((x, y) => x - y);
      const res = [];
      const go = (start, cur) => {
        res.push(cur.slice());
        for (let i = start; i < a.length; i++) { cur.push(a[i]); go(i + 1, cur); cur.pop(); }
      };
      go(0, []);
      return res;
    },
  },
];
