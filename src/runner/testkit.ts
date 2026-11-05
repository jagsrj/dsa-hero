// Java support code appended to every compilation unit.
// Kept in a TS string so both the browser runner and the verification script share it.

export const LISTNODE_JAVA = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    static ListNode of(int[] values) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : values) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }
    /** builds a list whose tail links back to index pos (pos = -1: no cycle) */
    static ListNode ofCycle(int[] values, int pos) {
        ListNode head = of(values);
        if (pos < 0 || head == null) return head;
        ListNode tail = head, target = null; int i = 0;
        for (ListNode c = head; c != null; c = c.next, i++) { if (i == pos) target = c; tail = c; }
        tail.next = target;
        return head;
    }
    /** index of node within the list starting at head, -1 if null or not found */
    static int indexOf(ListNode head, ListNode node) {
        if (node == null) return -1;
        int i = 0;
        for (ListNode c = head; c != null && i < 100000; c = c.next, i++) if (c == node) return i;
        return -1;
    }
}
`;

export const TESTKIT_JAVA = `
interface DsaThunk { Object get() throws Throwable; }

final class T {
    static final PrintStream REAL_OUT = System.out;
    static final InputStream REAL_IN = System.in;
    static final StringBuilder json = new StringBuilder();
    static String resultFile = null;
    static boolean includeHidden = true;
    static int count = 0, passed = 0;
    static String curName, curInput; static boolean curHidden; static long t0;
    static ByteArrayOutputStream buf;

    static void begin(String[] args, boolean hidden) {
        if (args.length > 0) resultFile = args[0];
        includeHidden = hidden;
        json.append("{\\"results\\":[");
    }

    static boolean start(String name, String input, boolean hidden) {
        if (hidden && !includeHidden) return false;
        curName = name; curInput = input; curHidden = hidden;
        buf = new ByteArrayOutputStream();
        System.setOut(new PrintStream(buf, true));
        t0 = System.nanoTime();
        return true;
    }

    static void stdin(String s) {
        System.setIn(new ByteArrayInputStream(s.getBytes()));
    }

    static void restore() { System.setOut(REAL_OUT); System.setIn(REAL_IN); }

    static void finish(Object expected, Object actual, double tol, boolean unordered) {
        restore();
        boolean ok = eq(norm(expected), norm(actual), tol, unordered);
        record(ok ? "pass" : "fail", fmt(expected), fmt(actual), null);
    }

    static void finishOut(String expectedOut) {
        restore();
        String actual = buf.toString();
        boolean ok = cleanOut(actual).equals(cleanOut(expectedOut));
        record(ok ? "pass" : "fail", expectedOut, actual, null);
    }

    static void finishFree() {
        restore();
        record("ran", null, null, null);
    }

    static void error(Throwable e) {
        restore();
        String msg = e.toString();
        StackTraceElement[] st = e.getStackTrace();
        for (StackTraceElement s : st) {
            String c = s.getClassName();
            if (!c.equals("T") && !c.equals("DsaHarness") && !c.startsWith("java.") && !c.startsWith("jdk.") && !c.startsWith("sun.")) {
                msg += "\\n    at " + s.getClassName() + "." + s.getMethodName() + "(line " + s.getLineNumber() + ")";
                break;
            }
        }
        if (e instanceof StackOverflowError) msg = "StackOverflowError: recursion went too deep (missing base case?)";
        record("error", null, null, msg);
    }

    /** custom harness test */
    static void test(String name, Object expected, DsaThunk body) { test(name, expected, body, false); }
    static void hiddenTest(String name, Object expected, DsaThunk body) { test(name, expected, body, true); }
    static void test(String name, Object expected, DsaThunk body, boolean hidden) {
        if (!start(name, "", hidden)) return;
        try { Object a = body.get(); finish(expected, a, 1e-6, false); }
        catch (Throwable e) { error(e); }
    }

