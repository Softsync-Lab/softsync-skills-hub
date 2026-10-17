#!/usr/bin/env node
// The Tidybooks demo website.  SOFTSYNC_API_KEY=… node server.mjs  →  http://localhost:3000
import { pathToFileURL } from 'node:url';

import { createTidybooks } from './site.mjs';

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const port = Number(process.env.PORT || 3000);
  createTidybooks({ siteUrl: process.env.SITE_URL || `http://localhost:${port}` })
    .listen(port)
    .then(() => console.log(`Tidybooks running on http://localhost:${port}`));
}
