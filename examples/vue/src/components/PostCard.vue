<script setup lang="ts">
import { RouterLink } from 'vue-router';

import type { Post } from '../lib/cms';
import { dayLabel } from '../lib/seo.js';

/** One post in a list: picture, tags, title, summary. */
defineProps<{ post: Post; authors: Record<string, { name: string }>; tags: Record<string, string> }>();
</script>

<template>
  <article class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
    <RouterLink :to="`/blog/${post.slug}`" tabindex="-1" aria-hidden="true" class="block aspect-video bg-stone-100">
      <img v-if="post.cover" :src="post.cover.url" alt="" loading="lazy" class="h-full w-full object-cover" />
    </RouterLink>
    <div class="flex flex-1 flex-col gap-2 p-6">
      <div class="flex flex-wrap gap-1.5">
        <RouterLink v-for="tag in post.tags" :key="tag" :to="`/tag/${tag}`" class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800 hover:bg-orange-100">
          {{ tags[tag] ?? tag }}
        </RouterLink>
      </div>
      <h2 class="font-serif text-2xl leading-snug font-bold tracking-tight">
        <RouterLink :to="`/blog/${post.slug}`">{{ post.title }}</RouterLink>
      </h2>
      <p class="flex-1 text-stone-600">{{ post.summary }}</p>
      <p class="text-sm text-stone-500">
        {{ authors[post.author ?? '']?.name ?? 'The team' }} · {{ dayLabel(post.publishedOn) }} · {{ post.readingMinutes }} min read
      </p>
    </div>
  </article>
</template>
