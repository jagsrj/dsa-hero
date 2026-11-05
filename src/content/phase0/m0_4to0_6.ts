import type { Module } from '../types';
import { fx, io, programStarter, solutionStarter } from '../helpers';

export const m0_4: Module = {
  id: '0.4',
  phase: 0,
  title: 'Decisions',
  tagline: 'if, else and switch: make your program choose.',
  hook: `Codeville's school needs a grading robot, and the calendar office keeps getting leap years wrong. Both need the same skill: looking at a value and choosing what to do.`,
  concept: `### Comparisons produce booleans

| Operator | Meaning |
|---|---|
| \`==\` | equal (for numbers and chars) |
| \`!=\` | not equal |
| \`<\`, \`<=\`, \`>\`, \`>=\` | ordering |

Combine them with **logical operators**: \`&&\` (and), \`||\` (or), \`!\` (not). Java uses **short-circuit** evaluation: in \`a && b\`, if \`a\` is false, \`b\` is never checked.

### if / else if / else

~~~java
if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else {
    System.out.println("Keep going");
}
~~~

Java checks the conditions **top to bottom** and runs only the **first** block that matches. Order matters!

### Comparing Strings

Never use \`==\` for Strings — it compares *where* they live in memory, not their text. Use \`a.equals(b)\` (or \`a.equalsIgnoreCase(b)\`).

### switch expressions (modern Java)

When you choose between many fixed values, a switch expression is cleaner than a ladder of ifs:

~~~java
String name = switch (day) {
    case 1 -> "Monday";
    case 6, 7 -> "Weekend";
    default -> "Midweek";
};
~~~

### A classic trap: negative remainders

In Java, \`-3 % 2\` is \`-1\`, not \`1\`. So test oddness with \`n % 2 != 0\`, never \`n % 2 == 1\`.`,
  visual: {
    kind: 'vars',
    title: 'Following an if / else-if ladder',
    frames: [
      { caption: 'score is 84.', code: 'int score = 84;', vars: { score: 84 } },
      { caption: 'Is 84 >= 90? No — skip this block.', code: 'if (score >= 90) { grade = \'A\'; }', vars: { score: 84, 'score >= 90': 'false' } },
      { caption: 'Is 84 >= 80? Yes — run this block and skip the rest.', code: 'else if (score >= 80) { grade = \'B\'; }', vars: { score: 84, 'score >= 80': 'true', grade: 'B' } },
      { caption: 'The final else is never checked.', code: 'else { grade = \'F\'; }', vars: { score: 84, grade: 'B' } },
    ],
  },
  javaSpotlight: {
    title: 'switch expressions',
    body: 'Introduced in modern Java (14+): `->` arrows, no fall-through, and the switch *returns* a value. You can list several labels in one case.',
    code: `public class Main {
    public static void main(String[] args) {
        int month = 2;
        int days = switch (month) {
            case 2 -> 28;
            case 4, 6, 9, 11 -> 30;
            default -> 31;
        };
        System.out.println(days);
    }
}`,
  },
  problems: [
    {
      id: 'p0-4-evenodd', title: 'Even or odd', role: 'guided', difficulty: 'Easy', kind: 'program',
      statement: 'Read an integer (possibly negative) and print `Even` or `Odd`.',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
    }
}`,
      hints: ['A number is even when dividing by 2 leaves no remainder.', 'Careful: `-3 % 2` is `-1`. Test `n % 2 == 0` rather than `n % 2 == 1`.'],
      tests: [io('4\n', 'Even'), io('7\n', 'Odd'), io('-3\n', 'Odd', true), io('0\n', 'Even', true)],
    },
    {
      id: 'p0-4-max3', title: 'Largest of three', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read three integers and print the largest — using `if` statements, not `Math.max`.',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int a = in.nextInt(), b = in.nextInt(), c = in.nextInt();
        int max = a;
        if (b > max) max = b;
        if (c > max) max = c;
        System.out.println(max);
    }
}`,
      hints: ['Assume the first is the largest, then challenge it with each of the others.'],
      tests: [io('3 9 4\n', '9'), io('-1 -5 -3\n', '-1'), io('7 7 2\n', '7', true), io('1 2 3\n', '3', true)],
    },
    {
      id: 'p0-4-grade', title: 'The grading robot', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read a score from 0 to 100 and print its letter: `A` (90+), `B` (80–89), `C` (70–79), `D` (60–69), otherwise `F`.',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int s = in.nextInt();
        if (s >= 90) System.out.println("A");
        else if (s >= 80) System.out.println("B");
        else if (s >= 70) System.out.println("C");
        else if (s >= 60) System.out.println("D");
        else System.out.println("F");
    }
}`,
      hints: ['Check the highest band first, then work down with `else if`.'],
      tests: [io('95\n', 'A'), io('80\n', 'B'), io('79\n', 'C'), io('60\n', 'D', true), io('0\n', 'F', true), io('100\n', 'A', true)],
    },
    {
      id: 'p0-4-fizz', title: 'FizzBuzz, one number', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read a positive integer `n`. Print `FizzBuzz` if it is divisible by both 3 and 5, `Fizz` if only by 3, `Buzz` if only by 5, otherwise the number itself.',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        if (n % 15 == 0) System.out.println("FizzBuzz");
        else if (n % 3 == 0) System.out.println("Fizz");
        else if (n % 5 == 0) System.out.println("Buzz");
        else System.out.println(n);
    }
}`,
      hints: ['Which case must be checked first? If you test `% 3` first, 15 prints `Fizz`.', 'Divisible by both 3 and 5 means divisible by 15.'],
      tests: [io('15\n', 'FizzBuzz'), io('9\n', 'Fizz'), io('10\n', 'Buzz'), io('7\n', '7', true), io('45\n', 'FizzBuzz', true)],
    },
    {
      id: 'p0-4-leap', title: 'Boss: The calendar office', role: 'boss', difficulty: 'Medium', kind: 'program',
      statement: `Read a year and print either \`Leap year, 366 days\` or \`Common year, 365 days\`.

The rules (Gregorian calendar):
- divisible by 400 → leap
- otherwise divisible by 100 → **not** leap
- otherwise divisible by 4 → leap
- otherwise → not leap

So 2000 is a leap year, 1900 is not, 2024 is.`,
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int y = in.nextInt();
        boolean leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
        System.out.println(leap ? "Leap year, 366 days" : "Common year, 365 days");
    }
}`,
      walkthrough: 'The whole rule fits in one boolean: divisible by 4 but not by 100, **or** divisible by 400. The ternary operator `cond ? a : b` picks one of two values.',
      hints: ['Write the rules as an if / else-if ladder, starting with the most specific (400).', 'Or combine into one boolean with `&&` and `||`.', '`(y % 4 == 0 && y % 100 != 0) || y % 400 == 0`'],
      tests: [io('2024\n', 'Leap year, 366 days'), io('1900\n', 'Common year, 365 days'), io('2000\n', 'Leap year, 366 days'), io('2023\n', 'Common year, 365 days', true), io('2100\n', 'Common year, 365 days', true), io('1600\n', 'Leap year, 366 days', true)],
    },
  ],
  gateQuestion: {
    prompt: 'Given `String a = new String("hi"); String b = "hi";`, which expression is guaranteed to be `true`?',
    options: ['`a == b`', '`a.equals(b)`', 'Both', 'Neither'],
    answer: 1,
    why: '`==` compares object identity (two different objects here). `.equals` compares the text.',
  },
  explainBack: {
    prompt: 'Why does the order of conditions in an if / else-if ladder matter? Use FizzBuzz as an example.',
    keyIdeas: [
      { idea: 'only the first matching branch runs', words: ['first', 'top', 'only one', 'stops', 'skip'] },
      { idea: 'more specific case must come first (15 before 3)', words: ['specific', '15', 'both', 'before'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-4-a', front: 'How do you compare two Strings for equal text?', back: '`a.equals(b)` — never `==`.' },
    { id: 'r0-4-b', front: 'What is `-7 % 2` in Java?', back: '`-1`' },
    { id: 'r0-4-c', front: 'What does short-circuit `&&` mean?', back: 'If the left side is false, the right side is not evaluated.' },
  ],
};

export const m0_5: Module = {
  id: '0.5',
  phase: 0,
  title: 'Loops',
  tagline: 'Repeat work with for, while and do-while — and trace them by hand.',
  hook: `The Codeville printing press can stamp one line at a time. To print a whole multiplication table it needs to repeat itself — without anyone copy-pasting a hundred lines. Enter loops.`,
  concept: `### The for loop

