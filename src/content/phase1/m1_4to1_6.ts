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

export const m1_4: Module = {
  id: '1.4',
  phase: 1,
  title: 'Dynamic arrays and prefix sums',
  tagline: 'Arrays that grow, and sums of any range in O(1).',
  hook: `The harbor's ledger keeps filling up — a fixed-size array can't keep up. And every captain asks the same question: "How much cargo arrived between day l and day r?" Today you'll build a list that grows on its own, and a trick that answers range questions instantly.`,
  concept: `### How ArrayList grows

Java arrays have a fixed size. \`ArrayList\` hides a regular array inside and, when it fills up, **allocates a bigger one** (about 1.5× in Java; we'll use 2×) and copies everything over.

Copying n elements is O(n) — so is \`add\` slow? No: doubling means copies are **rare**. Adding n elements costs at most n + n/2 + n/4 + … < 2n copies in total. That's **amortized O(1)** per add.

| ArrayList operation | Cost |
|---|---|
| \`get(i)\`, \`set(i, x)\` | O(1) |
| \`add(x)\` at the end | amortized O(1) |
| \`add(0, x)\` / \`remove(0)\` | O(n) — everything shifts |
| \`contains(x)\` | O(n) |

### Generics with an Object[] inside

Java can't create \`new T[n]\`, so generic containers store an \`Object[]\` and cast on the way out:

~~~java
@SuppressWarnings("unchecked")
T get(int i) { return (T) data[i]; }
~~~

### Prefix sums: range sums in O(1)

Precompute \`prefix[i]\` = sum of the first \`i\` elements (\`prefix[0] = 0\`):

~~~java
long[] prefix = new long[n + 1];
for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
// sum of a[l..r] inclusive:
long rangeSum = prefix[r + 1] - prefix[l];
~~~

O(n) to build once, then **O(1) per query** instead of O(n). The extra slot (\`n + 1\`) avoids special cases for \`l = 0\`.

### Prefix + suffix

Some problems need information from **both sides** of each index: compute a left-to-right pass and a right-to-left pass, then combine them.`,
  visual: {
    kind: 'array',
    title: 'Building prefix sums',
    frames: [
      { caption: 'The array a.', values: [3, 1, 4, 1, 5, 9] },
      { caption: 'prefix[i] = sum of the first i elements. prefix[0] = 0.', values: [0, 3, 4, 8, 9, 14, 23], pointers: { 0: 'p[0]' } },
      { caption: 'Sum of a[2..4] = prefix[5] − prefix[2] = 14 − 4 = 10.', values: [0, 3, 4, 8, 9, 14, 23], highlight: [2, 5], pointers: { 2: 'p[l]', 5: 'p[r+1]' } },
      { caption: 'Any range, one subtraction: O(1).', values: [0, 3, 4, 8, 9, 14, 23], highlight: [0, 6], pointers: { 0: 'p[0]', 6: 'p[6]' } },
    ],
  },
  javaSpotlight: {
    title: 'ArrayList in practice',
    body: 'Prefer `List<Integer> list = new ArrayList<>();` (program to the interface). Boxing means each element is an `Integer` object: for millions of numbers, a plain `int[]` is far faster and smaller.',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 5; i++) list.add(i * i);
        list.remove(list.size() - 1);           // O(1) at the end
        System.out.println(list + " size=" + list.size());
    }
}`,
  },
  problems: [
    {
      id: 'p1-4-dynarray', title: 'Build it: your own ArrayList', role: 'guided', difficulty: 'Medium', kind: 'custom',
      statement: `Build \`DynamicArray<T>\` backed by an \`Object[]\` that starts with **capacity 2** and **doubles** when full.

- \`void add(T x)\` — append (amortized O(1)).
- \`T get(int i)\` / \`void set(int i, T x)\` — throw \`IndexOutOfBoundsException\` if \`i < 0\` or \`i >= size()\`.
- \`T removeLast()\` — remove and return the last element; throw \`java.util.NoSuchElementException\` if empty.
- \`int size()\`, \`int capacity()\` (length of the internal array).`,
      starter: `import java.util.NoSuchElementException;

class DynamicArray<T> {
    private Object[] data = new Object[2];
    private int size = 0;

    void add(T x) {
        // TODO: grow when full, then append
    }

    @SuppressWarnings("unchecked")
    T get(int i) {
        return null;
    }

    void set(int i, T x) { }

    T removeLast() {
        return null;
    }

    int size() { return size; }

    int capacity() { return data.length; }
}
`,
      solution: `import java.util.NoSuchElementException;

class DynamicArray<T> {
    private Object[] data = new Object[2];
    private int size = 0;

    void add(T x) {
        if (size == data.length) {
            Object[] bigger = new Object[data.length * 2];
            System.arraycopy(data, 0, bigger, 0, size);
            data = bigger;
        }
        data[size++] = x;
    }

    private void check(int i) {
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException("index " + i + ", size " + size);
    }

    @SuppressWarnings("unchecked")
    T get(int i) {
        check(i);
        return (T) data[i];
    }

    void set(int i, T x) {
        check(i);
        data[i] = x;
    }

    @SuppressWarnings("unchecked")
    T removeLast() {
        if (size == 0) throw new NoSuchElementException("empty");
        T x = (T) data[--size];
        data[size] = null;   // let the garbage collector reclaim it
        return x;
    }

    int size() { return size; }

    int capacity() { return data.length; }
}`,
      walkthrough: 'When `size == data.length`, allocate an array twice as large and copy with `System.arraycopy`. Doubling keeps the total copying under 2n, so adding n items is O(n) overall. Clearing the removed slot avoids a memory leak.',
      hints: ['In `add`: if `size == data.length`, make a new array of double length and copy.', '`System.arraycopy(src, 0, dst, 0, size)` copies fast.', 'Write a private `check(i)` helper for the bounds checks.'],
      tests: [],
      customHarness: `T.test("add and get", "a b c", () -> { DynamicArray<String> d = new DynamicArray<>(); d.add("a"); d.add("b"); d.add("c"); return d.get(0) + " " + d.get(1) + " " + d.get(2); });
        T.test("size", 3, () -> { DynamicArray<Integer> d = new DynamicArray<>(); d.add(1); d.add(2); d.add(3); return d.size(); });
        T.test("capacity doubles: 2 → 4 → 8", "2 4 8", () -> { DynamicArray<Integer> d = new DynamicArray<>(); int c0 = d.capacity(); d.add(1); d.add(2); d.add(3); int c1 = d.capacity(); d.add(4); d.add(5); return c0 + " " + c1 + " " + d.capacity(); });
        T.test("set", 99, () -> { DynamicArray<Integer> d = new DynamicArray<>(); d.add(1); d.set(0, 99); return d.get(0); });
        T.test("removeLast", "3 2", () -> { DynamicArray<Integer> d = new DynamicArray<>(); d.add(1); d.add(2); d.add(3); int x = d.removeLast(); return x + " " + d.size(); });
        T.test("get out of bounds throws", "IndexOutOfBoundsException", () -> { DynamicArray<Integer> d = new DynamicArray<>(); d.add(1); try { d.get(1); return "no exception"; } catch (IndexOutOfBoundsException e) { return "IndexOutOfBoundsException"; } });
        T.test("negative index throws", "IndexOutOfBoundsException", () -> { DynamicArray<Integer> d = new DynamicArray<>(); d.add(1); try { d.set(-1, 5); return "no exception"; } catch (IndexOutOfBoundsException e) { return "IndexOutOfBoundsException"; } });
        T.test("removeLast on empty throws", "NoSuchElementException", () -> { try { new DynamicArray<Integer>().removeLast(); return "no exception"; } catch (NoSuchElementException e) { return "NoSuchElementException"; } });
        T.test("1,000,000 adds stay fast (amortized O(1))", 999999, () -> { DynamicArray<Integer> d = new DynamicArray<>(); for (int i = 0; i < 1000000; i++) d.add(i); return d.get(999999); });`,
      complexity: { prompt: 'Why is add() amortized O(1) even though resizing copies the whole array?', options: ['Resizing never happens', 'Doubling makes resizes rare: total copying for n adds is under 2n', 'System.arraycopy is O(1)', 'The JVM caches the array'], answer: 1, why: 'Copies happen at sizes 2, 4, 8, … n — a geometric series that sums to less than 2n.' },
    },
    {
      id: 'p1-4-numarray', title: 'Cargo between days l and r', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `Build \`NumArray\`:

- \`NumArray(int[] nums)\` — preprocess.
- \`long sumRange(int l, int r)\` — sum of \`nums[l..r]\` inclusive, in **O(1)**.

The tests make 200,000 queries on 200,000 numbers.`,
      starter: `class NumArray {
    NumArray(int[] nums) {
    }

    long sumRange(int l, int r) {
        return 0;
    }
}
`,
      solution: `class NumArray {
    private final long[] prefix;

    NumArray(int[] nums) {
        prefix = new long[nums.length + 1];
        for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
    }

    long sumRange(int l, int r) {
        return prefix[r + 1] - prefix[l];
    }
}`,
      hints: ['Build `prefix` of length n + 1 in the constructor.', '`sumRange` = `prefix[r + 1] - prefix[l]`.'],
      tests: [],
      customHarness: `T.test("example", "1 -1 -3", () -> { NumArray a = new NumArray(new int[]{-2, 0, 3, -5, 2, -1}); return a.sumRange(0, 2) + " " + a.sumRange(2, 5) + " " + a.sumRange(0, 5); });
        T.test("single element", 7L, () -> new NumArray(new int[]{7}).sumRange(0, 0));
        T.test("large values", 6000000000L, () -> new NumArray(new int[]{2000000000, 2000000000, 2000000000}).sumRange(0, 2));
        T.test("200,000 queries", true, () -> { int n = 200000; int[] a = T.genRandom(n, -1000, 1000, 5); NumArray na = new NumArray(a); long[] p = new long[n + 1]; for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i]; java.util.Random r = new java.util.Random(1); for (int q = 0; q < 200000; q++) { int l = r.nextInt(n), rr = l + r.nextInt(n - l); if (na.sumRange(l, rr) != p[rr + 1] - p[l]) return false; } return true; });`,
    },
    {
      id: 'p1-4-pivot', title: 'Balance point', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return the **leftmost** index where the sum of elements to the left equals the sum of elements to the right (excluding the index itself). Return `-1` if none exists.\n\n`[1, 7, 3, 6, 5, 6]` → `3` (1 + 7 + 3 = 5 + 6)',
      starter: solutionStarter('public int pivotIndex(int[] nums)', 'return -1;'),
      solution: `class Solution {
    public int pivotIndex(int[] nums) {
        long total = 0;
        for (int x : nums) total += x;
        long left = 0;
        for (int i = 0; i < nums.length; i++) {
            if (left == total - left - nums[i]) return i;
            left += nums[i];
        }
        return -1;
    }
}`,
      hints: ['Compute the total once.', 'Right sum = total − left − nums[i].'],
      fn: { name: 'pivotIndex', params: [{ name: 'nums', type: 'int[]' }], returns: 'int' },
      oracle: `class DsaRef { static int pivotIndex(int[] a) { long t = 0; for (int x : a) t += x; long l = 0; for (int i = 0; i < a.length; i++) { if (l == t - l - a[i]) return i; l += a[i]; } return -1; } }`,
      tests: [fx([[1, 7, 3, 6, 5, 6]], 3), fx([[1, 2, 3]], -1), fx([[2, 1, -1]], 0), fx([[0]], 0, true), fx([{ gen: 'random', n: 200000, lo: -1, hi: 1, seed: 6 }], undefined, true, '200,000 values')],
    },
    {
      id: 'p1-4-ranges', title: 'Answer every captain', role: 'mastery', difficulty: 'Medium', kind: 'function',
      statement: '`bits` contains only 0s and 1s. Each query `[l, r]` asks how many 1s are in `bits[l..r]` (inclusive). Return the answers in order.\n\n`bits = [1,0,1,1,0]`, `queries = [[0,4],[1,2],[3,3]]` → `[3, 1, 1]`',
      starter: solutionStarter('public int[] countOnes(int[] bits, int[][] queries)', 'return new int[0];'),
      solution: `class Solution {
    public int[] countOnes(int[] bits, int[][] queries) {
        int[] prefix = new int[bits.length + 1];
        for (int i = 0; i < bits.length; i++) prefix[i + 1] = prefix[i] + bits[i];
        int[] out = new int[queries.length];
        for (int q = 0; q < queries.length; q++) {
            out[q] = prefix[queries[q][1] + 1] - prefix[queries[q][0]];
        }
        return out;
    }
}`,
      hints: ['Prefix sums of the bits count the ones.', 'Each answer is one subtraction.'],
      fn: { name: 'countOnes', params: [{ name: 'bits', type: 'int[]' }, { name: 'queries', type: 'int[][]' }], returns: 'int[]' },
      tests: [fx([[1, 0, 1, 1, 0], [[0, 4], [1, 2], [3, 3]]], [3, 1, 1]), fx([[0, 0], [[0, 1]]], [0]), fx([[1], [[0, 0], [0, 0]]], [1, 1], true), fx([[1, 1, 0, 1, 0, 1, 1, 1], [[0, 7], [2, 4], [5, 7], [4, 4]]], [6, 1, 3, 0], true)],
    },
    {
      id: 'p1-4-product', title: 'Boss: Product of everything else', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `Return an array \`out\` where \`out[i]\` is the product of every element **except** \`nums[i]\`. Every product fits in an \`int\`.

**You may not use division** (zeros would break it anyway). Aim for O(n) time.

\`[1, 2, 3, 4]\` → \`[24, 12, 8, 6]\``,
      starter: solutionStarter('public int[] productExceptSelf(int[] nums)', 'return new int[0];'),
      solution: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int left = 1;
        for (int i = 0; i < n; i++) {
            out[i] = left;          // product of everything left of i
            left *= nums[i];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            out[i] *= right;        // times product of everything right of i
            right *= nums[i];
        }
        return out;
    }
}`,
      walkthrough: '`out[i]` = (product of everything to the left) × (product of everything to the right). A forward pass writes the left products; a backward pass multiplies in the right products with a single running variable. O(n) time, O(1) extra space besides the output.',
      hints: ['out[i] = (product of elements left of i) × (product of elements right of i).', 'Fill left products in a forward pass.', 'Multiply in right products with a backward pass and one running variable.'],
      fn: { name: 'productExceptSelf', params: [{ name: 'nums', type: 'int[]' }], returns: 'int[]' },
      oracle: `class DsaRef { static int[] productExceptSelf(int[] a) { int n = a.length; int[] l = new int[n], r = new int[n], o = new int[n]; for (int i = 0; i < n; i++) l[i] = i == 0 ? 1 : l[i - 1] * a[i - 1]; for (int i = n - 1; i >= 0; i--) r[i] = i == n - 1 ? 1 : r[i + 1] * a[i + 1]; for (int i = 0; i < n; i++) o[i] = l[i] * r[i]; return o; } }`,
      tests: [fx([[1, 2, 3, 4]], [24, 12, 8, 6]), fx([[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]), fx([[2, 3]], [3, 2]), fx([[0, 0]], [0, 0], true), fx([[5, 0, 2]], [0, 10, 0], true), fx([{ gen: 'random', n: 100000, lo: -1, hi: 1, seed: 13 }], undefined, true, '100,000 values')],
      complexity: { prompt: 'Time complexity of the two-pass solution?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'], answer: 2, why: 'Two linear passes.' },
    },
  ],
  gateQuestion: {
    prompt: 'With prefix sums where `prefix[0] = 0` and `prefix[i+1] = prefix[i] + a[i]`, what is the sum of `a[l..r]` inclusive?',
    options: ['prefix[r] − prefix[l]', 'prefix[r + 1] − prefix[l]', 'prefix[r] − prefix[l − 1]', 'prefix[r + 1] − prefix[l + 1]'],
    answer: 1,
    why: '`prefix[r+1]` covers a[0..r]; subtracting `prefix[l]` (a[0..l−1]) leaves a[l..r].',
  },
  explainBack: {
    prompt: 'Explain why ArrayList.add is "amortized O(1)" even though growing copies every element.',
    keyIdeas: [
      { idea: 'capacity doubles (grows geometrically)', words: ['double', 'doubles', 'twice', '2x', 'geometric', '1.5'] },
      { idea: 'resizes are rare', words: ['rare', 'rarely', 'occasional', 'not often', 'only sometimes'] },
      { idea: 'total cost spread over many adds is O(n)', words: ['average', 'spread', 'total', 'amortized', 'overall', '2n'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-4-a', front: 'Cost of `ArrayList.add(0, x)`?', back: 'O(n) — every element shifts right.' },
    { id: 'r1-4-b', front: 'Why make the prefix array length n + 1?', back: 'So prefix[0] = 0 and ranges starting at 0 need no special case.' },
    { id: 'r1-4-c', front: 'Why can\'t Java do `new T[n]`?', back: 'Generic types are erased at runtime; use `Object[]` and cast.' },
  ],
};

export const m1_5: Module = {
  id: '1.5',
  phase: 1,
  title: 'String techniques',
  tagline: 'Count characters, compare from both ends, expand from the centre.',
  hook: `Cargo manifests arrive as long strings of codes. Customs wants to know which manifests are scrambled copies of each other, which read the same both ways, and how to compress them for the radio. Strings are just arrays of chars — and everything you learned about arrays applies.`,
  concept: `### Technique 1: counting with int[26] / int[128]

