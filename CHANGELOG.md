# Changelog

All notable changes to ChapterLane will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
