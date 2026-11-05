import type { Module } from '../types';
import { fx, solutionStarter } from '../helpers';

export const m0_7: Module = {
  id: '0.7',
  phase: 0,
  title: 'Strings',
  tagline: 'Text is an array of characters you can read but not change.',
  hook: `A secret society in Codeville sends messages with every letter shifted down the alphabet. To join them you must read, transform and build strings — fast.`,
  concept: `### A String is a sequence of chars

~~~java
String s = "Codeville";
s.length();        // 9
s.charAt(0);       // 'C'
s.charAt(s.length() - 1); // 'e'
s.substring(0, 4); // "Code"  (start inclusive, end exclusive)
s.indexOf("ville"); // 4  (-1 if not found)
s.toLowerCase();   // "codeville"
~~~

Indexes start at **0** and end at **length − 1**.

### Strings are immutable

No String method changes the original — each one returns a **new** String:

~~~java
String a = "hi";
a.toUpperCase();      // result thrown away!
a = a.toUpperCase();  // now a is "HI"
~~~

### Looping over characters

~~~java
for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
}
for (char c : s.toCharArray()) { ... }   // the enhanced for loop
~~~

### chars are numbers

A \`char\` is stored as a number (its Unicode code), so you can do arithmetic:

~~~java
char c = 'c';
int pos = c - 'a';            // 2  (position in the alphabet)
char next = (char) (c + 1);   // 'd'
Character.isLetter(c); Character.isDigit(c); Character.toUpperCase(c);
~~~

### Building strings: StringBuilder

Adding to a String in a loop with \`+\` creates a new String every time — slow for long text. A \`StringBuilder\` grows in place:

~~~java
StringBuilder sb = new StringBuilder();
sb.append("abc").append('d');
sb.reverse();       // "dcba"
String result = sb.toString();
~~~`,
  visual: {
    kind: 'array',
    title: 'A String is indexed from 0',
    frames: [
      { caption: '"Codeville" has length 9; indexes 0 to 8.', values: ['C', 'o', 'd', 'e', 'v', 'i', 'l', 'l', 'e'] },
      { caption: 'charAt(0) is the first character.', values: ['C', 'o', 'd', 'e', 'v', 'i', 'l', 'l', 'e'], highlight: [0], pointers: { 0: 'charAt(0)' } },
      { caption: 'substring(0, 4) takes indexes 0, 1, 2, 3 — the end index is excluded.', values: ['C', 'o', 'd', 'e', 'v', 'i', 'l', 'l', 'e'], window: [0, 3] },
      { caption: 'The last character is at length − 1 = 8.', values: ['C', 'o', 'd', 'e', 'v', 'i', 'l', 'l', 'e'], highlight: [8], pointers: { 8: 'length-1' } },
    ],
  },
  javaSpotlight: {
    title: 'Character arithmetic',
    body: "Because chars are numbers, `c - 'a'` gives a letter's position (0–25), and `(char) ('a' + k)` turns a position back into a letter. This is the heart of every cipher.",
    code: `public class Main {
    public static void main(String[] args) {
        char c = 'x';
        int pos = c - 'a';                     // 23
        char shifted = (char) ('a' + (pos + 3) % 26); // 'a'
        System.out.println(pos + " " + shifted);
    }
}`,
  },
  problems: [
    {
      id: 'p0-7-vowels', title: 'Count vowels', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: 'Return how many vowels (`a e i o u`, upper or lower case) are in `s`.',
      starter: solutionStarter('public int countVowels(String s)', 'return 0;'),
      solution: `class Solution {
    public int countVowels(String s) {
        int count = 0;
        for (char c : s.toLowerCase().toCharArray()) {
            if ("aeiou".indexOf(c) >= 0) count++;
        }
        return count;
    }
}`,
      hints: ['Loop over each character.', 'Lower-case the string first so you only check five letters.', '`"aeiou".indexOf(c) >= 0` tells you whether c is a vowel.'],
      fn: { name: 'countVowels', params: [{ name: 's', type: 'String' }], returns: 'int' },
      tests: [fx(['Codeville'], 4), fx(['rhythm'], 0), fx(['AEIOUaeiou'], 10), fx([''], 0, true), fx(['Hello, World!'], 3, true)],
    },
    {
      id: 'p0-7-reverse', title: 'Reverse a string', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return `s` reversed. Try it with a loop first, then with `StringBuilder`.',
      starter: solutionStarter('public String reverse(String s)', 'return s;'),
      solution: `class Solution {
    public String reverse(String s) {
        StringBuilder sb = new StringBuilder();
        for (int i = s.length() - 1; i >= 0; i--) sb.append(s.charAt(i));
        return sb.toString();
    }
}`,
      hints: ['Loop from the last index down to 0.', 'Append each char to a StringBuilder.'],
      fn: { name: 'reverse', params: [{ name: 's', type: 'String' }], returns: 'String' },
      tests: [fx(['abc'], 'cba'), fx(['Java'], 'avaJ'), fx([''], '', true), fx(['a'], 'a', true), fx(['racecar'], 'racecar', true)],
    },
    {
      id: 'p0-7-pal', title: 'Is it a palindrome?', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'A palindrome reads the same forwards and backwards. Return `true` if `s` is one, **ignoring case**. (`"Level"` → true.)\n\nDo it without building a reversed copy: compare characters from both ends.',
      starter: solutionStarter('public boolean isPalindrome(String s)', 'return false;'),
      solution: `class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
            i++;
            j--;
        }
        return true;
    }
}`,
      hints: ['Use two indexes: `i` from the start, `j` from the end.', 'Move them toward each other while `i < j`.', 'Compare with `Character.toLowerCase`.'],
      fn: { name: 'isPalindrome', params: [{ name: 's', type: 'String' }], returns: 'boolean' },
      tests: [fx(['Level'], true), fx(['hello'], false), fx(['a'], true), fx([''], true, true), fx(['abBA'], true, true), fx(['abca'], false, true)],
    },
    {
      id: 'p0-7-title', title: 'Title case', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Words in `s` are separated by single spaces. Return `s` with the first letter of every word upper-case and the rest lower-case.\n\n`"hELLO codeville"` → `"Hello Codeville"`',
      starter: solutionStarter('public String titleCase(String s)', 'return s;'),
      solution: `class Solution {
    public String titleCase(String s) {
        StringBuilder sb = new StringBuilder();
        boolean startOfWord = true;
        for (char c : s.toCharArray()) {
            if (c == ' ') { sb.append(c); startOfWord = true; }
            else if (startOfWord) { sb.append(Character.toUpperCase(c)); startOfWord = false; }
            else sb.append(Character.toLowerCase(c));
        }
        return sb.toString();
    }
}`,
      hints: ['Track whether the next letter starts a word.', 'A space resets that flag.'],
      fn: { name: 'titleCase', params: [{ name: 's', type: 'String' }], returns: 'String' },
      tests: [fx(['hELLO codeville'], 'Hello Codeville'), fx(['java'], 'Java'), fx(['a b c'], 'A B C', true), fx(['DATA STRUCTURES and algorithms'], 'Data Structures And Algorithms', true)],
    },
    {
      id: 'p0-7-caesar', title: 'Boss: The secret society cipher', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `Encode \`s\` with a **Caesar cipher**: shift every letter \`shift\` places along the alphabet, wrapping around (\`z\` + 1 → \`a\`). Keep upper-case letters upper-case and lower-case lower-case. Anything that is not a letter stays the same.

\`shift\` can be large or negative: \`shift = 27\` behaves like 1, and \`shift = -1\` turns \`a\` into \`z\`.

**Example:** \`encode("Hello, World!", 3)\` → \`"Khoor, Zruog!"\``,
      starter: solutionStarter('public String encode(String s, int shift)', 'return s;'),
      solution: `class Solution {
    public String encode(String s, int shift) {
        int k = ((shift % 26) + 26) % 26;
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c >= 'a' && c <= 'z') sb.append((char) ('a' + (c - 'a' + k) % 26));
            else if (c >= 'A' && c <= 'Z') sb.append((char) ('A' + (c - 'A' + k) % 26));
            else sb.append(c);
        }
        return sb.toString();
    }
}`,
      walkthrough: 'Normalize the shift once: `((shift % 26) + 26) % 26` maps any integer into 0–25, fixing negative remainders. Then each letter becomes `base + (pos + k) % 26`.',
      hints: ["Turn a letter into a position with `c - 'a'`, shift it, wrap with `% 26`, and turn it back with `(char) ('a' + pos)`.", 'Handle upper-case separately with `A` as the base.', 'For negative shifts, `((shift % 26) + 26) % 26` gives a value in 0–25.'],
      fn: { name: 'encode', params: [{ name: 's', type: 'String' }, { name: 'shift', type: 'int' }], returns: 'String' },
      tests: [fx(['Hello, World!', 3], 'Khoor, Zruog!'), fx(['xyz', 3], 'abc'), fx(['abc', -1], 'zab'), fx(['Codeville 2026', 27], 'Dpefwjmmf 2026', true), fx(['ABC', -27], 'ZAB', true), fx(['', 5], '', true)],
      complexity: { prompt: 'What is the time complexity of encode for a string of length n?', options: ['O(1)', 'O(n)', 'O(n²)', 'O(26n²)'], answer: 1, why: 'One pass over the characters with constant work per character; StringBuilder appends are amortized O(1).' },
    },
  ],
  gateQuestion: {
    prompt: 'What does this print?\n\n~~~java\nString a = "hi";\na.toUpperCase();\nSystem.out.println(a);\n~~~',
    options: ['HI', 'hi', 'Hi', 'It does not compile'],
    answer: 1,
    why: "Strings are immutable. `toUpperCase()` returns a new String, which is ignored here, so `a` is unchanged.",
  },
  explainBack: {
    prompt: 'Why should you use a StringBuilder instead of + when building a long string in a loop?',
    keyIdeas: [
      { idea: 'Strings are immutable', words: ['immutable', 'cannot change', "can't change", 'new string'] },
      { idea: '+ creates a new copy every time (slow)', words: ['copy', 'copies', 'slow', 'every time', 'new object', 'quadratic', 'n^2', 'n²'] },
      { idea: 'StringBuilder appends in place', words: ['in place', 'mutable', 'append', 'grows', 'buffer'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-7-a', front: 'What does `"Codeville".substring(2, 5)` return?', back: '`"dev"` — index 2 up to (not including) 5.' },
    { id: 'r0-7-b', front: "What is `'d' - 'a'`?", back: '`3`' },
    { id: 'r0-7-c', front: 'Are Java Strings mutable?', back: 'No. Every "change" returns a new String.' },
  ],
};

export const m0_8: Module = {
  id: '0.8',
  phase: 0,
  title: 'Arrays',
  tagline: 'Fixed-size rows (and grids) of values you can reach instantly by index.',
  hook: `Codeville's warehouse stores crates in numbered slots. Any slot can be reached instantly if you know its number — but the warehouse can't grow. That's an array.`,
  concept: `### Creating arrays

~~~java
int[] scores = new int[5];          // five zeros
int[] primes = {2, 3, 5, 7, 11};    // with values
String[] names = new String[3];     // three nulls
~~~

- An array has a **fixed length**: \`primes.length\` is 5 (no parentheses!).
- Indexes go from **0** to **length − 1**.
- Reading \`primes[5]\` throws \`ArrayIndexOutOfBoundsException\`.
- New arrays are filled with **default values**: \`0\`, \`0.0\`, \`false\` or \`null\`.

### Why arrays are fast

The elements sit next to each other in memory, so the computer jumps straight to \`a[i]\` by calculating its address. Reading or writing any index takes the same tiny amount of time — **O(1)** in the language of the next phase.

### Looping

~~~java
for (int i = 0; i < a.length; i++) a[i] *= 2;   // when you need the index
for (int x : a) sum += x;                          // when you only read values
~~~

### Arrays are references

An array variable holds a *reference* (an arrow) to the array. Passing it to a method passes the arrow, so the method **can change the caller's array**:

~~~java
void zeroFirst(int[] a) { a[0] = 0; }   // the caller sees this change
~~~

### 2D arrays (grids)

~~~java
int[][] grid = new int[3][4];   // 3 rows, 4 columns
grid[1][2] = 7;                 // row 1, column 2
int rows = grid.length, cols = grid[0].length;
~~~`,
  visual: {
    kind: 'array',
    title: 'Reversing an array in place with two indexes',
    frames: [
      { caption: 'Start: i at the front, j at the back.', values: [1, 2, 3, 4, 5], pointers: { 0: 'i', 4: 'j' } },
      { caption: 'Swap a[i] and a[j], then move both inward.', values: [5, 2, 3, 4, 1], pointers: { 1: 'i', 3: 'j' }, highlight: [0, 4] },
      { caption: 'Swap again.', values: [5, 4, 3, 2, 1], pointers: { 2: 'i, j' }, highlight: [1, 3] },
      { caption: 'i and j met in the middle: done. Only n/2 swaps.', values: [5, 4, 3, 2, 1], highlight: [0, 1, 2, 3, 4] },
    ],
  },
  javaSpotlight: {
    title: 'The Arrays utility class',
    body: '`java.util.Arrays` saves typing: `Arrays.toString(a)` prints an array, `Arrays.fill(a, -1)` fills it, `Arrays.copyOf(a, n)` copies it, and `Arrays.sort(a)` sorts it.',
    code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {5, 3, 9, 1};
        Arrays.sort(a);
        System.out.println(Arrays.toString(a)); // [1, 3, 5, 9]
        int[] b = new int[3];
        Arrays.fill(b, 7);
        System.out.println(Arrays.toString(b)); // [7, 7, 7]
    }
}`,
  },
  problems: [
    {
      id: 'p0-8-sum', title: 'Array sum', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: 'Return the sum of all elements of `a`. The sum might not fit in an `int`.',
      starter: solutionStarter('public long sum(int[] a)', 'return 0;'),
      solution: `class Solution {
    public long sum(int[] a) {
        long total = 0;
        for (int x : a) total += x;
        return total;
    }
}`,
      hints: ['Use an enhanced for loop: `for (int x : a)`.', 'Accumulate into a `long`.'],
      fn: { name: 'sum', params: [{ name: 'a', type: 'int[]' }], returns: 'long' },
      tests: [fx([[1, 2, 3]], 6), fx([[]], 0), fx([[-5, 5, 10]], 10), fx([[2000000000, 2000000000]], 4000000000, true)],
    },
    {
      id: 'p0-8-max', title: 'Largest element', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return the largest value in a non-empty array `a`.',
      starter: solutionStarter('public int max(int[] a)', 'return 0;'),
      solution: `class Solution {
    public int max(int[] a) {
        int best = a[0];
        for (int x : a) if (x > best) best = x;
        return best;
    }
}`,
      hints: ['Start with `a[0]`, not 0 — the array might be all negative.'],
      fn: { name: 'max', params: [{ name: 'a', type: 'int[]' }], returns: 'int' },
      tests: [fx([[3, 9, 2]], 9), fx([[-7, -3, -9]], -3), fx([[42]], 42, true), fx([[1, 1, 1]], 1, true)],
    },
    {
      id: 'p0-8-rev', title: 'Reverse in place', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Reverse the array `a` **in place** — modify it directly and return nothing. The test checks your array afterwards.',
      starter: solutionStarter('public void reverse(int[] a)', ''),
      solution: `class Solution {
    public void reverse(int[] a) {
        int i = 0, j = a.length - 1;
        while (i < j) {
            int t = a[i];
            a[i] = a[j];
            a[j] = t;
            i++;
            j--;
        }
    }
}`,
      hints: ['Swap the first and last, then move inward.', 'A swap needs a temporary variable.'],
      fn: { name: 'reverse', params: [{ name: 'a', type: 'int[]' }], returns: 'void', checkArg: 0 },
      tests: [fx([[1, 2, 3, 4, 5]], [5, 4, 3, 2, 1]), fx([[1, 2]], [2, 1]), fx([[]], [], true), fx([[7]], [7], true), fx([[1, 2, 3, 4]], [4, 3, 2, 1], true)],
    },
    {
      id: 'p0-8-running', title: 'Running totals', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return a new array where element `i` is the sum of `a[0]` through `a[i]`.\n\n`[1, 2, 3, 4]` → `[1, 3, 6, 10]`',
      starter: solutionStarter('public int[] runningSum(int[] a)', 'return new int[0];'),
      solution: `class Solution {
    public int[] runningSum(int[] a) {
        int[] out = new int[a.length];
        int sum = 0;
        for (int i = 0; i < a.length; i++) {
            sum += a[i];
            out[i] = sum;
        }
        return out;
    }
}`,
      hints: ['Create `new int[a.length]`.', 'Keep a running sum as you go.'],
      fn: { name: 'runningSum', params: [{ name: 'a', type: 'int[]' }], returns: 'int[]' },
      tests: [fx([[1, 2, 3, 4]], [1, 3, 6, 10]), fx([[5]], [5]), fx([[3, -3, 3, -3]], [3, 0, 3, 0], true), fx([[]], [], true)],
    },
    {
      id: 'p0-8-rotate', title: 'Boss: Rotate the map', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `The Codeville map is an **n × n** grid. Return a **new** grid rotated 90° clockwise.

~~~
1 2 3        7 4 1
4 5 6   →    8 5 2
7 8 9        9 6 3
~~~`,
      starter: solutionStarter('public int[][] rotate(int[][] m)', 'return m;'),
      solution: `class Solution {
    public int[][] rotate(int[][] m) {
        int n = m.length;
        int[][] r = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                r[j][n - 1 - i] = m[i][j];
        return r;
    }
}`,
      walkthrough: 'Row `i` of the original becomes column `n − 1 − i` of the result. So `m[i][j]` lands at `r[j][n − 1 − i]`. Check it on the corner `m[0][0] = 1`: it goes to `r[0][2]`, the top-right. ✔',
      hints: ['Work out where `m[0][0]`, `m[0][2]` and `m[2][0]` end up.', 'The first row becomes the last column.', '`r[j][n - 1 - i] = m[i][j]`'],
      fn: { name: 'rotate', params: [{ name: 'm', type: 'int[][]' }], returns: 'int[][]' },
      tests: [fx([[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [[7, 4, 1], [8, 5, 2], [9, 6, 3]]), fx([[[1]]], [[1]]), fx([[[1, 2], [3, 4]]], [[3, 1], [4, 2]], true), fx([[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]], [[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]], true)],
      complexity: { prompt: 'Time complexity for an n × n grid?', options: ['O(n)', 'O(n²)', 'O(n³)', 'O(log n)'], answer: 1, why: 'Every one of the n² cells is visited exactly once.' },
    },
  ],
  gateQuestion: {
    prompt: 'What happens?\n\n~~~java\nint[] a = new int[3];\nSystem.out.println(a[3]);\n~~~',
    options: ['Prints 0', 'Prints null', 'Throws ArrayIndexOutOfBoundsException', 'Does not compile'],
    answer: 2,
    why: 'Valid indexes are 0, 1 and 2. Index 3 is past the end; the compiler cannot catch it, so it fails when the program runs.',
  },
  explainBack: {
    prompt: 'Why is reading a[i] from an array so fast, no matter how big the array is?',
    keyIdeas: [
      { idea: 'elements are stored next to each other (contiguous)', words: ['contiguous', 'next to each other', 'consecutive', 'in a row', 'block', 'adjacent'] },
      { idea: 'the address is computed directly from the index', words: ['address', 'calculate', 'compute', 'offset', 'directly', 'jump'] },
      { idea: 'constant time O(1)', words: ['o(1)', 'constant', 'same time'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-8-a', front: 'Default value of a new `int[]` element?', back: '`0`' },
    { id: 'r0-8-b', front: 'How do you get the number of columns of `int[][] g`?', back: '`g[0].length`' },
    { id: 'r0-8-c', front: "Can a method change the caller's array?", back: 'Yes — it receives a reference to the same array.' },
  ],
};
