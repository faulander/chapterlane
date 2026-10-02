# ChapterLane

A self-hosted reading tracker and personal library. Keep track of what you read, organize books on shelves and in lists, log your progress, follow friends, and see your reading habits in charts. It syncs with KOReader e-readers.

Inspired by Goodreads, StoryGraph, and Calibre, for readers who want a cleaner, more flexible, multilingual app they run themselves. Your data lives in one SQLite file on your own server.

## What you can do

- **Build a library**: add books manually or through Google Books search, with covers fetched automatically.
- **Organize**: shelves for tags, reading lists for series and plans, and your own reading statuses on top of the defaults (want to read, reading, on hold, completed, dropped).
- **Track progress**: log pages or percent, with notes and where you read.
- **Sync your e-reader**: a KOReader plugin sends your reading progress automatically.
- **See your dashboard**: books you are reading, a compact activity feed grouped by day, and (if you have no friends yet) your reading streak, a yearly book goal, and your recently finished covers.
- **Read with friends**: add friends, share activity, and control who sees your profile (private, friends, or public).
- **Look at statistics**: books and pages per month, languages, statuses, reading places, and top authors (read books by default, or want-to-read, or everything).
- **Import**: bring your library from Goodreads (CSV), StoryGraph (CSV), or a Calibre library (covers, tags, and series included).
- **Use it in English or German**, in light or dark mode.

## Quick start with Docker

