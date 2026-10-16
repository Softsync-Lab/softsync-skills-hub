import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Embed } from '@/components/Embed';
import { links } from '@/lib/site';

export const metadata: Metadata = { title: 'Book a time' };

/** The app's booking page inside your own page. */
export default function Book() {
  if (!links.booking) notFound();
  return (
    <main className="mx-auto max-w-5xl px-6">
      <h1 className="mt-10 mb-6 font-serif text-5xl font-bold tracking-tight">Book a time</h1>
      <Embed page={`book/${links.booking}`} title="Book a time" />
    </main>
  );
}
