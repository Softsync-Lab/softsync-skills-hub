// A small stand-in for the app that answers from recorded data, so every
// example runs with no account and no key. It answers the calls the examples
// make (see _shared/softsync.js) and nothing else. Nothing here is written
// back: a form answer is acknowledged and forgotten.
//
// The recording (dump.json and images/) is made from a real workspace by the
// app's own test suite and refreshed there, so it follows the real API.

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEMO_KEY = 'demo';

const types = { '.png': 'image/png', '.js': 'text/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8' };

/** Whether a record matches one filter, the way the real search reads it. */
function matches(item, { fieldId, operator, value }) {
  const have = item.data[fieldId];
  if (operator === 'eq') return Array.isArray(have) ? have.includes(value) : have === value;
  if (operator === 'in') {
    const wanted = Array.isArray(value) ? value : [value];
    return Array.isArray(have) ? have.some((entry) => wanted.includes(entry)) : wanted.includes(have);
  }
  throw new Error(`The demo does not know the filter "${operator}".`);
}

function words(text) {
  return String(text).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** Records whose text holds every word asked for. */
function mentions(item, query) {
  const text = words(Object.values(item.data).filter((v) => typeof v === 'string').join(' '));
  return words(query).every((word) => text.some((entry) => entry.startsWith(word)));
}

export function search(dump, body) {
  const table = dump.describe.tables.find((t) => t.id === body.tableId);
  if (!table) return { status: 404, body: { message: 'No such table' } };
  let items = dump.records[table.apiName].filter((item) => (body.fieldFilters ?? []).every((f) => matches(item, f)));
  if (body.semanticQuery) items = items.filter((item) => mentions(item, body.semanticQuery));
  if (body.sort) {
    const { fieldId, direction } = body.sort;
    const sign = direction === 'desc' ? -1 : 1;
    items = [...items].sort((a, b) => sign * String(a.data[fieldId] ?? '').localeCompare(String(b.data[fieldId] ?? ''), 'en', { numeric: true }));
  }
  return { status: 200, body: { items: items.slice(0, body.limit ?? 50) } };
}

/**
 * Starts the demo app on `port`. `origin` is where the examples reach it; it
 * is also where pictures are served from.
 */
export async function startDemo({ port = 4010, dumpFile = path.join(here, 'dump.json') } = {}) {
  const origin = `http://localhost:${port}`;
  const dump = JSON.parse(readFileSync(dumpFile, 'utf8').split('{{origin}}').join(origin));

  const send = (response, status, body, type = 'application/json') => {
    response.writeHead(status, {
      'content-type': type,
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    });
    response.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
  };
  const read = (request) => new Promise((resolve) => {
    let text = '';
    request.on('data', (chunk) => (text += chunk));
    request.on('end', () => resolve(text));
  });

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', origin);
    const route = url.pathname;
    if (request.method === 'OPTIONS') return send(response, 204, '');

    // Pictures and the app's own scripts need no key, as in the real app.
    if (route.startsWith('/images/') || route === '/embed.js' || route === '/web-agent.js') {
      const file = path.join(here, route.startsWith('/images/') ? route.slice(1) : path.join('app', route));
      if (!file.startsWith(here) || !existsSync(file)) return send(response, 404, 'Not found', 'text/plain');
      return send(response, 200, readFileSync(file), types[path.extname(file)] ?? 'application/octet-stream');
    }
    // The app's pages that the examples put in a frame.
    const frame = /^\/(forms|book|portal|agent)\/(.+)$/.exec(route);
    if (frame) return send(response, 200, framePage(frame[1], dump), types['.html']);

    // Contact form: anyone may send; here it is only acknowledged.
    if (/^\/public\/forms\//.test(route)) {
      if (request.method !== 'POST') return send(response, 200, dump.form);
      const text = await read(request);
      const fields = request.headers['content-type']?.includes('json') ? JSON.parse(text || '{}') : Object.fromEntries(new URLSearchParams(text));
      if (fields._website) return send(response, 200, { message: dump.successMessage });
      // The form's own questions decide what is needed, as in the real app.
      for (const field of dump.form.fields) {
        const value = String(fields[field.id] ?? '').trim();
        if (field.required && !value) return send(response, 400, { message: `${field.label} is required.` });
        if (value && field.inputType === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return send(response, 400, { message: 'Enter a valid email address.' });
      }
      return send(response, 200, { message: dump.successMessage });
    }

    // Everything else is the API, read with a key.
    if (request.headers['x-api-key'] !== DEMO_KEY) return send(response, 401, { message: `Use SOFTSYNC_API_KEY=${DEMO_KEY} with the demo.` });
    if (route === '/api-keys/info') return send(response, 200, { info: dump.info });
    if (route === `/workspaces/${dump.info.workspaceId}/members`) return send(response, 200, dump.members);
    if (route === '/table/describe') return send(response, 200, { description: dump.describe });
    if (route === '/records/search' && request.method === 'POST') {
      const result = search(dump, JSON.parse((await read(request)) || '{}'));
      return send(response, result.status, result.body);
    }
    return send(response, 404, { message: `The demo does not answer ${request.method} ${route}.` });
  });

  await new Promise((resolve, reject) => server.once('error', reject).listen(port, 'localhost', resolve));
  return { origin, dump, links: dump.links, close: () => new Promise((resolve) => server.close(resolve)) };
}

/** What a frame shows in the demo: a short note, and the height the embed script needs. */
function framePage(kind, dump) {
  const labels = { forms: 'contact form', book: 'booking page', portal: 'help centre', agent: 'chat' };
  const message = kind === 'agent'
    ? `{ source: 'web-agent', type: 'ready', color: '#c2410c', icon: 'chat', openLabel: 'Chat', closeLabel: 'Close' }`
    : `{ type: 'public-embed:resize', height: 200 }`;
  return `<!doctype html><meta charset="utf-8"><title>Demo ${labels[kind]}</title>
<body style="font:16px system-ui;margin:0;padding:24px;color:#444;background:#fafaf9">
<p><strong>Demo ${labels[kind]}.</strong> With your own workspace, the app's real ${labels[kind]} appears here.</p>
<script>parent.postMessage(${message}, '*')</script>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.DEMO_PORT ?? 4010);
  const demo = await startDemo({ port });
  console.log(`Demo app on ${demo.origin}  (SOFTSYNC_API_KEY=${DEMO_KEY})`);
}
