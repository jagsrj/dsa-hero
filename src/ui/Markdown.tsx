import { Marked } from 'marked';
import { useMemo } from 'react';
import { highlightJava } from './highlight';

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const l = (lang ?? '').trim();
      const body = l === 'java' || l === '' ? highlightJava(text) : text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<pre class="code-block${l ? ' lang-' + l : ''}"><code>${body}</code></pre>`;
    },
    table(token) {
      // wrap tables so they scroll horizontally on small screens
      const header = token.header.map((h) => `<th>${this.parser.parseInline(h.tokens)}</th>`).join('');
      const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
      return `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
  },
});

export function Markdown({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => marked.parse(text) as string, [text]);
  return <div className={`md ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function CodeView({ code }: { code: string }) {
  const html = useMemo(() => highlightJava(code), [code]);
  return <pre className="code-block"><code dangerouslySetInnerHTML={{ __html: html }} /></pre>;
}
