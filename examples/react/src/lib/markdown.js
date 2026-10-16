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

/**
 * Size and position for a picture or an embed, written the standard Markdown
 * way (an attribute list right after it): `![alt](url){width=600}`,
 * `{width=50% align=center}`, `{height=300}`. Anything else is ignored.
 */
function attributes(list) {
  const found = {};
  for (const [, key, value] of String(list ?? '').matchAll(/(\w+)\s*=\s*([^\s,}]+)/g)) {
    if ((key === 'width' || key === 'height') && /^\d{1,4}(px|%)?$/.test(value)) found[key] = /^\d+$/.test(value) ? `${value}px` : value;
    if (key === 'align' && ['left', 'center', 'right'].includes(value)) found.align = value;
  }
  return found;
}

const SIDE = { left: 'margin-right:auto', center: 'margin-inline:auto', right: 'margin-left:auto' };
const sizeStyle = ({ width, height }) => [width && `width:${width}`, height && `height:${height}`].filter(Boolean).join(';');

/** The pages that may be shown inside a post. Nothing else is ever put in a frame. */
function embedUrl(url) {
  let address;
  try { address = new URL(String(url).trim()); } catch { return null; }
  const host = address.hostname.replace(/^www\./, '');
  const id = (value) => (/^[\w-]{6,40}$/.test(value ?? '') ? value : null);
  if (host === 'youtu.be') { const v = id(address.pathname.slice(1)); return v && `https://www.youtube-nocookie.com/embed/${v}`; }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = id(address.searchParams.get('v')) ?? id(/^\/(?:embed|shorts|live)\/([\w-]+)/.exec(address.pathname)?.[1]);
    return v && `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === 'vimeo.com') { const v = /^\/(\d{5,12})/.exec(address.pathname)?.[1]; return v && `https://player.vimeo.com/video/${v}`; }
  if (host === 'loom.com') { const v = /^\/(?:share|embed)\/([a-f0-9]{20,40})/.exec(address.pathname)?.[1]; return v && `https://www.loom.com/embed/${v}`; }
  return null;
}

const isVideoFile = (url) => /\.(mp4|webm|ogg|mov)(\?[^#]*)?(#.*)?$/i.test(String(url));

/** A video page or file as a player, or null when the address is neither. */
function mediaHtml(url, title, size) {
  const place = size.align ? `;${SIDE[size.align]}` : '';
  const embed = embedUrl(url);
  if (embed) {
    const style = `aspect-ratio:16/9;width:100%;max-width:${size.width ?? '720px'}${place}`;
    return `<figure class="embed" style="${style}"><iframe src="${embed}" title="${escapeHtml(title || 'Video')}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" style="width:100%;height:100%;border:0"></iframe></figure>`;
  }
  if (isVideoFile(url)) {
    const style = `max-width:100%;height:auto;${sizeStyle(size)}${place}`.replace(/;;/g, ';');
    return `<figure class="embed"><video src="${safeUrl(url)}" controls preload="metadata" playsinline aria-label="${escapeHtml(title || 'Video')}" style="${style}"></video></figure>`;
  }
  return null;
}

function inline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)(\{[^}\n]*\})?/g, (_, alt, url, _title, list) => {
    const style = sizeStyle(attributes(list));
    return `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" decoding="async"${style ? ` style="${style};max-width:100%;height:auto"` : ''}>`;
  });
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
    const alone = text.trim();
    // A picture, a video page or a video file on its own line becomes a figure or a player.
    const media = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)(\{[^}\n]*\})?$/.exec(alone);
    const bare = /^<?(https?:\/\/[^\s<>]+)>?$/.exec(alone);
    const player = media ? mediaHtml(media[2], media[1], attributes(media[3])) : bare ? mediaHtml(bare[1], '', {}) : null;
    if (player) {
      out.push(player);
    } else if (media) {
      const size = attributes(media[3]);
      const img = `<img src="${safeUrl(media[2])}" alt="${escapeHtml(media[1])}" loading="lazy" decoding="async" style="max-width:100%;height:auto${size.width ? `;width:${size.width}` : ''}${size.height ? `;height:${size.height}` : ''}">`;
      out.push(`<figure${size.align ? ` style="${SIDE[size.align]}${size.width ? `;width:${size.width}` : ''}"` : ''}>${img}${media[1] ? `<figcaption>${escapeHtml(media[1])}</figcaption>` : ''}</figure>`);
    } else {
      out.push(`<p>${inline(text)}</p>`);
    }
  }
  return { html: out.join('\n'), headings };
}
