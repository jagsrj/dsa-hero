import type { Module } from '../types';
import { io, programStarter, programStarterNoInput } from '../helpers';

export const m0_1: Module = {
  id: '0.1',
  phase: 0,
  title: 'Hello, Java',
  tagline: 'Write, compile and run your very first program.',
  hook: `You've just arrived in **Codeville**, a city run entirely by programs. The gatekeeper hands you a blank terminal and says: *"Make it speak, and the city opens to you."* Every great engineer started exactly here: one line that prints something to the screen.`,
  concept: `### What is a program?

A program is a list of instructions that a computer follows **in order, top to bottom**. You write those instructions in a **programming language** — here, Java.

### From your code to the screen

1. You write **source code** in a file called \`Main.java\`.
2. The **compiler** (\`javac\`) checks your code for mistakes and translates it into **bytecode**.
3. The **Java Virtual Machine (JVM)** runs that bytecode and you see the output.

If the compiler finds a mistake (a missing \`;\`, a typo), it stops and tells you the line. That's not failure — it's the compiler helping you.

### The shape of every Java program

~~~java
public class Main {                          // a class: a container for code
    public static void main(String[] args) { // main: where the program starts
        System.out.println("Hello, Codeville!");
    }
}
~~~

- Every statement ends with a **semicolon** \`;\`.
- Curly braces \`{ }\` group code into blocks.
- Text inside double quotes is a **String**.
- \`// ...\` is a **comment**: the computer ignores it, humans read it.

### Printing

| Code | What it does |
|---|---|
| \`System.out.println("Hi");\` | prints \`Hi\` and moves to a new line |
| \`System.out.print("Hi");\` | prints \`Hi\` and stays on the same line |

**Escape sequences** let you print special characters inside a String: \`\\n\` (new line), \`\\t\` (tab), \`\\"\` (a quote) and \`\\\\\` (a backslash).

### Reading input

Programs get more interesting when they react to input. A \`Scanner\` reads what the user types:

~~~java
Scanner in = new Scanner(System.in);
String name = in.nextLine();   // reads one whole line
System.out.println("Welcome, " + name + "!");
~~~

The \`+\` operator **joins** (concatenates) Strings together.`,
  visual: {
    kind: 'text',
    title: 'Watch the program run line by line',
    frames: [
      { caption: 'The JVM starts at main.', code: 'public static void main(String[] args) {', output: '' },
      { caption: 'print writes text and stays on the same line.', code: 'System.out.print("Hello, ");', output: 'Hello, ' },
      { caption: 'println writes text, then moves to a new line.', code: 'System.out.println("Codeville!");', output: 'Hello, Codeville!\n' },
      { caption: '\\t inserts a tab; \\n starts a new line.', code: 'System.out.println("A\\tB\\nC");', output: 'Hello, Codeville!\nA\tB\nC\n' },
      { caption: 'When main ends, the program ends.', code: '}', output: 'Hello, Codeville!\nA\tB\nC\n' },
    ],
  },
  javaSpotlight: {
    title: 'println vs print vs printf',
    body: 'Three ways to print. `printf` uses a format string where `%s` is replaced by a String, `%d` by a whole number and `%n` by a new line. You will use it a lot for neat output.',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.print("Level ");
        System.out.println(1);
        System.out.printf("%s has %d coins%n", "Ada", 42);
    }
}`,
  },
  problems: [
    {
      id: 'p0-1-hello', title: 'Hello, Codeville', role: 'guided', difficulty: 'Easy', kind: 'program',
      statement: `Print exactly this line:

~~~
Hello, Codeville!
~~~

Capital letters, the comma and the exclamation mark all matter.`,
      starter: programStarterNoInput('// Print the greeting'),
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Codeville!");
    }
}`,
      walkthrough: 'Inside `main`, a single `System.out.println` call prints the String and ends the line.',
      hints: ['Use `System.out.println(...)` inside the `main` method.', 'Text goes inside double quotes: `"Hello, Codeville!"`.', 'Don\'t forget the semicolon at the end of the statement.'],
      tests: [io('', 'Hello, Codeville!')],
    },
    {
      id: 'p0-1-welcome', title: 'Welcome badge', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: `Read a name (one line) and print:

~~~
Welcome, <name>!
~~~

**Example:** input \`Ada\` → output \`Welcome, Ada!\``,
      starter: programStarter('// Read the name, then print the welcome message'),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String name = in.nextLine();
        System.out.println("Welcome, " + name + "!");
    }
}`,
      hints: ['`in.nextLine()` returns the whole line the user typed.', 'Join Strings with `+`: `"Welcome, " + name + "!"`.'],
      tests: [io('Ada\n', 'Welcome, Ada!'), io('Grace Hopper\n', 'Welcome, Grace Hopper!'), io('Linus\n', 'Welcome, Linus!', true)],
    },
    {
      id: 'p0-1-house', title: 'ASCII house', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: `Print this house exactly (no input):

