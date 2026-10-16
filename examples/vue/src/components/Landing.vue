<script setup lang="ts">
import { computed } from 'vue';

import type { Block } from '../lib/cms';

// The home page's own pieces, written in the app: a hero, a heading and picture cards.
const props = defineProps<{ blocks: Block[] }>();
const hero = computed(() => props.blocks.find((b) => b.block === 'hero'));
const heading = computed(() => props.blocks.find((b) => b.block === 'section'));
const cards = computed(() => props.blocks.filter((b) => b.block === 'feature'));
</script>

<template>
  <section v-if="hero" class="grid items-center gap-10 py-16 md:grid-cols-2">
    <img v-if="hero.image" :src="hero.image.url" :alt="hero.image.alt" class="aspect-[4/5] w-full rounded-3xl object-cover shadow-sm" />
    <div>
      <h1 class="font-serif text-5xl leading-tight font-bold tracking-tight">
        {{ hero.title }}
        <span v-if="hero.highlight" class="block text-orange-700">{{ hero.highlight }}</span>
      </h1>
      <p class="mt-5 text-lg text-stone-600">{{ hero.body }}</p>
      <a v-if="hero.button_label" :href="hero.button_link || '#'" class="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 font-medium text-white hover:bg-orange-700">{{ hero.button_label }}</a>
    </div>
  </section>
  <section v-if="cards.length" class="py-10">
    <h2 v-if="heading" class="mb-10 text-center font-serif text-4xl font-bold tracking-tight">
      {{ heading.title }}
      <span v-if="heading.highlight" class="block text-orange-700">{{ heading.highlight }}</span>
    </h2>
    <div class="grid gap-8 sm:grid-cols-3">
      <article v-for="card in cards" :key="card.id">
        <img v-if="card.image" :src="card.image.url" :alt="card.image.alt" class="aspect-[4/5] w-full rounded-3xl object-cover shadow-sm" />
        <h3 class="mt-5 text-xl font-semibold">{{ card.title }}</h3>
        <p class="mt-2 text-stone-600">{{ card.body }}</p>
      </article>
    </div>
  </section>
</template>
