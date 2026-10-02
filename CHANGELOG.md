# Changelog

All notable changes to ChapterLane will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Added device keys and an authenticated reading-device API for per-user library discovery and retry-safe status/percent updates
- Added a KOReader plugin with explicit book linking, offline retry-safe progress sync, manual completion, and a usage/implementation guide
- KOReader can import the HTTPS address and device key from a two-line file transferred over USB
- KOReader book linking now starts with an editable fuzzy title filter, ranked matches, and a Show all books option
- Server logs are stored in the database (newest 5,000 kept, unhandled request errors included) and can be browsed by the instance owner under Settings → Server logs, with level, module, and text filters
- Top Authors on the statistics page can be switched between read books, want-to-read books, and all books, and states which one is counted

- Shelves overview now uses visual cards with recent book cover previews and a fallback book icon
- Lists overview now uses matching visual cards with recent book cover previews and visibility/book counts
- List detail pages show each book's current reading status, including a neutral "Not in library" badge

### Changed

- Dashboard activity groups one person's updates to a book (added, started, progress) into a single row with a progress bar; finished books stay separate rows, and updates more than a day apart are not merged
- Dashboard activity rows are compact (small cover, title and story on two lines, time and progress on the right) in one shared list, about half the height of the previous cards
- Dashboard activity shows an icon and color accent per row (finished, milestone, started, added, progress) and groups rows under Today / Yesterday / date headings in the viewer's timezone
- Dashboard activity shows the latest 10 rows with a "Show more" link that reveals 10 more at a time (works without JavaScript)
- Dashboard shows a personal summary when you have no friends: reading streak, days read in the last 7 days and books finished, a yearly book goal ring (set it right on the dashboard), and a strip of recently finished covers
- Book detail page redesigned with a cover-focused hero layout and separate cards for reading state, dates, shelves, and description
- Total pages editing now lives inside the reading-state card instead of a separate awkward section
- Setting a book to a non-planned status now requires a positive total page count so page-based statistics remain accurate
- Setting a book to active or completed automatically fills missing started/finished dates

### Fixed

- Completed books with no progress entries now count their full page count in the pages-read statistics for the finished month
- Pages-read statistics now count progress deltas instead of repeatedly summing absolute current-page values
- Non-planned books can no longer clear their total page count
- Docker deployments now include SQL migrations; startup applies pending schema changes instead of silently skipping them
- KOReader connection failures now show the transport reason or proxy HTTP status instead of a generic network error
- Deployment now keeps remote .env origin and cookie settings when no explicit overrides are passed
- Docker build context now excludes private device-key transfer notes
- KOReader book picker no longer crashes on releases without `util.stringLower`; it falls back to Lua lowercase for matching
- Server logs no longer record 404 responses (such as scanner probes for `/.git/config`) as errors

## [1.3.0] - 2026-04-13

### Added

- Library sort: sort books by title, author, or date added (ascending/descending)
- Book search: separate title and author fields for precise Google Books queries (uses `intitle:`/`inauthor:` API qualifiers)
- Auto cover fetch: immediately fetches cover from Google Books when a book is added without one
- "Add Book" button now goes to search page; manual add available as secondary link
- New activity event types: `book_added`, `book_started` with book_id in all event payloads

### Fixed

- Activity feed survives book deletion: feed query falls back to payload `book_id` when `user_books` row is gone
- Search "In your library" now checks user's actual library, not just catalog existence
- Re-adding a previously deleted book no longer creates duplicates
- Google Books cover applied to existing catalog books that lack one on re-add
- Search deduplicates internal and Google results by title, enriches internal results with Google cover/description
- Source badge shows "Database"/"Datenbank" instead of misleading "Library"

## [1.2.0] - 2026-04-13

### Added

- Dashboard activity feed: shows own activity when no friends are connected (fallback from friend feed)
- Activity events for all progress updates, status changes, book additions, and reading starts
- Feed cards show book cover, title, series name/number, and relative timestamps
- Descriptive feed messages: "read to page 42", "is 66% through", "started reading this", "finished this book", "added this to the library"
- Progress bar on BookCard component (visible in library grid for books with progress)
- i18n messages for all new feed event types (EN + DE)

