// The Tidybooks website: a landing page and blog that read from the app, plus a
// page each for the demo booking, the help centre and the contact form, which are
// the app's own pages placed inside this site with its one-line embed.

import { createBlog } from '../content-site/server.mjs';
import { landingHome } from './landing.mjs';
import { SHOP } from './content.mjs';

/** One of the app's pages, placed on the site with its one-line embed (embed.js). */
export function embed({ app, page, title }) {
  return `<script src="${app}/embed.js" data-page="${page}" data-title="${title}" async></script>`;
}

/**
 * `links` are the public links from each feature's Embed button, as `WORKSPACE_ID/LINK_ID`
 * (leave one out and its page and menu item are left out too).
 */
export function createTidybooks({
  app = process.env.SOFTSYNC_APP || 'https://app.softsync.ai',
  // An object, or a function returning one when the links can change while it runs.
  links = {
    booking: process.env.SOFTSYNC_BOOKING,
    help: process.env.SOFTSYNC_HELP,
    form: process.env.SOFTSYNC_FORM,
    agent: process.env.SOFTSYNC_AGENT,
  },
  preview = process.env.SOFTSYNC_PREVIEW === '1',
  // Read the landing page from somewhere else than the app (the site as it was first built).
  pageOf,
  // Replace or wrap the landing page: `home(context, landing)`.
  home,
  ...options
} = {}) {
  const current = () => (typeof links === 'function' ? links() : links);
  const tool = '.tool{padding-bottom:48px}.tool h1{font-size:40px;margin:28px 0 6px}.tool .lede{color:#57534e;margin:0 0 20px}';
  /** A page of its own: a heading, a line of words and the app's page below it. */
  const page = (heading, intro, code) => ({ esc }) => ({
    title: `${heading} · ${SHOP.name}`,
    description: intro,
    body: `<style>${tool}</style><main class="wrap tool"><h1>${esc(heading)}</h1><p class="lede">${esc(intro)}</p>${code}</main>`,
  });

  const landing = landingHome({
    pageOf,
    // The buttons under the call to action lead to the pages above.
    actions: () => {
      const { booking, form } = current();
      return [
        ...(booking ? [{ label: 'Book a demo', href: '/book' }] : []),
        ...(form ? [{ label: 'Write to Emma', href: '/contact', ghost: true }] : []),
      ];
    },
    latest: async ({ content, cards }) =>
      current().blog === false ? '' : `<section class="band"><h2>From the blog</h2><div class="grid">${await cards(await content.listPosts({ limit: 3 }))}</div></section>`,
  });

  return createBlog({
    siteName: SHOP.name,
    tagline: SHOP.tagline,
    listPath: '/blog',
    nav: () => {
      const { booking, help, form, blog } = current();
      return [
        ...(booking ? [{ label: 'Book a demo', href: '/book' }] : []),
        ...(help ? [{ label: 'Help', href: '/help' }, { label: 'FAQ', href: '/faq' }] : []),
        ...(form ? [{ label: 'Contact', href: '/contact' }] : []),
        ...(blog !== false ? [{ label: 'Blog', href: '/blog' }] : []),
      ];
    },
    pages: () => {
      const { booking, help, form } = current();
      return {
        ...(booking && { '/book': page('Book a demo', 'Pick a time that suits you. It goes straight into Emma’s calendar.', embed({ app, page: `book/${booking}`, title: 'Book a demo' })) }),
        ...(help && { '/help': page('Help centre', 'Search the guides, or browse by topic.', embed({ app, page: `portal/${help}`, title: 'Help centre' })) }),
        ...(form && { '/contact': page('Talk to us', 'A few words is plenty. Emma writes back within a day.', embed({ app, page: `forms/${form}`, title: 'Contact' })) }),
      };
    },
    home: home ? (context) => home(context, landing) : landing,
    bodyEnd: () => {
      const { agent } = current();
      return [
        // The chat bubble: one line, on every page.
        agent ? `<script src="${app}/web-agent.js" data-agent="${agent}" async></script>` : '',
        // Only while building: click any text on the site to edit it in the app.
        preview ? `<script src="${app}/preview.js" async></script>` : '',
      ].join('');
    },
    ...options,
  });
}