You need [Docker](https://docs.docker.com/get-docker/) with Compose.

```sh
git clone <repo-url> chapterlane
cd chapterlane

cat > .env <<'EOF'
APP_ORIGIN=http://localhost:3002
COOKIE_SECURE=false
EOF

docker compose up -d --build
```

Open <http://localhost:3002> and create an account. **The first account you create becomes the owner** of the instance (it is the only one that can see the server logs).

> **`APP_ORIGIN` must be exactly the address you type in your browser**, for example `http://192.168.1.20:3002` or `https://books.example.com`. If it differs, signing in fails with a 403 error. Without the setting, the compose file falls back to a placeholder address that is almost certainly wrong for you.

### Settings

Put these in the `.env` file next to `docker-compose.yml`.

| Variable               | What it does                                                                                            | Default                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `APP_ORIGIN`           | The address you use to reach the app. Required for sign-in to work.                                     | a placeholder, set it         |
| `CHAPTERLANE_PORT`     | Port on your machine.                                                                                   | `3002`                        |
| `COOKIE_SECURE`        | Set to `true` when you use `https://`; keep `false` for plain `http://` (otherwise you cannot sign in). | `false`                       |
| `LOG_LEVEL`            | `debug`, `info`, `warn`, or `error`.                                                                    | `info`                        |
| `GOOGLE_BOOKS_API_KEY` | Optional. Search and cover lookups work without it but may be rate limited.                             | empty                         |
| `CALIBRE_LIBRARY_PATH` | Folder of your Calibre library, only for Calibre import (see below).                                    | a placeholder, set it if used |

Your data is stored in the `data/` folder next to the compose file (the database and downloaded covers).

## Using ChapterLane over the internet

1. Put it behind a reverse proxy that provides HTTPS (for example Nginx Proxy Manager, Caddy, or Traefik) and forwards to the port above.
2. Set `APP_ORIGIN=https://your.domain` and `COOKIE_SECURE=true`, then restart with `docker compose up -d`.
3. The proxy must pass the original host and protocol on as the standard `X-Forwarded-Host` and `X-Forwarded-Proto` headers; most proxies do this by default.

> **Anyone who can reach the site can register an account.** There is no setting to turn registration off. If the instance is just for you or your family, keep it on your home network or behind a VPN, or restrict access in your reverse proxy.

## First steps

1. **Add books** from **My Books**: search Google Books, or add one by hand.
2. **Set a status** on each book. Marking a book as reading, paused, completed, or dropped needs a total page count, because the statistics use it.
3. **Organize** with shelves and reading lists, and adjust your statuses and reading places under **Settings**.
4. **Log progress** on a book's page, or let your e-reader do it (see below).
5. Check the **Dashboard** and **Stats** pages as you go.

### Importing your existing library

Go to **Settings → Import Books**.

- **Goodreads or StoryGraph**: export your library as CSV from their website and upload it.
- **Calibre**: Calibre's library has to be visible to the container. Set `CALIBRE_LIBRARY_PATH` to your library folder in `.env` and restart. The folder is mounted read-only at the same path inside the container; enter that path on the Calibre import page. Tags become shelves, series become reading lists, and covers are copied.

## Syncing a KOReader e-reader

The `koreader/chapterlane.koplugin/` folder is a KOReader plugin that sends your reading progress to ChapterLane and picks your book with a title search. It needs **KOReader 2024.01 or newer** and your site to be reachable over **HTTPS** from the device.

1. In ChapterLane, open **Settings → Reading devices** and create a key. Copy it right away; it is shown only once.
2. Install the plugin on the device and enter your address and key.
3. Open a book and choose **Link this book**. If Wi-Fi is off, the plugin switches it on for you (set KOReader's **Network → Action when Wi-Fi is off** to **Turn on** to skip the confirmation).

Books you start from KOReader do not ask for a page count. Add one on the book's page in ChapterLane so the page statistics include it; the plugin only sends a percentage.

The [KOReader guide](koreader/README.md) has the step-by-step setup, copying the key to the device over USB, and troubleshooting.

## Updating and backups

**Update**

```sh
git pull
docker compose up -d --build
```

Database changes are applied automatically when the app starts.

**Back up** the whole `data/` folder. For a consistent copy, stop the app first:

```sh
docker compose stop
cp -r data /path/to/backup/
docker compose start
```

## Privacy and security notes

- Passwords are stored hashed with argon2id. Device keys are stored only as a one-way digest, so a lost key cannot be shown again; create a new one and revoke the old one.
- Book searches and cover lookups are sent to Google Books.
- The owner can browse recent server logs under **Settings → Server logs**. They can contain personal data, such as the email address used in a failed sign-in.
- Reading streaks count days in UTC.

## Reading device API

This reference is for building other clients. The KOReader plugin uses it.

Create a revocable device key at **Settings → Reading devices**. Copy it immediately; only its SHA-256 digest is stored. Use HTTPS for any device connection. A key grants access only to its owner's library and reading updates. Revoke it from the same settings page.

Use `Authorization: Bearer <key>` on both endpoints:

- `GET /api/device/books` returns `{ books: [{ book_id, title, authors, status, percent }] }`. Select a `book_id` explicitly; never auto-select the first matching title.
- `POST /api/device/sync` accepts JSON `{ "event_id": "unique-stable-id", "book_id": "book-id", "status": "active", "percent": 42 }`. `status` is optional (`active` or `completed`); `percent` is optional (0–100); at least one is required. `event_id` must remain the same across retries and be unique for each new event on that key. The response is `{ "result": "applied" }` or `{ "result": "duplicate" }`.

Only books already in the owner's library can be updated. A planned book may be activated by an event containing status "active" and percent, without a page count; completion requires an active book. Paused, dropped and completed books reject new updates with HTTP 409 rather than being silently reopened. Unknown books return 404; missing/invalid keys return 401; malformed events return 400. Retries with an already-applied event ID do not create extra progress or status history. Percent is independent of device pagination; the API does not infer physical page counts.

## Development

Built with [SvelteKit](https://svelte.dev) (Svelte 5), the [Bun](https://bun.sh) runtime, SQLite (`bun:sqlite`), [Tailwind CSS](https://tailwindcss.com), [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for translations, and [Chart.js](https://www.chartjs.org).

```sh
bun install
cp .env.example .env
bun run dev          # http://localhost:5173, database created on first run
```

Useful commands:

```sh
bun run check                   # type-check
bun run lint                    # prettier + eslint
bunx vitest run --project server  # unit tests
bun run build && bun run preview  # production build
```

```
src/
  lib/
    components/    # UI components
    server/        # database (db/), business logic (services/), helpers (utils/)
    utils/         # shared helpers
  routes/
    (app)/         # signed-in pages
    (auth)/        # sign in and registration
    api/device/    # reading device API
messages/          # translations (en.json, de.json)
koreader/          # KOReader plugin and its guide
data/              # database and covers (created at runtime)
```

Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## License

Private.
