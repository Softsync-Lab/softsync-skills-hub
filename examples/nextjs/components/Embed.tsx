'use client';

import { useEffect, useRef } from 'react';

const app = process.env.NEXT_PUBLIC_SOFTSYNC_APP ?? 'https://app.softsync.ai';

/**
 * Puts one of the app's pages inside yours with the app's own one-line embed.
 * `page` is `forms/WORKSPACE_ID/LINK_ID`, `book/…` or `portal/…`, exactly as the
 * Embed button shows it. The frame grows with its content, so there is no
 * scrollbar inside a box.
 */
export function Embed({ page, title }: { page: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const script = document.createElement('script');
    script.src = `${app}/embed.js`;
    script.async = true;
    script.dataset.page = page;
    script.dataset.title = title;
    element.appendChild(script);
    // Leaving the page (or React re-running the effect) removes the frame too.
    return () => element.replaceChildren();
  }, [page, title]);

  return <div ref={box} data-embed={page.split('/')[0]} />;
}
