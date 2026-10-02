# ChapterLane

A social reading tracker and personal library app. Track what you read, organize books with shelves and lists, log reading progress, connect with friends, and explore your reading statistics.

Inspired by Goodreads, StoryGraph, and Calibre — built for readers who want a cleaner, more flexible, multilingual experience.

## Features

- **Library management** — add books manually or via Google Books search, organize with custom shelves and reading lists
- **Reading progress** — track pages/percent, log reading sessions with notes and reading places
- **Custom statuses** — define your own reading statuses beyond the defaults (planned, active, paused, completed, dropped)
- **Activity feed** — see your own activity and your friends' updates (progress milestones, status changes, completions)
- **Social** — add friends, share activity, view profiles with privacy controls
- **Import** — bring your library from Goodreads (CSV), StoryGraph (CSV), or Calibre (direct DB import with covers, tags, and series)
- **Statistics** — charts for books/pages by month, by language, by status, by reading place, and top authors (read books by default; switchable to want-to-read or all books)
- **Multilingual** — full English and German support via Paraglide i18n
- **Dark mode** — system-aware with manual toggle

## Reading device API

Create a revocable device key at **Settings → Reading devices**. Copy it immediately; only its SHA-256 digest is stored. Use HTTPS for any device connection. A key grants access only to its owner's library and reading updates. Revoke it from the same settings page.

Use `Authorization: Bearer <key>` on both endpoints:

- `GET /api/device/books` returns `{ books: [{ book_id, title, authors, status, percent }] }`. Select a `book_id` explicitly; never auto-select the first matching title.
- `POST /api/device/sync` accepts JSON `{ "event_id": "unique-stable-id", "book_id": "book-id", "status": "active", "percent": 42 }`. `status` is optional (`active` or `completed`); `percent` is optional (0–100); at least one is required. `event_id` must remain the same across retries and be unique for each new event on that key. The response is `{ "result": "applied" }` or `{ "result": "duplicate" }`.

Only books already in the owner's library can be updated. A planned book may be activated by an event containing status "active" and percent, without a page count; completion requires an active book. Paused, dropped and completed books reject new updates with HTTP 409 rather than being silently reopened. Unknown books return 404; missing/invalid keys return 401; malformed events return 400. Retries with an already-applied event ID do not create extra progress or status history. Percent is independent of device pagination; the API does not infer physical page counts.

Install the bundled KOReader plugin from koreader/chapterlane.koplugin/. See the [KOReader usage and implementation guide](koreader/README.md) for installation, book linking, sync behavior, and troubleshooting.

## Server logs

Log entries at or above `LOG_LEVEL` are also stored in the database (newest 5,000 kept, including unhandled request errors). The instance owner — the first registered account — can browse them at **Settings → Server logs**, filtered by minimum level, module, and text. Other accounts get a 403. Entries can contain personal data such as email addresses from failed logins. Raise `LOG_LEVEL` to `info` or higher in production to avoid storing debug noise.

## Tech Stack

- [SvelteKit](https://svelte.dev) (Svelte 5, runes mode)
- [Bun](https://bun.sh) runtime
- SQLite via `bun:sqlite`
- [Tailwind CSS](https://tailwindcss.com)
- [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for i18n
- [Chart.js](https://www.chartjs.org) for statistics
- [svelte-lucide](https://github.com/shinokada/svelte-lucide) for icons

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0

### Install

```sh
git clone <repo-url> chapterlane
cd chapterlane
bun install
```

### Configure

Copy the example env file and set your values:

```sh
cp .env.example .env
```

| Variable               | Description                       | Default               |
| ---------------------- | --------------------------------- | --------------------- |
| `DATABASE_PATH`        | SQLite database location          | `data/chapterlane.db` |
| `LOG_LEVEL`            | Logging level                     | `debug`               |
| `GOOGLE_BOOKS_API_KEY` | Google Books API key (for search) | —                     |

### Run

```sh
bun run dev
```

The app will be available at `http://localhost:5173`. The database and tables are created automatically on first run.

### Build for Production

```sh
bun run build
bun run preview
```

Uses the SvelteKit Node adapter.

### Docker

```sh
docker compose up --build
```

The container listens on port `3000` and stores persistent data in `./data` mounted at `/app/data`.

For Calibre import, the library folder is bind-mounted read-only into the
container at the same path so it matches what you enter in the "Calibre
Library Path" field. Override the host source with `CALIBRE_LIBRARY_PATH`
(default `/mnt/HD2/BACKUP/CALIBRE_BOOKS`):

```sh
CALIBRE_LIBRARY_PATH=/path/to/your/calibre/library docker compose up --build
```

### Deploy

Deploy to the configured server:

```sh
bun run deploy
```

Defaults:

- Host: `192.168.42.167` (SSH key auth)
- Directory: `/mnt/HD4/Docker/own/chapterlane`
- App port, origin, cookie mode, log level, and Google Books key come from
  the remote .env or docker-compose.yml unless explicitly overridden.

> `ORIGIN` must exactly match how the app is reached in the browser
> (SvelteKit rejects form submissions whose `Origin` header doesn't match).
> If you change `CHAPTERLANE_PORT`, pass a matching `APP_ORIGIN` too, e.g.
> `CHAPTERLANE_PORT=8080 APP_ORIGIN=http://192.168.42.167:8080 bun run deploy`.

Optional overrides:

```sh
DEPLOY_HOST=other.host DEPLOY_USER=myuser bun run deploy
# override what's passed through to the remote docker-compose.yml
CHAPTERLANE_PORT=8080 APP_ORIGIN=https://books.example.com bun run deploy
COOKIE_SECURE=true bun run deploy
```

Password auth is supported if `sshpass` is installed (SSH keys are used by default):

```sh
DEPLOY_USER=myuser bun run deploy -- --password 'your-password'
# or
DEPLOY_USER=myuser DEPLOY_PASSWORD='your-password' bun run deploy
```

Each deploy rsyncs the app (excluding `data/`) to the remote directory, then
runs `docker compose up -d --build` to rebuild the image and restart the
container. The remote `data/chapterlane.db*` and `data/covers/` are seeded
only if missing; existing runtime data is never overwritten.

## Project Structure

```
src/
  lib/
    components/    # Reusable UI components (BookCard, Button, StatusBadge, etc.)
    paraglide/     # Generated i18n messages
    server/
      db/          # SQLite queries and migrations
      services/    # Business logic (progress, feed, import, covers)
      utils/       # Logger, crypto helpers
    types.ts       # Shared TypeScript interfaces
    utils/         # Client-side utilities
  routes/
    (app)/         # Authenticated app routes (dashboard, books, reading, etc.)
    (auth)/        # Login and registration
messages/          # i18n message files (en.json, de.json)
data/              # SQLite database (created at runtime)
```

## License

Private.
