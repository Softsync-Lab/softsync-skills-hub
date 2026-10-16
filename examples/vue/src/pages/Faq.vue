<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { listFaq } from '../lib/cms';
import { renderMarkdown } from '../lib/markdown.js';
import { useHead } from '../lib/useHead';

/** The help centre's public articles as a FAQ page. Team-only articles never leave the app. */
const data = ref<Awaited<ReturnType<typeof listFaq>>>(null);
onMounted(async () => {
  data.value = await listFaq();
});
useHead(computed(() => 'FAQ'), computed(() => 'Answers to the questions we hear most, from our help centre.'));

const groups = computed(() => {
  const map = new Map<string, NonNullable<typeof data.value>['items']>();
  for (const item of data.value?.items ?? []) map.set(item.category, [...(map.get(item.category) ?? []), item]);
  return [...map];
});
</script>

<template>
  <main class="mx-auto max-w-3xl px-6">
    <h1 class="mt-10 font-serif text-5xl font-bold tracking-tight">Frequently asked questions</h1>
    <section v-for="[category, items] in groups" :key="category" class="mt-10">
      <h2 class="mb-3 font-serif text-2xl font-bold">{{ data?.categories[category] ?? 'General' }}</h2>
      <details v-for="item in items" :key="item.id" class="mb-2.5 rounded-xl border border-stone-200 bg-white px-5 py-3.5">
        <summary class="cursor-pointer font-semibold">{{ item.question }}</summary>
        <div class="prose prose-stone mt-2" v-html="renderMarkdown(item.answer).html" />
      </details>
    </section>
  </main>
</template>
