<script lang="ts">
	import { onMount } from 'svelte';
	import { href } from '$lib/utils/navigation';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { dayKey, dayRelation } from '$lib/utils/feed-groups';
	import BookCard from '$lib/components/books/BookCard.svelte';
	import FeedGroupRow from '$lib/components/feed/FeedGroupRow.svelte';
	import SoloPanel from '$lib/components/dashboard/SoloPanel.svelte';

	let { data, form } = $props();

	// Day boundaries are UTC while rendering on the server and switch to the viewer's own
	// timezone after mount, so the first client render matches the server HTML.
	let local = $state(false);
	onMount(() => {
		local = true;
	});

	function dayHeading(createdAt: string, key: string, now: Date): string {
		const relation = dayRelation(key, now, local);
		if (relation === 'today') return m.feed_day_today();
		if (relation === 'yesterday') return m.feed_day_yesterday();
		return new Intl.DateTimeFormat(getLocale(), {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			timeZone: local ? undefined : 'UTC'
		}).format(new Date(createdAt.replace(' ', 'T') + 'Z'));
	}

	const feedRows = $derived.by(() => {
		const now = new Date();
		let previousKey = '';
		return data.feed.map((group) => {
			const key = dayKey(group.latestAt, local);
			const heading = key === previousKey ? null : dayHeading(group.latestAt, key, now);
			previousKey = key;
			return { group, heading };
		});
	});
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

	{#if data.solo}
		<SoloPanel solo={data.solo} goalError={!!form?.goalError} />
	{/if}

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
			{#each feedRows as { group, heading } (group.id)}
				{#if heading}
					<div
						class="bg-gray-50 px-3 py-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:bg-gray-800/60 dark:text-gray-400"
					>
						{heading}
					</div>
				{/if}
				<FeedGroupRow {group} />
			{/each}
			{#if data.showMore}
				<a
					href={href(`/dashboard?feed=${data.showMore.nextLimit}`)}
					data-sveltekit-noscroll
					class="block px-3 py-2.5 text-center text-sm font-medium text-indigo-600 hover:bg-gray-50 dark:text-indigo-400 dark:hover:bg-gray-800/50"
				>
					{m.feed_show_more({ count: String(data.showMore.count) })}
				</a>
			{/if}
		</div>
	{/if}
</div>
