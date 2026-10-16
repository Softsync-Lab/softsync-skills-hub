<script setup lang="ts">
import { computed } from 'vue';

import ContactForm from '../components/ContactForm.vue';
import Embed from '../components/Embed.vue';
import { links } from '../lib/config';
import { useHead } from '../lib/useHead';

/** Help centre, booking and contact: the app's pages inside your own page. */
const props = defineProps<{ kind: 'help' | 'book' | 'contact' }>();
const titles = { help: 'Help centre', book: 'Book a time', contact: 'Contact' };
useHead(computed(() => titles[props.kind]));
</script>

<template>
  <main v-if="kind === 'help'" class="mx-auto max-w-5xl px-6">
    <h1 class="mt-10 mb-6 font-serif text-5xl font-bold tracking-tight">Help centre</h1>
    <Embed v-if="links.help" :page="`portal/${links.help}`" title="Help centre" />
  </main>
  <main v-else-if="kind === 'book'" class="mx-auto max-w-5xl px-6">
    <h1 class="mt-10 mb-6 font-serif text-5xl font-bold tracking-tight">Book a time</h1>
    <Embed v-if="links.booking" :page="`book/${links.booking}`" title="Book a time" />
  </main>
  <!-- The same form twice: the app's own look (one line), and your own design (your Tailwind classes). -->
  <main v-else-if="links.form" class="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2">
    <section>
      <h1 class="mt-10 mb-6 font-serif text-4xl font-bold tracking-tight">Write to us</h1>
      <h2 class="mb-3 text-sm font-semibold tracking-widest text-stone-500 uppercase">The app’s own look</h2>
      <Embed :page="`forms/${links.form}`" title="Contact" />
    </section>
    <section>
      <h2 class="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase md:mt-[4.9rem]">Your own design</h2>
      <ContactForm :form="links.form" />
    </section>
  </main>
</template>