    static void record(String status, String expected, String actual, String err) {
        long ms = (System.nanoTime() - t0) / 1_000_000;
        if (count > 0) json.append(',');
        count++;
        if (status.equals("pass")) passed++;
        String out = buf == null ? "" : buf.toString();
        if (out.length() > 4000) out = out.substring(0, 4000) + "\\n...(output truncated)";
        json.append("{\\"name\\":").append(js(curName))
            .append(",\\"input\\":").append(js(curInput))
            .append(",\\"hidden\\":").append(curHidden)
            .append(",\\"status\\":").append(js(status))
            .append(",\\"expected\\":").append(js(expected))
            .append(",\\"actual\\":").append(js(actual))
            .append(",\\"stdout\\":").append(js(out))
            .append(",\\"error\\":").append(js(err))
            .append(",\\"ms\\":").append(ms).append('}');
    }

    static void end() throws IOException {
        json.append("],\\"passed\\":").append(passed).append(",\\"total\\":").append(count).append('}');
        String s = json.toString();
        if (resultFile != null) {
            File f = new File(resultFile);
            if (f.getParentFile() != null) f.getParentFile().mkdirs();
            try (Writer w = new OutputStreamWriter(new FileOutputStream(f), "UTF-8")) { w.write(s); }
        }
        REAL_OUT.println("@@DSA_RESULT@@" + s);
        REAL_OUT.flush();
    }

    // ---------- formatting & equality ----------
    static Object norm(Object o) {
        if (o == null) return null;
        if (o instanceof int[]) { List<Object> l = new ArrayList<>(); for (int v : (int[]) o) l.add((long) v); return l; }
        if (o instanceof long[]) { List<Object> l = new ArrayList<>(); for (long v : (long[]) o) l.add(v); return l; }
        if (o instanceof double[]) { List<Object> l = new ArrayList<>(); for (double v : (double[]) o) l.add(v); return l; }
        if (o instanceof char[]) { List<Object> l = new ArrayList<>(); for (char v : (char[]) o) l.add(v); return l; }
        if (o instanceof boolean[]) { List<Object> l = new ArrayList<>(); for (boolean v : (boolean[]) o) l.add(v); return l; }
        if (o instanceof Object[]) { List<Object> l = new ArrayList<>(); for (Object v : (Object[]) o) l.add(norm(v)); return l; }
        if (o instanceof Collection) { List<Object> l = new ArrayList<>(); for (Object v : (Collection<?>) o) l.add(norm(v)); return l; }
        if (o instanceof Integer || o instanceof Short || o instanceof Byte) return ((Number) o).longValue();
        if (o instanceof Float) return ((Float) o).doubleValue();
        String cn = o.getClass().getName();
        if (cn.equals("ListNode")) return listNodeToList(o);
        return o;
    }

    static Object listNodeToList(Object node) {
        List<Object> l = new ArrayList<>();
        l.add("__list__");
        try {
            java.lang.reflect.Field fv = node.getClass().getDeclaredField("val");
            java.lang.reflect.Field fn = node.getClass().getDeclaredField("next");
            fv.setAccessible(true); fn.setAccessible(true);
            Object cur = node; int guard = 0;
            while (cur != null && guard++ < 10000) { l.add(((Number) fv.get(cur)).longValue()); cur = fn.get(cur); }
            if (cur != null) l.add("...cycle?");
        } catch (Exception e) { l.add("?"); }
        return l;
    }

    static boolean eq(Object e, Object a, double tol, boolean unordered) {
        if (e == null || a == null) return e == a;
        if (e instanceof List && a instanceof List) {
            List<?> le = (List<?>) e, la = (List<?>) a;
            if (le.size() != la.size()) return false;
            if (unordered) {
                List<String> se = new ArrayList<>(), sa = new ArrayList<>();
                for (Object x : le) se.add(fmtN(x)); for (Object x : la) sa.add(fmtN(x));
                Collections.sort(se); Collections.sort(sa);
                return se.equals(sa);
            }
            for (int i = 0; i < le.size(); i++) if (!eq(le.get(i), la.get(i), tol, false)) return false;
            return true;
        }
        if (e instanceof Number && a instanceof Number) {
            if (e instanceof Double || a instanceof Double) {
                double x = ((Number) e).doubleValue(), y = ((Number) a).doubleValue();
                return Math.abs(x - y) <= Math.max(tol, 1e-9);
            }
            return ((Number) e).longValue() == ((Number) a).longValue();
        }
        return fmtN(e).equals(fmtN(a));
    }

