<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { links } from '../lib/config';

/**
 * Puts one of the app's pages inside yours with the app's own one-line embed.
 * `page` is `forms/WORKSPACE_ID/LINK_ID`, `book/…` or `portal/…`, as the Embed
 * button shows it. The frame grows with its content, so there is no scrollbar
 * inside a box.
 */
const props = defineProps<{ page: string; title: string }>();
const box = ref<HTMLElement | null>(null);

function mount() {
  const element = box.value;
  if (!element) return;
  const script = document.createElement('script');
  script.src = `${links.app}/embed.js`;
  script.async = true;
  script.dataset.page = props.page;
  script.dataset.title = props.title;
  element.appendChild(script);
}

// Leaving the page removes the box and the frame with it.
onMounted(mount);
</script>

<template>
  <div ref="box" :data-embed="page.split('/')[0]" />
</template>