Use it when you know how many times to repeat:

~~~java
for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}
~~~

Three parts in the parentheses: **start** (\`int i = 1\`), **keep going while** (\`i <= 5\`), **step** (\`i++\`).

### The while loop

Use it when you repeat *until something happens*:

~~~java
int n = 4729;
while (n > 0) {
    System.out.println(n % 10);
    n /= 10;
}
~~~

\`do { ... } while (cond);\` is the same, but always runs the body **at least once**.

### break and continue

- \`break\` leaves the loop immediately.
- \`continue\` skips to the next round.

### Nested loops

A loop inside a loop runs the inner loop **completely** for every round of the outer loop — great for grids and patterns:

~~~java
for (int row = 1; row <= 3; row++) {
    for (int col = 1; col <= row; col++) System.out.print("*");
    System.out.println();
}
~~~

### Tracing

Before running a loop, predict it. Write a small table of each variable after every round. This single habit prevents most loop bugs — especially **off-by-one** errors (\`<\` vs \`<=\`).

### Accumulators

A very common pattern: start a variable at a neutral value and update it every round.

~~~java
long sum = 0;
for (int i = 1; i <= n; i++) sum += i;
~~~`,
  visual: {
    kind: 'vars',
    title: 'Tracing a for loop that sums 1..4',
    frames: [
      { caption: 'Before the loop: sum = 0.', code: 'long sum = 0;', vars: { sum: 0 } },
      { caption: 'Round 1: i = 1, sum becomes 1.', code: 'sum += i;', vars: { i: 1, sum: 1 } },
      { caption: 'Round 2: i = 2, sum becomes 3.', code: 'sum += i;', vars: { i: 2, sum: 3 } },
      { caption: 'Round 3: i = 3, sum becomes 6.', code: 'sum += i;', vars: { i: 3, sum: 6 } },
      { caption: 'Round 4: i = 4, sum becomes 10.', code: 'sum += i;', vars: { i: 4, sum: 10 } },
      { caption: 'i becomes 5, i <= 4 is false: the loop ends.', code: 'i++ → 5; 5 <= 4 is false', vars: { i: 5, sum: 10 } },
    ],
  },
  javaSpotlight: {
    title: 'Building output with StringBuilder',
    body: 'Printing inside a big loop is slow. Collect the text in a `StringBuilder` and print once at the end. `sb.append(x)` adds to the end; `sb.toString()` gives the String.',
    code: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            if (i > 1) sb.append(' ');
            sb.append(i * i);
        }
        System.out.println(sb); // 1 4 9 16 25
    }
}`,
  },
  problems: [
    {
      id: 'p0-5-count', title: 'Count to N', role: 'guided', difficulty: 'Easy', kind: 'program',
      statement: 'Read `n` (1 ≤ n ≤ 1000) and print the numbers 1 to n, one per line.',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 1; i <= n; i++) {
            System.out.println(i);
        }
    }
}`,
      hints: ['`for (int i = 1; i <= n; i++)`', 'Is it `<` or `<=`? Trace it with n = 3.'],
      tests: [io('3\n', '1\n2\n3'), io('1\n', '1'), io('5\n', '1\n2\n3\n4\n5', true)],
    },
    {
      id: 'p0-5-sum', title: 'Sum 1 to N', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read `n` (1 ≤ n ≤ 1,000,000) and print `1 + 2 + … + n`. Watch the size of the answer.',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        long sum = 0;
        for (int i = 1; i <= n; i++) sum += i;
        System.out.println(sum);
    }
}`,
      hints: ['Use an accumulator starting at 0.', 'For n = 1,000,000 the answer is about 5 × 10¹¹ — it needs a `long`.'],
      tests: [io('4\n', '10'), io('100\n', '5050'), io('1000000\n', '500000500000', true)],
    },
    {
      id: 'p0-5-table', title: 'Multiplication table', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read `n` and print its table from 1 to 10 in this format:\n\n~~~\n7 x 1 = 7\n7 x 2 = 14\n...\n7 x 10 = 70\n~~~',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 1; i <= 10; i++) {
            System.out.println(n + " x " + i + " = " + (n * i));
        }
    }
}`,
      hints: ['Loop `i` from 1 to 10.', 'Put the multiplication in parentheses inside the String.'],
      tests: [io('7\n', Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`).join('\n')), io('1\n', Array.from({ length: 10 }, (_, i) => `1 x ${i + 1} = ${i + 1}`).join('\n'), true)],
    },
    {
      id: 'p0-5-stairs', title: 'Star staircase', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read `n` and print a staircase of `n` rows where row `i` has `i` stars.\n\n**Example:** `3` →\n~~~\n*\n**\n***\n~~~',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int row = 1; row <= n; row++) {
            for (int c = 0; c < row; c++) System.out.print("*");
            System.out.println();
        }
    }
}`,
      hints: ['Outer loop: rows. Inner loop: stars in that row.', 'Use `print` for stars and `println()` to end the row.'],
      tests: [io('3\n', '*\n**\n***'), io('1\n', '*'), io('5\n', '*\n**\n***\n****\n*****', true)],
    },
    {
      id: 'p0-5-primes', title: 'Boss: Prime hunter', role: 'boss', difficulty: 'Medium', kind: 'program',
      statement: `Read \`n\` (1 ≤ n ≤ 10000) and print all primes ≤ n on **one line**, separated by single spaces. If there are none, print \`None\`.

A prime is a number greater than 1 whose only divisors are 1 and itself.

**Example:** \`20\` → \`2 3 5 7 11 13 17 19\``,
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        StringBuilder sb = new StringBuilder();
        for (int x = 2; x <= n; x++) {
            boolean prime = true;
            for (int d = 2; d * d <= x; d++) {
                if (x % d == 0) { prime = false; break; }
            }
            if (prime) {
                if (sb.length() > 0) sb.append(' ');
                sb.append(x);
            }
        }
        System.out.println(sb.length() == 0 ? "None" : sb.toString());
    }
}`,
      walkthrough: 'For each candidate `x`, try divisors `d` only while `d * d <= x`: if `x` had a divisor larger than √x, it would also have one smaller than √x. `break` stops as soon as a divisor is found.',
      hints: ['For each x from 2 to n, check whether any d from 2 to x−1 divides it.', 'You only need to check divisors up to √x: loop while `d * d <= x`.', 'Use a `StringBuilder` and add a space before every prime except the first.'],
      tests: [io('20\n', '2 3 5 7 11 13 17 19'), io('1\n', 'None'), io('2\n', '2'), io('30\n', '2 3 5 7 11 13 17 19 23 29', true), io('97\n', '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97', true)],
    },
  ],
  gateQuestion: {
    prompt: 'What is `s` after this runs?\n\n~~~java\nint s = 0;\nfor (int i = 1; i <= 10; i += 3) s += i;\n~~~',
    options: ['22', '12', '55', '18'],
    answer: 0,
    why: '`i` takes the values 1, 4, 7, 10, so `s = 1 + 4 + 7 + 10 = 22`.',
  },
  explainBack: {
    prompt: 'When would you choose a while loop over a for loop? Give an example.',
    keyIdeas: [
      { idea: 'for: known number of repetitions', words: ['know', 'fixed', 'count', 'how many', 'range'] },
      { idea: 'while: repeat until a condition changes', words: ['until', 'condition', 'unknown', 'while', 'not know'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-5-a', front: 'What is an off-by-one error?', back: 'A loop that runs one time too many or too few, usually `<` vs `<=`.' },
    { id: 'r0-5-b', front: 'How is do-while different from while?', back: 'do-while always runs the body at least once.' },
    { id: 'r0-5-c', front: 'Why only test divisors up to √x for primality?', back: 'Any divisor above √x pairs with one below √x.' },
  ],
};

export const m0_6: Module = {
  id: '0.6',
  phase: 0,
  title: 'Methods',
  tagline: 'Package logic into reusable, testable pieces.',
  hook: `The Codeville engineers are tired of rewriting the same calculations. They want **machines**: put values in, get an answer out. In Java those machines are called methods — and from now on, the tests will call your methods directly.`,
  concept: `### Anatomy of a method