    static String fmt(Object o) { return fmtN(norm(o)); }

    static String fmtN(Object o) {
        if (o == null) return "null";
        if (o instanceof String) return "\\"" + o + "\\"";
        if (o instanceof Character) return "'" + o + "'";
        if (o instanceof Double) {
            double d = (Double) o;
            if (d == Math.rint(d) && !Double.isInfinite(d) && Math.abs(d) < 1e15) return String.format("%.1f", d);
            String s = String.format("%.5f", d);
            s = s.replaceAll("0+$", "");
            return s;
        }
        if (o instanceof List) {
            List<?> l = (List<?>) o;
            if (!l.isEmpty() && "__list__".equals(l.get(0))) {
                if (l.size() == 1) return "(empty list)";
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i < l.size(); i++) { if (i > 1) sb.append(" -> "); sb.append(l.get(i)); }
                return sb.toString();
            }
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < l.size(); i++) { if (i > 0) sb.append(", "); sb.append(fmtN(l.get(i))); }
            return sb.append(']').toString();
        }
        return String.valueOf(o);
    }

    static String cleanOut(String s) {
        String[] lines = s.replace("\\r\\n", "\\n").split("\\n", -1);
        StringBuilder sb = new StringBuilder();
        for (String line : lines) sb.append(line.replaceAll("\\\\s+$", "")).append('\\n');
        return sb.toString().replaceAll("\\\\n+$", "");
    }

    static String js(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder("\\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\\\\""); break;
                case '\\\\': sb.append("\\\\\\\\"); break;
                case '\\n': sb.append("\\\\n"); break;
                case '\\r': sb.append("\\\\r"); break;
                case '\\t': sb.append("\\\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.append('"').toString();
    }

    // ---------- deterministic generators for large tests ----------
    static int[] genRange(int from, int to) { int[] a = new int[Math.max(0, to - from + 1)]; for (int i = 0; i < a.length; i++) a[i] = from + i; return a; }
    static int[] genRandom(int n, int lo, int hi, long seed) { Random r = new Random(seed); long span = (long) hi - lo + 1; int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = (int) (lo + Math.floorMod(r.nextLong(), span)); return a; }
    static int[] genSorted(int n, int lo, int hi, long seed) { int[] a = genRandom(n, lo, hi, seed); Arrays.sort(a); return a; }
    static int[] genRepeat(int n, int v) { int[] a = new int[n]; Arrays.fill(a, v); return a; }
    static int[] genMissing(int n, int missing, long seed) {
        int[] a = new int[n]; int k = 0; for (int i = 0; i <= n; i++) if (i != missing) a[k++] = i;
        Random r = new Random(seed); for (int i = n - 1; i > 0; i--) { int j = r.nextInt(i + 1); int t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }
    static String genString(int n, String alphabet, long seed) { Random r = new Random(seed); StringBuilder sb = new StringBuilder(n); for (int i = 0; i < n; i++) sb.append(alphabet.charAt(r.nextInt(alphabet.length()))); return sb.toString(); }

    // ---------- literal helpers ----------
    static List<Integer> li(int... xs) { List<Integer> l = new ArrayList<>(); for (int x : xs) l.add(x); return l; }
    static List<String> ls(String... xs) { return new ArrayList<>(Arrays.asList(xs)); }
    @SafeVarargs static List<List<Integer>> lli(List<Integer>... xs) { return new ArrayList<>(Arrays.asList(xs)); }
}
`;
