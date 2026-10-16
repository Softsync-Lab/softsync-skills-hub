// Edit in the app, watch it here. Builds the site, serves it, and builds again
// every few seconds so a change you make in the app is on the page after a
// refresh. Drafts are shown while you build (set SOFTSYNC_PREVIEW=0 to hide them).
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const port = Number(process.env.PORT ?? 3000);
const every = Number(process.env.REFRESH_SECONDS ?? 5) * 1000;
const env = { ...process.env, SOFTSYNC_PREVIEW: process.env.SOFTSYNC_PREVIEW ?? '1', SITE_URL: process.env.SITE_URL ?? `http://localhost:${port}` };
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };

const build = () => new Promise((resolve) => {
  execFile('npm', ['run', 'build', '--silent'], { env }, (error, _out, errors) => {
    if (error) console.error(errors || error.message);
    resolve();
  });
});

await build();
createServer((request, response) => {
  const route = decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname);
  let file = join('dist', route);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    return response.end('Not found');
  }
  response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  response.end(readFileSync(file));
}).listen(port, () => console.log(`Previewing on http://localhost:${port}, refreshed every ${every / 1000}s`));
for (;;) {
  await new Promise((resolve) => setTimeout(resolve, every));
  await build();
}
