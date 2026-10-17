<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { getPost, type PostPage } from '../lib/cms';
import { dayLabel } from '../lib/seo.js';
import { useHead } from '../lib/useHead';

const route = useRoute();
const view = ref<PostPage | null | undefined>(undefined);

watch(
  () => route.params.slug as string,
  async (slug) => {
    view.value = undefined;
    const result = await getPost(slug);
    if (slug === route.params.slug) view.value = result;
  },
  { immediate: true },
);
useHead(
  computed(() => (view.value ? view.value.post.title : 'Article')),
  computed(() => view.value?.post.summary),
);
</script>

<template>
  <main v-if="view === undefined" class="mx-auto max-w-3xl px-6 py-20 text-stone-500">Loading…</main>
  <main v-else-if="view === null" class="mx-auto max-w-3xl px-6 py-20 text-xl">We could not find that article.</main>
  <main v-else class="mx-auto max-w-3xl px-6">
    <article>
      <p class="mt-9 mb-3 text-sm text-stone-500">
        <RouterLink to="/">Home</RouterLink> / <RouterLink to="/blog">Blog</RouterLink> / {{ view.categoryLabel }}
      </p>
      <div class="flex flex-wrap gap-1.5">
        <RouterLink v-for="tag in view.tagLabels" :key="tag.value" :to="`/tag/${tag.value}`" class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
          {{ tag.label }}
        </RouterLink>
      </div>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold tracking-tight">{{ view.post.title }}</h1>
      <p class="mt-4 text-xl text-stone-700">{{ view.post.summary }}</p>
      <div class="mt-6 flex items-center gap-3 text-[15px]">
        <img v-if="view.author.avatar" :src="view.author.avatar" alt="" class="size-11 rounded-full object-cover" />
        <span v-else class="grid size-11 place-items-center rounded-full bg-orange-700 font-bold text-white">{{ view.author.name[0] }}</span>
        <div>
          <b>{{ view.author.name }}</b>
          <br />
          <small class="text-stone-500">
            Published <time :datetime="view.post.publishedOn">{{ dayLabel(view.post.publishedOn) }}</time> · {{ view.post.readingMinutes }} min read
          </small>
        </div>
      </div>
      <figure v-if="view.post.cover" class="my-8">
        <img :src="view.post.cover.url" :alt="view.post.cover.alt" class="w-full rounded-2xl" />
      </figure>
      <aside v-if="view.post.takeaways.length" class="mb-8 rounded-r-2xl border-l-4 border-orange-700 bg-orange-50 px-6 py-5">
        <h2 class="mb-2 text-xs font-bold tracking-widest text-orange-800 uppercase">In short</h2>
        <ul class="list-disc pl-5">
          <li v-for="item in view.post.takeaways" :key="item">{{ item }}</li>
        </ul>
      </aside>
      <nav v-if="view.headings.length > 2" aria-label="On this page" class="mb-8 flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-[15px]">
        <b>On this page</b>
        <a v-for="heading in view.headings" :key="heading.id" :href="`#${heading.id}`" :class="heading.level > 2 ? 'ml-4' : ''">{{ heading.text }}</a>
      </nav>
      <!-- The small server made this HTML safe: its Markdown reader escapes everything before it adds markup. -->
      <div class="prose prose-stone prose-lg prose-a:text-orange-700 max-w-none" v-html="view.html" />
      <section v-if="view.post.sources.length" class="mt-12 border-t border-stone-200 pt-4 text-[15px] text-stone-600">
        <h2 class="mb-2 font-serif text-2xl font-bold text-stone-900">Sources</h2>
        <ul class="list-disc pl-5">
          <li v-for="source in view.post.sources" :key="source">
            <a v-if="/^https?:/.test(source)" :href="source" rel="noopener" class="underline">{{ source }}</a>
            <template v-else>{{ source }}</template>
          </li>
        </ul>
      </section>
    </article>
  </main>
</template>
