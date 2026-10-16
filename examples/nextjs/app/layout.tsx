import type { Metadata } from 'next';
import Link from 'next/link';

import { WebAgent } from '@/components/WebAgent';
import { links, site } from '@/lib/site';
import './globals.css';

// Posts change when someone publishes, so pages are made when they are asked for.
// (The CMS reader keeps answers for a minute, so this stays cheap.)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { label: 'Blog', href: '/blog' },
    ...(links.help ? [{ label: 'Help', href: '/help' }, { label: 'FAQ', href: '/faq' }] : []),
    ...(links.form ? [{ label: 'Contact', href: '/contact' }] : []),
    ...(links.booking ? [{ label: 'Book', href: '/book' }] : []),
  ];
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
              {site.name}
            </Link>
            <nav className="flex flex-1 gap-5 text-[15px] text-stone-600">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-orange-700">
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action="/search" role="search" className="flex gap-2">
              <input
                type="search"
                name="q"
                placeholder="Search articles"
                aria-label="Search articles"
                className="w-56 rounded-full border border-stone-300 bg-white px-4 py-2 text-[15px] outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20"
              />
              <button className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white">Search</button>
            </form>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-stone-200 py-8 text-sm text-stone-500">
          <div className="mx-auto max-w-6xl px-6">
            <b>{site.name}</b> · {site.tagline} · <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">For AI assistants</a>
          </div>
        </footer>
        <WebAgent agent={links.agent} />
      </body>
    </html>
  );
}
