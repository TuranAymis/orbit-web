# Orbit Web
![CI](https://github.com/TuranAymis/orbit-web/actions/workflows/ci.yml/badge.svg)
## Acceptance Criteria

- The app boots without crashing.
- `/login` renders outside the protected app shell.
- Protected routes render with sidebar, topbar, and page container primitives.
- Sidebar shows all main navigation entries and marks the active route.
- Sidebar navigation changes the current route when clicked.
- Page containers render title, subtitle, actions, and body content consistently.
- The shell remains usable on smaller widths with a mobile navigation trigger.
- Vitest and React Testing Library cover the first user-visible layout behaviors and pass.

## PWA

Production builds register `/sw.js`. It precaches the app shell and manifest, then caches the generated icons when they exist. Navigation uses the network first and falls back to cached `index.html` offline; versioned `/assets/*` files use cache first. API requests, WebSocket paths, non-GET requests, and other origins bypass the cache. Offline application data and authenticated API responses are outside this cache.

Each build computes a deterministic SHA-256 fingerprint of its emitted files and service worker source. `vite.config.ts` writes the first 16 hex characters into `dist/sw.js` as `CACHE_VERSION`, along with `VITE_ORBIT_API_URL` (or the app default). Changed files automatically create a new cache. To force a cache bump without changing app files, increment the `orbit-pwa-revision-1` salt in `vite.config.ts` and rebuild. The new worker waits until the user clicks **Reload** on the update banner. It then activates, removes old Orbit caches, claims clients, and the page reloads once.

Run `npm run pwa:icons` to generate the three PNG icons from `public/icons/icon.svg` using the installed Playwright Chromium. Generate them before checking installability or deploying. Installability and offline behavior should be checked in a real browser over HTTPS or localhost.

## Offline data

Authenticated Groups and Events list and detail reads save their mapped response data in IndexedDB (`orbit-offline`). Keys are `groups:list`, `events:list`, `group:{id}`, and `event:{id}`, prefixed by the authenticated user ID. A network failure can serve a saved copy up to seven days old; HTTP errors, including 401, always propagate. A banner marks saved data with its age.

Only group join/leave and event RSVP join/leave are available as offline writes. They use the same per-user IndexedDB partition as read caches. For repeated changes to one group or event, the latest intent replaces earlier queued intents; replay follows creation order. The server treats repeated joins and leaves as successful, idempotent requests. Creating or deleting groups/events, chat sends, and profile/settings edits remain online-only and report their errors.

The page replays queued writes after auth is ready, on `online`, when the page becomes visible, and when the service worker sends `FLUSH_OUTBOX` for the `orbit-outbox` Background Sync tag. The service worker cannot access credentials and never sends authenticated requests or caches API traffic. Background Sync depends on browser support and an open window client; the other page triggers remain available. A successful replay refreshes group, event, Discover, and chat queries.

HTTP success removes the intent. A 401 invalidates the session and wipes the user's offline partition. A 404 drops the intent with a “no longer exists” notice; 403 drops it with “not allowed”; other 4xx drop it with a rejection notice. Network and 5xx errors keep the intent, increment attempts, and retry with exponential delays from one second up to one minute. A network failure stops the current pass. After five failed attempts, the intent stops retrying and shows a persistent, dismissible failure notice. The banner shows queued counts, a brief saved/synced confirmation, and notices for every dropped or exhausted intent. Successful replay can resolve to the server's current state if it changed while this device was offline.

Each record has `DATA_VERSION` (currently 1) in `src/shared/lib/offline/offlineCache.ts`. Increment it when the payload or mapper contract changes; older records are ignored and deleted on read. IndexedDB schema migrations belong in `onupgradeneeded` in `keyValueStore.ts`, with a corresponding database schema version increment. Logout and session invalidation remove that user's records, including queued writes and notices. The offline partition contains Group and Event payloads and write intents: no token, `/users/me` response, chat, notifications, or profile data. Browsers without IndexedDB use memory only for the current page lifetime.
