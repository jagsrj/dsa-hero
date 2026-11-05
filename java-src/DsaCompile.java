import java.io.*;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;

/**
 * Runs inside CheerpJ. Copies the learner's source from /str into a fresh
 * work directory under /files, compiles it with the JDK's javac and writes
 * "EXIT <code>" plus all diagnostics to <workDir>/compile.txt.
 * Any internal failure is written to compile.txt as "EXIT 99" with the stack trace,
 * so the page can always show what went wrong.
 *
 * args: <sourceIn> <fileName> <workDir>
 */
public class DsaCompile {
    public static void main(String[] args) {
        File work = new File(args[2]);
        StringWriter diag = new StringWriter();
        PrintWriter pw = new PrintWriter(diag);
        int rc;
        try {
            cleanOldRuns(work.getParentFile(), work.getName());
            File src = new File(work, "src");
            File classes = new File(work, "classes");
            src.mkdirs();
            classes.mkdirs();
            File file = new File(src, args[1]);
            copy(new File(args[0]), file);
            String[] javacArgs = { "-nowarn", "-encoding", "UTF-8", "-g", "-d", classes.getPath(), file.getPath() };
            rc = compile(javacArgs, pw);
        } catch (Throwable t) {
            rc = 99;
            pw.println("DSA Hero internal error while compiling:");
            t.printStackTrace(pw);
        }
        pw.flush();
        try {
            work.mkdirs();
            try (Writer w = new OutputStreamWriter(new FileOutputStream(new File(work, "compile.txt")), StandardCharsets.UTF_8)) {
                w.write("EXIT " + rc + "\n" + diag);
            }
        } catch (Throwable t) {
            System.out.println("@@DSA_COMPILE@@EXIT " + rc);
            System.out.println(diag);
            t.printStackTrace();
        }
    }

    private static int compile(String[] javacArgs, PrintWriter pw) throws Exception {
        Throwable first = null;
        try {
            javax.tools.JavaCompiler jc = javax.tools.ToolProvider.getSystemJavaCompiler();
            if (jc != null) {
                ByteArrayOutputStream err = new ByteArrayOutputStream();
                int rc = jc.run(null, err, err, javacArgs);
                pw.print(new String(err.toByteArray(), StandardCharsets.UTF_8));
                return rc;
            }
        } catch (Throwable t) {
            first = t;
        }
        try {
            Class<?> main = Class.forName("com.sun.tools.javac.Main");
            Method m = main.getMethod("compile", String[].class, PrintWriter.class);
            return (Integer) m.invoke(null, javacArgs, pw);
        } catch (Throwable t) {
            if (first != null) t.addSuppressed(first);
            throw new RuntimeException("javac is not available in this Java runtime", t);
        }
    }

    private static void copy(File from, File to) throws IOException {
        try (InputStream in = new FileInputStream(from); OutputStream out = new FileOutputStream(to)) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        }
    }

    private static void cleanOldRuns(File root, String keep) {
        if (root == null) return;
        File[] kids = root.listFiles();
        if (kids == null) return;
        for (File k : kids) if (!k.getName().equals(keep)) deleteTree(k);
    }

    private static void deleteTree(File f) {
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        f.delete();
    }
}
