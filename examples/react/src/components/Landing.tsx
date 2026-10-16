import type { Block } from '../lib/cms';

/** The home page's own pieces, written in the app: a hero, a heading and picture cards. */
export function Landing({ blocks }: { blocks: Block[] }) {
  const hero = blocks.find((b) => b.block === 'hero');
  const heading = blocks.find((b) => b.block === 'section');
  const cards = blocks.filter((b) => b.block === 'feature');
  return (
    <>
      {hero && (
        <section className="grid items-center gap-10 py-16 md:grid-cols-2">
          {hero.image && <img src={hero.image.url} alt={hero.image.alt} className="aspect-[4/5] w-full rounded-3xl object-cover shadow-sm" />}
          <div>
            <h1 className="font-serif text-5xl leading-tight font-bold tracking-tight">
              {hero.title}
              {hero.highlight && <span className="block text-orange-700">{hero.highlight}</span>}
            </h1>
            <p className="mt-5 text-lg text-stone-600">{hero.body}</p>
            {hero.button_label && (
              <a href={hero.button_link || '#'} className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 font-medium text-white hover:bg-orange-700">
                {hero.button_label}
              </a>
            )}
          </div>
        </section>
      )}
      {cards.length > 0 && (
        <section className="py-10">
          {heading && (
            <h2 className="mb-10 text-center font-serif text-4xl font-bold tracking-tight">
              {heading.title}
              {heading.highlight && <span className="block text-orange-700">{heading.highlight}</span>}
            </h2>
          )}
          <div className="grid gap-8 sm:grid-cols-3">
            {cards.map((card) => (
              <article key={card.id}>
                {card.image && <img src={card.image.url} alt={card.image.alt} className="aspect-[4/5] w-full rounded-3xl object-cover shadow-sm" />}
                <h3 className="mt-5 text-xl font-semibold">{card.title}</h3>
                <p className="mt-2 text-stone-600">{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
