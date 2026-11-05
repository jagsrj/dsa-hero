import type { Module } from '../types';
import { fx, solutionStarter } from '../helpers';

export const m1_1: Module = {
  id: '1.1',
  phase: 1,
  title: 'Big-O: measuring code',
  tagline: 'Predict how your code slows down as the input grows.',
  hook: `Welcome to **the Harbor**, Codeville's busy port. Ships arrive with 10 crates on Monday and 10 million on Friday. A sorting method that felt instant on Monday now takes all week. The harbor master wants one skill from you: **predicting** how long code takes before you run it.`,
  concept: `### Count steps, not seconds

Seconds depend on the machine. Instead, count how the **number of basic steps** grows with the input size **n**.

~~~java
long sum = 0;
for (int x : a) sum += x;          // n steps         → O(n)

for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        count++;                    // n × n steps     → O(n²)
~~~

### Big-O keeps only what matters for large n

- Drop constants: \`3n + 7\` → **O(n)**.
- Keep the fastest-growing term: \`n² + 100n\` → **O(n²)**.

| Big-O | Name | n = 1,000,000 → steps | Example |
|---|---|---|---|
| O(1) | constant | 1 | \`a[i]\`, a formula |
| O(log n) | logarithmic | ~20 | binary search |
| O(n) | linear | 10⁶ | one loop |
| O(n log n) | linearithmic | ~2 × 10⁷ | good sorting |
| O(n²) | quadratic | 10¹² 😱 | nested loops |
| O(2ⁿ) | exponential | astronomical | trying every subset |

**Rule of thumb:** a computer does roughly 10⁸ simple steps per second. With n = 10⁵, O(n²) = 10¹⁰ steps — that's minutes, not milliseconds. The tests in this phase include **big inputs** to prove it: a slow solution will hit the time limit.

### Space complexity

Memory counts too. Creating a new array of size n is **O(n) extra space**; using a few variables is **O(1)**.

### Worst, best, average

Big-O usually describes the **worst case**. Searching an unsorted array is O(n) because the item might be last (or missing).

### The trick behind fast solutions

Most speed-ups follow the same idea: **avoid repeated work**. Instead of re-scanning the array for every element (O(n²)), remember what you've already seen — in a counter array, a running sum or a sorted order (O(n) or O(n log n)).`,
  visual: { kind: 'growth', title: 'How step counts grow with n', frames: [{ caption: 'Drag through: as n grows, O(n²) leaves everything else behind.' }] },
  javaSpotlight: {
    title: 'Timing code with System.nanoTime',
    body: 'Big-O predicts the trend; `System.nanoTime()` measures reality. Double n and watch: O(n) time doubles, O(n²) time quadruples.',
    code: `public class Main {
    public static void main(String[] args) {
        for (int n = 1000; n <= 8000; n *= 2) {
            long t0 = System.nanoTime();
            long count = 0;
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) count++;
            long ms = (System.nanoTime() - t0) / 1_000_000;
            System.out.println("n=" + n + "  " + ms + " ms");
        }
    }
}`,
  },
  problems: [
    {
      id: 'p1-1-sumto', title: 'Gauss at the harbor', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: `Return \`1 + 2 + … + n\` for \`1 ≤ n ≤ 3,000,000,000\`.

A loop works for small n — but n can be three billion. Find an **O(1)** formula.

(Hint from young Gauss: pair the first and last numbers.)`,
      starter: solutionStarter('public long sumTo(long n)', 'return 0;'),
      solution: `class Solution {
    public long sumTo(long n) {
        return n * (n + 1) / 2;
    }
}`,
      walkthrough: 'Pair 1 with n, 2 with n−1, … each pair sums to n + 1 and there are n/2 pairs: **n(n + 1)/2**. One multiplication instead of billions of additions: O(1). For n = 3 × 10⁹, n(n + 1) ≈ 9 × 10¹⁸, which still fits in a long (max ≈ 9.22 × 10¹⁸).',
      hints: ['1 + n = n + 1, 2 + (n − 1) = n + 1, …', 'There are n/2 such pairs.', '`n * (n + 1) / 2` — and use `long`.'],
      fn: { name: 'sumTo', params: [{ name: 'n', type: 'long' }], returns: 'long' },
      tests: [fx([4], 10), fx([1], 1), fx([100000], 5000050000), fx(['3000000000'], '4500000001500000000', true, 'n = 3 billion (a loop is far too slow)')],
      complexity: { prompt: 'What is the time complexity of the formula solution?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 2, why: 'A fixed number of arithmetic operations, regardless of n.' },
    },
    {
      id: 'p1-1-missing', title: 'The missing crate', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: `Crates numbered \`0\` to \`n\` should arrive, but one is missing. \`nums\` holds the \`n\` crates that did arrive, in any order. Return the missing number.

n can be 200,000, so checking every number against every crate (O(n²)) is too slow. Aim for **O(n) time, O(1) extra space**.`,
      starter: solutionStarter('public int missingNumber(int[] nums)', 'return 0;'),
      solution: `class Solution {
    public int missingNumber(int[] nums) {
        long n = nums.length;
        long expected = n * (n + 1) / 2;
        long actual = 0;
        for (int x : nums) actual += x;
        return (int) (expected - actual);
    }
}`,
      walkthrough: 'The numbers 0..n should sum to n(n+1)/2. Subtract what actually arrived; the difference is the missing crate. (XOR-ing all indexes and values also works.)',
      hints: ['What should all numbers 0..n add up to?', 'Subtract the actual sum.', 'Use `long` for the sums.'],
      fn: { name: 'missingNumber', params: [{ name: 'nums', type: 'int[]' }], returns: 'int' },
      oracle: `class DsaRef { static int missingNumber(int[] a) { boolean[] seen = new boolean[a.length + 1]; for (int x : a) seen[x] = true; for (int i = 0; i <= a.length; i++) if (!seen[i]) return i; return -1; } }`,
      tests: [fx([[3, 0, 1]], 2), fx([[0, 1]], 2), fx([[1]], 0), fx([{ gen: 'missing', n: 200000, missing: 199990, seed: 7 }], undefined, true, '200,000 crates'), fx([{ gen: 'missing', n: 200000, missing: 0, seed: 3 }], undefined, true, '200,000 crates, 0 missing')],
      complexity: { prompt: 'Time and extra space of the sum solution?', options: ['O(n) time, O(n) space', 'O(n) time, O(1) space', 'O(n²) time, O(1) space', 'O(log n) time, O(1) space'], answer: 1, why: 'One pass and two counters.' },
    },
    {
      id: 'p1-1-countmax', title: 'How many tallest crates?', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return how many times the maximum value appears in the non-empty array `a`. Do it in **one pass**.',
      starter: solutionStarter('public int countMax(int[] a)', 'return 0;'),
      solution: `class Solution {
    public int countMax(int[] a) {
        int max = a[0], count = 0;
        for (int x : a) {
            if (x > max) { max = x; count = 1; }
            else if (x == max) count++;
        }
        return count;
    }
}`,
      hints: ['Track the max so far and how many times you have seen it.', 'When you find a bigger value, reset the count to 1.'],
      fn: { name: 'countMax', params: [{ name: 'a', type: 'int[]' }], returns: 'int' },
      oracle: `class DsaRef { static int countMax(int[] a) { int m = Integer.MIN_VALUE; for (int x : a) m = Math.max(m, x); int c = 0; for (int x : a) if (x == m) c++; return c; } }`,
      tests: [fx([[3, 9, 9, 2]], 2), fx([[5]], 1), fx([[-1, -1, -1]], 3), fx([{ gen: 'random', n: 200000, lo: 0, hi: 1000, seed: 11 }], undefined, true, '200,000 values')],
    },
    {
      id: 'p1-1-pairs', title: 'Matching pairs', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: `Each crate has a label from **0 to 1000**. Return the number of pairs \`(i, j)\` with \`i < j\` and \`a[i] == a[j]\`.

With 200,000 crates, comparing every pair is 2 × 10¹⁰ steps. Find an O(n) approach.`,
      starter: solutionStarter('public long countEqualPairs(int[] a)', 'return 0;'),
      solution: `class Solution {
    public long countEqualPairs(int[] a) {
        long[] count = new long[1001];
        long pairs = 0;
        for (int x : a) {
            pairs += count[x];   // x pairs with every earlier x
            count[x]++;
        }
        return pairs;
    }
}`,
      walkthrough: 'When you meet a value you have already seen `c` times, it forms `c` new pairs. Counting with an array indexed by label turns O(n²) into O(n + 1001).',
      hints: ['Labels are small (0–1000): count them in an array.', 'A value that appears c times forms c × (c − 1) / 2 pairs.', 'Or add `count[x]` to the answer before incrementing it.'],
      fn: { name: 'countEqualPairs', params: [{ name: 'a', type: 'int[]' }], returns: 'long' },
      oracle: `class DsaRef { static long countEqualPairs(int[] a) { long[] c = new long[1001]; for (int x : a) c[x]++; long p = 0; for (long v : c) p += v * (v - 1) / 2; return p; } }`,
      tests: [fx([[1, 2, 1, 1]], 3), fx([[1, 2, 3]], 0), fx([[7, 7]], 1), fx([{ gen: 'random', n: 200000, lo: 0, hi: 1000, seed: 5 }], undefined, true, '200,000 crates'), fx([{ gen: 'repeat', n: 100000, value: 4 }], undefined, true, '100,000 identical crates')],
      complexity: { prompt: 'Time complexity of the counting solution?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'], answer: 2, why: 'One pass over n crates plus a fixed-size count array.' },
    },
    {
      id: 'p1-1-mindiff', title: 'Boss: Closest crate weights', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `Return the smallest difference \`|a[i] − a[j]|\` between any two different crates (\`i ≠ j\`). There are at least 2 crates; weights range from −10⁹ to 10⁹.

There are up to 200,000 crates. Comparing all pairs is O(n²) — too slow. Can sorting help? (\`Arrays.sort\` runs in O(n log n).)

Watch out: the difference of two weights can exceed the \`int\` range.`,
      starter: solutionStarter('public long minDiff(int[] a)', 'return 0;'),
      solution: `import java.util.Arrays;

class Solution {
    public long minDiff(int[] a) {
        int[] b = a.clone();
        Arrays.sort(b);
        long best = Long.MAX_VALUE;
        for (int i = 1; i < b.length; i++) best = Math.min(best, (long) b[i] - b[i - 1]);
        return best;
    }
}`,
      walkthrough: 'After sorting, the closest pair must be **neighbours** — any element between two others is closer to each of them. So sort (O(n log n)) and scan adjacent pairs (O(n)). Cast to `long` before subtracting: 10⁹ − (−10⁹) overflows an int.',
      hints: ['If the array were sorted, which pairs could be the closest?', 'Only neighbours in sorted order need checking.', 'Compute differences as `(long) b[i] - b[i - 1]`.'],
      fn: { name: 'minDiff', params: [{ name: 'a', type: 'int[]' }], returns: 'long' },
      oracle: `class DsaRef { static long minDiff(int[] a) { int[] b = a.clone(); java.util.Arrays.sort(b); long m = Long.MAX_VALUE; for (int i = 1; i < b.length; i++) m = Math.min(m, (long) b[i] - b[i - 1]); return m; } }`,
      tests: [fx([[4, 9, 1, 32, 13]], 3), fx([[5, 5]], 0), fx([[-1000000000, 1000000000]], 2000000000), fx([{ gen: 'random', n: 200000, lo: -1000000000, hi: 1000000000, seed: 42 }], undefined, true, '200,000 random weights'), fx([{ gen: 'range', from: 1, to: 200000 }], undefined, true, '200,000 sorted weights')],
      complexity: { prompt: 'Overall time complexity?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 1, why: 'Sorting dominates: O(n log n), plus an O(n) scan.' },
    },
  ],
  gateQuestion: {
    prompt: 'What is the time complexity?\n\n~~~java\nfor (int i = 0; i < n; i++)\n    for (int j = i; j < n; j++)\n        count++;\n~~~',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    answer: 2,
    why: 'The inner loop runs n + (n−1) + … + 1 = n(n+1)/2 times. Constants drop: O(n²).',
  },
  explainBack: {
    prompt: 'Why do we drop constants and smaller terms in Big-O? What does O(n²) tell you about doubling the input?',
    keyIdeas: [
      { idea: 'Big-O describes growth for large n', words: ['growth', 'grows', 'large', 'scale', 'big input', 'trend'] },
      { idea: 'constants / small terms stop mattering', words: ['constant', 'dominat', 'smaller term', 'ignore', "don't matter", 'do not matter'] },
      { idea: 'doubling n makes O(n²) ~4× slower', words: ['four', '4x', '4 times', 'quadruple', '4×'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-1-a', front: 'Simplify O(3n² + 50n + 7).', back: 'O(n²)' },
    { id: 'r1-1-b', front: 'About how many simple steps per second does a computer do?', back: 'Roughly 10⁸.' },
    { id: 'r1-1-c', front: 'If n doubles, how much slower is O(n log n)?', back: 'A little more than 2×.' },
  ],
};

export const m1_2: Module = {
  id: '1.2',
  phase: 1,
  title: 'Arrays and two pointers',
  tagline: 'Two indexes walking toward each other turn O(n²) into O(n).',
  hook: `Two cranes work from opposite ends of the harbor's crate row. Each decision moves one of them closer, so they never revisit a crate. That's the **two-pointer** technique, and it solves a surprising number of problems in one pass.`,
  concept: `### The idea

Put one pointer at the **left** end and one at the **right** end. Look at both values, decide which pointer to move, and repeat until they meet. Each step discards an element for good, so the whole thing is **O(n)**.

~~~java
int i = 0, j = a.length - 1;
while (i < j) {
    if (/* condition */) i++;
    else j--;
}
~~~

### Why it works on sorted arrays

To find two numbers with sum \`target\` in a **sorted** array:

- If \`a[i] + a[j]\` is **too small**, the only way to grow it is to move \`i\` right (\`a[j]\` is already the biggest).
- If it is **too big**, move \`j\` left.

No pair is ever skipped that could be the answer.

### Same-direction pointers (read / write)

Another flavour: a fast **read** pointer scans everything, and a slow **write** pointer marks where the next kept element goes. This is how you filter an array **in place** with O(1) extra space:

~~~java
int w = 0;
for (int r = 0; r < a.length; r++) {
    if (keep(a[r])) a[w++] = a[r];
}
// a[0..w-1] holds the kept elements
~~~

### Recognise the pattern

Reach for two pointers when you see: **sorted array**, **pairs**, **in place**, **reverse**, **palindrome**, or "from both ends".`,
  visual: {
    kind: 'array',
    title: 'Two pointers finding a pair that sums to 9',
    frames: [
      { caption: 'Sorted array. Target 9. i at the left, j at the right.', values: [1, 2, 4, 6, 8, 11], pointers: { 0: 'i', 5: 'j' } },
      { caption: '1 + 11 = 12 > 9: too big. Move j left.', values: [1, 2, 4, 6, 8, 11], pointers: { 0: 'i', 5: 'j' }, highlight: [0, 5] },
      { caption: '1 + 8 = 9? Yes! Found it with only 2 checks.', values: [1, 2, 4, 6, 8, 11], pointers: { 0: 'i', 4: 'j' }, highlight: [0, 4] },
      { caption: 'Try target 10: 1 + 8 = 9 < 10, too small: move i right.', values: [1, 2, 4, 6, 8, 11], pointers: { 1: 'i', 4: 'j' }, highlight: [1, 4] },
      { caption: '2 + 8 = 10. Each step discards one element, so at most n steps.', values: [1, 2, 4, 6, 8, 11], pointers: { 1: 'i', 4: 'j' }, highlight: [1, 4] },
    ],
  },
  javaSpotlight: {
    title: 'Arrays.sort and Arrays.fill',
    body: '`Arrays.sort(a)` sorts primitives in O(n log n) (a tuned quicksort). `Arrays.fill(a, v)` sets every slot. `a.clone()` makes a copy so you do not modify the caller\'s array by accident.',
    code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] crates = {8, 3, 5, 1};
        int[] sorted = crates.clone();
        Arrays.sort(sorted);
        System.out.println(Arrays.toString(crates) + " " + Arrays.toString(sorted));
    }
}`,
  },
  problems: [
    {
      id: 'p1-2-twosum', title: 'Two Sum on a sorted row', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: 'The array `numbers` is sorted in non-decreasing order. Exactly one pair `i < j` has `numbers[i] + numbers[j] == target`. Return `[i, j]` (0-based).\n\nUse O(1) extra space.',
      starter: solutionStarter('public int[] twoSum(int[] numbers, int target)', 'return new int[0];'),
      solution: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int i = 0, j = numbers.length - 1;
        while (i < j) {
            int sum = numbers[i] + numbers[j];
            if (sum == target) return new int[]{i, j};
            if (sum < target) i++;
            else j--;
        }
        return new int[0];
    }
}`,
      hints: ['Start with `i = 0`, `j = length - 1`.', 'Sum too small → `i++`. Too big → `j--`.'],
      fn: { name: 'twoSum', params: [{ name: 'numbers', type: 'int[]' }, { name: 'target', type: 'int' }], returns: 'int[]' },
      tests: [fx([[2, 7, 11, 15], 9], [0, 1]), fx([[1, 2, 4, 6, 8, 11], 10], [1, 4]), fx([[-3, -1, 0, 5], -4], [0, 1], true), fx([[1, 3, 4, 5, 7, 10, 11], 21], [5, 6], true)],
      complexity: { prompt: 'Time complexity?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'], answer: 0, why: 'Each step moves one pointer; they meet after at most n steps.' },
    },
    {
      id: 'p1-2-zeroes', title: 'Empty crates to the back', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Move all `0`s to the end of `nums` **in place**, keeping the order of the non-zero values.\n\n`[0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`',
      starter: solutionStarter('public void moveZeroes(int[] nums)', ''),
      solution: `class Solution {
    public void moveZeroes(int[] nums) {
        int w = 0;
        for (int r = 0; r < nums.length; r++) {
            if (nums[r] != 0) nums[w++] = nums[r];
        }
        while (w < nums.length) nums[w++] = 0;
    }
}`,
      hints: ['Use a write pointer `w` for where the next non-zero goes.', 'After the scan, fill the rest with zeros.'],
      fn: { name: 'moveZeroes', params: [{ name: 'nums', type: 'int[]' }], returns: 'void', checkArg: 0 },
      oracle: `class DsaRef { static void moveZeroes(int[] a) { int w = 0; for (int x : a) if (x != 0) a[w++] = x; while (w < a.length) a[w++] = 0; } }`,
      tests: [fx([[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]), fx([[0]], [0]), fx([[1, 2]], [1, 2]), fx([{ gen: 'random', n: 200000, lo: 0, hi: 3, seed: 9 }], undefined, true, '200,000 crates')],
    },
    {
      id: 'p1-2-dedupe', title: 'Remove duplicates (sorted)', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `\`nums\` is sorted. Remove duplicates **in place** so each value appears once, and return the number of unique values \`k\`. The first \`k\` slots must hold the unique values in order (what is after them doesn't matter).

\`[1, 1, 2, 3, 3]\` → return 3, array starts \`[1, 2, 3, …]\``,
      starter: solutionStarter('public int removeDuplicates(int[] nums)', 'return 0;'),
      solution: `class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int w = 1;
        for (int r = 1; r < nums.length; r++) {
            if (nums[r] != nums[w - 1]) nums[w++] = nums[r];
        }
        return w;
    }
}`,
      hints: ['Keep the first element. Write pointer `w = 1`.', 'Copy `nums[r]` only when it differs from the last written value.'],
      tests: [],
      customHarness: `T.test("[1,1,2,3,3]", T.li(1, 2, 3), () -> { int[] a = {1, 1, 2, 3, 3}; int k = new Solution().removeDuplicates(a); return Arrays.copyOf(a, k); });
        T.test("[0,0,1,1,1,2,2,3,3,4]", T.li(0, 1, 2, 3, 4), () -> { int[] a = {0, 0, 1, 1, 1, 2, 2, 3, 3, 4}; int k = new Solution().removeDuplicates(a); return Arrays.copyOf(a, k); });
        T.test("all same", T.li(7), () -> { int[] a = {7, 7, 7}; int k = new Solution().removeDuplicates(a); return Arrays.copyOf(a, k); });
        T.test("empty", 0, () -> new Solution().removeDuplicates(new int[0]));
        T.test("no duplicates", T.li(-2, 0, 5), () -> { int[] a = {-2, 0, 5}; int k = new Solution().removeDuplicates(a); return Arrays.copyOf(a, k); });`,
    },
    {
      id: 'p1-2-squares', title: 'Squares of a sorted array', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: '`nums` is sorted and may contain negatives. Return the squares of each number, **sorted**, in O(n) — without calling sort.\n\n`[-4, -1, 0, 3, 10]` → `[0, 1, 9, 16, 100]`',
      starter: solutionStarter('public int[] sortedSquares(int[] nums)', 'return new int[0];'),
      solution: `class Solution {
    public int[] sortedSquares(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int i = 0, j = n - 1;
        for (int w = n - 1; w >= 0; w--) {
            if (Math.abs(nums[i]) > Math.abs(nums[j])) { out[w] = nums[i] * nums[i]; i++; }
            else { out[w] = nums[j] * nums[j]; j--; }
        }
        return out;
    }
}`,
      walkthrough: 'The largest square is at one of the two **ends** (most negative or most positive). Fill the output from the back, each time taking the bigger end.',
      hints: ['Where is the largest square — in the middle or at an end?', 'Fill the result from the last index backwards.', 'Compare `|nums[i]|` and `|nums[j]|`.'],
      fn: { name: 'sortedSquares', params: [{ name: 'nums', type: 'int[]' }], returns: 'int[]' },
      oracle: `class DsaRef { static int[] sortedSquares(int[] a) { int[] o = new int[a.length]; for (int i = 0; i < a.length; i++) o[i] = a[i] * a[i]; java.util.Arrays.sort(o); return o; } }`,
      tests: [fx([[-4, -1, 0, 3, 10]], [0, 1, 9, 16, 100]), fx([[-7, -3, 2, 3, 11]], [4, 9, 9, 49, 121]), fx([[-5, -3, -1]], [1, 9, 25], true), fx([{ gen: 'sorted', n: 200000, lo: -10000, hi: 10000, seed: 21 }], undefined, true, '200,000 sorted values')],
      complexity: { prompt: 'Time complexity of the two-pointer solution?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(1)'], answer: 1, why: 'Each output slot is filled once.' },
    },
    {
      id: 'p1-2-water', title: 'Boss: The widest dock (Container With Most Water)', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `\`height[i]\` is the height of a wall at position \`i\`. Two walls and the ground form a dock that holds water up to the **shorter** wall. The amount is \`(j − i) × min(height[i], height[j])\`.

Return the maximum water any pair of walls can hold. Up to 100,000 walls: O(n²) won't make it.`,
      starter: solutionStarter('public int maxArea(int[] height)', 'return 0;'),
      solution: `class Solution {
    public int maxArea(int[] height) {
        int i = 0, j = height.length - 1, best = 0;
        while (i < j) {
            int area = (j - i) * Math.min(height[i], height[j]);
            best = Math.max(best, area);
            if (height[i] < height[j]) i++;
            else j--;
        }
        return best;
    }
}`,
      walkthrough: 'Start with the widest dock. The water is limited by the shorter wall, and moving the taller wall inward can only shrink the width without raising that limit. So the shorter wall can never be part of a better answer: move it. One pass, O(n).',
      hints: ['Start with the two outermost walls — the widest possible dock.', 'Which wall limits the water?', 'Moving the taller wall can never help. Always move the shorter one.'],
      fn: { name: 'maxArea', params: [{ name: 'height', type: 'int[]' }], returns: 'int' },
      oracle: `class DsaRef { static int maxArea(int[] h) { int i = 0, j = h.length - 1, b = 0; while (i < j) { b = Math.max(b, (j - i) * Math.min(h[i], h[j])); if (h[i] < h[j]) i++; else j--; } return b; } }`,
      tests: [fx([[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49), fx([[1, 1]], 1), fx([[4, 3, 2, 1, 4]], 16, true), fx([[1, 2, 1]], 2, true), fx([{ gen: 'random', n: 100000, lo: 0, hi: 10000, seed: 77 }], undefined, true, '100,000 walls')],
      complexity: { prompt: 'Time complexity?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'], answer: 2, why: 'The pointers move toward each other, one step per iteration.' },
    },
  ],
  gateQuestion: {
    prompt: 'In Two Sum on a sorted array, `numbers[i] + numbers[j]` is **smaller** than the target. What should you do?',
    options: ['Move j left', 'Move i right', 'Move both', 'Restart from the beginning'],
    answer: 1,
    why: 'The sum must grow. `numbers[j]` is already the largest available, so only moving `i` right can increase the sum.',
  },
  explainBack: {
    prompt: 'Why is it safe for the two-pointer method to discard an element at every step? Use Container With Most Water or Two Sum as the example.',
    keyIdeas: [
      { idea: 'the discarded element cannot be part of a better answer', words: ['cannot', "can't", 'never', 'no better', 'not part'] },
      { idea: 'sorted order / shorter wall limits the result', words: ['sorted', 'shorter', 'smaller', 'limit', 'bigger', 'largest'] },
      { idea: 'so it runs in one pass / O(n)', words: ['o(n)', 'one pass', 'linear', 'each element once'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-2-a', front: 'Name two signals that suggest two pointers.', back: 'Sorted array, pairs, in-place, reverse, palindrome, "from both ends".' },
    { id: 'r1-2-b', front: 'In Container With Most Water, which pointer moves?', back: 'The one at the shorter wall.' },
    { id: 'r1-2-c', front: 'What is the read/write pointer pattern for?', back: 'Filtering or compacting an array in place with O(1) extra space.' },
  ],
};

export const m1_3: Module = {
  id: '1.3',
  phase: 1,
  title: 'Sliding window',
  tagline: 'Reuse the previous window instead of recomputing it.',
  hook: `The harbor's camera watches a stretch of k crates at a time and slides along the row. Recounting every crate in view after each slide would take forever. Instead the camera only looks at the crate that **entered** and the one that **left**.`,
  concept: `### Fixed-size window

For "the best sum of any **k** consecutive elements", the naive way recomputes each window: O(n·k). Instead, slide:

~~~java
long sum = 0;
for (int i = 0; i < k; i++) sum += a[i];       // first window
long best = sum;
for (int r = k; r < a.length; r++) {
    sum += a[r] - a[r - k];                     // add entering, remove leaving
    best = Math.max(best, sum);
}
~~~

Each element enters once and leaves once: **O(n)**.

### Variable-size window

For "the longest/shortest stretch that satisfies a rule", grow the window with a **right** pointer and shrink it with a **left** pointer whenever the rule breaks:

~~~java
int left = 0;
for (int right = 0; right < n; right++) {
    add(a[right]);
    while (windowIsInvalid()) {
        remove(a[left]);
        left++;
    }
    best = Math.max(best, right - left + 1);
}
~~~

Even though there is a loop inside a loop, \`left\` only ever moves forward — at most n times in total. So the whole thing is still **O(n)**. This "amortized" argument is worth remembering.

### What goes in the window's "state"?

A running sum, a count of zeros, or a frequency table of characters (\`int[128]\` for ASCII). Pick the smallest state that lets you check validity in O(1).

### Recognise the pattern

"Longest / shortest / maximum / count of **contiguous** subarrays or substrings" → sliding window. (Note: it needs the window's validity to change predictably as it grows — e.g. all positive numbers for sum limits.)`,
  visual: {
    kind: 'array',
    title: 'A window of size 3 slides along',
    frames: [
      { caption: 'First window [2, 1, 5]: sum 8.', values: [2, 1, 5, 1, 3, 2], window: [0, 2] },
      { caption: 'Slide: add 1, remove 2 → sum 7.', values: [2, 1, 5, 1, 3, 2], window: [1, 3], highlight: [3] },
      { caption: 'Slide: add 3, remove 1 → sum 9 (best so far).', values: [2, 1, 5, 1, 3, 2], window: [2, 4], highlight: [4] },
      { caption: 'Slide: add 2, remove 5 → sum 6. Each step is O(1).', values: [2, 1, 5, 1, 3, 2], window: [3, 5], highlight: [5] },
    ],
  },
  javaSpotlight: {
    title: 'Frequency tables with int[]',
    body: "For characters, an `int[128]` (ASCII) or `int[26]` (lower-case letters) is a fast, tiny hash map: `count[c]++` where `c` is a char. Index with `c - 'a'` for the 26-letter version.",
    code: `public class Main {
    public static void main(String[] args) {
        int[] count = new int[128];
        for (char c : "harbor".toCharArray()) count[c]++;
        System.out.println(count['r']);  // 2
    }
}`,
  },
  problems: [
    {
      id: 'p1-3-maxk', title: 'Busiest k-hour stretch', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: 'Return the maximum sum of any `k` consecutive elements of `nums` (1 ≤ k ≤ n). Values may be negative. n can be 200,000 and k 50,000, so recomputing each window is too slow.',
      starter: solutionStarter('public long maxSumK(int[] nums, int k)', 'return 0;'),
      solution: `class Solution {
    public long maxSumK(int[] nums, int k) {
        long sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        long best = sum;
        for (int r = k; r < nums.length; r++) {
            sum += nums[r] - nums[r - k];
            best = Math.max(best, sum);
        }
        return best;
    }
}`,
      hints: ['Compute the first window\'s sum.', 'To slide: add `nums[r]`, subtract `nums[r - k]`.'],
      fn: { name: 'maxSumK', params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }], returns: 'long' },
      oracle: `class DsaRef { static long maxSumK(int[] a, int k) { long[] p = new long[a.length + 1]; for (int i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i]; long b = Long.MIN_VALUE; for (int i = k; i <= a.length; i++) b = Math.max(b, p[i] - p[i - k]); return b; } }`,
      tests: [fx([[2, 1, 5, 1, 3, 2], 3], 9), fx([[-1, -2, -3], 2], -3), fx([[5], 1], 5), fx([{ gen: 'random', n: 200000, lo: -10000, hi: 10000, seed: 3 }, 50000], undefined, true, 'n = 200,000, k = 50,000')],
      complexity: { prompt: 'Time complexity?', options: ['O(n·k)', 'O(n)', 'O(k)', 'O(n log n)'], answer: 1, why: 'Every element is added once and removed once.' },
    },
    {
      id: 'p1-3-avg', title: 'Windows above the bar', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return how many windows of exactly `k` consecutive elements have an **average ≥ threshold**.\n\nTip: avoid decimals — average ≥ t is the same as sum ≥ k × t.',
      starter: solutionStarter('public int numOfSubarrays(int[] arr, int k, int threshold)', 'return 0;'),
      solution: `class Solution {
    public int numOfSubarrays(int[] arr, int k, int threshold) {
        long target = (long) k * threshold, sum = 0;
        int count = 0;
        for (int r = 0; r < arr.length; r++) {
            sum += arr[r];
            if (r >= k) sum -= arr[r - k];
            if (r >= k - 1 && sum >= target) count++;
        }
        return count;
    }
}`,
      hints: ['Compare `sum >= k * threshold`.', 'A window is complete once `r >= k - 1`.'],
      fn: { name: 'numOfSubarrays', params: [{ name: 'arr', type: 'int[]' }, { name: 'k', type: 'int' }, { name: 'threshold', type: 'int' }], returns: 'int' },
      oracle: `class DsaRef { static int numOfSubarrays(int[] a, int k, int t) { long[] p = new long[a.length + 1]; for (int i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i]; int c = 0; for (int i = k; i <= a.length; i++) if (p[i] - p[i - k] >= (long) k * t) c++; return c; } }`,
      tests: [fx([[2, 2, 2, 2, 5, 5, 5, 8], 3, 4], 3), fx([[11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5], 6), fx([[1, 1, 1], 3, 2], 0, true), fx([{ gen: 'random', n: 200000, lo: 0, hi: 10000, seed: 8 }, 40000, 5000], undefined, true, 'n = 200,000, k = 40,000')],
    },
    {
      id: 'p1-3-minlen', title: 'Shortest load over the limit', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: 'All values in `nums` are **positive**. Return the length of the shortest contiguous subarray whose sum is **≥ target**, or `0` if there is none.\n\n`target = 7, nums = [2, 3, 1, 2, 4, 3]` → `2` (`[4, 3]`)',
      starter: solutionStarter('public int minSubArrayLen(int target, int[] nums)', 'return 0;'),
      solution: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int left = 0, best = Integer.MAX_VALUE;
        long sum = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                best = Math.min(best, right - left + 1);
                sum -= nums[left++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}`,
      hints: ['Grow the window to the right until the sum reaches the target.', 'Then shrink from the left as long as it stays ≥ target, recording the length.'],
      fn: { name: 'minSubArrayLen', params: [{ name: 'target', type: 'int' }, { name: 'nums', type: 'int[]' }], returns: 'int' },
      oracle: `class DsaRef { static int minSubArrayLen(int t, int[] a) { int l = 0, b = Integer.MAX_VALUE; long s = 0; for (int r = 0; r < a.length; r++) { s += a[r]; while (s >= t) { b = Math.min(b, r - l + 1); s -= a[l++]; } } return b == Integer.MAX_VALUE ? 0 : b; } }`,
      tests: [fx([7, [2, 3, 1, 2, 4, 3]], 2), fx([4, [1, 4, 4]], 1), fx([11, [1, 1, 1, 1, 1, 1, 1, 1]], 0), fx([15, [1, 2, 3, 4, 5]], 5, true), fx([1000000, { gen: 'random', n: 200000, lo: 1, hi: 100, seed: 4 }], undefined, true, '200,000 values')],
      complexity: { prompt: 'Time complexity, given the nested while loop?', options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(target)'], answer: 1, why: '`left` only moves forward, at most n times overall, so the total work is O(n) (amortized).' },
    },
    {
      id: 'p1-3-ones', title: 'Patch the gaps', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: '`nums` contains only 0s and 1s. You may flip **at most k** zeros into ones. Return the length of the longest run of consecutive 1s you can make.\n\n`[1,1,1,0,0,0,1,1,1,1,0], k = 2` → `6`',
      starter: solutionStarter('public int longestOnes(int[] nums, int k)', 'return 0;'),
      solution: `class Solution {
    public int longestOnes(int[] nums, int k) {
        int left = 0, zeros = 0, best = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > k) {
                if (nums[left] == 0) zeros--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
      hints: ['Rephrase: the longest window containing at most k zeros.', 'Track the number of zeros in the window; shrink when it exceeds k.'],
      fn: { name: 'longestOnes', params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }], returns: 'int' },
      oracle: `class DsaRef { static int longestOnes(int[] a, int k) { int l = 0, z = 0, b = 0; for (int r = 0; r < a.length; r++) { if (a[r] == 0) z++; while (z > k) { if (a[l] == 0) z--; l++; } b = Math.max(b, r - l + 1); } return b; } }`,
      tests: [fx([[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], 6), fx([[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], 10), fx([[0, 0, 0], 0], 0, true), fx([[1, 1], 0], 2, true), fx([{ gen: 'random', n: 200000, lo: 0, hi: 1, seed: 12 }, 500], undefined, true, '200,000 bits')],
    },
    {
      id: 'p1-3-substr', title: 'Boss: Longest unique cargo code', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `Return the length of the longest substring of \`s\` with **no repeating characters**. \`s\` contains ASCII characters and can be 200,000 long.

\`"abcabcbb"\` → \`3\` (\`"abc"\`), \`"pwwkew"\` → \`3\` (\`"wke"\`)`,
      starter: solutionStarter('public int lengthOfLongestSubstring(String s)', 'return 0;'),
      solution: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int[] count = new int[128];
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            count[c]++;
            while (count[c] > 1) {
                count[s.charAt(left)]--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
      walkthrough: 'The window is valid while every character appears once. When the new character `c` creates a duplicate, shrink from the left until `c` is unique again. A faster variant stores each character\'s last index and jumps `left` directly.',
      hints: ['Variable-size window with a frequency table `int[128]`.', 'After adding `s.charAt(right)`, shrink while that character appears twice.', 'Record `right - left + 1` after each step.'],
      fn: { name: 'lengthOfLongestSubstring', params: [{ name: 's', type: 'String' }], returns: 'int' },
      oracle: `class DsaRef { static int lengthOfLongestSubstring(String s) { int[] last = new int[128]; java.util.Arrays.fill(last, -1); int l = 0, b = 0; for (int r = 0; r < s.length(); r++) { char c = s.charAt(r); if (last[c] >= l) l = last[c] + 1; last[c] = r; b = Math.max(b, r - l + 1); } return b; } }`,
      tests: [fx(['abcabcbb'], 3), fx(['bbbbb'], 1), fx(['pwwkew'], 3), fx([''], 0, true), fx(['dvdf'], 3, true), fx(['abba'], 2, true), fx([{ gen: 'string', n: 200000, alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', seed: 99 }], undefined, true, 'length 200,000')],
      complexity: { prompt: 'Time complexity?', options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(128 · n²)'], answer: 1, why: 'Both pointers only move forward: O(n) total.' },
    },
  ],
  gateQuestion: {
    prompt: 'A sliding-window solution has a `while` loop inside a `for` loop. Why is it still O(n)?',
    options: ['The while loop runs at most once per step', 'The left pointer only moves forward, so it moves at most n times in total', 'Java optimises nested loops', 'It is actually O(n²)'],
    answer: 1,
    why: 'Count total work, not work per iteration: `right` moves n times and `left` moves at most n times overall (amortized analysis).',
  },
  explainBack: {
    prompt: 'Explain the sliding-window idea: what do you do when the window becomes invalid, and why is it faster than checking every subarray?',
    keyIdeas: [
      { idea: 'expand with right, shrink with left', words: ['shrink', 'left', 'move the start', 'remove'] },
      { idea: 'reuse previous window state instead of recomputing', words: ['reuse', 'previous', 'update', 'add and remove', 'running', 'instead of recomput'] },
      { idea: 'each element enters and leaves once → O(n)', words: ['once', 'o(n)', 'linear', 'amortized'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-3-a', front: 'Sliding a fixed window of size k: how do you update the sum?', back: '`sum += a[r] - a[r - k]`' },
    { id: 'r1-3-b', front: 'Which keyword describes the O(n) argument for variable windows?', back: 'Amortized analysis — each pointer moves at most n times in total.' },
    { id: 'r1-3-c', front: 'Signal words for sliding window?', back: 'Longest / shortest / max / count of contiguous subarrays or substrings.' },
  ],
};
