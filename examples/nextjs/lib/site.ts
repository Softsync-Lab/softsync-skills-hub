import { createClient } from './softsync.js';

/** Where the site lives and what it is called. */
export const site = {
  url: (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  name: process.env.SITE_NAME ?? 'The Journal',
  tagline: process.env.SITE_TAGLINE ?? 'Stories, guides and ideas from our team',
};

/** Public values: safe to ship to the browser. Empty means "not set up", and that part is hidden. */
export const links = {
  app: process.env.NEXT_PUBLIC_SOFTSYNC_APP ?? 'https://app.softsync.ai',
  api: process.env.NEXT_PUBLIC_SOFTSYNC_API ?? 'https://api.softsync.ai',
  form: process.env.NEXT_PUBLIC_SOFTSYNC_FORM ?? '',
  booking: process.env.NEXT_PUBLIC_SOFTSYNC_BOOKING ?? '',
  help: process.env.NEXT_PUBLIC_SOFTSYNC_HELP ?? '',
  agent: process.env.NEXT_PUBLIC_SOFTSYNC_AGENT ?? '',
};

let client: ReturnType<typeof createClient> | undefined;

/**
 * The CMS reader. It holds the workspace API key, so it only ever runs on the
 * server (pages, route handlers). It remembers answers for a minute, which
 * keeps a busy site far below the key's request limit.
 */
export function content() {
  client ??= createClient({
    api: process.env.SOFTSYNC_API,
    apiKey: process.env.SOFTSYNC_API_KEY,
    cacheSeconds: Number(process.env.CACHE_SECONDS ?? 60),
  });
  return client;
}
