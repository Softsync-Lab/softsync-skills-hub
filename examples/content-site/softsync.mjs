// The only place that knows how to talk to the app. A workspace API key is
// all a backend needs: it reads, and it can never write through this file.

export function createClient({ api = 'https://api.softsync.ai', apiKey, cacheSeconds = 60 }) {
  if (!apiKey) throw new Error('Set SOFTSYNC_API_KEY to a workspace API key.');
  const cache = new Map();

  async function call(path, body) {
    const response = await fetch(`${api}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'x-api-key': apiKey, ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error(`${path} answered ${response.status}: ${await response.text()}`);
    return response.json();
  }

  /** Remembers an answer for a short while, so busy pages stay far under the key's request limit. */
  async function remembered(key, load, seconds = cacheSeconds) {
    const hit = cache.get(key);
    if (hit && hit.until > Date.now()) return hit.value;
    const value = await load();
    cache.set(key, { value, until: Date.now() + (typeof seconds === 'function' ? seconds(value) : seconds) * 1000 });
    return value;
  }

  /** Tables, their ids and the labels of every choice. Rarely changes, so it is read once. */
  const schema = () => remembered('schema', async () => {
    const { description } = await call('/table/describe');
    const tables = Object.fromEntries(description.tables.map((t) => [t.apiName, t]));
    const labels = (table, field) => Object.fromEntries((tables[table].fields.find((f) => f.apiName === field)?.options?.choices ?? []).map((c) => [c.value, c.label]));
    return {
      posts: tables.posts?.id, sections: tables.post_sections?.id,
      tags: tables.posts ? labels('posts', 'tags') : {}, categories: tables.posts ? labels('posts', 'category') : {},
      // The help articles of the knowledge base (Wiki), when the workspace has one.
      articles: tables.articles?.id, articleCategories: tables.articles ? labels('articles', 'category') : {},
    };
  // A workspace that has not added its content tables yet is looked at again soon, not in an hour.
  }, (schema) => (schema.posts ? 3600 : 5));

  /** The people who can be an author: name and picture, never an email address. */
  const authors = () => remembered('authors', async () => {
    const { info } = await call('/api-keys/info');
    const { members } = await call(`/workspaces/${info.workspaceId}/members`);
    return Object.fromEntries(members.map((m) => [m.userId, {
      name: [m.userFirstName, m.userLastName].filter(Boolean).join(' ') || 'The team',
      avatar: m.userAvatarUrl ?? null,
    }]));
  }, 300);

  const published = { fieldId: 'status', operator: 'eq', value: 'published' };

  /** Published posts, newest first. No text comes with them, so the list stays light. */
  async function listPosts({ tag, q, limit = 50 } = {}) {
    return remembered(`list:${tag ?? ''}:${q ?? ''}:${limit}`, async () => {
      const { posts } = await schema();
      const { items } = await call('/records/search', {
        tableId: posts,
        limit,
        fieldFilters: [published, ...(tag ? [{ fieldId: 'tags', operator: 'in', value: tag }] : [])],
        sort: { fieldId: 'published_on', direction: 'desc' },
        ...(q ? { semanticQuery: q, disableVector: true } : {}),
      });
      // A page of the site (the home page) is not an article in the list.
      return items.map(shape).filter((post) => post.category !== 'page');
    });
  }

  /** One post: its details, its sections in order. */
  async function getPost(slug) {
    return remembered(`post:${slug}`, async () => {
      const { posts, sections } = await schema();
      const { items } = await call('/records/search', {
        tableId: posts,
        limit: 1,
        fieldFilters: [published, { fieldId: 'slug', operator: 'eq', value: slug }],
      });
      if (!items[0]) return null;
      const post = shape(items[0]);
      const byPost = { fieldId: 'post', operator: 'eq', value: post.id };
      const body = await call('/records/search', { tableId: sections, limit: 100, fieldFilters: [byPost], sort: { fieldId: 'position', direction: 'asc' } });
      return {
        ...post,
        sections: body.items.map((s) => ({ title: s.data.title, body: s.data.body ?? '' })),
      };
    });
  }

  /**
   * The knowledge base as an FAQ: every published article meant for customers,
   * title as the question and body as the answer. Team-only pages never leave the app.
   */
  async function listFaq() {
    return remembered('faq', async () => {
      const { articles } = await schema();
      if (!articles) return [];
      const { items } = await call('/records/search', {
        tableId: articles,
        limit: 100,
        fieldFilters: [
          { fieldId: 'status', operator: 'eq', value: 'published' },
          { fieldId: 'audience', operator: 'eq', value: 'public' },
        ],
      });
      return items.map((a) => ({ id: a.id, question: a.data.title, answer: a.data.body ?? '', category: a.data.category ?? null, updatedAt: a.updatedAt }));
    });
  }

  /** Everything the site reads: label maps and author names, posts, and the FAQ. */
  return { schema, authors, listPosts, getPost, listFaq };
}

/** A search hit as the site uses it. */
function shape(item) {
  const d = item.data;
  const cover = Array.isArray(d.cover_image) ? d.cover_image[0] : d.cover_image;
  const lines = (text) => String(text ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    id: item.id,
    slug: d.slug,
    title: d.title,
    summary: d.summary ?? '',
    category: d.category ?? null,
    tags: d.tags ?? [],
    author: d.author ?? null,
    publishedOn: d.published_on ?? item.createdAt,
    updatedAt: item.updatedAt,
    readingMinutes: d.reading_minutes ?? 1,
    wordCount: d.word_count ?? 0,
    cover: cover?.url ? { url: cover.url, alt: d.cover_image_alt ?? '' } : null,
    focusKeyword: d.focus_keyword ?? '',
    canonicalUrl: d.canonical_url ?? '',
    hidden: d.hide_from_search === 'yes',
    takeaways: lines(d.key_takeaways),
    sources: lines(d.sources),
  };
}
