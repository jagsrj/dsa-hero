import type { Module } from '../types';

export const m0_9: Module = {
  id: '0.9',
  phase: 0,
  title: 'Classes and objects',
  tagline: 'Design your own types: fields, constructors and behaviour.',
  hook: `The Codeville bank is drowning in loose variables: \`balance1\`, \`balance2\`, \`owner1\`… Bugs everywhere. The fix is to bundle data and the rules that protect it into one thing: an **object**.`,
  concept: `### A class is a blueprint; an object is a thing built from it

~~~java
class Counter {
    private int count;            // field: data each object owns

    Counter(int start) {          // constructor: runs when you write new Counter(...)
        this.count = start;
    }

    void increment() { count++; } // method: behaviour
    int getCount() { return count; }
}

Counter a = new Counter(0);
Counter b = new Counter(10);
a.increment();   // a is 1, b is still 10 — each object has its own fields
~~~

### this

Inside a method or constructor, \`this\` means *the object being worked on*. You need it when a parameter has the same name as a field: \`this.count = count;\`.

### Encapsulation

Make fields \`private\` and expose methods. Then the class can **enforce its rules** — for example, a bank balance can never go negative because the only way to change it is through \`withdraw\`, which checks first.

### static: belongs to the class, not to objects

~~~java
class Ticket {
    private static int issued = 0;   // shared by all tickets
    private final int number;

    Ticket() { issued++; number = issued; }
    static int getIssued() { return issued; }
}
~~~

\`final\` means the field can be set once and never changed.

### toString

Override \`toString()\` to control how your object prints: \`System.out.println(ticket)\` calls it automatically.

### How these tests work

There is no \`Solution\` class this time. The tests create your objects with \`new\` and call their methods, checking every result.`,
  visual: {
    kind: 'vars',
    title: 'Two objects, two sets of fields',
    frames: [
      { caption: 'new creates an object and runs the constructor.', code: 'Counter a = new Counter(0);', vars: { 'a.count': 0 } },
      { caption: 'A second object gets its own fields.', code: 'Counter b = new Counter(10);', vars: { 'a.count': 0, 'b.count': 10 } },
      { caption: 'Calling a method on a changes only a.', code: 'a.increment();', vars: { 'a.count': 1, 'b.count': 10 } },
      { caption: 'static fields are shared by every object.', code: 'Counter.created  // static', vars: { 'a.count': 1, 'b.count': 10, 'Counter.created': 2 } },
    ],
  },
  javaSpotlight: {
    title: 'Records: tiny immutable classes',
    body: "When a class just carries data, a `record` writes the constructor, getters, `equals`, `hashCode` and `toString` for you. You'll use records for things like coordinates and edges later.",
    code: `public class Main {
    record Point(int x, int y) {}

    public static void main(String[] args) {
        Point p = new Point(3, 4);
        System.out.println(p.x() + p.y());   // 7
        System.out.println(p);               // Point[x=3, y=4]
    }
}`,
  },
  problems: [
    {
      id: 'p0-9-point', title: 'Your first class: Point', role: 'guided', difficulty: 'Easy', kind: 'custom',
      statement: `Complete the \`Point\` class:

- \`Point(int x, int y)\` stores the coordinates.
- \`getX()\` and \`getY()\` return them.
- \`distanceTo(Point other)\` returns the **Manhattan distance** \`|x1 − x2| + |y1 − y2|\`.`,
      starter: `class Point {
    // TODO: add two private int fields

    Point(int x, int y) {
        // TODO: store the coordinates
    }

    int getX() { return 0; }

    int getY() { return 0; }

    int distanceTo(Point other) {
        return 0;
    }
}
`,
      solution: `class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int getX() { return x; }

    int getY() { return y; }

    int distanceTo(Point other) {
        return Math.abs(x - other.x) + Math.abs(y - other.y);
    }
}`,
      hints: ['Declare `private int x;` and `private int y;` at the top of the class.', 'In the constructor: `this.x = x;`', 'Use `Math.abs` for the distance.'],
      tests: [],
      customHarness: `T.test("stores x", 3, () -> new Point(3, 4).getX());
        T.test("stores y", 4, () -> new Point(3, 4).getY());
        T.test("distance (1,2)→(4,6)", 7, () -> new Point(1, 2).distanceTo(new Point(4, 6)));
        T.test("distance with negatives", 10, () -> new Point(-2, -3).distanceTo(new Point(3, 2)));
        T.test("distance to itself", 0, () -> { Point p = new Point(5, 5); return p.distanceTo(p); });
        T.test("objects are independent", "1,2 5,6", () -> { Point a = new Point(1, 2); Point b = new Point(5, 6); return a.getX() + "," + a.getY() + " " + b.getX() + "," + b.getY(); });`,
    },
    {
      id: 'p0-9-counter', title: 'A guarded counter', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `Build a \`Counter\` that starts at 0:

- \`increment()\` adds 1.
- \`decrement()\` subtracts 1 but **never goes below 0**.
- \`getCount()\` returns the current value.
- \`reset()\` sets it back to 0.`,
      starter: `class Counter {
    void increment() { }

    void decrement() { }

    int getCount() { return 0; }

    void reset() { }
}
`,
      solution: `class Counter {
    private int count = 0;

    void increment() { count++; }

    void decrement() { if (count > 0) count--; }

    int getCount() { return count; }

    void reset() { count = 0; }
}`,
      hints: ['You need one private field.', 'Guard `decrement` with an `if`.'],
      tests: [],
      customHarness: `T.test("starts at zero", 0, () -> new Counter().getCount());
        T.test("increments", 3, () -> { Counter c = new Counter(); c.increment(); c.increment(); c.increment(); return c.getCount(); });
        T.test("never below zero", 0, () -> { Counter c = new Counter(); c.decrement(); c.decrement(); return c.getCount(); });
        T.test("up and down", 1, () -> { Counter c = new Counter(); c.increment(); c.increment(); c.decrement(); return c.getCount(); });
        T.test("reset", 0, () -> { Counter c = new Counter(); c.increment(); c.reset(); return c.getCount(); });`,
    },
    {
      id: 'p0-9-rect', title: 'Immutable rectangle', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `Build an **immutable** \`Rectangle\` (fields \`final\`, no setters):

- \`Rectangle(int width, int height)\`
- \`int area()\`, \`int perimeter()\`, \`boolean isSquare()\`
- \`Rectangle scaled(int k)\` returns a **new** rectangle k times wider and taller. The original must not change.`,
      starter: `class Rectangle {
    Rectangle(int width, int height) { }

    int area() { return 0; }

    int perimeter() { return 0; }

    boolean isSquare() { return false; }

    Rectangle scaled(int k) { return this; }
}
`,
      solution: `class Rectangle {
    private final int width;
    private final int height;

    Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    int area() { return width * height; }

    int perimeter() { return 2 * (width + height); }

    boolean isSquare() { return width == height; }

    Rectangle scaled(int k) { return new Rectangle(width * k, height * k); }
}`,
      hints: ['`scaled` must use `new Rectangle(...)`.', 'Mark fields `final` so the compiler stops you from changing them.'],
      tests: [],
      customHarness: `T.test("area", 12, () -> new Rectangle(3, 4).area());
        T.test("perimeter", 14, () -> new Rectangle(3, 4).perimeter());
        T.test("not a square", false, () -> new Rectangle(3, 4).isSquare());
        T.test("square", true, () -> new Rectangle(5, 5).isSquare());
        T.test("scaled area", 48, () -> new Rectangle(3, 4).scaled(2).area());
        T.test("original unchanged after scaling", 12, () -> { Rectangle r = new Rectangle(3, 4); r.scaled(10); return r.area(); });`,
    },
    {
      id: 'p0-9-ticket', title: 'Numbered tickets (static)', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `Every \`Ticket\` gets the next number in sequence.

- \`Ticket(String holder)\`
- \`getHolder()\` returns the name.
- \`getNumber()\` returns this ticket's number: the first ticket ever created is 1, the next is 2, and so on.
- \`static int issued()\` returns how many tickets have been created so far.

Hint: one counter must be **shared** by all tickets.`,
      starter: `class Ticket {
    Ticket(String holder) { }

    String getHolder() { return null; }

    int getNumber() { return 0; }

    static int issued() { return 0; }
}
`,
      solution: `class Ticket {
    private static int count = 0;
    private final String holder;
    private final int number;

    Ticket(String holder) {
        this.holder = holder;
        count++;
        this.number = count;
    }

    String getHolder() { return holder; }

    int getNumber() { return number; }

    static int issued() { return count; }
}`,
      hints: ['`private static int count` is shared; `private final int number` belongs to each ticket.', 'In the constructor: increment the shared count, then copy it into `number`.'],
      tests: [],
      customHarness: `T.test("holder", "Ada", () -> new Ticket("Ada").getHolder());
        T.test("issued goes up by one per ticket", 2, () -> { int before = Ticket.issued(); new Ticket("A"); new Ticket("B"); return Ticket.issued() - before; });
        T.test("consecutive numbers", 1, () -> { Ticket a = new Ticket("A"); Ticket b = new Ticket("B"); return b.getNumber() - a.getNumber(); });
        T.test("number matches issued count", true, () -> { Ticket t = new Ticket("C"); return t.getNumber() == Ticket.issued(); });`,
    },
    {
      id: 'p0-9-bank', title: 'Boss: The Codeville bank account', role: 'boss', difficulty: 'Medium', kind: 'custom',
      statement: `Build a \`BankAccount\` that can never be put into a bad state. Money is stored in **cents** as a \`long\` (never use \`double\` for money).

- \`BankAccount(String owner, long initialCents)\` — \`initialCents\` is ≥ 0.
- \`getOwner()\`, \`getBalance()\`
- \`boolean deposit(long amount)\` — rejects amounts ≤ 0 (returns \`false\`, nothing changes).
- \`boolean withdraw(long amount)\` — rejects amounts ≤ 0 or more than the balance.
- \`boolean transferTo(BankAccount other, long amount)\` — moves money only if the withdrawal is allowed.
- \`int getTransactionCount()\` — counts **successful** deposits, withdrawals and transfers out (a transfer counts once on each account).`,
      starter: `class BankAccount {
    BankAccount(String owner, long initialCents) { }

    String getOwner() { return null; }

    long getBalance() { return 0; }

    boolean deposit(long amount) { return false; }

    boolean withdraw(long amount) { return false; }

    boolean transferTo(BankAccount other, long amount) { return false; }

    int getTransactionCount() { return 0; }
}
`,
      solution: `class BankAccount {
    private final String owner;
    private long balance;
    private int transactions;

    BankAccount(String owner, long initialCents) {
        this.owner = owner;
        this.balance = initialCents;
    }

    String getOwner() { return owner; }

    long getBalance() { return balance; }

    boolean deposit(long amount) {
        if (amount <= 0) return false;
        balance += amount;
        transactions++;
        return true;
    }

    boolean withdraw(long amount) {
        if (amount <= 0 || amount > balance) return false;
        balance -= amount;
        transactions++;
        return true;
    }

    boolean transferTo(BankAccount other, long amount) {
        if (other == null || other == this) return false;
        if (!withdraw(amount)) return false;
        other.deposit(amount);
        return true;
    }

    int getTransactionCount() { return transactions; }
}`,
      walkthrough: 'All rules live inside the class, so no outside code can create a negative balance. `transferTo` reuses `withdraw` and `deposit`, which keeps the rules in one place and makes the transaction counts correct for free.',
      hints: ['Three private fields: owner, balance, transaction count.', 'Validate first, then change state, then count the transaction.', '`transferTo` can call `withdraw(amount)` and, if it succeeds, `other.deposit(amount)`.'],
      tests: [],
      customHarness: `T.test("initial state", "Ada:5000", () -> { BankAccount a = new BankAccount("Ada", 5000); return a.getOwner() + ":" + a.getBalance(); });
        T.test("deposit", 5250L, () -> { BankAccount a = new BankAccount("Ada", 5000); a.deposit(250); return a.getBalance(); });
        T.test("reject non-positive deposit", "false false 100", () -> { BankAccount a = new BankAccount("A", 100); return a.deposit(0) + " " + a.deposit(-5) + " " + a.getBalance(); });
        T.test("withdraw", "true 40", () -> { BankAccount a = new BankAccount("A", 100); return a.withdraw(60) + " " + a.getBalance(); });
        T.test("cannot overdraw", "false 100", () -> { BankAccount a = new BankAccount("A", 100); return a.withdraw(101) + " " + a.getBalance(); });
        T.test("transfer", "true 70 30", () -> { BankAccount a = new BankAccount("A", 100), b = new BankAccount("B", 0); return a.transferTo(b, 30) + " " + a.getBalance() + " " + b.getBalance(); });
        T.test("failed transfer changes nothing", "false 100 0", () -> { BankAccount a = new BankAccount("A", 100), b = new BankAccount("B", 0); return a.transferTo(b, 500) + " " + a.getBalance() + " " + b.getBalance(); });
        T.test("counts only successful transactions", "3 1", () -> { BankAccount a = new BankAccount("A", 100), b = new BankAccount("B", 0); a.deposit(10); a.withdraw(1000); a.withdraw(5); a.transferTo(b, 20); a.deposit(-1); return a.getTransactionCount() + " " + b.getTransactionCount(); });`,
    },
  ],
  gateQuestion: {
    prompt: 'Inside a constructor `Counter(int count) { this.count = count; }`, what does `this.count` refer to?',
    options: ['The parameter `count`', 'The field `count` of the object being created', 'A static variable', 'Nothing — it is a syntax error'],
    answer: 1,
    why: '`this` is the object under construction, so `this.count` is its field; plain `count` is the parameter that shadows it.',
  },
  explainBack: {
    prompt: 'What is encapsulation, and how does it protect the BankAccount balance?',
    keyIdeas: [
      { idea: 'fields are private / hidden', words: ['private', 'hidden', 'hide', 'not accessible', 'cannot access'] },
      { idea: 'changes only go through methods', words: ['method', 'methods', 'through', 'only way', 'deposit', 'withdraw'] },
      { idea: 'the class enforces rules / validation', words: ['rule', 'rules', 'check', 'validate', 'invalid', 'negative', 'protect'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-9-a', front: 'What is the difference between a class and an object?', back: 'A class is a blueprint; an object is an instance created from it with `new`.' },
    { id: 'r0-9-b', front: 'What does `static` mean on a field?', back: 'One copy shared by the whole class, not one per object.' },
    { id: 'r0-9-c', front: 'Why store money as `long` cents instead of `double`?', back: 'Doubles have rounding errors (0.1 + 0.2 ≠ 0.3); whole cents are exact.' },
  ],
};

export const m0_10: Module = {
  id: '0.10',
  phase: 0,
  title: 'Interfaces, inheritance and exceptions',
  tagline: 'Contracts, families of classes, generics and handling failure.',
  hook: `Codeville's architects want one blueprint system for every building shape, a zoo where every animal can "speak", and forms that reject nonsense input politely instead of crashing. This is how large Java systems stay organised.`,
  concept: `### Interfaces: a contract

An interface lists methods a class **promises** to provide:

~~~java
interface Shape {
    double area();
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
}
~~~

Code can work with **any** \`Shape\` without knowing which kind it is — this is **polymorphism**. Interface methods are public, so implementations must be declared \`public\`.

### Inheritance: extends

~~~java
abstract class Animal {
    protected final String name;
    Animal(String name) { this.name = name; }
    abstract String sound();                     // subclasses must provide it
    String speak() { return name + " says " + sound(); }
}

class Dog extends Animal {
    Dog(String name) { super(name); }            // call the parent constructor
    @Override String sound() { return "Woof"; }
}
~~~

\`@Override\` asks the compiler to check you really are overriding a parent method.

### Generics: one class, any type

~~~java
class Box<T> {
    private T value;
    void set(T v) { value = v; }
    T get() { return value; }
}
Box<String> b = new Box<>();
~~~

The \`<T>\` is a type parameter. \`ArrayList<Integer>\` and \`HashMap<String, Integer>\` work exactly this way.

### Exceptions: handling failure

~~~java
try {
    int n = Integer.parseInt(text);
} catch (NumberFormatException e) {
    System.out.println("Not a number: " + text);
}
~~~

Throw your own when inputs break the rules:

~~~java
if (age < 0) throw new IllegalArgumentException("Invalid age: " + age);
~~~

**Checked** exceptions (like \`IOException\`) must be declared or caught; **unchecked** ones (\`RuntimeException\` and its subclasses) need not be.`,
  visual: {
    kind: 'vars',
    title: 'One interface, many shapes',
    frames: [
      { caption: 'A list typed as Shape can hold any Shape.', code: 'List<Shape> shapes = List.of(new Circle(1), new Square(2));', vars: { 'shapes.size()': 2 } },
      { caption: 'Calling area() runs Circle\'s version for the circle…', code: 'shapes.get(0).area()', vars: { 'Circle.area()': 3.14159 } },
      { caption: "…and Square's version for the square. Same call, different behaviour.", code: 'shapes.get(1).area()', vars: { 'Circle.area()': 3.14159, 'Square.area()': 4.0 } },
    ],
  },
  javaSpotlight: {
    title: 'Interface vs abstract class',
    body: 'Use an **interface** for a capability many unrelated classes can have (a class can implement many). Use an **abstract class** to share code and fields among closely related classes (a class can extend only one).',
    code: `interface Speaker { String speak(); }
interface Mover { int speed(); }

class Robot implements Speaker, Mover {   // many interfaces: fine
    public String speak() { return "Beep"; }
    public int speed() { return 5; }
}`,
  },
  problems: [
    {
      id: 'p0-10-shapes', title: 'Implement the Shape contract', role: 'guided', difficulty: 'Easy', kind: 'custom',
      statement: `The \`Shape\` interface is given. Write two classes that implement it:

- \`Circle(double radius)\` — area = π r²
- \`Square(double side)\` — area = side²`,
      starter: `interface Shape {
    double area();
}

class Circle implements Shape {
    // TODO: store the radius

    Circle(double radius) { }

    public double area() { return 0; }
}

class Square implements Shape {
    // TODO: store the side

    Square(double side) { }

    public double area() { return 0; }
}
`,
      solution: `interface Shape {
    double area();
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
}

class Square implements Shape {
    private final double side;
    Square(double side) { this.side = side; }
    public double area() { return side * side; }
}`,
      hints: ['`class Circle implements Shape { ... }`', 'Interface methods are public: write `public double area()`.', 'Use `Math.PI`.'],
      tests: [],
      customHarness: `T.test("circle r=1", Math.PI, () -> new Circle(1).area());
        T.test("circle r=2.5", 19.634954084936208, () -> new Circle(2.5).area());
        T.test("square side=3", 9.0, () -> new Square(3).area());
        T.test("polymorphism: total area", 4 + Math.PI, () -> { Shape[] s = { new Circle(1), new Square(2) }; double t = 0; for (Shape x : s) t += x.area(); return t; });`,
    },
    {
      id: 'p0-10-zoo', title: 'The Codeville zoo', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `\`Animal\` is given. Create \`Dog\` ("Woof"), \`Cat\` ("Meow") and \`Cow\` ("Moo"), each with a constructor that takes the name.

\`new Dog("Rex").speak()\` must return \`"Rex says Woof"\`.`,
      starter: `abstract class Animal {
    protected final String name;

    Animal(String name) { this.name = name; }

    abstract String sound();

    String speak() { return name + " says " + sound(); }
}

class Dog extends Animal {
    Dog(String name) { super(name); }

    @Override String sound() { return "TODO"; }
}

// TODO: write Cat ("Meow") and Cow ("Moo") the same way
class Cat extends Animal {
    Cat(String name) { super(name); }

    @Override String sound() { return "TODO"; }
}

class Cow extends Animal {
    Cow(String name) { super(name); }

    @Override String sound() { return "TODO"; }
}
`,
      solution: `abstract class Animal {
    protected final String name;

    Animal(String name) { this.name = name; }

    abstract String sound();

    String speak() { return name + " says " + sound(); }
}

class Dog extends Animal {
    Dog(String name) { super(name); }
    @Override String sound() { return "Woof"; }
}

class Cat extends Animal {
    Cat(String name) { super(name); }
    @Override String sound() { return "Meow"; }
}

class Cow extends Animal {
    Cow(String name) { super(name); }
    @Override String sound() { return "Moo"; }
}`,
      hints: ['`class Dog extends Animal`', 'The constructor must call `super(name);`.', 'Override `sound()` only — `speak()` is inherited.'],
      tests: [],
      customHarness: `T.test("dog", "Rex says Woof", () -> new Dog("Rex").speak());
        T.test("cat", "Tom says Meow", () -> new Cat("Tom").speak());
        T.test("cow", "Daisy says Moo", () -> new Cow("Daisy").speak());
        T.test("polymorphic list", "Woof Meow Moo", () -> { List<Animal> zoo = List.of(new Dog("a"), new Cat("b"), new Cow("c")); StringBuilder sb = new StringBuilder(); for (Animal x : zoo) { if (sb.length() > 0) sb.append(' '); sb.append(x.sound()); } return sb.toString(); });`,
    },
    {
      id: 'p0-10-age', title: 'Polite input validation', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `Write \`AgeParser.parseAge(String text)\`:

- Returns the age as an \`int\` when \`text\` is a whole number from 0 to 150.
- Otherwise throws \`IllegalArgumentException\` with the message \`"Invalid age: " + text\`.

Careful: \`Integer.parseInt\` throws its *own* exception with a different message.`,
      starter: `class AgeParser {
    static int parseAge(String text) {
        return 0;
    }
}
`,
      solution: `class AgeParser {
    static int parseAge(String text) {
        int age;
        try {
            age = Integer.parseInt(text.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid age: " + text);
        }
        if (age < 0 || age > 150) throw new IllegalArgumentException("Invalid age: " + text);
        return age;
    }
}`,
      hints: ['Wrap `Integer.parseInt` in `try` / `catch (NumberFormatException e)`.', 'In the catch block, throw your own `IllegalArgumentException` with the required message.', 'Then check the range.'],
      tests: [],
      customHarness: `T.test("valid", 42, () -> AgeParser.parseAge("42"));
        T.test("zero", 0, () -> AgeParser.parseAge("0"));
        T.test("not a number", "Invalid age: abc", () -> { try { AgeParser.parseAge("abc"); return "no exception"; } catch (IllegalArgumentException e) { return e.getMessage(); } });
        T.test("negative", "Invalid age: -1", () -> { try { AgeParser.parseAge("-1"); return "no exception"; } catch (IllegalArgumentException e) { return e.getMessage(); } });
        T.test("too old", "Invalid age: 151", () -> { try { AgeParser.parseAge("151"); return "no exception"; } catch (IllegalArgumentException e) { return e.getMessage(); } });
        T.test("decimal", "Invalid age: 4.5", () -> { try { AgeParser.parseAge("4.5"); return "no exception"; } catch (IllegalArgumentException e) { return e.getMessage(); } });`,
    },
    {
      id: 'p0-10-box', title: 'A generic Box<T>', role: 'mastery', difficulty: 'Easy', kind: 'custom',
      statement: `Write a generic \`Box<T>\` that may hold one value:

- \`Box()\` creates an empty box; \`Box(T value)\` a full one.
- \`T get()\`, \`void set(T value)\`, \`boolean isEmpty()\` (true when the value is \`null\`)
- \`T getOrDefault(T fallback)\` returns the value, or \`fallback\` if empty.`,
      starter: `class Box<T> {
    Box() { }

    Box(T value) { }

    T get() { return null; }

    void set(T value) { }

    boolean isEmpty() { return true; }

    T getOrDefault(T fallback) { return null; }
}
`,
      solution: `class Box<T> {
    private T value;

    Box() { }

    Box(T value) { this.value = value; }

    T get() { return value; }

    void set(T value) { this.value = value; }

    boolean isEmpty() { return value == null; }

    T getOrDefault(T fallback) { return value == null ? fallback : value; }
}`,
      hints: ['One field: `private T value;`', 'Use `value == null` to test emptiness.'],
      tests: [],
      customHarness: `T.test("empty box", true, () -> new Box<String>().isEmpty());
        T.test("full box", "gold", () -> new Box<>("gold").get());
        T.test("set then get", 7, () -> { Box<Integer> b = new Box<>(); b.set(7); return b.get(); });
        T.test("default when empty", "none", () -> new Box<String>().getOrDefault("none"));
        T.test("value when full", "gem", () -> new Box<>("gem").getOrDefault("none"));`,
    },
    {
      id: 'p0-10-shapelib', title: 'Boss: The architect\'s shape library', role: 'boss', difficulty: 'Medium', kind: 'custom',
      statement: `Design a small shape library.

\`\`\`
interface Shape {
    double area();
    double perimeter();
    String name();
}
\`\`\`

- \`Circle(double r)\`, \`Rectangle(double w, double h)\`, \`Triangle(double a, double b, double c)\`. \`name()\` returns \`"Circle"\`, \`"Rectangle"\` or \`"Triangle"\`.
- Every constructor throws \`IllegalArgumentException\` if any length is ≤ 0. \`Triangle\` also throws if the sides break the triangle inequality (each side must be **strictly** less than the sum of the other two).
- Triangle area uses **Heron's formula**: with \`s = (a + b + c) / 2\`, area = √(s(s−a)(s−b)(s−c)).
- \`Shapes.largest(List<Shape> shapes)\` returns the shape with the largest area, or \`null\` for an empty list.`,
      starter: `import java.util.List;

interface Shape {
    double area();
    double perimeter();
    String name();
}

class Circle implements Shape {
    Circle(double r) { }
    public double area() { return 0; }
    public double perimeter() { return 0; }
    public String name() { return "Circle"; }
}

class Rectangle implements Shape {
    Rectangle(double w, double h) { }
    public double area() { return 0; }
    public double perimeter() { return 0; }
    public String name() { return "Rectangle"; }
}

class Triangle implements Shape {
    Triangle(double a, double b, double c) { }
    public double area() { return 0; }
    public double perimeter() { return 0; }
    public String name() { return "Triangle"; }
}

class Shapes {
    static Shape largest(List<Shape> shapes) {
        return null;
    }
}
`,
      solution: `import java.util.List;

interface Shape {
    double area();
    double perimeter();
    String name();
}

class Circle implements Shape {
    private final double r;
    Circle(double r) {
        if (r <= 0) throw new IllegalArgumentException("radius must be positive");
        this.r = r;
    }
    public double area() { return Math.PI * r * r; }
    public double perimeter() { return 2 * Math.PI * r; }
    public String name() { return "Circle"; }
}

class Rectangle implements Shape {
    private final double w, h;
    Rectangle(double w, double h) {
        if (w <= 0 || h <= 0) throw new IllegalArgumentException("sides must be positive");
        this.w = w;
        this.h = h;
    }
    public double area() { return w * h; }
    public double perimeter() { return 2 * (w + h); }
    public String name() { return "Rectangle"; }
}

class Triangle implements Shape {
    private final double a, b, c;
    Triangle(double a, double b, double c) {
        if (a <= 0 || b <= 0 || c <= 0) throw new IllegalArgumentException("sides must be positive");
        if (a >= b + c || b >= a + c || c >= a + b) throw new IllegalArgumentException("not a triangle");
        this.a = a;
        this.b = b;
        this.c = c;
    }
    public double area() {
        double s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }
    public double perimeter() { return a + b + c; }
    public String name() { return "Triangle"; }
}

class Shapes {
    static Shape largest(List<Shape> shapes) {
        Shape best = null;
        for (Shape s : shapes) {
            if (best == null || s.area() > best.area()) best = s;
        }
        return best;
    }
}`,
      walkthrough: 'Each class validates in its constructor, so an invalid shape can never exist. `Shapes.largest` only talks to the `Shape` interface — it would keep working if someone added a `Hexagon` tomorrow.',
      hints: ['Write each class with `implements Shape` and three `public` methods.', 'Validate at the top of each constructor and `throw new IllegalArgumentException(...)`.', 'For `largest`, keep the best shape seen so far, starting from `null`.'],
      tests: [],
      customHarness: `T.test("circle area", Math.PI * 4, () -> new Circle(2).area());
        T.test("circle perimeter", 4 * Math.PI, () -> new Circle(2).perimeter());
        T.test("rectangle", "12.0 14.0 Rectangle", () -> { Shape r = new Rectangle(3, 4); return r.area() + " " + r.perimeter() + " " + r.name(); });
        T.test("triangle 3-4-5 area", 6.0, () -> new Triangle(3, 4, 5).area());
        T.test("triangle perimeter", 12.0, () -> new Triangle(3, 4, 5).perimeter());
        T.test("rejects degenerate triangle", "rejected", () -> { try { new Triangle(1, 2, 3); return "accepted"; } catch (IllegalArgumentException e) { return "rejected"; } });
        T.test("rejects zero radius", "rejected", () -> { try { new Circle(0); return "accepted"; } catch (IllegalArgumentException e) { return "rejected"; } });
        T.test("rejects negative side", "rejected", () -> { try { new Rectangle(2, -1); return "accepted"; } catch (IllegalArgumentException e) { return "rejected"; } });
        T.test("largest", "Circle", () -> Shapes.largest(List.of(new Rectangle(1, 1), new Circle(3), new Triangle(3, 4, 5))).name());
        T.test("largest of empty", true, () -> Shapes.largest(new ArrayList<>()) == null);`,
    },
  ],
  gateQuestion: {
    prompt: 'Which statement is true in Java?',
    options: ['A class can extend several classes', 'A class can implement several interfaces', 'An abstract class cannot have fields', 'Interfaces can be instantiated with `new`'],
    answer: 1,
    why: 'Java allows single inheritance of classes but any number of interfaces. Abstract classes can have fields; interfaces cannot be instantiated directly.',
  },
  explainBack: {
    prompt: 'What is polymorphism? Explain it using the Shape interface.',
    keyIdeas: [
      { idea: 'code works with the interface / parent type', words: ['interface', 'parent', 'supertype', 'shape type', 'any shape', 'general'] },
      { idea: 'the actual object decides which method runs', words: ['actual', 'its own', 'different behaviour', 'different behavior', 'runtime', 'override', 'overridden', 'each class'] },
    ],
    minGroups: 2,
  },
  review: [
    { id: 'r0-10-a', front: 'What keyword calls the parent constructor?', back: '`super(...)` — it must be the first line of the constructor.' },
    { id: 'r0-10-b', front: 'Checked vs unchecked exceptions?', back: 'Checked must be declared or caught (IOException); unchecked extend RuntimeException.' },
    { id: 'r0-10-c', front: 'What does `<T>` in `Box<T>` mean?', back: 'A type parameter: the box works with any type chosen when it is used.' },
  ],
};
