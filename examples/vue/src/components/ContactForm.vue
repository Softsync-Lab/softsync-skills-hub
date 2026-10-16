<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { links } from '../lib/config';

interface Field {
  id: string;
  label: string;
  kind: string;
  required: boolean;
  inputType?: string;
  choices?: { value: string; label: string }[];
}

const input =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20';

/**
 * Your own design for a form from the app. It reads the form's questions (so a
 * new question shows up here without a code change), draws them with your own
 * Tailwind classes and sends the answers straight to the form's address.
 * Nothing from the app's own look is used.
 */
const props = defineProps<{ form: string }>();
const endpoint = `${links.api}/public/forms/${props.form}`;
const fields = ref<Field[]>([]);
const state = ref<'idle' | 'sending' | 'done' | 'failed'>('idle');
const message = ref('');

onMounted(async () => {
  try {
    const view = await (await fetch(endpoint)).json();
    fields.value = (view.fields ?? []).filter((field: Field) => field.kind !== 'file');
  } catch {
    state.value = 'failed';
  }
});

async function send(event: Event) {
  state.value = 'sending';
  const response = await fetch(endpoint, {
    method: 'POST',
    // Asking for JSON gives {"message": "…"} back instead of a page.
    headers: { Accept: 'application/json' },
    body: new URLSearchParams(Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)) as Record<string, string>),
  });
  const answer = await response.json().catch(() => ({}));
  message.value = answer.message ?? '';
  state.value = response.ok ? 'done' : 'failed';
}
</script>

<template>
  <p v-if="state === 'done'" role="status" class="rounded-xl bg-emerald-50 px-5 py-4 text-emerald-900">
    {{ message || 'Thank you!' }}
  </p>
  <form v-else class="flex flex-col gap-4" @submit.prevent="send">
    <label v-for="field in fields" :key="field.id" class="flex flex-col gap-1 text-sm font-medium text-stone-700">
      {{ field.label }}
      <select v-if="field.kind === 'select'" :name="field.id" :required="field.required" :class="input">
        <option value="">Choose…</option>
        <option v-for="choice in field.choices" :key="choice.value" :value="choice.value">{{ choice.label }}</option>
      </select>
      <textarea v-else-if="field.inputType === 'textarea'" :name="field.id" :required="field.required" rows="4" :class="input" />
      <input
        v-else
        :name="field.id"
        :required="field.required"
        :type="field.inputType === 'email' ? 'email' : field.inputType === 'phone' ? 'tel' : 'text'"
        :class="input"
      />
    </label>
    <!-- Catches spam bots: people never see it, so leave it in. -->
    <input type="text" name="_website" tabindex="-1" autocomplete="off" hidden />
    <button
      type="submit"
      :disabled="state === 'sending' || fields.length === 0"
      class="self-start rounded-full bg-stone-900 px-6 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
    >
      Send
    </button>
    <p v-if="state === 'failed'" role="alert" class="text-sm text-red-700">Something went wrong. Please try again.</p>
  </form>
</template>
