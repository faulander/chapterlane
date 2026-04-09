Absolutely — here is a full updated PRD for ChapterLane.

# PRD: ChapterLane

Version: 0.2
Status: Draft
Product Type: Social reading tracker and library app
Platform: Web app
Tech Stack: Bun, SvelteKit, SQLite via `bun:sqlite`, Tailwind CSS, `svelte-lucide`

## 1. Product Overview

ChapterLane is a social reading app that lets users build and organize their personal library, track reading progress, create custom shelves and custom statuses, define reading places, connect with friends, create reading lists, and explore reading statistics.

The app is inspired by the best parts of Goodreads, StoryGraph, and Calibre, while aiming for a cleaner, more flexible, multilingual experience.

Core principles:

- books are tracked as works, not editions
- users can organize books in their own way
- social activity should feel useful, not noisy
- imports should make switching easy
- statistics should be rich, but not complicated

## 2. Vision

ChapterLane should become a reader’s personal and social home for books:

- a place to track what they read
- a place to organize books with shelves and lists
- a place to see what friends are reading
- a place to understand their reading habits over time

## 3. Problem Statement

Readers often use multiple disconnected tools:

- Goodreads for social updates
- StoryGraph for reading stats
- Calibre for library management
- notes or memory for reading progress and reading context

These tools often have one or more of these problems:

- limited flexibility in organizing books
- weak support for custom reading workflows
- cluttered or outdated UX
- poor import or migration experience
- limited multilingual handling
- overemphasis on editions when users mostly care about the work itself

ChapterLane solves this by combining:

- personal library management
- flexible progress tracking
- social reading features
- import support
- meaningful statistics
- multilingual support

## 4. Goals

### Primary Goals

1. Let users build a personal library of books.
2. Let users create custom shelves and custom statuses.
3. Let users track reading progress for actively read books.
4. Let users define reading places such as devices, contexts, or locations.
5. Provide social features such as friendships, activity feed, and reading lists.
6. Offer useful reading statistics.
7. Support importing from Goodreads, StoryGraph, and Calibre.
8. Support book discovery and adding through external search providers such as Google Books.

### Secondary Goals

1. Support multilingual book metadata and UI.
2. Keep the architecture simple and robust using Bun, SvelteKit, and SQLite.
3. Make the app fast for everyday use.
4. Keep the data model edition-agnostic.

## 5. Non-Goals

For v1, ChapterLane will not focus on:

- in-app ebook reading
- audiobook playback
- bookstore or commerce features
- explicit edition tracking such as paperback vs hardcover vs epub
- advanced recommendation engine
- large-scale review/comment community features
- native mobile apps
- full public book database moderation workflows

## 6. Target Users

### 1. Social Readers

Users who want to see what friends are reading, share lists, and discover books socially.

### 2. Organized Readers

Users who care about shelves, reading statuses, and structured reading workflows.

### 3. Reading Trackers

Users who want progress, pace, reading place tracking, and statistics.

### 4. Migrators

Users who already have book data in Goodreads, StoryGraph, or Calibre.

### 5. Multilingual Readers

Users who read in different languages and want original and translated titles handled properly.

## 7. Core Product Concepts

## 7.1 Books are Works, Not Editions

A book in ChapterLane is treated as a work-level object, not a format-specific edition.

Each book should support:

- original title
- original language
- translated or localized titles
- author or authors
- optional description
- optional cover image
- optional external identifiers

Important:

- ChapterLane does not model paperback, hardcover, epub, mobi, etc. as separate records.
- if a user tracks pages, those page counts are user-specific, not global, because different copies can have different lengths.

## 7.2 User Library

A user can add a book to their library and then organize it with:

- shelves
- status
- progress
- reading places
- notes in future versions

The user library is the center of the product.

## 7.3 Shelves

Shelves are user-defined collections of books.

Examples:

- favorites
- science fiction
- owned
- to buy
- 2026 reads
- comfort reads

Rules:

- users can create, rename, and delete shelves
- a book can be on multiple shelves
- shelves can be private, friends-only, or public
- shelves can optionally have descriptions

## 7.4 Statuses

Users can create their own statuses, but for consistent logic and statistics each status maps to a fixed system category.

