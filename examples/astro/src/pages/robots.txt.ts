import type { APIRoute } from 'astro';

import { site } from '../lib/site';
import { robotsTxt } from '../lib/seo.js';

export const GET: APIRoute = () => new Response(robotsTxt(site.url), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
