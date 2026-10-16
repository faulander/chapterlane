# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Readers who run their own ChapterLane instance (alone, with family, or with friends) to track what they read. Personal tracking (library, statuses, progress, statistics) and friend activity (dashboard feed, friends, shared lists) are equally important. Used on phones and desktops; mobile-first responsive (confirmed). Some users read on a KOReader e-reader that syncs progress.

## Product Purpose

A self-hosted book tracker: build a library, set reading statuses, log progress, organize shelves and lists, see statistics, and follow friends' reading. Success is that the reader's data stays on their own server and stays accurate with little manual effort.

## Positioning

Not confirmed in the interview. Repository evidence (README), unconfirmed as the differentiator: self-hosted with Docker and SQLite (data in a local `data/` folder), KOReader e-reader progress sync, and import from Goodreads, StoryGraph and Calibre.

## Operating Context

Deployed with Docker Compose behind an optional HTTPS reverse proxy; the first registered account is the instance owner (sees server logs). Anyone who can reach the site can register. English and German UI (Paraglide). Per-user profile visibility: private, friends, public.

## Capabilities and Constraints

- Library: manual add and Google Books search, covers fetched automatically; custom statuses mapped to planned/active/paused/completed/dropped; reading places; shelves; reading lists; yearly book goal.
- Social: friends, dashboard activity feed (grouped, finished books separate), visibility controls.
- Statistics: books/pages per month, languages, statuses, places, top authors, reading streak (days counted in UTC).
- Import: Goodreads CSV, StoryGraph CSV, Calibre library.
- Device API and KOReader plugin: per-user device keys, percent/status events, retry-safe.
- Appearance: eight themes (ChapterLane, Nord, Catppuccin, Gruvbox, Solarized, Dracula, Tokyo Night, Rosé Pine), each light and dark, plus System mode; set under Settings → Appearance. Themes override only the Tailwind gray and indigo scales.
- Stack: SvelteKit (Svelte 5), Bun, SQLite, Tailwind CSS v4, Paraglide, Chart.js.
- Marking a book reading/paused/completed/dropped needs a total page count (statistics depend on it).

## Evidence on Hand

README.md, CHANGELOG.md, koreader/README.md. No testimonials, customer lists, or benchmarks exist; do not invent any.

## Product Principles

- The reader owns their data: self-hosted, exportable, no vendor dependency.
- Tracking should cost little effort: import, e-reader sync, and sensible defaults over manual entry.
- Privacy is the default; sharing with friends is an explicit choice.
- Works equally well on a phone and at a desk, in English and German.

## Accessibility & Inclusion

No specific standard established. Existing patterns: 44px minimum touch targets, light/dark and theme choices, no-JavaScript fallbacks for key forms.
