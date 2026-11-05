import type { TestCase } from './types';

/** program test: stdin → expected stdout */
export const io = (stdin: string, stdout: string, hidden = false, name?: string): TestCase => ({ stdin, stdout, hidden, name });

/** function test: args → expected (omit expected to use the oracle) */
export const fx = (args: unknown[], expected?: unknown, hidden = false, name?: string): TestCase => ({ args, expected, hidden, name });

export const programStarter = (todo = '// Write your code here'): string => `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        ${todo}
    }
}
`;

export const programStarterNoInput = (todo = '// Write your code here'): string => `public class Main {
    public static void main(String[] args) {
        ${todo}
    }
}
`;

/** Starter for a method-based problem. `sig` is the full method signature, `ret` a placeholder return statement. */
export const solutionStarter = (sig: string, ret: string, extraImports = ''): string => `${extraImports}class Solution {
    ${sig} {
        // Write your code here
        ${ret}
    }
}
`;
