import { parser } from '@lezer/java';
import { classHighlighter, highlightCode } from '@lezer/highlight';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Java source → HTML with `tok-*` classes (styled in CSS). */
export function highlightJava(code: string): string {
  let out = '';
  try {
    const tree = parser.parse(code);
    highlightCode(code, tree, classHighlighter,
      (text, classes) => { out += classes ? `<span class="${classes}">${esc(text)}</span>` : esc(text); },
      () => { out += '\n'; });
    return out;
  } catch {
    return esc(code);
  }
}