System categories:

- Planned
- Active
- Paused
- Completed
- Dropped

Examples:

- currently reading → Active
- rereading → Active
- on hold → Paused
- finished → Completed
- dnf → Dropped
- want to buy → Planned

Rules:

- every user gets default statuses on signup
- users can create, edit, and remove custom statuses
- one book has only one current status per user
- only Active statuses support live reading progress

## 7.5 Reading Progress

When a book is in an Active status, the user can update progress.

Supported fields:

- current page
- total pages for the user’s copy
- percentage complete
- update timestamp
- optional note
- optional reading place

Rules:

- total pages belong to the user-book relationship, not the global book
- percentage can be manually entered
- percentage can be derived from page values when total pages are known
- progress history should be preserved

## 7.6 Reading Places

Users can create reading places to represent where or how they read.

Examples:

- ebookreader1
- ebookreader2
- hardcover
- office
- at home
- commute
- bed
- café

Rules:

- users can create, edit, and delete reading places
- progress entries can reference a reading place
- statistics can be broken down by reading place

## 7.7 Friends

Users can connect with other users through mutual friendship.

Supported actions:

- send friend request
- accept request
- reject request
- remove friend
- block user

## 7.8 Dashboard / Activity Feed

The dashboard shows recent activity from friends.

Example events:

- started reading a book
- changed status
- updated progress
- finished a book
- added a book to a shelf
- created a reading list
- added a book to a reading list

Rules:

- activity must respect privacy settings
- progress activity should be batched or milestone-based to avoid spam
- dashboard should feel fresh and useful

## 7.9 Reading Lists

Reading lists are user-created collections intended for sharing or curation.

Examples:

- best novels under 300 pages
- books for rainy weekends
- favorite travel memoirs
- 2026 reading challenge

Rules:

- users can create lists
- lists can contain ordered items
- each item can optionally have a note
- list visibility can be private, friends-only, or public

## 7.10 Statistics

Users should be able to see meaningful statistics about their reading habits.

Examples:

- books completed by month or year
- pages read over time
- reading by language
- reading by author
- reading by shelf
- reading by status
- reading by reading place
- current books in progress
- completion trends
- yearly recap

## 8. User Stories

### Library

- As a user, I want to add a book to my library so I can track it.
- As a user, I want to search for books and add them quickly.
- As a user, I want to create my own shelves.
- As a user, I want to place a book on multiple shelves.

### Statuses and Progress

- As a user, I want to create custom statuses that match my reading habits.
- As a user, I want to mark a book as currently reading.
- As a user, I want to update pages and percentage while reading.
- As a user, I want to log where I am reading a book.

### Social

- As a user, I want to add friends.
- As a user, I want to see what my friends are reading.
- As a user, I want to create and share reading lists.

### Imports

- As a user, I want to import my Goodreads data.
- As a user, I want to import my StoryGraph data.
- As a user, I want to import my Calibre library data.

### Statistics

- As a user, I want to understand how much I read.
- As a user, I want to see trends over time.
- As a user, I want statistics by language, place, and status.

## 9. Functional Requirements

## 9.1 Authentication and Accounts

Must have:

- sign up
- login
- logout
- password reset
- session management
- account deletion

Should have:

- email verification
- export personal data

## 9.2 Profiles

Must have:

- username
- display name
- optional avatar
- bio
- preferred language
- privacy settings

Should have:

- reading goal fields
- favorite genres or tags in future versions

## 9.3 Book Catalog

Must have:

- internal catalog of works
- original title
- original language
- translated/localized titles
- authors
- optional cover image
- optional description
- external source identifiers
- search by title and author
- manual add if external search fails

Should have:

- merge and dedupe tooling for admins
- alias support for alternate spellings

Important:
Even though edition data is out of scope, authors are still required for usability, search, import matching, and duplicate prevention.

## 9.4 Multilingual Support

Must have:

- multilingual UI support
- user-selected preferred language
- display translated title if available in user language
- fallback to original title when no translation exists
- search across original and translated titles

## 9.5 Shelves

Must have:

- create shelf
- edit shelf
- delete shelf
- add book to shelf
- remove book from shelf
- shelf visibility control

