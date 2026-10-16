<script setup lang="ts">
import { onMounted } from 'vue';

import { links } from '../lib/config';

/**
 * The chat bubble. Put it once at the top of the app and it sits in the corner
 * of every page. It only appears once the agent is live, so a switched-off
 * agent leaves nothing behind. Colour, name and icon come from the agent's settings.
 */
const props = defineProps<{ agent: string }>();

onMounted(() => {
  if (!props.agent || document.querySelector('script[data-agent]')) return;
  const script = document.createElement('script');
  script.src = `${links.app}/web-agent.js`;
  script.async = true;
  script.dataset.agent = props.agent;
  document.body.appendChild(script);
});
</script>

<template><span hidden /></template>
