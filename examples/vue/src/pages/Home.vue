<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import Landing from '../components/Landing.vue';
import PostCard from '../components/PostCard.vue';
import { listBlocks, listPosts, type Block } from '../lib/cms';
import { links } from '../lib/config';
import { useHead } from '../lib/useHead';

const props = defineProps<{ site: { name: string; tagline: string } }>();
const data = ref<Awaited<ReturnType<typeof listPosts>>>(null);
const blocks = ref<Block[]>([]);
onMounted(async () => {
  data.value = await listPosts();
  blocks.value = await listBlocks();
});
useHead(
  computed(() => (props.site.name ? `${props.site.name} — ${props.site.tagline}` : 'Loading…')),
  computed(() => props.site.tagline),
);

const doors = [
  { show: links.help, to: '/help', title: 'Help centre', text: 'Answers to the questions we hear most.' },
  { show: links.form, to: '/contact', title: 'Write to us', text: 'A message that reaches us straight away.' },
  { show: links.booking, to: '/book', title: 'Book a time', text: 'Pick a time that suits you.' },
].filter((door) => door.show);
</script>

<template>
  <main class="mx-auto max-w-6xl px-6">
    <Landing :blocks="blocks" />
    <section v-if="!blocks.some((block) => block.block === 'hero')" class="py-16">
      <h1 class="font-serif text-6xl leading-none font-bold tracking-tight">{{ site.name }}</h1>
      <p class="mt-4 max-w-xl text-xl text-stone-600">{{ site.tagline }}</p>
    </section>
    <section v-if="doors.length" class="grid gap-4 sm:grid-cols-3">
      <RouterLink v-for="door in doors" :key="door.to" :to="door.to" class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 hover:ring-orange-600">
        <h2 class="font-semibold">{{ door.title }}</h2>
        <p class="mt-1 text-stone-600">{{ door.text }}</p>
      </RouterLink>
    </section>
    <h2 class="mt-14 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">
      From the blog
      <RouterLink to="/blog" class="ml-2 font-normal tracking-normal normal-case underline">All articles</RouterLink>
    </h2>
    <div v-if="data" class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      <PostCard v-for="post in data.posts.slice(0, 3)" :key="post.id" :post="post" :authors="data.authors" :tags="data.tags" />
    </div>
  </main>
</template>
