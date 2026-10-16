/** @type {import('next').NextConfig} */
export default {
  // Every post is also available as clean Markdown at /blog/<slug>.md, for AI assistants.
  async rewrites() {
    return [{ source: '/blog/:slug.md', destination: '/blog/:slug/markdown' }];
  },
};
