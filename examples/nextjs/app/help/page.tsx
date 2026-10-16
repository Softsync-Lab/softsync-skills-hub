import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Embed } from '@/components/Embed';
import { links } from '@/lib/site';

export const metadata: Metadata = { title: 'Help centre' };

/** The app's help centre inside your own page. */
export default function Help() {
  if (!links.help) notFound();
  return (
    <main className="mx-auto max-w-5xl px-6">
      <h1 className="mt-10 mb-6 font-serif text-5xl font-bold tracking-tight">Help centre</h1>
      <Embed page={`portal/${links.help}`} title="Help centre" />
    </main>
  );
}
