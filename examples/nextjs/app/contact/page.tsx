import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContactForm } from '@/components/ContactForm';
import { Embed } from '@/components/Embed';
import { links } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact' };

/** The same form twice: the app's own look (one line), and your own design (your Tailwind classes). */
export default function Contact() {
  if (!links.form) notFound();
  return (
    <main className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2">
      <section>
        <h1 className="mt-10 mb-6 font-serif text-4xl font-bold tracking-tight">Write to us</h1>
        <h2 className="mb-3 text-sm font-semibold tracking-widest text-stone-500 uppercase">The app’s own look</h2>
        <Embed page={`forms/${links.form}`} title="Contact" />
      </section>
      <section>
        <h2 className="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase md:mt-[4.9rem]">Your own design</h2>
        <ContactForm form={links.form} />
      </section>
    </main>
  );
}