Should have:

- manual ordering
- shelf description
- shelf cover or icon in future versions

## 9.6 Statuses

Must have:

- default statuses for new users
- custom statuses per user
- mapping of custom status to system category
- set current status on a user-book
- retain status history

Should have:

- reorder statuses in settings
- status colors or icons

## 9.7 User-Book Tracking

Must have:

- a user can add a book to their library
- a user can assign a current status
- a user can define total pages for their copy
- a user can track current page and percent
- a user can store started date and finished date
- a user can preserve historical progress changes

Should have:

- reread count
- backdated updates

## 9.8 Reading Places

Must have:

- create, edit, delete reading place
- attach reading place to progress entries

Should have:

- color or icon
- default sorting

## 9.9 Progress Updates

Must have:

- create progress entry
- edit latest entry if needed
- store timestamp
- optionally store note
- optionally store reading place
- recalculate current progress values

Should have:

- milestone feed generation
- progress calendar view

## 9.10 Friends

Must have:

- search users
- send friend request
- accept or reject friend request
- remove friend
- block user

Should have:

- pending request list
- privacy controls for who can send requests

## 9.11 Dashboard Feed

Must have:

- recent friend activity view
- support for the key event types
- privacy-aware event filtering

Should have:

- filters by event type
- hidden activity preferences
- grouped progress events

## 9.12 Reading Lists

Must have:

- create, edit, delete lists
- add books to lists
- remove books from lists
- reorder list items
- set visibility
- title and description

Should have:

- item notes
- ranked lists
- list reactions or comments later

## 9.13 Statistics

Must have:

- books completed by month and year
- pages read by month and year
- current active reads
- books by language
- books by status
- books by shelf
- books by reading place
- top authors
- average pages per completed book

Should have:

- reading streaks
- pace trends
- yearly recap
- completion time averages
- charts and visual summaries

## 9.14 Imports

Must have:

- Goodreads import
- StoryGraph import
- Calibre import
- import preview
- duplicate detection
- import summary
- non-destructive merge behavior

Should have:

- saved import mappings
- re-run failed imports
- better field matching assistance

Recommended v1 scope:

- Goodreads CSV import
- StoryGraph CSV import
- Calibre CSV or metadata export import

Direct reading of Calibre `metadata.db` can be considered later.

## 9.15 External Search and Add

Must have:

- search external providers such as Google Books
- show title, author, language, and cover when available
- allow adding selected result to internal catalog
- prevent duplicates where possible

Should have:

- Open Library integration
- caching external results
- multiple provider fallback logic

## 10. Product Rules

1. A book is modeled as a work, not an edition.
2. A user can assign one current status per book.
3. A user can add the same book to multiple shelves.
4. Only Active statuses allow live progress updates.
5. Page counts are user-specific, not global.
6. Book titles should display in the user’s preferred language when available.
7. All social data must respect privacy settings.
8. Imports must be previewable and non-destructive.
9. Progress history should not be lost when current progress changes.
10. Feed generation should avoid excessive noise from minor progress updates.

## 11. Privacy and Visibility

Visibility should apply to:

- profile
- shelves
- reading lists
- reading activity

Visibility levels:

- private
- friends-only
- public

Privacy requirements:

- blocked users cannot interact or view protected content
- users can hide parts of their reading activity
- private shelves and private lists must never appear in social feed
- feed inclusion must be privacy-aware at event creation and at feed read time

## 12. MVP Scope

## Included in MVP

- authentication and profile
- internal book catalog
- multilingual titles
- author support
- add/search books
- Google Books integration
- custom shelves
- custom statuses with system category mapping
- active reading tracking
- page and percent progress
- reading places
- friend requests and friendships
- dashboard feed
- reading lists
- basic statistics
- Goodreads import
- StoryGraph import
- basic Calibre import
- privacy settings

## Excluded from MVP

- ratings and reviews
- comments on books or lists
- collaborative lists
- recommendation engine
- notifications beyond basic UI status
- native mobile apps
- edition-level model

## 13. Post-MVP Ideas