### Fixed

- Activity events were defined but never emitted — wired up progress logging, status changes, book additions
- Feed queries now join book data (cover, translated title, series) instead of relying solely on payload JSON

## [1.1.1] - 2026-04-10

### Fixed

- Mobile: prevent horizontal overflow on book grid (added `min-w-0` and `overflow-x-hidden` to layout)
- Mobile: reduced book grid gap for tighter fit on small screens
- Mobile: bottom nav labels truncate instead of wrapping (fixes "Meine Bücher" overflow in German)

## [1.1.0] - 2026-04-10

### Added

- Calibre import: reads directly from metadata.db on the filesystem (no CSV upload needed)
- Calibre import: auto-detects custom columns, lets user pick reading status column
- Calibre import: maps custom column values to reading status (EN + DE patterns)
- Calibre import: imports covers from library filesystem into local storage
- Calibre import: imports tags as shelves, series as reading lists (with correct order)
- Calibre import: reads language (ISO 639-3→639-1 mapping), ISBN from identifiers table, pages from custom columns
- Local cover storage service with API endpoint (`/api/covers/[bookId]`)
- Book cards show shelves (amber tags) and reading lists (blue tags), both clickable
- Book cards: author names are clickable, filtering library by that author
- i18n messages for Calibre import flow (EN + DE)

### Fixed

- Status badges now use i18n translations instead of raw English DB labels
- Status dropdown on book detail page is translated
- Statistics: pages read chart now accounts for percent-based progress entries
- Statistics: Chart.js navigation bug fixed (double-destroy in effect cleanup)
- Statistics: disabled chart animations for faster rendering
- Cover fetcher: fixed extra argument in titleMatches call

## [1.0.1] - 2026-04-09

### Fixed

- Google Books API key now loaded via `$env/dynamic/private` (was missing from `process.env`)
- Background cover fetcher: 5min backoff on 429, stops after 3 consecutive rate limits, resumes on restart
- Cover title matching relaxed: author fallback for translated titles, lower word overlap threshold
- Removed per-book cover fetch during import (was causing immediate rate limits)
- Cover fetch triggers on server startup for books missing covers
- Import upload and confirm forms: removed `use:enhance` to fix redirect issues
- Import now runs in background with live progress bar on summary page
- Import preview: language selector (defaults to DE), auto-scrolls to bottom
- Library page: search filter now updates page counts and pagination
- Paraglide locale switching: added `data-sveltekit-reload`, URL strategy enabled, hooks reordered
- Bun runtime: switched to `bunx --bun vite` for native `bun:sqlite` and `Bun.password` support

## [1.0.0] - 2026-04-09

### Added

- Settings hub page with links to all settings sections
- Profile settings: edit display name, bio, avatar URL
- Privacy settings: profile visibility (public/friends/private)
- Language settings: preferred language selection (persisted to DB)
- i18n messages for settings, profile, privacy, language (en + de)
- Fixed root layout to use navigation helper for Paraglide compatibility

## [0.9.0] - 2026-04-09

### Added

- Statistics DB module with queries for books/pages by month, language, status, reading place, top authors
- Statistics page with Chart.js bar/doughnut charts and year selector
- ChartCanvas Svelte wrapper for Chart.js with reactive data
- StatCard component for key metrics display
- i18n messages for statistics (en + de)

## [0.8.0] - 2026-04-09

### Added

- Reading lists migration: reading_lists and reading_list_items tables
- Lists DB module: CRUD, items with position ordering, reorder support
- Lists page with create/delete and item counts
- List detail page with ordered book items and remove actions
- i18n messages for lists (en + de)

## [0.7.0] - 2026-04-09

### Added

- Social migration: friend_requests, friendships, blocks, activity_events tables
- Friends DB module: send/accept/reject requests, remove/block, search users
- Feed DB module: create events, query friend feed with visibility and block filtering
- Feed service with event emission helpers (status change, completion, progress milestones)
- Friends page: search users, send requests, accept/reject pending, remove friends
- User profile page with privacy-aware activity display
- Dashboard now shows friend activity feed
- i18n messages for friends, feed, profile (en + de)

