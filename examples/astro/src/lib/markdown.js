// A small, safe Markdown → HTML converter for post sections.
// Covers what the editor writes: headings, paragraphs, lists, quotes, code,
// links and images. Everything is escaped first, so a post can never inject markup.

export function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function slugify(text) {
  return String(text).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
}

function safeUrl(url) {
  const value = String(url).trim();
  return /^(https?:\/\/|\/|#|mailto:)/i.test(value) ? value : '#';
}

function inline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" decoding="async">`);
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${safeUrl(url)}">${label}</a>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return html;
}

/** Returns `{ html, headings }`, where headings are `{ level, text, id }` for a table of contents. */
export function renderMarkdown(source) {
  const lines = String(source ?? '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  const used = new Set();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++;
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      // A post's own title is the page's only h1, so section headings start at h2.
      const level = Math.max(2, heading[1].length);
      const text = heading[2].trim();
      let id = slugify(text);
      for (let n = 2; used.has(id); n++) id = `${slugify(text)}-${n}`;
      used.add(id);
      headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { out.push('<hr>'); i++; continue; }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    const list = /^(\s*)([-*]|\d+\.)\s+/.exec(line);
    if (list) {
      const ordered = /\d/.test(list[2]);
      const items = [];
      while (i < lines.length && /^(\s*)([-*]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^(\s*)([-*]|\d+\.)\s+/, ''));
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>\s?|(\s*)([-*]|\d+\.)\s+)/.test(lines[i])) paragraph.push(lines[i++]);
    const text = paragraph.join(' ');
    // A picture on its own line is a figure, with its description as the caption.
    const figure = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(text.trim());
    out.push(figure
      ? `<figure><img src="${safeUrl(figure[2])}" alt="${escapeHtml(figure[1])}" loading="lazy" decoding="async">${figure[1] ? `<figcaption>${escapeHtml(figure[1])}</figcaption>` : ''}</figure>`
      : `<p>${inline(text)}</p>`);
  }
  return { html: out.join('\n'), headings };
}