- ratings and reviews
- comments and reactions
- collaborative reading lists
- yearly reading challenge
- custom goals
- recommendation engine
- better duplicate merge tools
- Open Library and additional metadata providers
- richer dashboards
- push/email notifications
- mobile app
- optional edition layer if ever required

## 14. UX / UI Principles

### Design Goals

- calm, readable, book-first UI
- fast navigation between library, reading, lists, and feed
- clear separation between personal organization and social discovery
- mobile-friendly responsive web app
- accessible interaction patterns

### UI Stack

- Tailwind CSS for styling
- `svelte-lucide` for iconography

### Suggested Primary Navigation

- Dashboard
- My Books
- Shelves
- Lists
- Stats
- Friends
- Profile

### Key UI Screens

1. Dashboard
2. Library / My Books
3. Book detail page
4. Add/Search books page
5. Shelf detail page
6. Reading list detail page
7. Stats page
8. Friends page
9. Profile and settings
10. Import page

## 15. Data Model Overview

This is a logical model, not the final SQL schema.

### Core Entities

- users
- sessions
- profiles
- friendships
- friend_requests
- blocks

- books
- book_title_translations
- authors
- book_authors
- external_book_refs

- user_books
- status_definitions
- user_book_status_history

- shelves
- shelf_books

- reading_places
- progress_entries

- reading_lists
- reading_list_items

- activity_events

- import_jobs
- import_rows
- import_matches

## 15.1 Recommended Entity Notes

### books

Stores work-level book data:

- id
- original_title
- original_language
- description
- cover_url
- created_at
- updated_at

### book_title_translations

Stores translated or localized titles:

- id
- book_id
- language_code
- translated_title

### authors

- id
- name
- sort_name optional

### book_authors

Many-to-many join:

- book_id
- author_id
- author_order

### user_books

Stores the relationship between a user and a book:

- id
- user_id
- book_id
- current_status_id
- started_at
- finished_at
- user_total_pages
- current_page
- current_percent
- reread_count
- created_at
- updated_at

This is the key table that solves page tracking without editions.

### status_definitions

Per-user status definitions:

- id
- user_id nullable for system defaults
- label
- system_category
- sort_order
- is_default
- is_active

### user_book_status_history

- id
- user_book_id
- status_id
- changed_at

### shelves

- id
- user_id
- name
- description
- visibility
- sort_order

### shelf_books

- shelf_id
- user_book_id
- added_at

### reading_places

- id
- user_id
- name
- icon optional
- color optional
- sort_order

### progress_entries

- id
- user_book_id
- page
- percent
- reading_place_id nullable
- note nullable
- created_at

### reading_lists

- id
- user_id
- title
- description
- visibility
- created_at
- updated_at

### reading_list_items

- id
- list_id
- book_id
- note nullable
- position
- added_at

### friendships

- user_id
- friend_user_id
- created_at

### friend_requests

- id
- sender_user_id
- receiver_user_id
- status
- created_at
- responded_at

### activity_events

- id
- actor_user_id
- event_type
- object_type
- object_id
- visibility
- payload_json
- created_at

### import_jobs

- id
- user_id
- source
- status
- started_at
- finished_at
- summary_json

## 16. Technical Architecture

## 16.1 Stack

- Runtime: Bun
- Framework: SvelteKit
- Database: SQLite
- Driver: `bun:sqlite`
- Styling: Tailwind CSS
- Icons: `svelte-lucide`

## 16.2 Database Approach

- raw SQL only
- no ORM
- domain-based query modules
- prepared statements for frequent queries
- explicit transactions for multi-step operations
- SQLite WAL mode enabled
- indexes added for all common lookup paths
- FTS5 used for title and author search

## 16.3 Suggested Backend Structure

Example structure:

- `src/lib/server/db/connection.ts`
- `src/lib/server/db/migrations/`
- `src/lib/server/db/users.ts`
- `src/lib/server/db/books.ts`
- `src/lib/server/db/library.ts`
- `src/lib/server/db/statuses.ts`
- `src/lib/server/db/progress.ts`
- `src/lib/server/db/friends.ts`
- `src/lib/server/db/feed.ts`
- `src/lib/server/db/imports.ts`

Service layer examples:

- `src/lib/server/services/book-service.ts`
- `src/lib/server/services/import-service.ts`
- `src/lib/server/services/feed-service.ts`

