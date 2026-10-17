// The home page, written in the app. The page is a "post" whose category is page
// and whose slug is `home`; its sections are the blocks. Each block becomes one band:
//   • the first block is the hero
//   • blocks titled "Feature: …" next to each other become a row of cards
//   • a block with a YouTube, Vimeo or Loom link is the video band
//   • a block with "call" in its title is the call to action (with buttons)
//   • anything else is a plain text band
// The order is the order set in the app, so dragging a block there moves it here.

import { renderMarkdown } from '../content-site/markdown.mjs';

export const FEATURE = 'Feature: ';
const now = (value) => (typeof value === 'function' ? value() : value);

export const LANDING_CSS = `
.band{padding:56px 0;border-bottom:1px solid #e7e2da}.band:last-child{border-bottom:0}
.band-text{text-align:center;max-width:640px;margin:0 auto}.band-hero{text-align:center;padding:72px 0 56px}.band-hero h1{font-size:54px;margin:0 0 12px}.band-hero p{font-size:20px;color:#57534e;max-width:640px;margin:0 auto}
.band h2{font-size:32px;text-align:center;margin:0 0 28px}
.fcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px}
.fcard{background:#fff;border:1px solid #e7e2da;border-radius:16px;overflow:hidden}
.fcard img{display:block;width:100%;height:170px;object-fit:cover;max-width:none!important}
.fcard h3{margin:16px 18px 6px;font-size:20px}.fcard p{margin:0 18px 18px;color:#57534e}.fcard figure{margin:0}.fcard figcaption{display:none}
.band-video{text-align:center}.band-video .embed{margin:18px auto 0;border-radius:14px;overflow:hidden}.band-video iframe{width:100%;height:100%;border:0}
.band-call{text-align:center;background:#f7f2ea;border-radius:20px;margin:40px 0}
.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:18px}
.actions a{background:#44403c;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600}
.actions a.ghost{background:#fff;color:#44403c;border:1px solid #d6d0c4}
`;

/**
 * `landingHome({ actions, latest, pageOf })` returns the `home` function for `createBlog`.
 *   actions: buttons under the call to action, `{ label, href, ghost? }` (or a function returning them)
 *   latest:  `async (context) => html` shown after the blocks (your latest posts)
 *   pageOf:  `async (content) => page` to read the page from somewhere else than the app
 */
export function landingHome({ actions = [], latest, pageOf } = {}) {
  return async (context) => {
    const { content, esc } = context;
    const page = pageOf ? await pageOf(content) : await content.getPost('home');
    if (!page) return { title: 'Home', description: '', body: '<main class="wrap"><p>No home page yet.</p></main>' };
    const sections = page.sections;
    const bands = [];
    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      if (section.title.startsWith(FEATURE)) {
        const cards = [];
        while (index < sections.length && sections[index].title.startsWith(FEATURE)) {
          cards.push(`<article class="fcard">${renderMarkdown(sections[index].body).html}</article>`);
          index += 1;
        }
        index -= 1;
        bands.push(`<section class="band band-features"><div class="fcards">${cards.join('')}</div></section>`);
        continue;
      }
      const lower = section.title.toLowerCase();
      const kind = index === 0 ? 'hero' : /youtube|vimeo|loom/.test(section.body) ? 'video' : lower.includes('call') ? 'call' : 'text';
      const buttons = kind === 'call' && now(actions).length
        ? `<div class="actions">${now(actions).map((a) => `<a${a.ghost ? ' class="ghost"' : ''} href="${esc(a.href)}">${esc(a.label)}</a>`).join('')}</div>`
        : '';
      let html = renderMarkdown(section.body).html;
      // The reader keeps headings below the first level; the page's own big heading is the first.
      if (kind === 'hero') html = html.replace(/^<h2( id="[^"]*")?>(.*?)<\/h2>/, '<h1$1>$2</h1>');
      bands.push(`<section class="band band-${kind}">${html}${buttons}</section>`);
    }
    return {
      title: page.title,
      description: page.summary || '',
      body: `<style>${LANDING_CSS}</style><main class="wrap">${bands.join('\n')}${latest ? await latest(context) : ''}</main>`,
    };
  };
}
