'use client';

import { useEffect } from 'react';

const app = process.env.NEXT_PUBLIC_SOFTSYNC_APP ?? 'https://app.softsync.ai';

/**
 * The chat bubble. Put it once in the layout and it sits in the corner of
 * every page. It only appears once the agent is live, so a switched-off agent
 * leaves nothing behind. Colour, name and icon come from the agent's settings.
 */
export function WebAgent({ agent }: { agent: string }) {
  useEffect(() => {
    if (!agent || document.querySelector('script[data-agent]')) return;
    const script = document.createElement('script');
    script.src = `${app}/web-agent.js`;
    script.async = true;
    script.dataset.agent = agent;
    document.body.appendChild(script);
  }, [agent]);

  return null;
}
