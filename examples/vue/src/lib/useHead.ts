import { onMounted, watch, type Ref } from 'vue';

/**
 * Sets the page title and description while a page is shown. For a post the
 * small server has already put the full <head> in the HTML, so crawlers do not
 * depend on this; it keeps the tab title right as visitors move around.
 */
export function useHead(title: Ref<string>, description?: Ref<string | undefined>) {
  const apply = () => {
    document.title = title.value;
    if (description?.value) document.querySelector('meta[name="description"]')?.setAttribute('content', description.value);
  };
  onMounted(apply);
  watch([title, ...(description ? [description] : [])], apply);
}
