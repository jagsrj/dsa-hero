import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, indentUnit } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { java } from '@codemirror/lang-java';
import { classHighlighter } from '@lezer/highlight';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  readOnly?: boolean;
  /** changing this key replaces the document (e.g. switching problems / reset) */
  docKey: string;
}

export function CodeEditor({ value, onChange, onRun, onSubmit, readOnly, docKey }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cb = useRef({ onChange, onRun, onSubmit });
  cb.current = { onChange, onRun, onSubmit };

  useEffect(() => {
    if (!host.current) return;
    const runKeys = keymap.of([
      { key: 'Mod-Enter', run: () => { cb.current.onRun?.(); return true; } },
      { key: 'Mod-Shift-Enter', run: () => { cb.current.onSubmit?.(); return true; } },
    ]);
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        indentUnit.of('    '),
        EditorState.tabSize.of(4),
        java(),
        syntaxHighlighting(classHighlighter),
        runKeys,
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.lineWrapping,
        EditorState.readOnly.of(!!readOnly),
        EditorView.updateListener.of((u) => { if (u.docChanged) cb.current.onChange(u.state.doc.toString()); }),
        EditorView.contentAttributes.of({ 'aria-label': 'Java code editor', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' }),
      ],
    });
    view.current = new EditorView({ state, parent: host.current });
    return () => { view.current?.destroy(); view.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKey, readOnly]);

  // external value changes (reset to starter) without remounting
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  return <div className="editor" ref={host} />;
}
