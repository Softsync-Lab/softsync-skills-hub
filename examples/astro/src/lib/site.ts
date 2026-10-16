import { createClient } from './softsync.js';

const env = process.env;

/** Where the site lives and what it is called. */
export const site = {
  url: (env.SITE_URL ?? 'http://localhost:4321').replace(/\/$/, ''),
  name: env.SITE_NAME ?? 'The Journal',
  tagline: env.SITE_TAGLINE ?? 'Stories, guides and ideas from our team',
};

/** Empty means "not set up", and that part of the site is hidden. */
export const links = {
  app: env.SOFTSYNC_APP ?? 'https://app.softsync.ai',
  api: env.SOFTSYNC_API ?? 'https://api.softsync.ai',
  form: env.SOFTSYNC_FORM ?? '',
  booking: env.SOFTSYNC_BOOKING ?? '',
  help: env.SOFTSYNC_HELP ?? '',
  agent: env.SOFTSYNC_AGENT ?? '',
};

let client: ReturnType<typeof createClient> | undefined;

/**
 * The CMS reader. It holds the workspace API key and runs on the server only.
 * It remembers answers for a minute, which keeps a busy site far below the
 * key's request limit.
 */
export function content() {
  client ??= createClient({
    api: env.SOFTSYNC_API,
    apiKey: env.SOFTSYNC_API_KEY,
    cacheSeconds: Number(env.CACHE_SECONDS ?? 60),
    preview: env.SOFTSYNC_PREVIEW === '1',
  });
  return client;
}
