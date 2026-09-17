# TJ Advaita website update

The live shared website is maintained in https://github.com/tobiasjenni/tjadvaita-tech. Its CNAME is tjadvaita.tech. The separate julia_page repository is Julia’s other website.

## Integrated applications

- `/yoga-sutras/` embeds https://tobiasjenni.github.io/shiva-shakti-sutra-companion/, published from https://github.com/tobiasjenni/shiva-shakti-sutra-companion.
- `/lila/` embeds https://lila.tjadvaita.tech/lila/, preserving the live game and its server APIs. Publish game changes through its existing deployment; no copy is maintained here.
- `/daily-mantra/` embeds https://tobiasjenni.github.io/daily-mantra-meditation/, published from https://github.com/tobiasjenni/daily-mantra-meditation.

The three index.html files are lightweight live frames with TJ Advaita navigation and an Open full page link. Edit and publish each app in its original repository. Once its GitHub Pages deployment succeeds, new visits/reloads here use that published version, subject to normal browser/CDN caching. No file copying, scheduled synchronization, credentials, or redeployment of TJ Advaita is needed. An already-open app is deliberately not refreshed during meditation or reading. Commits to branches that are not deployed do not change the live app.

Keep the upstream Pages URLs stable and embedding enabled. If an app is renamed, moved, or given a custom domain, update its iframe source and Open full page link here. The timer frame allows audio, screen wake lock, and fullscreen; browser/device restrictions still apply. The full-page link is always available if an embedded feature is restricted.

Timer storage now belongs to the original app inside the frame. Browsers may partition embedded storage, so it can differ from both the former tjadvaita.tech copy and the standalone github.io page. Existing progress is not migrated or deleted. The reader remains Sanskrit/English and the timer English.

The source assets copied in the first release remain as an inactive archive (sutras cbff7d7, timer 8f77e6c), including attribution and notes. The live wrappers do not load them; edit the upstream repositories for app changes. Do not replace the wrappers with an upstream index.html, which would disconnect the live integration.

## Navigation and mobile presentation

`js/menu.js` and `css/site-improvements.css` provide the shared modal menu. Native dialog behavior keeps keyboard focus inside the menu and closes it with Escape. The original language controls are moved temporarily into the menu, keeping their listeners and restoring their position on close.

The live wrappers use `css/practice-shell.css` and `js/practice-shell.js`: coordinated colour themes, a persistent Home / Yoga Sutras / Meditate / Lila dock, and focus mode. Focus mode resizes the existing iframe without changing its source or restarting it. The external full-page link is inside the menu. Active-page links close the menu or remain in place instead of reloading an active practice. App functionality and ongoing updates remain owned by the original repositories and deployments.

## Validation

Run the timer regression suite in its original repository with `npm test` (Node 20+). The tests retained here only cover the archived copy. No build step is required for TJ Advaita. Serve the repository root with a static HTTP server for local preview. The host must serve folder index.html files and redirect folder paths without a trailing slash. Check desktop/mobile menus on the homepage and profiles, all three embedded apps, and the full-page fallback links.

Keep the source and editorial notes with the Yoga Sutra collection. In particular, its existing GRETIL attribution and CC BY-NC-SA terms are unchanged; the collection does not have a blanket unrestricted license.
