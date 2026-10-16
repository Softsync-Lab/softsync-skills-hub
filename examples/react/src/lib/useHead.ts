import { useEffect } from 'react';

/**
 * Sets the page title and description while a page is shown. For a post the
 * small server has already put the full <head> in the HTML, so crawlers do not
 * depend on this; it keeps the tab title right as visitors move around.
 */
export function useHead(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
