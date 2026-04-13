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
- **Statistics** — charts for books/pages by month, by language, by status, by reading place, top authors
- **Multilingual** — full English and German support via Paraglide i18n
- **Dark mode** — system-aware with manual toggle

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

| Variable | Description | Default |
|---|---|---|
| `DATABASE_PATH` | SQLite database location | `data/chapterlane.db` |
| `LOG_LEVEL` | Logging level | `debug` |
| `GOOGLE_BOOKS_API_KEY` | Google Books API key (for search) | — |

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
