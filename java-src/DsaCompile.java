import java.io.*;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

/**
 * Runs inside CheerpJ. Copies the learner's source from /str into a fresh
 * work directory under /files, compiles it with the JDK's javac and writes
 * "EXIT <code>" plus all diagnostics to <workDir>/compile.txt.
 *
 * args: <sourceIn> <fileName> <workDir>
 */
public class DsaCompile {
    public static void main(String[] args) throws Exception {
        String sourceIn = args[0], fileName = args[1];
        Path work = Paths.get(args[2]);
        cleanOldRuns(work.getParent(), work.getFileName().toString());
        Path src = work.resolve("src");
        Path classes = work.resolve("classes");
        Files.createDirectories(src);
        Files.createDirectories(classes);
        byte[] code = Files.readAllBytes(Paths.get(sourceIn));
        Path file = src.resolve(fileName);
        Files.write(file, code);

        StringWriter diag = new StringWriter();
        PrintWriter pw = new PrintWriter(diag);
        String[] javacArgs = { "-nowarn", "-encoding", "UTF-8", "-g", "-d", classes.toString(), file.toString() };
        int rc;
        JavaCompiler jc = null;
        try { jc = ToolProvider.getSystemJavaCompiler(); } catch (Throwable ignored) {}
        if (jc != null) {
            ByteArrayOutputStream err = new ByteArrayOutputStream();
            rc = jc.run(null, err, err, javacArgs);
            pw.print(new String(err.toByteArray(), StandardCharsets.UTF_8));
        } else {
            Class<?> main = Class.forName("com.sun.tools.javac.Main");
            Method m = main.getMethod("compile", String[].class, PrintWriter.class);
            rc = (Integer) m.invoke(null, javacArgs, pw);
        }
        pw.flush();
        String out = "EXIT " + rc + "\n" + diag;
        Files.write(work.resolve("compile.txt"), out.getBytes(StandardCharsets.UTF_8));
    }

    private static void cleanOldRuns(Path root, String keep) {
        if (root == null || !Files.isDirectory(root)) return;
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(root)) {
            for (Path p : ds) if (!p.getFileName().toString().equals(keep)) deleteTree(p);
        } catch (IOException ignored) {}
    }

    private static void deleteTree(Path p) {
        try {
            if (Files.isDirectory(p)) try (DirectoryStream<Path> ds = Files.newDirectoryStream(p)) { for (Path c : ds) deleteTree(c); }
            Files.deleteIfExists(p);
        } catch (IOException ignored) {}
    }
}
