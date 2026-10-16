# Demo data

`npm run demo` in an example folder starts that example against this small stand-in instead of the real app, so it works without an account or a key.

| File | What it is |
| --- | --- |
| `server.mjs` | The stand-in. It answers only what the examples ask for: the blog, the authors, the help articles and the contact form. Nothing is saved. |
| `run.mjs` | Starts the stand-in, points the example at it and runs the example. |
| `dump.json`, `images/`, `app/` | The sample business, recorded from a real workspace: three authors, six posts with covers, sections and questions, a draft that stays hidden, help articles for customers and one for the team only. |

The sample business is not written by hand. The app's own tests build it in a real workspace, record what the real API answers, and fail if that no longer matches this folder. So the demo stays true to the real thing, and if the API changes, you hear about it straight away.

The key for the demo is `demo`. It only works with the stand-in.