## [0.6.0] - 2026-04-09

### Added

- Import system: migration for import_jobs and import_rows tables
- CSV parser with quoted field support
- Goodreads CSV parser with status mapping (to-read/currently-reading/read)
- StoryGraph CSV parser with status mapping
- Calibre CSV parser for library exports
- Import matcher with fuzzy title/author matching via FTS
- Import service: parse, preview, confirm, batch-execute with transaction safety
- Import upload page with source selection and file upload
- Import preview page with accept/skip toggles per row and confidence indicators
- Import summary page with imported/skipped/error counts
- Import history list on upload page
- i18n messages for import UI in English and German

## [0.5.0] - 2026-04-09

### Added

- Google Books API integration for external book search
- External search service combining internal FTS and Google Books results
- Book search page with combined internal/external results
- Add-from-external flow: creates book, links external ref, adds to library
- Deduplication via external_book_refs when adding Google Books results
- i18n messages for search UI in English and German

## [0.4.0] - 2026-04-09

### Added

- Progress migration: reading_places and progress_entries tables
- Reading places DB module with CRUD operations
- Progress DB module for creating and querying progress entries
- Progress service with Active-status validation and auto-percent calculation
- Book detail page: progress form, progress bar, progress history timeline (Active books only)
- Book detail page: total pages setting
- Currently Reading page with inline quick-progress updates per book
- Reading places settings page with create/delete
- i18n messages for progress, reading places, currently reading (en + de)

## [0.3.0] - 2026-04-09

### Added

- Shelves migration: shelves and shelf_books tables
- Shelves DB module with full CRUD and book count queries
- Library browsing page with status filter tabs (All/Planned/Active/Paused/Completed/Dropped)
- BookCard and StatusBadge UI components
- Book detail page: status selector, date fields, shelf management (add/remove)
- Shelves list page with create/delete and book counts
- Shelf detail page with book grid and remove actions
- Custom status management page (create/delete, system categories)
- i18n messages for library, shelves, statuses, and visibility in English and German

## [0.2.1] - 2026-04-09

### Fixed

- Language switcher now triggers full page reload via data-sveltekit-reload
- Paraglide URL strategy enabled (was missing "url" in strategy config)
- Hooks order: Paraglide middleware now wraps auth for proper locale context
- Switched to Bun runtime for Vite (bunx --bun), enabling bun:sqlite and Bun.password natively
- Removed better-sqlite3 and bcryptjs dependencies in favor of Bun built-ins

## [0.2.0] - 2026-04-09

### Added

- Books migration: books, book_title_translations, authors, book_authors, external_book_refs tables
- Content-backed FTS5 full-text search with books_search table and auto-sync triggers
- User books migration: status_definitions (5 system defaults), user_books, user_book_status_history
- DB modules: books, authors, search, library, statuses (all with prepared statements)
- Book service: addBook with author linking, FTS indexing, and title translation support
- Book detail page with translated title display and language fallback
- Manual add-book page with form validation
- Navigation helper (href utility) wrapping Paraglide localizeHref + resolve
- i18n messages for book-related UI in English and German

## [0.1.0] - 2026-04-09

### Added

- SQLite database connection with WAL mode via better-sqlite3
- Migration runner with version tracking
- Foundation migration: users and sessions tables
- User registration with Argon2id password hashing
- User login with session-based authentication
- Logout with session cleanup
- Auth middleware in hooks.server.ts (chained with Paraglide via sequence)
- Structured logger with levels (debug, info, warn, error) and module context
- Shared TypeScript types for all data entities
- Reusable UI components: Button, Input, FormError, ThemeToggle
- Dark/light mode with Tailwind CSS class strategy and localStorage persistence
- Mobile-first app shell with bottom tab navigation (mobile) and sidebar (desktop)
- Top navigation bar with language switcher and theme toggle
- Login and registration pages with form validation
- Dashboard placeholder page
- Paraglide i18n messages for English and German
- Root page redirect (authenticated -> dashboard, unauthenticated -> login)
