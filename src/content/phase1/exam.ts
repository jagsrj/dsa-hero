import type { Problem } from '../types';
import { fx, solutionStarter } from '../helpers';

export const phase1Exam: Problem[] = [
  {
    id: 'e1-majority', title: 'The majority flag', role: 'exam', difficulty: 'Easy', kind: 'function',
    statement: 'More than half of the ships fly the same flag. Return that flag number. Aim for O(n) time and O(1) space (no sorting).',
    starter: solutionStarter('public int majorityElement(int[] nums)', 'return 0;'),
    solution: `class Solution {
    public int majorityElement(int[] nums) {
        int candidate = 0, count = 0;
        for (int x : nums) {
            if (count == 0) candidate = x;
            count += (x == candidate) ? 1 : -1;
        }
        return candidate;
    }
}`,
    walkthrough: 'Boyer–Moore voting: pair each majority element against a different element and cancel them. The majority survives because it has more than half the votes.',
    hints: ['Think of votes cancelling out.', 'Keep a candidate and a counter; when the counter hits 0, adopt the current element.'],
    fn: { name: 'majorityElement', params: [{ name: 'nums', type: 'int[]' }], returns: 'int' },
    tests: [fx([[3, 2, 3]], 3), fx([[2, 2, 1, 1, 1, 2, 2]], 2), fx([[7]], 7), fx([[1, 9, 9, 9, 1]], 9, true), fx([{ gen: 'repeat', n: 200000, value: 42 }], 42, true, '200,000 ships')],
  },
  {
    id: 'e1-fruit', title: 'Two cargo types', role: 'exam', difficulty: 'Medium', kind: 'function',
    statement: 'Walking along a row of crates (`types[i]` is the cargo type), you can carry at most **two different types**. Return the length of the longest contiguous stretch you can collect.\n\n`[1, 2, 3, 2, 2]` → `4` (`[2, 3, 2, 2]`)',
    starter: solutionStarter('public int totalFruit(int[] types)', 'return 0;'),
    solution: `class Solution {
    public int totalFruit(int[] types) {
        int[] count = new int[types.length + 1];
        int left = 0, distinct = 0, best = 0;
        for (int right = 0; right < types.length; right++) {
            if (count[types[right]]++ == 0) distinct++;
            while (distinct > 2) {
                if (--count[types[left]] == 0) distinct--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
    hints: ['Longest window with at most two distinct values.', 'Types are in `0..n-1`, so a count array works.'],
    fn: { name: 'totalFruit', params: [{ name: 'types', type: 'int[]' }], returns: 'int' },
    oracle: `class DsaRef { static int totalFruit(int[] t) { int[] c = new int[t.length + 1]; int l = 0, d = 0, b = 0; for (int r = 0; r < t.length; r++) { if (c[t[r]]++ == 0) d++; while (d > 2) { if (--c[t[l]] == 0) d--; l++; } b = Math.max(b, r - l + 1); } return b; } }`,
    tests: [fx([[1, 2, 1]], 3), fx([[0, 1, 2, 2]], 3), fx([[1, 2, 3, 2, 2]], 4), fx([[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], 5, true), fx([{ gen: 'random', n: 200000, lo: 0, hi: 3, seed: 1 }], undefined, true, '200,000 crates')],
  },
  {
    id: 'e1-adjacent', title: 'Collapse duplicate signals', role: 'exam', difficulty: 'Easy', kind: 'function',
    statement: 'Repeatedly remove two **adjacent equal** letters until no such pair remains, and return the result.\n\n`"abbaca"` → `"ca"` (remove `bb` → `"aaca"`, then `aa` → `"ca"`)',
    starter: solutionStarter('public String removeAdjacent(String s)', 'return s;'),
    solution: `class Solution {
    public String removeAdjacent(String s) {
        StringBuilder st = new StringBuilder();   // used as a stack
        for (char c : s.toCharArray()) {
            int n = st.length();
            if (n > 0 && st.charAt(n - 1) == c) st.deleteCharAt(n - 1);
            else st.append(c);
        }
        return st.toString();
    }
}`,
    hints: ['A stack: if the new letter equals the top, pop; otherwise push.', 'A StringBuilder can act as a stack of chars.'],
    fn: { name: 'removeAdjacent', params: [{ name: 's', type: 'String' }], returns: 'String' },
    tests: [fx(['abbaca'], 'ca'), fx(['azxxzy'], 'ay'), fx(['aa'], ''), fx(['abc'], 'abc', true), fx(['ab'.repeat(5000) + 'ba'.repeat(5000)], '', true, 'length 20,000')],
  },
  {
    id: 'e1-addtwo', title: 'Add two cargo counts', role: 'exam', difficulty: 'Medium', kind: 'function', uses: ['ListNode'],
    statement: 'Two non-negative numbers are stored as linked lists with digits in **reverse order** (ones digit first). Return their sum as a list in the same format.\n\n`2 → 4 → 3` (342) + `5 → 6 → 4` (465) = `7 → 0 → 8` (807)',
    starter: `// ListNode is provided: int val; ListNode next; ListNode(int val); ListNode(int val, ListNode next)
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // Write your code here
        return null;
    }
}
`,
    solution: `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0), tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry;
            if (l1 != null) { sum += l1.val; l1 = l1.next; }
            if (l2 != null) { sum += l2.val; l2 = l2.next; }
            tail.next = new ListNode(sum % 10);
            tail = tail.next;
            carry = sum / 10;
        }
        return dummy.next;
    }
}`,
    hints: ['Add digit by digit like on paper, with a carry.', 'Keep going while either list has digits **or** a carry remains.'],
    fn: { name: 'addTwoNumbers', params: [{ name: 'l1', type: 'ListNode' }, { name: 'l2', type: 'ListNode' }], returns: 'ListNode' },
    tests: [fx([[2, 4, 3], [5, 6, 4]], [7, 0, 8]), fx([[0], [0]], [0]), fx([[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], [8, 9, 9, 9, 0, 0, 0, 1]), fx([[5], [5]], [0, 1], true), fx([[1], [9, 9]], [0, 0, 1], true)],
  },
];
