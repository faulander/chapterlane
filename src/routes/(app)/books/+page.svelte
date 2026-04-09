<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Image } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import BookCard from '$lib/components/books/BookCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();

	const tabs = $derived([
		{ key: 'all', label: m.status_all(), count: data.counts.all },
		{ key: 'planned', label: m.status_planned(), count: data.counts.planned },
		{ key: 'active', label: m.status_active(), count: data.counts.active },
		{ key: 'paused', label: m.status_paused(), count: data.counts.paused },
		{ key: 'completed', label: m.status_completed(), count: data.counts.completed },
		{ key: 'dropped', label: m.status_dropped(), count: data.counts.dropped }
	]);
</script>

<svelte:head>
	<title>{m.my_books_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.my_books_title()}</h1>
		<div class="flex gap-2">
			<form method="POST" action="?/fetchCovers" use:enhance>
				<Button type="submit" size="sm" variant="secondary">
					<Image size="16" class="mr-1" />{m.import_fetch_covers()}
				</Button>
			</form>
			<a href={href('/books/add')}>
				<Button size="sm"><Plus size="16" class="mr-1" /> {m.book_add_heading()}</Button>
			</a>
		</div>
	</div>

	{#if form?.coversFetched !== undefined}
		<div
			class="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
		>
			{m.import_covers_fetched({ count: String(form.coversFetched) })}
		</div>
	{/if}

	<div class="flex gap-1 overflow-x-auto pb-2">
		{#each tabs as tab (tab.key)}
			<a
				href={tab.key === 'all' ? href('/books') : href(`/books?status=${tab.key}`)}
				class="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors
					{data.currentFilter === tab.key
					? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
					: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}"
			>
				{tab.label}
				<span class="ml-1 text-xs opacity-70">({tab.count})</span>
			</a>
		{/each}
	</div>

	{#if data.books.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.my_books_empty()}</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each data.books as book (book.id)}
				<BookCard
					bookId={book.book_id}
					title={book.display_title}
					authors={book.authors}
					coverUrl={book.cover_url}
					statusLabel={book.status_label}
					statusCategory={book.system_category}
				/>
			{/each}
		</div>
	{/if}
</div>
