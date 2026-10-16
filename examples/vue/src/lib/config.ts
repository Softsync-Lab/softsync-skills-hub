/** Public values, set at build time. Empty means "not set up", and that part of the site is hidden. */
const env = import.meta.env;

export const links = {
  app: (env.VITE_SOFTSYNC_APP as string | undefined) ?? 'https://app.softsync.ai',
  api: (env.VITE_SOFTSYNC_API as string | undefined) ?? 'https://api.softsync.ai',
  form: (env.VITE_SOFTSYNC_FORM as string | undefined) ?? '',
  booking: (env.VITE_SOFTSYNC_BOOKING as string | undefined) ?? '',
  help: (env.VITE_SOFTSYNC_HELP as string | undefined) ?? '',
  agent: (env.VITE_SOFTSYNC_AGENT as string | undefined) ?? '',
};
