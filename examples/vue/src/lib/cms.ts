// What the browser app reads: the small server's /cms answers, never the
// workspace API key itself.

export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  author: string | null;
  publishedOn: string;
  updatedAt: string;
  readingMinutes: number;
  takeaways: string[];
  sources: string[];
  cover: { url: string; alt: string } | null;
  faqs: { question: string; answer: string }[];
}

export interface PostPage {
  post: Post;
  author: { name: string; avatar: string | null };
  html: string;
  headings: { id: string; text: string; level: number }[];
  categoryLabel: string;
  tagLabels: { value: string; label: string }[];
  jsonLd: object[];
  robots: string;
  url: string;
}

async function read<T>(path: string): Promise<T | null> {
  const response = await fetch(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response.json() as Promise<T>;
}

export const getSite = () => read<{ name: string; tagline: string; url: string }>('/cms/site');
export const listPosts = (query: { tag?: string; q?: string } = {}) =>
  read<{ posts: Post[]; authors: Record<string, { name: string }>; tags: Record<string, string> }>(
    `/cms/posts?${new URLSearchParams(Object.entries(query).filter(([, value]) => value) as [string, string][])}`,
  );
export const getPost = (slug: string) => read<PostPage>(`/cms/posts/${encodeURIComponent(slug)}`);
export const listFaq = () => read<{ items: { id: string; question: string; answer: string; category: string }[]; categories: Record<string, string> }>('/cms/faq');

export interface Block {
  id: string;
  block: string;
  title?: string;
  highlight?: string;
  body?: string;
  image?: { url: string; alt: string };
  button_label?: string;
  button_link?: string;
}
/** The home page's own pieces, written in the app. */
export const listBlocks = async () => (await read<{ blocks: Block[] }>('/cms/blocks'))?.blocks ?? [];
