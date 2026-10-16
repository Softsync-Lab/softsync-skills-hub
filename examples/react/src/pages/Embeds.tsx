import { ContactForm } from '../components/ContactForm';
import { Embed } from '../components/Embed';
import { links } from '../lib/config';
import { useHead } from '../lib/useHead';

/** The app's help centre inside your own page. */
export function Help() {
  useHead('Help centre');
  return (
    <main className="mx-auto max-w-5xl px-6">
      <h1 className="mt-10 mb-6 font-serif text-5xl font-bold tracking-tight">Help centre</h1>
      {links.help && <Embed page={`portal/${links.help}`} title="Help centre" />}
    </main>
  );
}

/** The app's booking page inside your own page. */
export function Book() {
  useHead('Book a time');
  return (
    <main className="mx-auto max-w-5xl px-6">
      <h1 className="mt-10 mb-6 font-serif text-5xl font-bold tracking-tight">Book a time</h1>
      {links.booking && <Embed page={`book/${links.booking}`} title="Book a time" />}
    </main>
  );
}

/** The same form twice: the app's own look (one line), and your own design (your Tailwind classes). */
export function Contact() {
  useHead('Contact');
  if (!links.form) return null;
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
