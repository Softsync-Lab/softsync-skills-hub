<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

import WebAgent from './components/WebAgent.vue';
import { getSite } from './lib/cms';
import { links } from './lib/config';

const site = ref({ name: '', tagline: '' });
onMounted(async () => {
  const value = await getSite();
  if (value) site.value = value;
});

const nav = computed(() => [
  { label: 'Blog', to: '/blog' },
  ...(links.help ? [{ label: 'Help', to: '/help' }, { label: 'FAQ', to: '/faq' }] : []),
  ...(links.form ? [{ label: 'Contact', to: '/contact' }] : []),
  ...(links.booking ? [{ label: 'Book', to: '/book' }] : []),
]);
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
      <RouterLink to="/" class="font-serif text-2xl font-bold tracking-tight">{{ site.name }}</RouterLink>
      <nav class="flex flex-1 gap-5 text-[15px] text-stone-600">
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="hover:text-orange-700">{{ item.label }}</RouterLink>
      </nav>
      <!-- A plain GET form: it works before any script has loaded. -->
      <form action="/search" role="search" class="flex gap-2">
        <input
          type="search"
          name="q"
          placeholder="Search articles"
          aria-label="Search articles"
          class="w-56 rounded-full border border-stone-300 bg-white px-4 py-2 text-[15px] outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20"
        />
        <button class="rounded-full bg-stone-900 px-4 py-2 text-sm text-white">Search</button>
      </form>
    </div>
  </header>
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" v-bind="route.path === '/' ? { site } : {}" />
  </RouterView>
  <footer class="mt-20 border-t border-stone-200 py-8 text-sm text-stone-500">
    <div class="mx-auto max-w-6xl px-6">
      <b>{{ site.name }}</b> · {{ site.tagline }} · <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">For AI assistants</a>
    </div>
  </footer>
  <WebAgent :agent="links.agent" />
</template>