## 16.4 Search

Internal search should support:

- original title
- translated title
- author name

Implementation:

- SQLite FTS5 virtual table
- sync FTS entries on book and author changes
- rank results by title match, author match, and exactness

## 16.5 Imports

Imports should run as background-like jobs, even if implemented initially inside the app server.

Import flow:

1. upload file
2. parse rows
3. normalize fields
4. attempt match to existing books
5. show preview
6. confirm import
7. write inside transaction batches
8. produce summary

## 16.6 Feed Generation

Feed events should be stored explicitly instead of generated ad hoc.

Why:

- simpler dashboard queries
- stable performance
- easier privacy filtering
- easier future notification support

Example generated events:

- status changed to Active
- milestone reached
- book completed
- list created
- list item added

## 17. Performance and Non-Functional Requirements

### Performance

- dashboard load target: under 2 seconds for normal users
- internal search target: under 500 ms for common queries
- external search target: under 1.5 seconds depending on provider
- progress update save target: under 300 ms
- support at least 10,000 user-book relations per user in v1 design

### Reliability

- imports should fail safely and report errors clearly
- transactions must protect status and progress updates
- feed event generation must be reliable
- migrations must be repeatable and versioned
- SQLite database must be backed up regularly

### Security

- secure password hashing
- session protection
- CSRF-safe form handling where relevant
- permission checks on every private resource
- block relationships enforced server-side

### Accessibility

- keyboard-usable navigation
- good contrast
- screen-reader-friendly labels
- icon-only actions must have text labels or `aria-label`

## 18. Success Metrics

### Activation

- percentage of new users who add first book in first session
- percentage of new users who create first shelf
- percentage of new users who complete first progress update
- percentage of imported users who finish import successfully

### Engagement

- weekly active users
- average library size per active user
- average progress updates per active reader
- percentage of users with at least one friend
- dashboard visits per week
- lists created per active user

### Retention

- day 7 retention
- day 30 retention
- percentage of users returning to update reading progress
- percentage of users still active after import

### Import Quality

- import completion rate by source
- duplicate creation rate
- percentage of rows auto-matched successfully
- average manual corrections per import

## 19. Risks and Open Questions

1. Page tracking without editions
   - solution: page values are stored per user-book

2. Flexible statuses vs clean reporting
   - solution: custom statuses map to fixed system categories

3. Duplicate books from imports and external APIs
   - requires matching strategy using title, author, language, and external IDs

4. Feed noise
   - requires batching or milestone logic for progress updates

5. Calibre import variability
   - likely easier to support CSV/export first than direct database parsing

6. SQLite growth over time
   - acceptable for MVP and early product, but feed and activity tables may need careful indexing and archival strategy

7. Expected Goodreads-style reviews
   - users may expect ratings and reviews, even if not part of MVP

## 20. Recommended MVP Build Order

1. Project setup
   - Bun
   - SvelteKit
   - Tailwind CSS
   - `bun:sqlite`
   - migrations
   - auth foundation

2. Core data model
   - users
   - books
   - authors
   - multilingual titles
   - user_books

3. Library features
   - add/search books
   - shelves
   - statuses

4. Reading tracking
   - reading places
   - progress updates
   - current reading UX

5. External search
   - Google Books integration
   - add selected result into internal catalog

6. Imports
   - Goodreads CSV
   - StoryGraph CSV
   - Calibre export import

7. Social
   - friend requests
   - friendships
   - dashboard feed

8. Lists
   - create, edit, reorder, share

9. Statistics
   - core charts and summary views

10. Privacy and polish

- visibility controls
- feed filtering
- performance pass

## 21. Summary

ChapterLane is a multilingual social reading app centered around:

- personal library management
- custom shelves and statuses
- reading progress and reading places
- social activity with friends
- reading lists
- imports from major reading tools
- rich but practical statistics

Its key product decision is to model books as works, not editions. This keeps the system simpler while still supporting reading progress through user-specific page and percent tracking.

Its key technical decision is to use a straightforward Bun + SvelteKit + SQLite architecture with `bun:sqlite`, raw SQL, Tailwind CSS, and `svelte-lucide`.