Two strings are **anagrams** if they contain the same characters with the same counts. Count with an array instead of sorting:

~~~java
int[] count = new int[26];
for (char c : s.toCharArray()) count[c - 'a']++;
for (char c : t.toCharArray()) count[c - 'a']--;
// anagrams ⇔ every count is 0
~~~

O(n) time, O(1) space (26 is a constant).

### Technique 2: two pointers from both ends

Palindrome checks and in-place reversals: compare \`s.charAt(i)\` and \`s.charAt(j)\` and move inward. Skip characters you don't care about with \`Character.isLetterOrDigit\`.

### Technique 3: expand around the centre

Every palindrome has a centre — either a character (odd length) or a gap between two characters (even length). From each of the **2n − 1** centres, expand outward while the ends match. O(n²) time, O(1) space, and simple to write.

### Technique 4: runs (run-length thinking)

Scan once, tracking where the current **run** of equal characters started. When the character changes, you know the run's length.

### Performance notes

- \`s.charAt(i)\` is O(1). \`s.substring(a, b)\` copies: O(b − a).
- Comparing Strings with \`equals\` is O(length).
- Building with \`+\` in a loop is O(n²); use \`StringBuilder\`.
- \`s.toCharArray()\` gives a \`char[]\` you can modify and sort (\`Arrays.sort\`).`,
  visual: {
    kind: 'array',
    title: 'Expanding around a centre',
    frames: [
      { caption: 'String "cbabad". Try the centre at index 2 (\'a\').', values: ['c', 'b', 'a', 'b', 'a', 'd'], highlight: [2], pointers: { 2: 'centre' } },
      { caption: 'Expand: s[1] = s[3] = \'b\' — still a palindrome: "bab".', values: ['c', 'b', 'a', 'b', 'a', 'd'], window: [1, 3], pointers: { 1: 'L', 3: 'R' } },
      { caption: "Expand again: s[0] = 'c', s[4] = 'a' — mismatch. Stop.", values: ['c', 'b', 'a', 'b', 'a', 'd'], window: [1, 3], highlight: [0, 4], pointers: { 0: 'L', 4: 'R' } },
      { caption: 'Centre at index 3 also gives "aba". Length 3 is the best here.', values: ['c', 'b', 'a', 'b', 'a', 'd'], window: [2, 4], pointers: { 3: 'centre' } },
    ],
  },
  javaSpotlight: {
    title: 'char[] and StringBuilder performance',
    body: 'In tight loops, `char[] cs = s.toCharArray()` then `cs[i]` is slightly faster than `s.charAt(i)`. `new String(cs)` turns it back into a String. `StringBuilder.reverse()` reverses in place.',
    code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        char[] cs = "listen".toCharArray();
        Arrays.sort(cs);
        System.out.println(new String(cs));                      // eilnst
        System.out.println(new StringBuilder("harbor").reverse()); // robrah
    }
}`,
  },
  problems: [
    {
      id: 'p1-5-anagram', title: 'Scrambled manifests', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: 'Return `true` if `t` is an anagram of `s` (same letters, same counts). Both contain only lower-case English letters. Aim for O(n) without sorting.',
      starter: solutionStarter('public boolean isAnagram(String s, String t)', 'return false;'),
      solution: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
}`,
      hints: ['Different lengths → false immediately.', 'Count up for `s`, down for `t`, in an `int[26]`.', 'Anagrams leave every count at 0.'],
      fn: { name: 'isAnagram', params: [{ name: 's', type: 'String' }, { name: 't', type: 'String' }], returns: 'boolean' },
      tests: [fx(['anagram', 'nagaram'], true), fx(['rat', 'car'], false), fx(['a', 'ab'], false), fx(['', ''], true, true), fx(['listen', 'silent'], true, true), fx(['aacc', 'ccac'], false, true)],
      complexity: { prompt: 'Time and space of the counting solution?', options: ['O(n log n), O(n)', 'O(n), O(1)', 'O(n²), O(1)', 'O(n), O(n)'], answer: 1, why: 'One pass; the count array has a fixed size of 26.' },
    },
    {
      id: 'p1-5-palin', title: 'Radio palindrome check', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return `true` if `s` reads the same forwards and backwards after **ignoring every non-alphanumeric character and case**.\n\n`"A man, a plan, a canal: Panama"` → `true`. Use O(1) extra space.',
      starter: solutionStarter('public boolean isPalindrome(String s)', 'return false;'),
      solution: `class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            char a = s.charAt(i), b = s.charAt(j);
            if (!Character.isLetterOrDigit(a)) { i++; continue; }
            if (!Character.isLetterOrDigit(b)) { j--; continue; }
            if (Character.toLowerCase(a) != Character.toLowerCase(b)) return false;
            i++;
            j--;
        }
        return true;
    }
}`,
      hints: ['Two pointers; skip characters that are not letters or digits.', '`Character.isLetterOrDigit` and `Character.toLowerCase`.'],
      fn: { name: 'isPalindrome', params: [{ name: 's', type: 'String' }], returns: 'boolean' },
      tests: [fx(['A man, a plan, a canal: Panama'], true), fx(['race a car'], false), fx([' '], true), fx(['0P'], false, true), fx(['No lemon, no melon!'], true, true)],
    },
    {
      id: 'p1-5-compress', title: 'Compress for the radio', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Compress `s` by replacing each run of a repeated character with the character followed by the run length. Runs of length 1 are written as just the character.\n\n`"aaabcc"` → `"a3bc2"`, `"zzzzzzzzzzzz"` → `"z12"`',
      starter: solutionStarter('public String compress(String s)', 'return s;'),
      solution: `class Solution {
    public String compress(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
            sb.append(s.charAt(i));
            if (j - i > 1) sb.append(j - i);
            i = j;
        }
        return sb.toString();
    }
}`,
      hints: ['Find each run with an inner pointer `j` that moves while the character stays the same.', 'Run length = `j - i`.'],
      fn: { name: 'compress', params: [{ name: 's', type: 'String' }], returns: 'String' },
      tests: [fx(['aaabcc'], 'a3bc2'), fx(['abc'], 'abc'), fx(['zzzzzzzzzzzz'], 'z12'), fx([''], '', true), fx(['aabbaa'], 'a2b2a2', true)],
    },
    {
      id: 'p1-5-lcp', title: 'Common route prefix', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return the longest common prefix of all strings in `strs` (at least one string). Return `""` if there is none.\n\n`["flower", "flow", "flight"]` → `"fl"`',
      starter: solutionStarter('public String longestCommonPrefix(String[] strs)', 'return "";'),
      solution: `class Solution {
    public String longestCommonPrefix(String[] strs) {
        String first = strs[0];
        for (int i = 0; i < first.length(); i++) {
            char c = first.charAt(i);
            for (String s : strs) {
                if (i >= s.length() || s.charAt(i) != c) return first.substring(0, i);
            }
        }
        return first;
    }
}`,
      hints: ['Compare column by column: position 0 of every string, then position 1…', 'Stop at the first mismatch or the end of the shortest string.'],
      fn: { name: 'longestCommonPrefix', params: [{ name: 'strs', type: 'String[]' }], returns: 'String' },
      tests: [fx([['flower', 'flow', 'flight']], 'fl'), fx([['dog', 'racecar', 'car']], ''), fx([['alone']], 'alone'), fx([['ab', 'a']], 'a', true), fx([['', 'b']], '', true)],
    },
    {
      id: 'p1-5-longestpal', title: 'Boss: The longest mirrored code', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `Return the **longest palindromic substring** of \`s\` (the tests are chosen so the answer is unique). Length up to 3,000 — an O(n³) "check every substring" approach is too slow; expand around centres for O(n²).

Some strings have ties (\`"babad"\` → \`"bab"\` or \`"aba"\`), so the tests avoid them. Example: \`"cbbd"\` → \`"bb"\`.`,
      starter: solutionStarter('public String longestPalindrome(String s)', 'return "";'),
      solution: `class Solution {
    private int bestStart = 0, bestLen = 0;

    public String longestPalindrome(String s) {
        bestStart = 0;
        bestLen = 0;
        for (int c = 0; c < s.length(); c++) {
            expand(s, c, c);       // odd length, centre on a character
            expand(s, c, c + 1);   // even length, centre between characters
        }
        return s.substring(bestStart, bestStart + bestLen);
    }

    private void expand(String s, int lo, int hi) {
        while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) {
            lo--;
            hi++;
        }
        int len = hi - lo - 1;
        if (len > bestLen) {
            bestLen = len;
            bestStart = lo + 1;
        }
    }
}`,
      walkthrough: 'There are 2n − 1 centres (each char and each gap). Expanding from one costs O(n) at most, so the total is O(n²) time and O(1) space. Manacher\'s algorithm does it in O(n) — a Phase 6 topic.',
      hints: ['A palindrome mirrors around its centre.', 'Try every centre: each character (odd lengths) and each gap (even lengths).', 'Write a helper `expand(s, lo, hi)` that grows while the ends match.'],
      fn: { name: 'longestPalindrome', params: [{ name: 's', type: 'String' }], returns: 'String' },
      tests: [fx(['cbbd'], 'bb'), fx(['a'], 'a'), fx(['forgeeksskeegfor'], 'geeksskeeg'), fx(['abacdfgdcaba'], 'aba', false, 'the reverse trap'), fx(['xyzracecarpq'], 'racecar', true), fx(['a'.repeat(3000)], 'a'.repeat(3000), true, '3,000 identical characters')],
      complexity: { prompt: 'Time complexity of expand-around-centre?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'], answer: 2, why: 'About 2n centres, each expanding up to n steps.' },
    },
  ],
  gateQuestion: {
    prompt: 'You must check whether two 1,000,000-character lower-case strings are anagrams. Which is the best approach?',
    options: ['Sort both and compare: O(n log n)', 'Count letters in an int[26]: O(n) time, O(1) space', 'Check every permutation', 'Compare them with equals()'],
    answer: 1,
    why: 'Counting is linear and uses constant space. Sorting works but is slower and needs char arrays.',
  },
  explainBack: {
    prompt: 'How does "expand around the centre" find palindromes, and why are there 2n − 1 centres?',
    keyIdeas: [
      { idea: 'grow outward while both ends match', words: ['expand', 'outward', 'grow', 'both ends', 'match', 'mirror'] },
      { idea: 'odd centres are characters, even centres are gaps', words: ['gap', 'between', 'even', 'odd', 'two characters'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-5-a', front: 'Cost of `s.substring(a, b)` in Java?', back: 'O(b − a): it copies the characters.' },
    { id: 'r1-5-b', front: 'How do you test "letter or digit"?', back: '`Character.isLetterOrDigit(c)`' },
    { id: 'r1-5-c', front: 'Why is an int[26] count O(1) space?', back: 'Its size is fixed regardless of the input length.' },
  ],
};

export const m1_6: Module = {
  id: '1.6',
  phase: 1,
  title: 'Singly linked lists',
  tagline: 'Chains of nodes: cheap to splice, impossible to index.',
  hook: `The harbor's barges are chained together: each one only knows the barge behind it. To add a barge in the middle you just re-hook two chains — no shifting everything along like an array. But to reach the 50th barge you must walk from the first.`,
  concept: `### A node points to the next node

~~~java
class ListNode {
    int val;
    ListNode next;
}
~~~

A list is just a reference to its **head**. The last node's \`next\` is \`null\`.

~~~
head → [3] → [7] → [1] → null
~~~

### Array vs linked list

| Operation | Array / ArrayList | Linked list |
|---|---|---|
| Access i-th element | O(1) | O(n) — walk from head |
| Insert / delete at the front | O(n) | **O(1)** |
| Insert / delete after a known node | O(n) | **O(1)** |
| Memory | compact | one extra reference per node |

### Walking a list

~~~java
for (ListNode cur = head; cur != null; cur = cur.next) {
    System.out.println(cur.val);
}
~~~

### Re-wiring pointers

Most linked-list problems are about changing \`next\` references **in the right order** so you never lose the rest of the list. Draw boxes and arrows on paper before you code. Save \`cur.next\` in a variable **before** you overwrite it.

### The dummy head trick

When the head itself might change (deleting the first node, merging lists), create a fake node in front:

~~~java
ListNode dummy = new ListNode(0);
dummy.next = head;
// ... work using dummy ...
return dummy.next;
~~~

No special case for "the first node" anymore.

### Two-pointer gap trick

To find the n-th node from the end in **one pass**, move a \`fast\` pointer n steps ahead, then move both until \`fast\` hits the end. The gap stays n.

### How these tests work

The platform defines \`ListNode\` for you. The tests build lists from arrays like \`[1, 2, 3]\` and compare the list you return.`,
  visual: {
    kind: 'list',
    title: 'Reversing a linked list',
    frames: [
      { caption: 'prev = null, cur = head.', values: [1, 2, 3, 4], pointers: { 0: 'cur' } },
      { caption: 'Save next, point 1 back to prev (null). Advance.', values: [1, 2, 3, 4], pointers: { 0: 'prev', 1: 'cur' }, highlight: [0], output: 'reversed so far: 1' },
      { caption: 'Point 2 back to 1. Advance.', values: [1, 2, 3, 4], pointers: { 1: 'prev', 2: 'cur' }, highlight: [0, 1], output: 'reversed so far: 2 → 1' },
      { caption: 'Point 3 back to 2.', values: [1, 2, 3, 4], pointers: { 2: 'prev', 3: 'cur' }, highlight: [0, 1, 2], output: 'reversed so far: 3 → 2 → 1' },
      { caption: 'cur is null: prev is the new head.', values: [1, 2, 3, 4], pointers: { 3: 'prev' }, highlight: [0, 1, 2, 3], output: 'result: 4 → 3 → 2 → 1' },
    ],
  },
  javaSpotlight: {
    title: 'References and null',
    body: 'A variable of a class type holds a **reference** (an arrow) or `null`. Calling a method or reading a field through `null` throws `NullPointerException`, so always check `cur != null` (and `cur.next != null` when you look two steps ahead).',
    code: `public class Main {
    static class Node { int val; Node next; Node(int v, Node n) { val = v; next = n; } }

    public static void main(String[] args) {
        Node head = new Node(3, new Node(7, new Node(1, null)));
        int length = 0;
        for (Node cur = head; cur != null; cur = cur.next) length++;
        System.out.println(length); // 3
    }
}`,
  },
  problems: [
    {
      id: 'p1-6-reverse', title: 'Reverse the barge chain', role: 'guided', difficulty: 'Easy', kind: 'function', uses: ['ListNode'],
      statement: 'Reverse the singly linked list and return the new head. Do it **iteratively** with O(1) extra space.\n\n`1 → 2 → 3 → 4` → `4 → 3 → 2 → 1`',
      starter: LISTNODE_NOTE + solutionStarter('public ListNode reverseList(ListNode head)', 'return head;'),
      solution: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;  // save the rest
            cur.next = prev;           // flip the arrow
            prev = cur;
            cur = next;
        }
        return prev;
    }
}`,
      walkthrough: 'Three references: `prev` (already reversed part), `cur` (node being flipped), `next` (saved rest of the list). Save, flip, advance. When `cur` becomes null, `prev` is the new head.',
      hints: ['Keep `prev` (initially null) and `cur` (initially head).', 'Save `cur.next` before you overwrite it.', 'Flip: `cur.next = prev`, then advance both.'],
      fn: { name: 'reverseList', params: [{ name: 'head', type: 'ListNode' }], returns: 'ListNode' },
      tests: [fx([[1, 2, 3, 4]], [4, 3, 2, 1]), fx([[1, 2]], [2, 1]), fx([[]], []), fx([[9]], [9], true), fx([[5, 4, 3, 2, 1, 0]], [0, 1, 2, 3, 4, 5], true)],
      complexity: { prompt: 'Time and extra space?', options: ['O(n), O(n)', 'O(n), O(1)', 'O(n²), O(1)', 'O(1), O(1)'], answer: 1, why: 'Each node is visited once and only three references are used.' },
    },
    {
      id: 'p1-6-merge', title: 'Merge two sorted convoys', role: 'mastery', difficulty: 'Easy', kind: 'function', uses: ['ListNode'],
      statement: 'Merge two **sorted** linked lists into one sorted list by re-linking their nodes, and return its head.\n\n`1 → 2 → 4` and `1 → 3 → 4` → `1 → 1 → 2 → 3 → 4 → 4`',
      starter: LISTNODE_NOTE + solutionStarter('public ListNode mergeTwoLists(ListNode l1, ListNode l2)', 'return null;'),
      solution: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
            else { tail.next = l2; l2 = l2.next; }
            tail = tail.next;
        }
        tail.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
}`,
      hints: ['Use a dummy head and a `tail` pointer.', 'Attach the smaller front node each step.', 'When one list runs out, attach the rest of the other.'],
      fn: { name: 'mergeTwoLists', params: [{ name: 'l1', type: 'ListNode' }, { name: 'l2', type: 'ListNode' }], returns: 'ListNode' },
      tests: [fx([[1, 2, 4], [1, 3, 4]], [1, 1, 2, 3, 4, 4]), fx([[], []], []), fx([[], [0]], [0]), fx([[5], [1, 2, 3]], [1, 2, 3, 5], true), fx([[-3, 10], [-5, 0, 20]], [-5, -3, 0, 10, 20], true)],
    },
    {
      id: 'p1-6-removenth', title: 'Unhook the n-th from the end', role: 'mastery', difficulty: 'Medium', kind: 'function', uses: ['ListNode'],
      statement: 'Remove the `n`-th node **from the end** of the list and return the head. `n` is valid (1 ≤ n ≤ length). Try to do it in **one pass**.\n\n`1 → 2 → 3 → 4 → 5`, n = 2 → `1 → 2 → 3 → 5`',
      starter: LISTNODE_NOTE + solutionStarter('public ListNode removeNthFromEnd(ListNode head, int n)', 'return head;'),
      solution: `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode fast = dummy, slow = dummy;
        for (int i = 0; i <= n; i++) fast = fast.next;   // gap of n + 1
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        slow.next = slow.next.next;   // slow is just before the target
        return dummy.next;
    }
}`,
      hints: ['A dummy head handles removing the first node.', 'Move `fast` n + 1 steps ahead of `slow`.', 'When `fast` reaches null, `slow` is right before the node to remove.'],
      fn: { name: 'removeNthFromEnd', params: [{ name: 'head', type: 'ListNode' }, { name: 'n', type: 'int' }], returns: 'ListNode' },
      tests: [fx([[1, 2, 3, 4, 5], 2], [1, 2, 3, 5]), fx([[1], 1], []), fx([[1, 2], 1], [1]), fx([[1, 2], 2], [2], true), fx([[10, 20, 30], 3], [20, 30], true)],
    },
    {
      id: 'p1-6-middle', title: 'Find the middle barge', role: 'mastery', difficulty: 'Easy', kind: 'function', uses: ['ListNode'],
      statement: 'Return the middle node of the list (the list from that node onward). If there are two middles, return the **second** one.\n\n`1 → 2 → 3 → 4 → 5` → `3 → 4 → 5`; `1 → 2 → 3 → 4` → `3 → 4`',
      starter: LISTNODE_NOTE + solutionStarter('public ListNode middleNode(ListNode head)', 'return head;'),
      solution: `class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
}`,
      hints: ['Two pointers: `slow` moves 1 step, `fast` moves 2.', 'When `fast` reaches the end, `slow` is in the middle.'],
      fn: { name: 'middleNode', params: [{ name: 'head', type: 'ListNode' }], returns: 'ListNode' },
      tests: [fx([[1, 2, 3, 4, 5]], [3, 4, 5]), fx([[1, 2, 3, 4]], [3, 4]), fx([[1]], [1]), fx([[1, 2]], [2], true)],
    },
    {
      id: 'p1-6-reorder', title: 'Boss: Reorder the convoy', role: 'boss', difficulty: 'Medium', kind: 'function', uses: ['ListNode'],
      statement: `Reorder \`L0 → L1 → … → Ln−1 → Ln\` into \`L0 → Ln → L1 → Ln−1 → L2 → …\` **in place** (re-link the nodes, don't change values). Return nothing; the tests inspect the list.

\`1 → 2 → 3 → 4 → 5\` → \`1 → 5 → 2 → 4 → 3\``,
      starter: LISTNODE_NOTE + solutionStarter('public void reorderList(ListNode head)', ''),
      solution: `class Solution {
    public void reorderList(ListNode head) {
        if (head == null || head.next == null) return;
        // 1. find the middle
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        // 2. reverse the second half
        ListNode prev = null, cur = slow.next;
        slow.next = null;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        // 3. weave the two halves together
        ListNode a = head, b = prev;
        while (b != null) {
            ListNode an = a.next, bn = b.next;
            a.next = b;
            b.next = an;
            a = an;
            b = bn;
        }
    }
}`,
      walkthrough: 'Combine three skills from this module: (1) fast/slow pointers find the middle, (2) reverse the second half, (3) weave the halves together alternately. O(n) time, O(1) space.',
      hints: ['Break it into three smaller problems you have already solved.', 'Find the middle, cut the list, reverse the second half.', 'Merge alternately: one node from the first half, one from the reversed second half.'],
      fn: { name: 'reorderList', params: [{ name: 'head', type: 'ListNode' }], returns: 'void', checkArg: 0 },
      tests: [fx([[1, 2, 3, 4]], [1, 4, 2, 3]), fx([[1, 2, 3, 4, 5]], [1, 5, 2, 4, 3]), fx([[1]], [1]), fx([[1, 2]], [1, 2], true), fx([[1, 2, 3, 4, 5, 6, 7, 8]], [1, 8, 2, 7, 3, 6, 4, 5], true)],
      complexity: { prompt: 'Time and extra space?', options: ['O(n), O(n)', 'O(n), O(1)', 'O(n²), O(1)', 'O(n log n), O(1)'], answer: 1, why: 'Three linear passes and a handful of references.' },
    },
  ],
  gateQuestion: {
    prompt: 'Why does a dummy head node simplify many linked-list functions?',
    options: ['It makes the list faster', 'The real head can change without a special case', 'It prevents cycles', 'Java requires it'],
    answer: 1,
    why: 'With a node before the head, deleting or inserting at the front looks exactly like doing it anywhere else; return `dummy.next`.',
  },
  explainBack: {
    prompt: 'When would you choose a linked list over an array, and what do you give up?',
    keyIdeas: [
      { idea: 'O(1) insert/delete at front or at a known node', words: ['insert', 'delete', 'remove', 'front', 'splice', 'o(1)'] },
      { idea: 'no O(1) random access — must walk from head', words: ['index', 'random access', 'walk', 'traverse', 'o(n)', 'from the head'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r1-6-a', front: 'What three references does iterative list reversal use?', back: '`prev`, `cur`, and a saved `next`.' },
    { id: 'r1-6-b', front: 'How do you find the n-th node from the end in one pass?', back: 'Move `fast` n steps ahead, then move both until `fast` reaches the end.' },
    { id: 'r1-6-c', front: 'Cost of accessing the k-th node?', back: 'O(k) — walk from the head.' },
  ],
};