~~~java
public int square(int x) {
    return x * x;
}
~~~

- \`int\` before the name is the **return type** (\`void\` if nothing is returned).
- \`square\` is the **name**.
- \`(int x)\` is the **parameter list**.
- \`return\` sends a value back and ends the method immediately.

### Calling a method

~~~java
int y = square(5);   // 25
~~~

### How the tests work from now on

You write methods inside a class called **\`Solution\`**. The test harness creates a \`Solution\` and calls your method with different inputs, comparing what you return with the expected answer. You don't need \`main\` or \`Scanner\` — just return the right value.

You can add your own **helper methods** to \`Solution\` too.

### Pass-by-value

Java copies the **value** of each argument into the parameter. Changing the parameter inside the method does **not** change the caller's variable:

~~~java
static void bump(int n) { n++; }
int a = 5;
bump(a);   // a is still 5
~~~

### Overloading

Two methods can share a name if their parameter lists differ: \`max(int, int)\` and \`max(double, double)\`.

### static vs instance (preview)

A \`static\` method belongs to the class; an instance method belongs to an object. The tests call your methods on a \`Solution\` object, so you don't write \`static\`. You'll learn more in module 0.9.`,
  visual: {
    kind: 'vars',
    title: 'A method call gets its own copy of the values',
    frames: [
      { caption: 'The caller has a = 5.', code: 'int a = 5;', vars: { 'main: a': 5 } },
      { caption: 'Calling bump(a) copies 5 into parameter n.', code: 'bump(a);', vars: { 'main: a': 5, 'bump: n': 5 } },
      { caption: 'n++ changes only the copy.', code: 'n++;', vars: { 'main: a': 5, 'bump: n': 6 } },
      { caption: 'bump returns; its variables disappear. a is still 5.', code: '}', vars: { 'main: a': 5 } },
    ],
  },
  javaSpotlight: {
    title: 'Helper methods keep code readable',
    body: 'Break a problem into small named steps. A method that does one thing is easy to test and easy to reuse.',
    code: `class Solution {
    public long lcm(long a, long b) {
        return a / gcd(a, b) * b;   // divide first to avoid overflow
    }

    private long gcd(long a, long b) {
        while (b != 0) {
            long t = a % b;
            a = b;
            b = t;
        }
        return a;
    }
}`,
  },
  problems: [
    {
      id: 'p0-6-square', title: 'Square it', role: 'guided', difficulty: 'Easy', kind: 'function',
      statement: 'Complete `square(int x)` so it returns `x * x`.\n\nThis is your first method problem: no `main`, no `Scanner` — just **return** the answer.',
      starter: solutionStarter('public int square(int x)', 'return 0;'),
      solution: `class Solution {
    public int square(int x) {
        return x * x;
    }
}`,
      hints: ['Replace `return 0;` with `return x * x;`.'],
      fn: { name: 'square', params: [{ name: 'x', type: 'int' }], returns: 'int' },
      tests: [fx([3], 9), fx([-4], 16), fx([0], 0, true), fx([1000], 1000000, true)],
    },
    {
      id: 'p0-6-iseven', title: 'isEven', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return `true` if `n` is even, `false` otherwise. Works for negative numbers too.',
      starter: solutionStarter('public boolean isEven(int n)', 'return false;'),
      solution: `class Solution {
    public boolean isEven(int n) {
        return n % 2 == 0;
    }
}`,
      hints: ['A comparison is already a boolean — you can return it directly.'],
      fn: { name: 'isEven', params: [{ name: 'n', type: 'int' }], returns: 'boolean' },
      tests: [fx([4], true), fx([7], false), fx([-3], false, true), fx([0], true, true)],
    },
    {
      id: 'p0-6-clamp', title: 'Clamp a value', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return `value` limited to the range `[lo, hi]`: if it is below `lo` return `lo`, above `hi` return `hi`, otherwise `value` itself. You can assume `lo <= hi`.',
      starter: solutionStarter('public int clamp(int value, int lo, int hi)', 'return value;'),
      solution: `class Solution {
    public int clamp(int value, int lo, int hi) {
        if (value < lo) return lo;
        if (value > hi) return hi;
        return value;
    }
}`,
      hints: ['Early `return` statements keep this tidy.', 'One-liner alternative: `Math.max(lo, Math.min(hi, value))`.'],
      fn: { name: 'clamp', params: [{ name: 'value', type: 'int' }, { name: 'lo', type: 'int' }, { name: 'hi', type: 'int' }], returns: 'int' },
      tests: [fx([5, 0, 10], 5), fx([-3, 0, 10], 0), fx([42, 0, 10], 10), fx([10, 10, 10], 10, true), fx([-50, -20, -10], -20, true)],
    },
    {
      id: 'p0-6-power', title: 'Power without Math.pow', role: 'mastery', difficulty: 'Easy', kind: 'function',
      statement: 'Return `base` raised to `exp` (exp ≥ 0) as a `long`, using a loop. The answer always fits in a `long`.',
      starter: solutionStarter('public long power(int base, int exp)', 'return 0;'),
      solution: `class Solution {
    public long power(int base, int exp) {
        long result = 1;
        for (int i = 0; i < exp; i++) result *= base;
        return result;
    }
}`,
      hints: ['Start with `result = 1` (anything to the power 0 is 1).', 'Multiply by `base`, `exp` times.'],
      fn: { name: 'power', params: [{ name: 'base', type: 'int' }, { name: 'exp', type: 'int' }], returns: 'long' },
      tests: [fx([2, 10], 1024), fx([5, 0], 1), fx([-3, 3], -27), fx([10, 18], 1000000000000000000, true), fx([7, 1], 7, true)],
    },
    {
      id: 'p0-6-lcm', title: 'Boss: Gear synchronizer (LCM)', role: 'boss', difficulty: 'Medium', kind: 'function',
      statement: `Two gears in the clock tower turn every \`a\` and \`b\` seconds. They line up again after **lcm(a, b)** seconds — the least common multiple.

Return \`lcm(a, b)\` for \`1 ≤ a, b ≤ 10⁹\`. The answer fits in a \`long\`, but intermediate values might not if you're careless.

Write a helper \`gcd\` using **Euclid's algorithm**: \`gcd(a, b) = gcd(b, a % b)\`, and \`gcd(a, 0) = a\`. Then \`lcm(a, b) = a / gcd(a, b) * b\`.`,
      starter: `class Solution {
    public long lcm(long a, long b) {
        // Write your code here (add a gcd helper method)
        return 0;
    }
}
`,
      solution: `class Solution {
    public long lcm(long a, long b) {
        return a / gcd(a, b) * b;
    }

    private long gcd(long a, long b) {
        while (b != 0) {
            long t = a % b;
            a = b;
            b = t;
        }
        return a;
    }
}`,
      walkthrough: "Euclid's algorithm shrinks the pair fast (logarithmic steps). Dividing **before** multiplying keeps the intermediate value small: `a * b` alone could reach 10¹⁸, which still fits a long here, but the habit prevents overflow in general.",
      hints: ['First write `gcd` with a `while (b != 0)` loop.', 'Each step: `(a, b) → (b, a % b)`.', 'Return `a / gcd(a, b) * b` — divide first.'],
      fn: { name: 'lcm', params: [{ name: 'a', type: 'long' }, { name: 'b', type: 'long' }], returns: 'long' },
      tests: [fx([4, 6], 12), fx([7, 3], 21), fx([12, 12], 12), fx([1000000000, 999999999], 999999999000000000, true), fx([1, 1], 1, true), fx([18, 24], 72, true)],
      complexity: { prompt: "How many steps does Euclid's gcd take for numbers up to N?", options: ['O(N)', 'O(√N)', 'O(log N)', 'O(1)'], answer: 2, why: 'The remainder at least halves every two steps, so it takes O(log N) steps.' },
    },
  ],
  gateQuestion: {
    prompt: 'What does this print?\n\n~~~java\nstatic void bump(int n) { n++; }\n// in main:\nint a = 5;\nbump(a);\nSystem.out.println(a);\n~~~',
    options: ['5', '6', 'It does not compile', '0'],
    answer: 0,
    why: 'Java passes a copy of the value. `bump` changes its own copy, not `a`.',
  },
  explainBack: {
    prompt: 'What does "pass-by-value" mean in Java, and why does it matter?',
    keyIdeas: [
      { idea: 'the method receives a copy', words: ['copy', 'copied', 'value'] },
      { idea: "changing the parameter doesn't change the caller's variable", words: ['caller', 'original', 'unchanged', "doesn't change", 'does not change', 'not affect'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-6-a', front: 'What does `return` do?', back: 'Sends a value back to the caller and ends the method.' },
    { id: 'r0-6-b', front: "Euclid's algorithm in one line?", back: '`gcd(a, b) = b == 0 ? a : gcd(b, a % b)`' },
    { id: 'r0-6-c', front: 'What is the return type of a method that returns nothing?', back: '`void`' },
  ],
};
