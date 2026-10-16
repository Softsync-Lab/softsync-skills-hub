/** Structured data for search engines and AI assistants. `<` is escaped so a post can never close the tag. */
export function JsonLd({ data }: { data: object[] }) {
  return (
    <>
      {data.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }} />
      ))}
    </>
  );
}
