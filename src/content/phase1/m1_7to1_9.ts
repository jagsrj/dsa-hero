import type { Module } from '../types';
import { fx, solutionStarter } from '../helpers';

const LISTNODE_NOTE = `// Definition of ListNode (provided by the platform — do not redefine it):
// class ListNode {
//     int val;
//     ListNode next;
//     ListNode(int val) { this.val = val; }
//     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
// }
`;

export const m1_7: Module = {
  id: '1.7',
  phase: 1,
  title: 'Doubly linked lists and fast/slow pointers',
  tagline: 'Walk both ways, and catch loops with a tortoise and a hare.',
  hook: `A barge convoy has gone in circles all night — someone hooked the last barge back onto the middle of the chain. The harbor master needs two things: a convoy that can be walked in both directions, and a way to detect a loop without marking every barge.`,
  concept: `### Doubly linked lists

Each node knows both neighbours:

~~~java
class Node {
    int val;
    Node prev, next;
}
~~~

Now removing a node you hold is **O(1)** — no need to find its predecessor. Java's \`LinkedList\` and \`ArrayDeque\` give O(1) add/remove at **both** ends. Using **sentinel** nodes (dummy head and tail that are always there) removes every null check at the edges:

~~~
head ⇄ [1] ⇄ [2] ⇄ [3] ⇄ tail
~~~

### Fast and slow pointers (Floyd's tortoise and hare)

Move \`slow\` 1 step and \`fast\` 2 steps:

- **No cycle:** \`fast\` reaches \`null\`.
- **Cycle:** \`fast\` laps \`slow\` and they **meet** inside the loop — the gap shrinks by 1 every step, so they must collide.

O(n) time, **O(1) space** — no "visited" set needed.

### Finding where the cycle starts

After they meet, put one pointer back at the head and move **both** one step at a time. They meet again exactly at the start of the cycle. (Why: if the head is \`a\` steps from the loop start and they met \`b\` steps into the loop of length \`L\`, the maths gives \`a ≡ L − b (mod L)\`.)

### Other fast/slow tricks

- Middle of a list (fast reaches the end when slow is halfway).
- Split a list in half for palindrome checks or merge sort.

### LinkedList vs ArrayList in Java

| | ArrayList | LinkedList |
|---|---|---|
| get(i) | O(1) | O(n) |
| add/remove at ends | O(1)* end only | O(1) both ends |
| memory | compact, cache friendly | 2 references + object header per node |

In practice \`ArrayList\` (or \`ArrayDeque\` for queues) wins almost always; linked lists shine when you hold node references and splice often — like an LRU cache (Phase 3).`,
  visual: {
    kind: 'list',
    title: 'Tortoise and hare on a list with a cycle',
    frames: [
      { caption: 'Cycle: the tail (6) links back to node 3. Both start at the head.', values: [1, 2, 3, 4, 5, 6], pointers: { 0: 'slow, fast' }, output: '6 → back to 3' },
      { caption: 'slow +1, fast +2.', values: [1, 2, 3, 4, 5, 6], pointers: { 1: 'slow', 2: 'fast' }, output: '6 → back to 3' },
      { caption: 'slow +1, fast +2.', values: [1, 2, 3, 4, 5, 6], pointers: { 2: 'slow', 4: 'fast' }, output: '6 → back to 3' },
      { caption: 'fast wraps around the loop: 5 → 6 → 3.', values: [1, 2, 3, 4, 5, 6], pointers: { 3: 'slow', 2: 'fast' }, output: '6 → back to 3' },
      { caption: 'They meet at node 5. A cycle exists!', values: [1, 2, 3, 4, 5, 6], pointers: { 4: 'slow, fast' }, highlight: [4], output: '6 → back to 3' },
    ],
  },
  javaSpotlight: {
    title: 'LinkedList and ArrayDeque',
    body: 'Both implement `Deque`: `addFirst`, `addLast`, `pollFirst`, `pollLast`, `peekFirst`, `peekLast`. `ArrayDeque` is usually faster (a circular array), but does not allow `null` elements.',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> dq = new ArrayDeque<>();
        dq.addFirst(2); dq.addFirst(1); dq.addLast(3);
        System.out.println(dq);                  // [1, 2, 3]
        System.out.println(dq.pollLast() + " " + dq.pollFirst()); // 3 1
    }
}`,
  },
  problems: [
    {
      id: 'p1-7-dll', title: 'Build it: a doubly linked deque', role: 'guided', difficulty: 'Medium', kind: 'custom',
      statement: `Build \`IntDeque\` as a **doubly linked list** (use a private nested \`Node\` class with \`prev\` and \`next\`). Every operation must be O(1).

- \`addFirst(int x)\`, \`addLast(int x)\`
- \`int removeFirst()\`, \`int removeLast()\` — return \`-1\` if empty
- \`int peekFirst()\`, \`int peekLast()\` — return \`-1\` if empty
- \`int size()\`

Tip: two sentinel nodes (\`head\` and \`tail\`) that are always present make every operation the same shape.`,
      starter: `class IntDeque {
    private static class Node {
        int val;
        Node prev, next;
        Node(int val) { this.val = val; }
    }

    // TODO: sentinels and size

    void addFirst(int x) { }

    void addLast(int x) { }

    int removeFirst() { return -1; }

    int removeLast() { return -1; }

    int peekFirst() { return -1; }

    int peekLast() { return -1; }

    int size() { return 0; }
}
`,
      solution: `class IntDeque {
    private static class Node {
        int val;
        Node prev, next;
        Node(int val) { this.val = val; }
    }

    private final Node head = new Node(0), tail = new Node(0);
    private int size = 0;

    IntDeque() {
        head.next = tail;
        tail.prev = head;
    }

    private void insertAfter(Node p, int x) {
        Node n = new Node(x);
        n.prev = p;
        n.next = p.next;
        p.next.prev = n;
        p.next = n;
        size++;
    }

    private int unlink(Node n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
        size--;
        return n.val;
    }

    void addFirst(int x) { insertAfter(head, x); }

    void addLast(int x) { insertAfter(tail.prev, x); }

    int removeFirst() { return size == 0 ? -1 : unlink(head.next); }

    int removeLast() { return size == 0 ? -1 : unlink(tail.prev); }

    int peekFirst() { return size == 0 ? -1 : head.next.val; }

    int peekLast() { return size == 0 ? -1 : tail.prev.val; }

    int size() { return size; }
}`,
      walkthrough: 'With sentinels, the list is never truly empty, so `insertAfter` and `unlink` work identically at both ends and in the middle. Each touches four references: O(1).',
      hints: ['Create `head` and `tail` sentinel nodes in the constructor and link them to each other.', 'Write two helpers: `insertAfter(node, x)` and `unlink(node)`.', 'addLast = insertAfter(tail.prev, x).'],
      tests: [],
      customHarness: `T.test("addLast then removeFirst (queue)", "1 2 3", () -> { IntDeque d = new IntDeque(); d.addLast(1); d.addLast(2); d.addLast(3); return d.removeFirst() + " " + d.removeFirst() + " " + d.removeFirst(); });
        T.test("addFirst then removeFirst (stack)", "3 2 1", () -> { IntDeque d = new IntDeque(); d.addFirst(1); d.addFirst(2); d.addFirst(3); return d.removeFirst() + " " + d.removeFirst() + " " + d.removeFirst(); });
        T.test("mixed ends", "0 2 1", () -> { IntDeque d = new IntDeque(); d.addLast(1); d.addFirst(0); d.addLast(2); return d.peekFirst() + " " + d.removeLast() + " " + d.peekLast(); });
        T.test("empty returns -1", "-1 -1 -1 -1 0", () -> { IntDeque d = new IntDeque(); return d.removeFirst() + " " + d.removeLast() + " " + d.peekFirst() + " " + d.peekLast() + " " + d.size(); });
        T.test("size tracking", "2 1 0", () -> { IntDeque d = new IntDeque(); d.addLast(5); d.addFirst(4); int a = d.size(); d.removeLast(); int b = d.size(); d.removeFirst(); return a + " " + b + " " + d.size(); });
        T.test("reuse after emptying", 9, () -> { IntDeque d = new IntDeque(); d.addLast(1); d.removeFirst(); d.addFirst(9); return d.peekLast(); });
        T.test("1,000,000 operations stay O(1)", 499999500000L, () -> { IntDeque d = new IntDeque(); for (int i = 0; i < 1000000; i++) { if (i % 2 == 0) d.addFirst(i); else d.addLast(i); } long s = 0; while (d.size() > 0) s += d.removeLast(); return s; });`,
    },
    {
      id: 'p1-7-hascycle', title: 'Is the convoy going in circles?', role: 'mastery', difficulty: 'Easy', kind: 'custom', uses: ['ListNode'],
      statement: 'Return `true` if the linked list contains a cycle. Use **O(1) extra memory** (no sets).',
      starter: LISTNODE_NOTE + solutionStarter('public boolean hasCycle(ListNode head)', 'return false;'),
      solution: `class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
      hints: ['Tortoise and hare.', 'If `fast` or `fast.next` becomes null, there is no cycle.', 'Compare node references with `==`, not values.'],
      tests: [],
      customHarness: `T.test("cycle back to index 1", true, () -> new Solution().hasCycle(ListNode.ofCycle(new int[]{3, 2, 0, -4}, 1)));
        T.test("two nodes pointing at each other", true, () -> new Solution().hasCycle(ListNode.ofCycle(new int[]{1, 2}, 0)));
        T.test("no cycle", false, () -> new Solution().hasCycle(ListNode.of(new int[]{1, 2, 3})));
        T.test("single node, no cycle", false, () -> new Solution().hasCycle(ListNode.of(new int[]{1})));
        T.test("empty list", false, () -> new Solution().hasCycle(null));
        T.test("self loop", true, () -> new Solution().hasCycle(ListNode.ofCycle(new int[]{7}, 0)));
        T.test("long list with cycle", true, () -> new Solution().hasCycle(ListNode.ofCycle(T.genRange(1, 100000), 50000)));
        T.test("long list without cycle", false, () -> new Solution().hasCycle(ListNode.of(T.genRange(1, 100000))));`,
    },
    {
      id: 'p1-7-palin', title: 'Mirror convoy', role: 'mastery', difficulty: 'Medium', kind: 'function', uses: ['ListNode'],
      statement: 'Return `true` if the values of the linked list read the same forwards and backwards. Can you do it in O(n) time and **O(1) extra space**? (Find the middle, reverse the second half, compare.)',
      starter: LISTNODE_NOTE + solutionStarter('public boolean isPalindrome(ListNode head)', 'return false;'),
      solution: `class Solution {
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode prev = null;
        while (slow != null) {
            ListNode next = slow.next;
            slow.next = prev;
            prev = slow;
            slow = next;
        }
        for (ListNode a = head, b = prev; b != null; a = a.next, b = b.next) {
            if (a.val != b.val) return false;
        }
        return true;
    }
}`,
      hints: ['Fast/slow pointers find the middle.', 'Reverse from the middle to the end.', 'Walk from both heads comparing values.'],
      fn: { name: 'isPalindrome', params: [{ name: 'head', type: 'ListNode' }], returns: 'boolean' },
      tests: [fx([[1, 2, 2, 1]], true), fx([[1, 2]], false), fx([[1, 2, 3, 2, 1]], true), fx([[1]], true, true), fx([[1, 2, 3, 1]], false, true), fx([[]], true, true)],
    },
    {
      id: 'p1-7-oddeven', title: 'Odd barges first', role: 'mastery', difficulty: 'Medium', kind: 'function', uses: ['ListNode'],
      statement: 'Group all nodes at **odd positions** (1st, 3rd, 5th…) followed by those at even positions, keeping the relative order inside each group. Re-link nodes in O(1) extra space.\n\n`1 → 2 → 3 → 4 → 5` → `1 → 3 → 5 → 2 → 4`',
      starter: LISTNODE_NOTE + solutionStarter('public ListNode oddEvenList(ListNode head)', 'return head;'),
      solution: `class Solution {
    public ListNode oddEvenList(ListNode head) {
        if (head == null) return null;
        ListNode odd = head, even = head.next, evenHead = even;
        while (even != null && even.next != null) {
            odd.next = even.next;
            odd = odd.next;
            even.next = odd.next;
            even = even.next;
        }
        odd.next = evenHead;
        return head;
    }
}`,
      hints: ['Maintain two chains: odd and even.', 'Remember where the even chain starts.', 'At the end, attach the even chain after the last odd node.'],
      fn: { name: 'oddEvenList', params: [{ name: 'head', type: 'ListNode' }], returns: 'ListNode' },
      tests: [fx([[1, 2, 3, 4, 5]], [1, 3, 5, 2, 4]), fx([[2, 1, 3, 5, 6, 4, 7]], [2, 3, 6, 7, 1, 5, 4]), fx([[]], []), fx([[1, 2]], [1, 2], true), fx([[1, 2, 3]], [1, 3, 2], true)],
    },
    {
      id: 'p1-7-cyclestart', title: 'Boss: Where does the loop begin?', role: 'boss', difficulty: 'Medium', kind: 'custom', uses: ['ListNode'],
      statement: `Return the node where the cycle begins, or \`null\` if there is no cycle. Do not modify the list, and use **O(1) extra space**.

The tests check *which node* you return (by position), so you must return the node itself.`,
      starter: LISTNODE_NOTE + solutionStarter('public ListNode detectCycle(ListNode head)', 'return null;'),
      solution: `class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                ListNode p = head;
                while (p != slow) {
                    p = p.next;
                    slow = slow.next;
                }
                return p;
            }
        }
        return null;
    }
}`,
      walkthrough: 'Phase 1: tortoise and hare meet inside the loop. Phase 2: one pointer restarts from the head; both advance one step at a time and meet at the loop start. If the head is `a` steps before the loop and they met `b` steps into a loop of length `L`, then `2(a + b) = a + b + kL`, so `a = kL − b`: walking `a` steps from the meeting point lands exactly on the start.',
      hints: ['First detect the cycle with tortoise and hare.', 'Then move one pointer back to the head.', 'Advance both one step at a time; where they meet is the start.'],
      tests: [],
      customHarness: `T.test("cycle starts at index 1", 1, () -> { ListNode h = ListNode.ofCycle(new int[]{3, 2, 0, -4}, 1); return ListNode.indexOf(h, new Solution().detectCycle(h)); });
        T.test("cycle starts at head", 0, () -> { ListNode h = ListNode.ofCycle(new int[]{1, 2}, 0); return ListNode.indexOf(h, new Solution().detectCycle(h)); });
        T.test("no cycle", -1, () -> { ListNode h = ListNode.of(new int[]{1, 2, 3}); return ListNode.indexOf(h, new Solution().detectCycle(h)); });
        T.test("self loop", 0, () -> { ListNode h = ListNode.ofCycle(new int[]{5}, 0); return ListNode.indexOf(h, new Solution().detectCycle(h)); });
        T.test("empty", -1, () -> ListNode.indexOf(null, new Solution().detectCycle(null)));
        T.test("long tail, small loop", 99990, () -> { ListNode h = ListNode.ofCycle(T.genRange(1, 100000), 99990); return ListNode.indexOf(h, new Solution().detectCycle(h)); });
        T.test("short tail, big loop", 3, () -> { ListNode h = ListNode.ofCycle(T.genRange(1, 100000), 3); return ListNode.indexOf(h, new Solution().detectCycle(h)); });`,
      complexity: { prompt: 'Time and extra space of Floyd\'s algorithm?', options: ['O(n), O(n)', 'O(n), O(1)', 'O(n²), O(1)', 'O(log n), O(1)'], answer: 1, why: 'Both phases are linear; only two pointers are stored.' },
    },
  ],
  gateQuestion: {
    prompt: 'In Floyd\'s cycle detection, why must the fast and slow pointers meet if there is a cycle?',
    options: ['Because fast moves randomly', 'Inside the loop the gap between them shrinks by exactly 1 each step', 'Because the list is sorted', 'They don\'t always meet'],
    answer: 1,
    why: 'Once both are in the loop, fast gains one node per step, so the gap decreases 1 at a time and must reach 0.',
  },
  explainBack: {
    prompt: 'Explain how the tortoise-and-hare method detects a cycle using O(1) memory.',
    keyIdeas: [
      { idea: 'slow moves 1, fast moves 2', words: ['one step', 'two steps', '1 step', '2 steps', 'twice as fast', 'double'] },
      { idea: 'fast hits null if no cycle', words: ['null', 'end', 'no cycle'] },
      { idea: 'they meet if there is a cycle', words: ['meet', 'catch', 'same node', 'collide', 'lap'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-7-a', front: 'What do sentinel nodes buy you in a doubly linked list?', back: 'No null checks at the ends: every insert/remove has the same shape.' },
    { id: 'r1-7-b', front: 'After slow and fast meet, how do you find the cycle start?', back: 'Reset one pointer to head; move both 1 step at a time until they meet.' },
    { id: 'r1-7-c', front: 'Why prefer ArrayDeque to LinkedList as a queue?', back: 'Faster and more memory-efficient (circular array, no node objects).' },
  ],
};

export const m1_8: Module = {
  id: '1.8',
  phase: 1,
  title: 'Stacks and monotonic stacks',
  tagline: 'Last in, first out — the shape of undo, brackets and "next greater".',
  hook: `Crates in the harbor's narrow storage bay are stacked: the last one in must be the first one out. It sounds limiting, but this one rule powers undo buttons, bracket checkers, calculators and some of the slickest O(n) tricks in interviews.`,
  concept: `### LIFO

A **stack** supports three O(1) operations:

| Operation | Meaning |
|---|---|
| \`push(x)\` | put x on top |
| \`pop()\` | remove and return the top |
| \`peek()\` | look at the top without removing it |

In Java, use \`Deque<Integer> stack = new ArrayDeque<>();\` with \`push\`, \`pop\`, \`peek\` and \`isEmpty\`. (The old \`Stack\` class is synchronized and slow — avoid it.)

### Where stacks appear

- **Matching pairs:** brackets, HTML tags. Push openers; each closer must match the top.
- **Undo / back button:** push each action; pop to undo.
- **Expression evaluation:** postfix (Reverse Polish Notation) is evaluated with one stack.
- **Recursion:** the JVM's call stack is literally a stack of method frames.

### The monotonic stack

Keep the stack **always sorted** (e.g. decreasing from bottom to top). When a new element breaks the order, pop until it's restored — and each popped element has just found its **next greater element**: the newcomer.

~~~java
Deque<Integer> st = new ArrayDeque<>();      // holds indexes
for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && a[st.peek()] < a[i]) {
        int j = st.pop();
        answer[j] = a[i];                        // a[i] is the next greater for j
    }
    st.push(i);
}
~~~

Each index is pushed once and popped at most once: **O(n)** total, instead of O(n²) scanning right from every element.

**Signals:** "next greater/smaller", "previous greater/smaller", "how many days until…", "span".`,
  visual: {
    kind: 'stack',
    title: 'Checking brackets with a stack: "{[()]}"',
    frames: [
      { caption: "Read '{' — an opener: push.", values: ['{'] },
      { caption: "Read '[' — push.", values: ['{', '['] },
      { caption: "Read '(' — push.", values: ['{', '[', '('] },
      { caption: "Read ')' — top is '(' — match! pop.", values: ['{', '['], highlight: [1] },
      { caption: "Read ']' — top is '[' — match! pop.", values: ['{'] },
      { caption: "Read '}' — match! pop. Stack empty at the end → valid.", values: [] },
    ],
  },
  javaSpotlight: {
    title: 'ArrayDeque as a stack (and why not Stack)',
    body: '`java.util.Stack` extends `Vector`: every call takes a lock, and it exposes index-based methods that break the stack abstraction. `ArrayDeque` is faster and is the recommended stack.',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<String> undo = new ArrayDeque<>();
        undo.push("type A");
        undo.push("type B");
        System.out.println(undo.peek());  // type B
        System.out.println(undo.pop());   // type B
        System.out.println(undo.size());  // 1
    }
}`,
  },
  problems: [
    {
      id: 'p1-8-brackets', title: 'Balanced brackets', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: 'Given a string of only `()[]{}`, return `true` if every bracket is closed by the same type in the correct order.\n\n`"{[()]}"` → `true`, `"([)]"` → `false`',
      starter: solutionStarter('public boolean isValid(String s)', 'return false;', 'import java.util.*;\n\n'),
      solution: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                if (st.isEmpty()) return false;
                char open = st.pop();
                if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{')) return false;
            }
        }
        return st.isEmpty();
    }
}`,
      hints: ['Push every opening bracket.', 'For a closer: the stack must be non-empty and its top must be the matching opener.', 'At the end, the stack must be empty.'],
      fn: { name: 'isValid', params: [{ name: 's', type: 'String' }], returns: 'boolean' },
      tests: [fx(['{[()]}'], true), fx(['([)]'], false), fx(['()[]{}'], true), fx(['('], false, true), fx([']'], false, true), fx([''], true, true), fx(['(('.repeat(5000) + '))'.repeat(5000)], true, true, '20,000 brackets')],
    },
    {
      id: 'p1-8-minstack', title: 'Build it: MinStack', role: 'mastery', difficulty: 'Medium', kind: 'custom',
      statement: `Design \`MinStack\` where **every** operation is O(1):

- \`void push(int x)\`, \`void pop()\`, \`int top()\`
- \`int getMin()\` — the smallest value currently in the stack

The tests never call \`pop\`, \`top\` or \`getMin\` on an empty stack.`,
      starter: `import java.util.*;

class MinStack {
    void push(int x) { }

    void pop() { }

    int top() { return 0; }

    int getMin() { return 0; }
}
`,
      solution: `import java.util.*;

class MinStack {
    private final Deque<Integer> values = new ArrayDeque<>();
    private final Deque<Integer> mins = new ArrayDeque<>();

    void push(int x) {
        values.push(x);
        mins.push(mins.isEmpty() ? x : Math.min(x, mins.peek()));
    }

    void pop() {
        values.pop();
        mins.pop();
    }

    int top() { return values.peek(); }

    int getMin() { return mins.peek(); }
}`,
      walkthrough: 'A second stack stores "the minimum so far" at every height. Popping both together keeps them in sync, so the current minimum is always on top of `mins`.',
      hints: ['Scanning for the minimum is O(n). What could you remember at each push?', 'Keep a second stack where each entry is the minimum of everything at or below it.'],
      tests: [],
      customHarness: `T.test("classic sequence", "-3 0 -2", () -> { MinStack s = new MinStack(); s.push(-2); s.push(0); s.push(-3); int a = s.getMin(); s.pop(); int b = s.top(); return a + " " + b + " " + s.getMin(); });
        T.test("duplicates of the minimum", "1 1 2", () -> { MinStack s = new MinStack(); s.push(2); s.push(1); s.push(1); int a = s.getMin(); s.pop(); int b = s.getMin(); s.pop(); return a + " " + b + " " + s.getMin(); });
        T.test("increasing pushes", 5, () -> { MinStack s = new MinStack(); s.push(5); s.push(6); s.push(7); return s.getMin(); });
        T.test("200,000 operations", true, () -> { MinStack s = new MinStack(); int[] a = T.genRandom(200000, -1000000, 1000000, 2); int m = Integer.MAX_VALUE; for (int x : a) { s.push(x); m = Math.min(m, x); } if (s.getMin() != m) return false; for (int i = 0; i < 100000; i++) s.pop(); int m2 = Integer.MAX_VALUE; for (int i = 0; i < 100000; i++) m2 = Math.min(m2, a[i]); return s.getMin() == m2; });`,
    },
    {
      id: 'p1-8-rpn', title: 'The harbor calculator (RPN)', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: 'Evaluate an expression in **Reverse Polish Notation**: operands come before their operator. Tokens are integers or `+ - * /`. Division truncates toward zero (like Java\'s `/`).\n\n`["2", "1", "+", "3", "*"]` → `(2 + 1) × 3 = 9`',
      starter: solutionStarter('public int evalRPN(String[] tokens)', 'return 0;', 'import java.util.*;\n\n'),
      solution: `import java.util.*;

class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String t : tokens) {
            switch (t) {
                case "+" -> st.push(st.pop() + st.pop());
                case "*" -> st.push(st.pop() * st.pop());
                case "-" -> { int b = st.pop(), a = st.pop(); st.push(a - b); }
                case "/" -> { int b = st.pop(), a = st.pop(); st.push(a / b); }
                default -> st.push(Integer.parseInt(t));
            }
        }
        return st.pop();
    }
}`,
      hints: ['Numbers: push.', 'Operators: pop two values, apply, push the result.', 'Order matters for `-` and `/`: the first pop is the **right** operand.'],
      fn: { name: 'evalRPN', params: [{ name: 'tokens', type: 'String[]' }], returns: 'int' },
      tests: [fx([['2', '1', '+', '3', '*']], 9), fx([['4', '13', '5', '/', '+']], 6), fx([['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], 22), fx([['3', '4', '-']], -1, true), fx([['7', '-2', '/']], -3, true), fx([['42']], 42, true)],
    },
    {
      id: 'p1-8-nextgreater', title: 'Next taller crate', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: 'For each element, find the first element **to its right** that is strictly greater. Return those values, using `-1` where none exists. n can be 200,000 — use a monotonic stack.\n\n`[2, 1, 2, 4, 3]` → `[4, 2, 4, -1, -1]`',
      starter: solutionStarter('public int[] nextGreater(int[] nums)', 'return new int[0];', 'import java.util.*;\n\n'),
      solution: `import java.util.*;

class Solution {
    public int[] nextGreater(int[] nums) {
        int[] ans = new int[nums.length];
        Arrays.fill(ans, -1);
        Deque<Integer> st = new ArrayDeque<>();   // indexes, values decreasing
        for (int i = 0; i < nums.length; i++) {
            while (!st.isEmpty() && nums[st.peek()] < nums[i]) ans[st.pop()] = nums[i];
            st.push(i);
        }
        return ans;
    }
}`,
      hints: ['Store **indexes** on the stack.', 'When a new value is bigger than the value at the top index, it is that index\'s answer: pop and record.', 'Indexes left on the stack at the end have no greater element.'],
      fn: { name: 'nextGreater', params: [{ name: 'nums', type: 'int[]' }], returns: 'int[]' },
      oracle: `class DsaRef { static int[] nextGreater(int[] a) { int n = a.length; int[] r = new int[n]; int[] st = new int[n]; int sp = 0; for (int i = n - 1; i >= 0; i--) { while (sp > 0 && st[sp - 1] <= a[i]) sp--; r[i] = sp == 0 ? -1 : st[sp - 1]; st[sp++] = a[i]; } return r; } }`,
      tests: [fx([[2, 1, 2, 4, 3]], [4, 2, 4, -1, -1]), fx([[1, 2, 3]], [2, 3, -1]), fx([[3, 2, 1]], [-1, -1, -1]), fx([[5, 5]], [-1, -1], true), fx([{ gen: 'random', n: 200000, lo: 0, hi: 1000000, seed: 31 }], undefined, true, '200,000 random values'), fx([{ gen: 'repeat', n: 200000, value: 7 }], undefined, true, '200,000 equal values')],
      complexity: { prompt: 'Time complexity of the monotonic-stack solution?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'], answer: 2, why: 'Each index is pushed once and popped at most once.' },
    },
    {
      id: 'p1-8-temps', title: 'Boss: Waiting for warmer weather', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `\`temps[i]\` is the temperature on day \`i\`. Return \`answer\` where \`answer[i]\` is the number of days you must wait after day \`i\` for a **warmer** day, or \`0\` if there is none.

\`[73, 74, 75, 71, 69, 72, 76, 73]\` → \`[1, 1, 4, 2, 1, 1, 0, 0]\`

Up to 200,000 days — and some tests are designed so that checking every later day is far too slow.`,
      starter: solutionStarter('public int[] dailyTemperatures(int[] temps)', 'return new int[0];', 'import java.util.*;\n\n'),
      solution: `import java.util.*;

class Solution {
    public int[] dailyTemperatures(int[] temps) {
        int[] ans = new int[temps.length];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < temps.length; i++) {
            while (!st.isEmpty() && temps[st.peek()] < temps[i]) {
                int j = st.pop();
                ans[j] = i - j;
            }
            st.push(i);
        }
        return ans;
    }
}`,
      walkthrough: 'Exactly "next greater element", but the answer is the **distance** `i − j` instead of the value. The stack holds days still waiting for a warmer day, in decreasing temperature order.',
      hints: ['This is "next greater element" in disguise.', 'Keep indexes of days still waiting on a stack.', 'When day i is warmer than the day on top, pop it and record `i - j`.'],
      fn: { name: 'dailyTemperatures', params: [{ name: 'temps', type: 'int[]' }], returns: 'int[]' },
      oracle: `class DsaRef { static int[] dailyTemperatures(int[] t) { int n = t.length; int[] r = new int[n]; int[] st = new int[n]; int sp = 0; for (int i = n - 1; i >= 0; i--) { while (sp > 0 && t[st[sp - 1]] <= t[i]) sp--; r[i] = sp == 0 ? 0 : st[sp - 1] - i; st[sp++] = i; } return r; } }`,
      tests: [fx([[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]), fx([[30, 40, 50, 60]], [1, 1, 1, 0]), fx([[30, 60, 90]], [1, 1, 0]), fx([[90, 80, 70]], [0, 0, 0], true), fx([{ gen: 'random', n: 200000, lo: 30, hi: 100, seed: 17 }], undefined, true, '200,000 random days'), fx([{ gen: 'repeat', n: 200000, value: 50 }], undefined, true, '200,000 equal days (worst case for naive scanning)')],
      complexity: { prompt: 'Time complexity?', options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n · 70)'], answer: 1, why: 'Each day is pushed and popped at most once.' },
    },
  ],
  gateQuestion: {
    prompt: 'Why is the monotonic-stack "next greater element" algorithm O(n) even though it has a while loop inside a for loop?',
    options: ['The while loop runs at most once', 'Each index is pushed once and popped at most once, so total pops ≤ n', 'Because the input is sorted', 'It is actually O(n log n)'],
    answer: 1,
    why: 'Amortized analysis again: the total number of pops across the whole run can never exceed the number of pushes (n).',
  },
  explainBack: {
    prompt: 'What does a monotonic stack keep, and what happens when a new element breaks its order?',
    keyIdeas: [
      { idea: 'elements kept in sorted (e.g. decreasing) order', words: ['decreasing', 'increasing', 'sorted', 'order', 'monotonic'] },
      { idea: 'pop smaller elements when a bigger one arrives', words: ['pop', 'remove'] },
      { idea: 'popped elements have found their answer (next greater)', words: ['answer', 'next greater', 'found', 'record'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-8-a', front: 'Which Java class should you use as a stack?', back: '`ArrayDeque` (push / pop / peek). Avoid `java.util.Stack`.' },
    { id: 'r1-8-b', front: 'In RPN, which popped operand is on the right of `-`?', back: 'The first one popped.' },
    { id: 'r1-8-c', front: 'Signal words for a monotonic stack?', back: 'Next/previous greater or smaller, "days until", span.' },
  ],
};

export const m1_9: Module = {
  id: '1.9',
  phase: 1,
  title: 'Queues and deques',
  tagline: 'First in, first out — plus the deque that rules sliding windows.',
  hook: `Ships queue at the harbor entrance: first to arrive, first to dock. The harbor also keeps a live "biggest ship in the last k arrivals" board — and to keep it updated in O(1), you'll need a queue that works from both ends.`,
  concept: `### FIFO

A **queue** adds at the back and removes from the front:

| Operation | ArrayDeque method |
|---|---|
| enqueue | \`offer(x)\` / \`addLast(x)\` |
| dequeue | \`poll()\` / \`pollFirst()\` |
| look at front | \`peek()\` / \`peekFirst()\` |

All O(1). Declare it as \`Queue<Integer> q = new ArrayDeque<>();\`.

### Circular buffers

A fixed-size queue can live in an array with two indexes that **wrap around** using \`%\`:

~~~java
tail = (tail + 1) % capacity;
~~~

No shifting, no allocation — this is how \`ArrayDeque\`, network buffers and audio players work.

### Where queues appear

- Simulations (customers, print jobs, round-robin scheduling).
- Rate limiters ("requests in the last 3 seconds").
- **Breadth-first search** in trees and graphs (Phases 3–4).

### The monotonic deque

To track the **maximum of a sliding window**, keep a deque of indexes whose values are **decreasing**:

1. Pop from the **back** while the back's value is ≤ the new value (they can never be the max again).
2. Push the new index at the back.
3. Pop from the **front** if it has slid out of the window.
4. The front is the window's maximum.

Each index enters and leaves once: **O(n)** for all windows, versus O(n·k) recomputing each one.`,
  visual: {
    kind: 'queue',
    title: 'A queue at the harbor entrance',
    frames: [
      { caption: 'Ships A, B and C arrive in order.', values: ['A', 'B', 'C'] },
      { caption: 'poll(): A, the first to arrive, docks first.', values: ['B', 'C'] },
      { caption: 'offer(D): D joins at the back.', values: ['B', 'C', 'D'], highlight: [2] },
      { caption: 'peek() shows B without removing it.', values: ['B', 'C', 'D'], highlight: [0] },
    ],
  },
  javaSpotlight: {
    title: 'The Queue and Deque interfaces',
    body: '`offer`/`poll`/`peek` return `false`/`null` on failure; `add`/`remove`/`element` throw exceptions instead. Iterating a deque goes front to back; `descendingIterator()` goes back to front.',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Queue<String> ships = new ArrayDeque<>();
        ships.offer("Aurora"); ships.offer("Borealis");
        System.out.println(ships.poll());   // Aurora
        System.out.println(ships.peek());   // Borealis
        System.out.println(ships.poll() + " " + ships.poll()); // Borealis null
    }
}`,
  },
  problems: [
    {
      id: 'p1-9-circular', title: 'Build it: a circular queue', role: 'guided', difficulty: 'Medium', kind: 'custom',
      statement: `Build \`CircularQueue\` with a fixed capacity \`k\`, stored in an \`int[]\` that wraps around (no shifting, no collections).

- \`boolean enQueue(int x)\` — false if full
- \`boolean deQueue()\` — false if empty
- \`int front()\`, \`int rear()\` — \`-1\` if empty
- \`boolean isEmpty()\`, \`boolean isFull()\``,
      starter: `class CircularQueue {
    CircularQueue(int k) { }

    boolean enQueue(int x) { return false; }

    boolean deQueue() { return false; }

    int front() { return -1; }

    int rear() { return -1; }

    boolean isEmpty() { return true; }

    boolean isFull() { return false; }
}
`,
      solution: `class CircularQueue {
    private final int[] data;
    private int head = 0, size = 0;

    CircularQueue(int k) { data = new int[k]; }

    boolean enQueue(int x) {
        if (isFull()) return false;
        data[(head + size) % data.length] = x;
        size++;
        return true;
    }

    boolean deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % data.length;
        size--;
        return true;
    }

    int front() { return isEmpty() ? -1 : data[head]; }

    int rear() { return isEmpty() ? -1 : data[(head + size - 1) % data.length]; }

    boolean isEmpty() { return size == 0; }

    boolean isFull() { return size == data.length; }
}`,
      walkthrough: 'Track `head` and `size`. The next free slot is `(head + size) % k`; the rear is `(head + size − 1) % k`. Keeping `size` avoids the classic full-vs-empty ambiguity when head == tail.',
      hints: ['Store `head` (index of the front) and `size`.', 'Next write position: `(head + size) % capacity`.', 'Dequeue moves head forward with `% capacity`.'],
      tests: [],
      customHarness: `T.test("fill to capacity", "true true true false", () -> { CircularQueue q = new CircularQueue(3); return q.enQueue(1) + " " + q.enQueue(2) + " " + q.enQueue(3) + " " + q.enQueue(4); });
        T.test("rear and full", "3 true", () -> { CircularQueue q = new CircularQueue(3); q.enQueue(1); q.enQueue(2); q.enQueue(3); return q.rear() + " " + q.isFull(); });
        T.test("wrap around", "true 4 2", () -> { CircularQueue q = new CircularQueue(3); q.enQueue(1); q.enQueue(2); q.enQueue(3); q.deQueue(); boolean ok = q.enQueue(4); return ok + " " + q.rear() + " " + q.front(); });
        T.test("empty queue", "-1 -1 false true", () -> { CircularQueue q = new CircularQueue(2); return q.front() + " " + q.rear() + " " + q.deQueue() + " " + q.isEmpty(); });
        T.test("many wraps", 99999, () -> { CircularQueue q = new CircularQueue(5); for (int i = 0; i < 100000; i++) { if (q.isFull()) q.deQueue(); q.enQueue(i); } return q.rear(); });`,
    },
    {
      id: 'p1-9-recent', title: 'Rate limiter: recent pings', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `\`RecentCounter.ping(int t)\` records a request at time \`t\` (milliseconds) and returns how many requests happened in \`[t − 3000, t]\`. Calls come with **strictly increasing** \`t\`.`,
      starter: `import java.util.*;

class RecentCounter {
    int ping(int t) {
        return 0;
    }
}
`,
      solution: `import java.util.*;

class RecentCounter {
    private final Deque<Integer> q = new ArrayDeque<>();

    int ping(int t) {
        q.offer(t);
        while (q.peek() < t - 3000) q.poll();
        return q.size();
    }
}`,
      hints: ['Keep recent times in a queue.', 'Before answering, drop times older than `t - 3000` from the front.'],
      tests: [],
      customHarness: `T.test("example", "1 2 3 3", () -> { RecentCounter r = new RecentCounter(); return r.ping(1) + " " + r.ping(100) + " " + r.ping(3001) + " " + r.ping(3002); });
        T.test("all old requests expire", 1, () -> { RecentCounter r = new RecentCounter(); r.ping(1); r.ping(2); return r.ping(10000); });
        T.test("boundary is inclusive", 2, () -> { RecentCounter r = new RecentCounter(); r.ping(1000); return r.ping(4000); });
        T.test("200,000 pings", 3001, () -> { RecentCounter r = new RecentCounter(); int last = 0; for (int t = 1; t <= 200000; t++) last = r.ping(t); return last; });`,
    },
    {
      id: 'p1-9-movingavg', title: 'Moving average of ship speeds', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: '`MovingAverage(int size)`; `double next(int val)` adds a value and returns the average of the last `size` values (or fewer, at the start). Each call must be O(1).',
      starter: `import java.util.*;

class MovingAverage {
    MovingAverage(int size) { }

    double next(int val) {
        return 0;
    }
}
`,
      solution: `import java.util.*;

class MovingAverage {
    private final int size;
    private final Deque<Integer> window = new ArrayDeque<>();
    private long sum = 0;

    MovingAverage(int size) { this.size = size; }

    double next(int val) {
        window.offer(val);
        sum += val;
        if (window.size() > size) sum -= window.poll();
        return (double) sum / window.size();
    }
}`,
      hints: ['Queue of the last `size` values plus a running sum.', 'When the queue grows too big, subtract the polled value.'],
      tests: [],
      customHarness: `T.test("example", "1.0 5.5 4.666666666666667 6.0", () -> { MovingAverage m = new MovingAverage(3); return m.next(1) + " " + m.next(10) + " " + m.next(3) + " " + m.next(5); });
        T.test("window of 1", 9.0, () -> { MovingAverage m = new MovingAverage(1); m.next(4); return m.next(9); });
        T.test("large values", 2.0E9, () -> { MovingAverage m = new MovingAverage(2); m.next(2000000000); return m.next(2000000000); });
        T.test("1,000,000 updates", 999949.5, () -> { MovingAverage m = new MovingAverage(100); double r = 0; for (int i = 0; i < 1000000; i++) r = m.next(i); return r; });`,
    },
    {
      id: 'p1-9-josephus', title: 'Who steers the last boat?', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: '`n` sailors numbered `1..n` stand in a circle. Starting from sailor 1, count `k` sailors around the circle; the k-th steps out. Counting continues from the next sailor. Return the number of the last sailor left. (1 ≤ n, k ≤ 1000)\n\n`n = 5, k = 2` → `3`',
      starter: solutionStarter('public int lastRemaining(int n, int k)', 'return 0;', 'import java.util.*;\n\n'),
      solution: `import java.util.*;

class Solution {
    public int lastRemaining(int n, int k) {
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) q.offer(i);
        while (q.size() > 1) {
            for (int i = 1; i < k; i++) q.offer(q.poll());   // move k-1 sailors to the back
            q.poll();                                        // the k-th steps out
        }
        return q.peek();
    }
}`,
      walkthrough: 'A queue models the circle: moving someone from the front to the back is "counting past" them. O(n·k). (There is also an O(n) recurrence: `J(1) = 0, J(n) = (J(n−1) + k) % n`.)',
      hints: ['Put 1..n in a queue.', 'Counting past a sailor = poll from the front, offer at the back.', 'The k-th sailor is polled and not put back.'],
      fn: { name: 'lastRemaining', params: [{ name: 'n', type: 'int' }, { name: 'k', type: 'int' }], returns: 'int' },
      tests: [fx([5, 2], 3), fx([6, 5], 1), fx([1, 7], 1), fx([7, 3], 4, true), fx([1000, 1000], 609, true)],
    },
    {
      id: 'p1-9-windowmax', title: 'Boss: Biggest ship in every window', role: 'boss', difficulty: 'Hard', kind: 'function',
      statement: `Return the maximum of every window of size \`k\` as it slides from left to right (\`n − k + 1\` values).

\`nums = [1, 3, −1, −3, 5, 3, 6, 7], k = 3\` → \`[3, 3, 5, 5, 6, 7]\`

n is up to 200,000 and k up to 50,000. Recomputing each window (O(n·k)) is too slow — use a monotonic deque for O(n).`,
      starter: solutionStarter('public int[] maxSlidingWindow(int[] nums, int k)', 'return new int[0];', 'import java.util.*;\n\n'),
      solution: `import java.util.*;

class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] out = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();   // indexes, values decreasing
        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();          // slid out
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast(); // never max again
            dq.offerLast(i);
            if (i >= k - 1) out[i - k + 1] = nums[dq.peekFirst()];
        }
        return out;
    }
}`,
      walkthrough: 'An element smaller than a newer one can never be a window maximum again — the newer one outlives it. So the deque only keeps candidates in decreasing order; the front is the current max. Each index is added and removed once: O(n) time, O(k) space.',
      hints: ['Store indexes in a deque, with values decreasing from front to back.', 'Before adding i, pop from the back every index whose value is ≤ nums[i].', 'Drop the front if it is outside the window; the front is then the max.'],
      fn: { name: 'maxSlidingWindow', params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }], returns: 'int[]' },
      oracle: `class DsaRef { static int[] maxSlidingWindow(int[] a, int k) { int n = a.length; int[] o = new int[n - k + 1]; int[] dq = new int[n]; int h = 0, t = 0; for (int i = 0; i < n; i++) { if (h < t && dq[h] <= i - k) h++; while (h < t && a[dq[t - 1]] <= a[i]) t--; dq[t++] = i; if (i >= k - 1) o[i - k + 1] = a[dq[h]]; } return o; } }`,
      tests: [fx([[1, 3, -1, -3, 5, 3, 6, 7], 3], [3, 3, 5, 5, 6, 7]), fx([[1], 1], [1]), fx([[9, 8, 7, 6], 2], [9, 8, 7]), fx([[1, -1], 1], [1, -1], true), fx([[4, 4, 4, 1], 2], [4, 4, 4], true), fx([{ gen: 'random', n: 200000, lo: -1000000, hi: 1000000, seed: 23 }, 50000], undefined, true, 'n = 200,000, k = 50,000'), fx([{ gen: 'range', from: 1, to: 200000 }, 1000], undefined, true, 'increasing values')],
      complexity: { prompt: 'Time complexity of the monotonic-deque solution?', options: ['O(n·k)', 'O(n log k)', 'O(n)', 'O(k)'], answer: 2, why: 'Every index is pushed once and popped at most once.' },
    },
  ],
  gateQuestion: {
    prompt: 'In a circular buffer of capacity 5, `head = 3` and `size = 4`. At which index does the next `enQueue` write?',
    options: ['7', '2', '4', '0'],
    answer: 1,
    why: '`(head + size) % capacity = (3 + 4) % 5 = 2`.',
  },
  explainBack: {
    prompt: 'For the sliding-window maximum, why can you throw away elements smaller than the new one from the back of the deque?',
    keyIdeas: [
      { idea: 'the new element is larger and stays in the window longer', words: ['larger', 'bigger', 'newer', 'later', 'longer', 'outlive'] },
      { idea: 'so smaller older ones can never be the maximum again', words: ['never', 'cannot', "can't", 'useless', 'no longer'] },
      { idea: 'each index added/removed once → O(n)', words: ['once', 'o(n)', 'linear'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-9-a', front: 'Queue methods that return null instead of throwing?', back: '`offer`, `poll`, `peek`.' },
    { id: 'r1-9-b', front: 'Next write index in a circular buffer?', back: '`(head + size) % capacity`' },
    { id: 'r1-9-c', front: 'What does the front of the monotonic deque hold?', back: 'The index of the current window maximum.' },
  ],
};
