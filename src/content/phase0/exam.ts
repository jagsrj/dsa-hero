import type { Problem } from '../types';
import { fx, io, programStarter, solutionStarter } from '../helpers';

export const phase0Exam: Problem[] = [
  {
    id: 'e0-minutes', title: 'Minutes to hours', role: 'exam', difficulty: 'Easy', kind: 'program',
    statement: 'Read a number of minutes and print it as `<h> h <m> min`.\n\n`135` → `2 h 15 min`',
    starter: programStarter(),
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int t = in.nextInt();
        System.out.println(t / 60 + " h " + t % 60 + " min");
    }
}`,
    hints: ['`/ 60` and `% 60`.'],
    tests: [io('135\n', '2 h 15 min'), io('59\n', '0 h 59 min'), io('600\n', '10 h 0 min', true)],
  },
  {
    id: 'e0-digits', title: 'Count the digits', role: 'exam', difficulty: 'Easy', kind: 'function',
    statement: 'Return how many digits `n` has. `0` has one digit; ignore the minus sign of negative numbers.',
    starter: solutionStarter('public int countDigits(long n)', 'return 0;'),
    solution: `class Solution {
    public int countDigits(long n) {
        if (n == 0) return 1;
        int count = 0;
        while (n != 0) {
            n /= 10;
            count++;
        }
        return count;
    }
}`,
    hints: ['Divide by 10 until the number becomes 0.'],
    fn: { name: 'countDigits', params: [{ name: 'n', type: 'long' }], returns: 'int' },
    tests: [fx([12345], 5), fx([0], 1), fx([-907], 3), fx([1000000000000], 13, true)],
  },
  {
    id: 'e0-evens', title: 'Sum of evens', role: 'exam', difficulty: 'Easy', kind: 'program',
    statement: 'Read `n` and print the sum of all even numbers from 1 to `n`.',
    starter: programStarter(),
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        long sum = 0;
        for (int i = 2; i <= n; i += 2) sum += i;
        System.out.println(sum);
    }
}`,
    hints: ['Step by 2.'],
    tests: [io('10\n', '30'), io('1\n', '0'), io('7\n', '12', true), io('100000\n', '2500050000', true)],
  },
  {
    id: 'e0-minindex', title: 'Where is the minimum?', role: 'exam', difficulty: 'Easy', kind: 'function',
    statement: 'Return the index of the smallest element of a non-empty array. If it appears more than once, return the **first** index.',
    starter: solutionStarter('public int indexOfMin(int[] a)', 'return 0;'),
    solution: `class Solution {
    public int indexOfMin(int[] a) {
        int best = 0;
        for (int i = 1; i < a.length; i++) if (a[i] < a[best]) best = i;
        return best;
    }
}`,
    hints: ['Track the index, not the value.', 'Use `<`, not `<=`, to keep the first occurrence.'],
    fn: { name: 'indexOfMin', params: [{ name: 'a', type: 'int[]' }], returns: 'int' },
    tests: [fx([[4, 2, 7, 2]], 1), fx([[9]], 0), fx([[5, 4, 3, 2, 1]], 4, true), fx([[-1, -1]], 0, true)],
  },
  {
    id: 'e0-words', title: 'Count the words', role: 'exam', difficulty: 'Medium', kind: 'function',
    statement: 'Return the number of words in `s`. Words are separated by one or more spaces; there may be spaces at the start or end.',
    starter: solutionStarter('public int countWords(String s)', 'return 0;'),
    solution: `class Solution {
    public int countWords(String s) {
        int count = 0;
        boolean inWord = false;
        for (char c : s.toCharArray()) {
            if (c == ' ') inWord = false;
            else if (!inWord) { inWord = true; count++; }
        }
        return count;
    }
}`,
    hints: ['Count the moments you move from a space into a word.'],
    fn: { name: 'countWords', params: [{ name: 's', type: 'String' }], returns: 'int' },
    tests: [fx(['hello world'], 2), fx(['   lots   of   space  '], 3), fx([''], 0, true), fx(['    '], 0, true), fx(['one'], 1, true)],
  },
  {
    id: 'e0-hollow', title: 'Hollow square', role: 'exam', difficulty: 'Medium', kind: 'program',
    statement: 'Read `n` (≥ 1) and print an n × n square of `*` that is hollow inside.\n\n`4` →\n~~~\n****\n*  *\n*  *\n****\n~~~',
    starter: programStarter(),
    solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int r = 0; r < n; r++) {
            StringBuilder sb = new StringBuilder();
            for (int c = 0; c < n; c++) {
                boolean edge = r == 0 || r == n - 1 || c == 0 || c == n - 1;
                sb.append(edge ? '*' : ' ');
            }
            System.out.println(sb);
        }
    }
}`,
    hints: ['A cell is a star when it is on the first/last row or column.'],
    tests: [io('4\n', '****\n*  *\n*  *\n****'), io('1\n', '*'), io('2\n', '**\n**', true), io('5\n', '*****\n*   *\n*   *\n*   *\n*****', true)],
  },
  {
    id: 'e0-sorted', title: 'Already sorted?', role: 'exam', difficulty: 'Easy', kind: 'function',
    statement: 'Return `true` if `a` is in non-decreasing order (each element ≥ the previous).',
    starter: solutionStarter('public boolean isSorted(int[] a)', 'return false;'),
    solution: `class Solution {
    public boolean isSorted(int[] a) {
        for (int i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false;
        return true;
    }
}`,
    hints: ['Compare each neighbour pair.'],
    fn: { name: 'isSorted', params: [{ name: 'a', type: 'int[]' }], returns: 'boolean' },
    tests: [fx([[1, 2, 2, 5]], true), fx([[3, 1]], false), fx([[]], true, true), fx([[7]], true, true), fx([[1, 2, 3, 2]], false, true)],
  },
  {
    id: 'e0-thermo', title: 'Thermometer log', role: 'exam', difficulty: 'Medium', kind: 'custom',
    statement: `Write a class \`Thermometer\`:

- \`void record(double t)\` stores a reading.
- \`int count()\`
- \`double max()\`, \`double min()\`, \`double average()\` — each throws \`IllegalStateException\` if nothing has been recorded.`,
    starter: `class Thermometer {
    void record(double t) { }

    int count() { return 0; }

    double max() { return 0; }

    double min() { return 0; }

    double average() { return 0; }
}
`,
    solution: `class Thermometer {
    private int count;
    private double sum, max, min;

    void record(double t) {
        if (count == 0) { max = t; min = t; }
        else { max = Math.max(max, t); min = Math.min(min, t); }
        sum += t;
        count++;
    }

    int count() { return count; }

    private void check() { if (count == 0) throw new IllegalStateException("no readings"); }

    double max() { check(); return max; }

    double min() { check(); return min; }

    double average() { check(); return sum / count; }
}`,
    hints: ['You do not need to store every reading — keep a running count, sum, max and min.'],
    tests: [],
    customHarness: `T.test("count", 3, () -> { Thermometer t = new Thermometer(); t.record(1); t.record(2); t.record(3); return t.count(); });
        T.test("max/min", "21.5 -3.0", () -> { Thermometer t = new Thermometer(); t.record(4); t.record(21.5); t.record(-3); return t.max() + " " + t.min(); });
        T.test("average", 2.5, () -> { Thermometer t = new Thermometer(); t.record(1); t.record(4); return t.average(); });
        T.test("negative-only readings", -2.0, () -> { Thermometer t = new Thermometer(); t.record(-5); t.record(-2); return t.max(); });
        T.test("empty throws", "thrown", () -> { try { new Thermometer().average(); return "no exception"; } catch (IllegalStateException e) { return "thrown"; } });`,
  },
];
