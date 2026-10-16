import { useEffect, useRef } from 'react';

import { links } from '../lib/config';

/**
 * Puts one of the app's pages inside yours with the app's own one-line embed.
 * `page` is `forms/WORKSPACE_ID/LINK_ID`, `book/…` or `portal/…`, as the Embed
 * button shows it. The frame grows with its content, so there is no scrollbar
 * inside a box.
 */
export function Embed({ page, title }: { page: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = box.current;
    // React may run this twice while you work; one frame is enough.
    if (!element || element.dataset.page === page) return;
    element.dataset.page = page;
    const script = document.createElement('script');
    script.src = `${links.app}/embed.js`;
    script.async = true;
    script.dataset.page = page;
    script.dataset.title = title;
    element.appendChild(script);
  }, [page, title]);

  // Keyed by the page: showing another page makes a new box, and leaving this
  // one removes the box and the frame with it.
  return <div key={page} ref={box} data-embed={page.split('/')[0]} />;
}
