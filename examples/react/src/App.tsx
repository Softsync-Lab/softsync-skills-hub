import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router';

import { WebAgent } from './components/WebAgent';
import { getSite } from './lib/cms';
import { links } from './lib/config';
import { Blog } from './pages/Blog';
import { Book, Contact, Help } from './pages/Embeds';
import { Faq } from './pages/Faq';
import { Home } from './pages/Home';
import { Post } from './pages/Post';

export function App() {
  const [site, setSite] = useState({ name: '', tagline: '' });
  useEffect(() => {
    getSite().then((value) => value && setSite(value));
  }, []);

  const nav = [
    { label: 'Blog', to: '/blog' },
    ...(links.help ? [{ label: 'Help', to: '/help' }, { label: 'FAQ', to: '/faq' }] : []),
    ...(links.form ? [{ label: 'Contact', to: '/contact' }] : []),
    ...(links.booking ? [{ label: 'Book', to: '/book' }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight">
            {site.name}
          </Link>
          <nav className="flex flex-1 gap-5 text-[15px] text-stone-600">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-orange-700">
                {item.label}
              </Link>
            ))}
          </nav>
          {/* A plain GET form: it works before any script has loaded. */}
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
      <Routes>
        <Route path="/" element={<Home site={site} />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/tag/:tag" element={<Blog />} />
        <Route path="/search" element={<Blog />} />
        <Route path="/blog/:slug" element={<Post />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book" element={<Book />} />
        <Route path="*" element={<main className="mx-auto max-w-3xl px-6 py-20 text-xl">We could not find that page.</main>} />
      </Routes>
      <footer className="mt-20 border-t border-stone-200 py-8 text-sm text-stone-500">
        <div className="mx-auto max-w-6xl px-6">
          <b>{site.name}</b> · {site.tagline} · <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">For AI assistants</a>
        </div>
      </footer>
      <WebAgent agent={links.agent} />
    </>
  );
}
