// Runs an example against the demo app: `npm run demo` inside an example folder.
// No account and no key; the data is recorded from a real workspace.

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { DEMO_KEY, startDemo } from './server.mjs';

const dir = process.cwd();
const scripts = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')).scripts ?? {};
const port = Number(process.env.DEMO_PORT ?? 4010);
const demo = await startDemo({ port });
const { form, help, booking, agent } = demo.links;

const server = {
  SOFTSYNC_API: demo.origin,
  SOFTSYNC_API_KEY: DEMO_KEY,
  SOFTSYNC_APP: demo.origin,
  SOFTSYNC_FORM: form,
  SOFTSYNC_BOOKING: booking,
  SOFTSYNC_HELP: help,
  SOFTSYNC_AGENT: agent,
  CACHE_SECONDS: '0',
};
const browser = (prefix) => Object.fromEntries(
  Object.entries({ APP: demo.origin, API: demo.origin, FORM: form, BOOKING: booking, HELP: help, AGENT: agent }).map(([k, v]) => [`${prefix}_SOFTSYNC_${k}`, v]),
);
const env = { ...process.env, ...server, ...browser('NEXT_PUBLIC'), ...browser('VITE') };

const run = (script, extra = []) => new Promise((resolve, reject) => {
  const child = spawn('npm', ['run', script, ...extra], { cwd: dir, env, stdio: 'inherit' });
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`npm run ${script} stopped with ${code}`))));
});

console.log(`\nDemo data on ${demo.origin}. Nothing here needs an account or a key.\n`);
try {
  if (scripts.api) await Promise.all([run('api'), run('dev')]);       // React, Vue: the small server and the browser app
  else if (scripts.dev) await run('dev');                              // Next.js, Astro
  else { await run('build'); await run('start'); }                     // Plain HTML
} finally {
  await demo.close();
}