~~~
  /\\
 /  \\
|____|
~~~

Line 1 has two spaces before \`/\\\`. Line 2 has one space before \`/\`.`,
      starter: programStarterNoInput('// Backslash needs escaping: write \\\\ to print one \\'),
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("  /\\\\");
        System.out.println(" /  \\\\");
        System.out.println("|____|");
    }
}`,
      hints: ['A single backslash inside a String must be written as `\\\\`.', 'Use one `println` per line of the house.'],
      tests: [io('', '  /\\\n /  \\\n|____|')],
    },
    {
      id: 'p0-1-echo', title: 'Echo, echo', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: `Read one line of text and print it **twice**, each on its own line.

**Example:** input \`hi there\` →
~~~
hi there
hi there
~~~`,
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String line = in.nextLine();
        System.out.println(line);
        System.out.println(line);
    }
}`,
      hints: ['Store the line in a variable so you can print it twice.'],
      tests: [io('hi there\n', 'hi there\nhi there'), io('Java!\n', 'Java!\nJava!'), io('  spaces  kept\n', '  spaces  kept\n  spaces  kept', true)],
    },
    {
      id: 'p0-1-receipt', title: 'Boss: The Codeville Café receipt', role: 'boss', difficulty: 'Easy', kind: 'program',
      statement: `The café needs a receipt printer. Read an **item name** (one line) and print exactly:

~~~
==== CODEVILLE CAFE ====
Item: <item>
	Thank you, come again!
========================
~~~

