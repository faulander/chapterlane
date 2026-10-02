<script lang="ts">
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import BookCard from '$lib/components/books/BookCard.svelte';
	import FeedGroupRow from '$lib/components/feed/FeedGroupRow.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.nav_dashboard()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
		{m.dashboard_welcome({ name: data.user.display_name || data.user.username })}
	</h1>

	<section class="space-y-3">
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
				{m.status_active()}
			</h2>
			<a
				href={href('/books?status=active')}
				class="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
			>
				{m.my_books_title()}
			</a>
		</div>

		{#if data.activeBooks.length === 0}
			<div
				class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
			>
				<p class="text-gray-600 dark:text-gray-400">{m.currently_reading_empty()}</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each data.activeBooks as book (book.id)}
					<BookCard
						bookId={book.book_id}
						title={book.display_title}
						authors={book.authors}
						coverUrl={book.cover_url}
						statusCategory={book.system_category}
						shelvesJson={book.shelves_json}
						listsJson={book.lists_json}
						currentPercent={book.current_percent}
						statuses={data.statuses}
						currentStatusId={book.current_status_id}
						hasTotalPages={!!book.user_total_pages}
					/>
				{/each}
			</div>
		{/if}
	</section>

	{#if data.ownFeed}
		<h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
			{m.feed_own_activity()}
		</h2>
	{/if}

	{#if data.feed.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-600 dark:text-gray-400">{m.feed_empty()}</p>
		</div>
	{:else}
		<div
			class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900"
		>
			{#each data.feed as group (group.id)}
				<FeedGroupRow {group} />
			{/each}
		</div>
	{/if}
</div>
