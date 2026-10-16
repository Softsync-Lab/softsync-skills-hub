<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import PostCard from '../components/PostCard.vue';
import { listPosts } from '../lib/cms';
import { useHead } from '../lib/useHead';

/** The list, a tag's list and search results are one page with a different filter. */
const route = useRoute();
const tag = computed(() => (route.params.tag as string | undefined) ?? '');
const searching = computed(() => route.path === '/search');
const q = computed(() => String(route.query.q ?? '').trim());
const data = ref<Awaited<ReturnType<typeof listPosts>>>(null);

watchEffect(async () => {
  const query = { tag: tag.value || undefined, q: searching.value ? q.value : undefined };
  data.value = null;
  const result = await listPosts(query);
  // Ignore an answer that arrives after the visitor has already moved on.
  if (query.tag === (tag.value || undefined)) data.value = result;
});

const label = computed(() => (tag.value ? (data.value?.tags[tag.value] ?? tag.value) : ''));
const heading = computed(() => (searching.value ? (q.value ? `Results for “${q.value}”` : 'Search') : tag.value ? label.value : 'Latest articles'));
useHead(computed(() => (searching.value ? 'Search' : tag.value ? label.value : 'Blog')));
</script>

<template>
  <main class="mx-auto max-w-6xl px-6">
    <nav aria-label="Filter by tag" class="mt-8 flex flex-wrap gap-2">
      <RouterLink to="/blog" :class="['rounded-full border px-4 py-1.5 text-sm', !tag && !searching ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white']">All</RouterLink>
      <RouterLink
        v-for="(text, value) in data?.tags ?? {}"
        :key="value"
        :to="`/tag/${value}`"
        :class="['rounded-full border px-4 py-1.5 text-sm', tag === value ? 'border-orange-700 bg-orange-700 text-white' : 'border-stone-300 bg-white hover:border-orange-600']"
      >
        {{ text }}
      </RouterLink>
    </nav>
    <h1 class="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">
      {{ heading }}
      <small v-if="data" class="ml-2 font-normal tracking-normal normal-case">{{ data.posts.length }} {{ data.posts.length === 1 ? 'article' : 'articles' }}</small>
    </h1>
    <div v-if="data" class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      <PostCard v-for="post in data.posts" :key="post.id" :post="post" :authors="data.authors" :tags="data.tags" />
    </div>
    <p v-if="data && data.posts.length === 0" class="text-stone-500 italic">Nothing here yet. Try another tag or search.</p>
  </main>
</template>
