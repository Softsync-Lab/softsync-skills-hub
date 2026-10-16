import { site } from '@/lib/site';
import { robotsTxt } from '@/lib/seo.js';

// Made when asked for, so it always lists what is published right now.
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response(robotsTxt(site.url), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