The third line starts with a **tab** character.`,
      starter: programStarter('// Print the four receipt lines'),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String item = in.nextLine();
        System.out.println("==== CODEVILLE CAFE ====");
        System.out.println("Item: " + item);
        System.out.println("\\tThank you, come again!");
        System.out.println("========================");
    }
}`,
      hints: ['Four `println` calls, one per line.', 'A tab is written `\\t` inside a String.', 'Count the `=` signs carefully: 24 on the last line.'],
      tests: [io('Masala Chai\n', '==== CODEVILLE CAFE ====\nItem: Masala Chai\n\tThank you, come again!\n========================'), io('Espresso\n', '==== CODEVILLE CAFE ====\nItem: Espresso\n\tThank you, come again!\n========================', true)],
    },
  ],
  gateQuestion: {
    prompt: 'What does this print?\n\n~~~java\nSystem.out.print("A");\nSystem.out.println("B");\nSystem.out.print("C");\n~~~',
    options: ['A, B and C on three lines', '`AB` on line 1, `C` on line 2', '`ABC` on one line', '`A` on line 1, `BC` on line 2'],
    answer: 1,
    why: '`print` stays on the line, so A and B share line 1; `println` then moves to a new line, where C is printed.',
  },
  explainBack: {
    prompt: 'In 2–3 sentences: what happens between saving Main.java and seeing output on the screen?',
    keyIdeas: [
      { idea: 'the compiler (javac) translates the code', words: ['compile', 'compiler', 'javac', 'bytecode', 'translate'] },
      { idea: 'the JVM runs it', words: ['jvm', 'virtual machine', 'run', 'execute'] },
      { idea: 'execution starts at main', words: ['main'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-1-a', front: 'What is the difference between `print` and `println`?', back: '`println` moves to a new line after printing; `print` does not.' },
    { id: 'r0-1-b', front: 'How do you print a double quote inside a String?', back: 'Escape it: `\\"`' },
    { id: 'r0-1-c', front: 'What does `javac` produce?', back: 'Bytecode (`.class` files) that the JVM runs.' },
  ],
};

export const m0_2: Module = {
  id: '0.2',
  phase: 0,
  title: 'Variables and types',
  tagline: 'Store values, pick the right type, and watch out for overflow.',
  hook: `The Codeville bank keeps every balance in labelled boxes. Put a decimal into a box meant for whole numbers and the cents vanish. Put a huge number into a small box and it wraps around to a negative. Today you learn which box to use.`,
  concept: `### Variables are labelled boxes

A **variable** has a **type**, a **name** and a **value**:

~~~java
int coins = 42;          // whole number
double price = 3.75;     // decimal number
boolean isOpen = true;   // true or false
char grade = 'A';        // one character, single quotes
String city = "Codeville"; // text, double quotes
~~~

You can change a variable's value later (\`coins = coins + 8;\`), but not its type.

### Primitive types you'll use most

| Type | Holds | Range / notes |
|---|---|---|
| \`int\` | whole numbers | about ±2.1 billion (2,147,483,647) |
| \`long\` | big whole numbers | about ±9.2 × 10¹⁸ — write literals with \`L\` |
| \`double\` | decimals | ~15 significant digits, tiny rounding errors |
| \`boolean\` | \`true\` / \`false\` | |
| \`char\` | one character | stored as a number (\`'A'\` is 65) |

### Integer overflow

An \`int\` has a maximum. Go past it and it **wraps around** to a large negative number — silently:

~~~java
int big = 2_000_000_000;
int doubled = big * 2;   // -294967296  (overflow!)
long safe = (long) big * 2; // 4000000000
~~~

When a result can exceed ~2 billion, use \`long\`. Interviewers love this bug.

### Integer vs decimal division

\`7 / 2\` is \`3\` because both sides are \`int\`. \`7 / 2.0\` is \`3.5\` because one side is a \`double\`. You can **cast** to change a type: \`(double) 7 / 2\` is \`3.5\`.

### Reading numbers

~~~java
Scanner in = new Scanner(System.in);
int a = in.nextInt();
long b = in.nextLong();
double c = in.nextDouble();
~~~`,
  visual: {
    kind: 'vars',
    title: 'Variables changing as each line runs',
    frames: [
      { caption: 'Declare an int box called coins.', code: 'int coins = 42;', vars: { coins: 42 } },
      { caption: 'Update it: the old value is replaced.', code: 'coins = coins + 8;', vars: { coins: 50 } },
      { caption: 'Integer division drops the fraction.', code: 'int half = coins / 4;', vars: { coins: 50, half: 12 } },
      { caption: 'Use a double to keep the fraction.', code: 'double exact = coins / 4.0;', vars: { coins: 50, half: 12, exact: 12.5 } },
      { caption: 'int overflow wraps around…', code: 'int big = 2_000_000_000 * 2;', vars: { coins: 50, half: 12, exact: 12.5, big: -294967296 } },
      { caption: '…so use long for big results.', code: 'long ok = 2_000_000_000L * 2;', vars: { coins: 50, half: 12, exact: 12.5, big: -294967296, ok: 4000000000 } },
    ],
  },
  javaSpotlight: {
    title: 'Casting and formatting decimals',
    body: 'A cast like `(int) 3.99` chops the decimal part (it does **not** round). To print a decimal neatly, use `printf` with `%.2f` (2 decimal places).',
    code: `public class Main {
    public static void main(String[] args) {
        double price = 3.99;
        int whole = (int) price;              // 3
        long cents = Math.round(price * 100); // 399
        System.out.printf("%.2f %d %d%n", price, whole, cents);
    }
}`,
  },
  problems: [
    {
      id: 'p0-2-sum', title: 'Add two numbers', role: 'guided', difficulty: 'Easy', kind: 'program',
      statement: 'Read two integers `a` and `b` (separated by a space) and print their sum.\n\n**Example:** `3 4` → `7`',
      starter: programStarter('// Read a and b with in.nextInt(), then print a + b'),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int a = in.nextInt();
        int b = in.nextInt();
        System.out.println(a + b);
    }
}`,
      hints: ['`in.nextInt()` reads the next whole number, skipping spaces.', 'Call it twice: once for `a`, once for `b`.'],
      tests: [io('3 4\n', '7'), io('-10 25\n', '15'), io('0 0\n', '0', true), io('1000 2000\n', '3000', true)],
    },
    {
      id: 'p0-2-rect', title: 'Rectangle report', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read the width and height of a rectangle (two integers) and print:\n\n~~~\nArea: <w*h>\nPerimeter: <2*(w+h)>\n~~~',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int w = in.nextInt(), h = in.nextInt();
        System.out.println("Area: " + (w * h));
        System.out.println("Perimeter: " + (2 * (w + h)));
    }
}`,
      hints: ['Wrap arithmetic in parentheses when joining with a String: `"Area: " + (w * h)`.', 'Without parentheses, `"Perimeter: " + 2 * w + h` would join the numbers as text.'],
      tests: [io('3 4\n', 'Area: 12\nPerimeter: 14'), io('10 1\n', 'Area: 10\nPerimeter: 22'), io('7 7\n', 'Area: 49\nPerimeter: 28', true)],
    },
    {
      id: 'p0-2-bigmul', title: 'No overflow allowed', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read two integers (each up to 2,000,000,000) and print their **exact** product.\n\n**Example:** `100000 100000` → `10000000000`',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        long a = in.nextLong(), b = in.nextLong();
        System.out.println(a * b);
    }
}`,
      hints: ['Will the product fit in an `int`? 100000 × 100000 = 10¹⁰.', 'Use `long` and `in.nextLong()`.'],
      tests: [io('100000 100000\n', '10000000000'), io('3 5\n', '15'), io('2000000000 2000000000\n', '4000000000000000000', true), io('-46341 46341\n', '-2147488281', true)],
    },
    {
      id: 'p0-2-avg', title: 'Average of three', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read three integers and print their average with **exactly 2 decimal places**.\n\n**Example:** `1 2 4` → `2.33`',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int a = in.nextInt(), b = in.nextInt(), c = in.nextInt();
        double avg = (a + b + c) / 3.0;
        System.out.printf("%.2f%n", avg);
    }
}`,
      hints: ['`(a + b + c) / 3` is integer division — the fraction is lost.', 'Divide by `3.0` instead, then print with `printf("%.2f%n", avg)`.'],
      tests: [io('1 2 4\n', '2.33'), io('10 20 30\n', '20.00'), io('-1 0 0\n', '-0.33', true), io('5 5 6\n', '5.33', true)],
    },
    {
      id: 'p0-2-temp', title: 'Boss: Temperature converter', role: 'boss', difficulty: 'Easy', kind: 'program',
      statement: `Codeville's weather station reports in Celsius, but the visitors want Fahrenheit.

Read a temperature in Celsius (a decimal number) and print:

~~~
<C> C = <F> F
~~~

where both numbers have **exactly 1 decimal place** and **F = C × 9 / 5 + 32**.

**Example:** \`37.5\` → \`37.5 C = 99.5 F\``,
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        double c = in.nextDouble();
        double f = c * 9 / 5 + 32;
        System.out.printf("%.1f C = %.1f F%n", c, f);
    }
}`,
      hints: ['Read with `in.nextDouble()`.', 'Because `c` is a `double`, `c * 9 / 5` keeps the fraction.', 'Format both numbers in one `printf`: `"%.1f C = %.1f F%n"`.'],
      tests: [io('37.5\n', '37.5 C = 99.5 F'), io('0\n', '0.0 C = 32.0 F'), io('-40\n', '-40.0 C = -40.0 F', true), io('21.2\n', '21.2 C = 70.2 F', true)],
    },
  ],
  gateQuestion: {
    prompt: 'What are the values?\n\n~~~java\nint x = 7 / 2;\ndouble y = 7 / 2;\ndouble z = 7 / 2.0;\n~~~',
    options: ['x = 3, y = 3.5, z = 3.5', 'x = 3, y = 3.0, z = 3.5', 'x = 4, y = 3.5, z = 3.5', 'x = 3.5, y = 3.5, z = 3.5'],
    answer: 1,
    why: '`7 / 2` is integer division (3) *before* it is stored, so y becomes 3.0. Only `7 / 2.0` divides as decimals.',
  },
  explainBack: {
    prompt: 'When should you use long instead of int, and what goes wrong if you don\'t?',
    keyIdeas: [
      { idea: 'int has a limited range (~2.1 billion)', words: ['billion', 'range', 'limit', 'max', '2147483647', 'too big', 'large'] },
      { idea: 'overflow wraps around silently', words: ['overflow', 'wrap', 'negative', 'wrong'] },
      { idea: 'long holds much bigger values', words: ['long', '64'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-2-a', front: 'What is `10 / 4` in Java?', back: '`2` — both are ints, so the fraction is dropped.' },
    { id: 'r0-2-b', front: 'What is the max value of an `int`?', back: '2,147,483,647 (about 2.1 billion).' },
    { id: 'r0-2-c', front: 'What does `(int) 9.99` give?', back: '`9` — casting truncates, it does not round.' },
  ],
};

export const m0_3: Module = {
  id: '0.3',
  phase: 0,
  title: 'Operators',
  tagline: 'Arithmetic, remainders and the order things happen in.',
  hook: `Codeville's clock tower is broken: it only knows the total number of seconds since midnight. The mayor needs hours, minutes and seconds. Two operators — integer division and remainder — are all it takes.`,
  concept: `### Arithmetic operators

| Operator | Meaning | Example | Result |
|---|---|---|---|
| \`+\` | add | \`7 + 2\` | 9 |
| \`-\` | subtract | \`7 - 2\` | 5 |
| \`*\` | multiply | \`7 * 2\` | 14 |
| \`/\` | divide | \`7 / 2\` | 3 (ints!) |
| \`%\` | remainder | \`7 % 2\` | 1 |

### The remainder operator \`%\` is a superpower

- \`n % 2 == 0\` → \`n\` is even.
- \`n % 10\` → the **last digit** of \`n\`.
- \`n / 10\` → \`n\` with the last digit **removed**.
- \`seconds % 60\` → seconds left over after taking out whole minutes.

### Precedence: who goes first

\`*\`, \`/\` and \`%\` happen before \`+\` and \`-\`. Operators of equal rank go **left to right**. When in doubt, use parentheses:

~~~java
int a = 2 + 3 * 4;     // 14
int b = (2 + 3) * 4;   // 20
int c = 20 / 2 * 5;    // 50 (left to right)
~~~

### Shortcuts

~~~java
x += 5;   // x = x + 5
x *= 2;   // x = x * 2
x++;      // x = x + 1
x--;      // x = x - 1
~~~

### The Math class

\`Math.abs(-4)\` → 4, \`Math.max(3, 9)\` → 9, \`Math.min(3, 9)\` → 3, \`Math.sqrt(16)\` → 4.0, \`Math.pow(2, 10)\` → 1024.0 (a double).`,
  visual: {
    kind: 'vars',
    title: 'Peeling digits with % and /',
    frames: [
      { caption: 'Start with n = 4729.', code: 'int n = 4729;', vars: { n: 4729 } },
      { caption: 'n % 10 is the last digit.', code: 'int last = n % 10;', vars: { n: 4729, last: 9 } },
      { caption: 'n / 10 removes the last digit.', code: 'n = n / 10;', vars: { n: 472, last: 9 } },
      { caption: 'Repeat: the new last digit is 2.', code: 'last = n % 10;', vars: { n: 472, last: 2 } },
      { caption: 'And again.', code: 'n = n / 10;', vars: { n: 47, last: 2 } },
    ],
  },
  javaSpotlight: {
    title: 'Padding numbers with printf',
    body: '`%02d` prints a whole number using at least 2 digits, padding with zeros — perfect for clocks like `7:05:09`.',
    code: `public class Main {
    public static void main(String[] args) {
        int h = 7, m = 5, s = 9;
        System.out.printf("%d:%02d:%02d%n", h, m, s); // 7:05:09
    }
}`,
  },
  problems: [
    {
      id: 'p0-3-split', title: 'Split the bill', role: 'guided', difficulty: 'Easy', kind: 'program',
      statement: 'Read the total bill in cents and the number of people (two integers). Everyone pays the same whole number of cents; the café keeps what is left over. Print:\n\n~~~\nEach: <cents per person>\nLeft over: <remaining cents>\n~~~\n\n**Example:** `1000 3` → `Each: 333` and `Left over: 1`',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int total = in.nextInt(), people = in.nextInt();
        System.out.println("Each: " + total / people);
        System.out.println("Left over: " + total % people);
    }
}`,
      hints: ['Integer division `/` gives each share.', '`%` gives what remains.'],
      tests: [io('1000 3\n', 'Each: 333\nLeft over: 1'), io('900 3\n', 'Each: 300\nLeft over: 0'), io('7 10\n', 'Each: 0\nLeft over: 7', true)],
    },
    {
      id: 'p0-3-lastdigit', title: 'Last digit, first part', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read a positive integer `n`. Print its last digit on line 1 and the number without its last digit on line 2.\n\n**Example:** `4729` → `9` then `472`',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        System.out.println(n % 10);
        System.out.println(n / 10);
    }
}`,
      hints: ['`n % 10` and `n / 10`.'],
      tests: [io('4729\n', '9\n472'), io('5\n', '5\n0'), io('100\n', '0\n10', true)],
    },
    {
      id: 'p0-3-clock', title: 'Fix the clock tower', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read the number of seconds since midnight (0 to 86399) and print the time as `H:MM:SS`.\n\n**Example:** `3725` → `1:02:05`',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int t = in.nextInt();
        int h = t / 3600;
        int m = (t % 3600) / 60;
        int s = t % 60;
        System.out.printf("%d:%02d:%02d%n", h, m, s);
    }
}`,
      hints: ['There are 3600 seconds in an hour.', 'After removing whole hours (`t % 3600`), divide by 60 for minutes.', 'Use `%02d` to pad minutes and seconds.'],
      tests: [io('3725\n', '1:02:05'), io('0\n', '0:00:00'), io('86399\n', '23:59:59', true), io('59\n', '0:00:59', true)],
    },
    {
      id: 'p0-3-digitsum4', title: 'Four-digit checksum', role: 'mastery', difficulty: 'Easy', kind: 'program',
      statement: 'Read a four-digit number (1000–9999) and print the sum of its digits. No loops needed.\n\n**Example:** `2026` → `10`',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int sum = n / 1000 + (n / 100) % 10 + (n / 10) % 10 + n % 10;
        System.out.println(sum);
    }
}`,
      hints: ['Thousands digit: `n / 1000`.', 'Hundreds digit: `(n / 100) % 10`.'],
      tests: [io('2026\n', '10'), io('9999\n', '36'), io('1000\n', '1', true), io('4729\n', '22', true)],
    },
    {
      id: 'p0-3-reverse3', title: 'Boss: Mirror number', role: 'boss', difficulty: 'Easy', kind: 'program',
      statement: 'Read a three-digit number (100–999). Print its digits reversed as a number, then the sum of its digits:\n\n~~~\nReversed: <r>\nSum: <s>\n~~~\n\n**Example:** `120` → `Reversed: 21` and `Sum: 3` (leading zeros disappear because it is a number).',
      starter: programStarter(),
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int a = n / 100, b = (n / 10) % 10, c = n % 10;
        System.out.println("Reversed: " + (c * 100 + b * 10 + a));
        System.out.println("Sum: " + (a + b + c));
    }
}`,
      hints: ['Pull out the three digits first.', 'Rebuild: `last * 100 + middle * 10 + first`.'],
      tests: [io('120\n', 'Reversed: 21\nSum: 3'), io('123\n', 'Reversed: 321\nSum: 6'), io('900\n', 'Reversed: 9\nSum: 9', true), io('505\n', 'Reversed: 505\nSum: 10', true)],
    },
  ],
  gateQuestion: {
    prompt: 'What is the value of `2 + 3 * 4 % 5`?',
    options: ['0', '4', '14', '5'],
    answer: 1,
    why: '`*` and `%` go first, left to right: `3 * 4 = 12`, `12 % 5 = 2`, then `2 + 2 = 4`.',
  },
  explainBack: {
    prompt: 'How do you get the last digit of a number, and how do you remove it?',
    keyIdeas: [
      { idea: '% 10 gives the last digit', words: ['% 10', '%10', 'mod 10', 'remainder', 'modulo'] },
      { idea: '/ 10 removes it', words: ['/ 10', '/10', 'divide by 10', 'division'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-3-a', front: 'How do you test whether `n` is even?', back: '`n % 2 == 0`' },
    { id: 'r0-3-b', front: 'What is `17 % 5`?', back: '`2`' },
    { id: 'r0-3-c', front: 'What does `x += 3` mean?', back: '`x = x + 3`' },
  ],
};
