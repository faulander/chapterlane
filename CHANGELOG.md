# Changelog

All notable changes to ChapterLane will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
