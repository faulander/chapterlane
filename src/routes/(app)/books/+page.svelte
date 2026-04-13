<script lang="ts">
	import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'svelte-lucide';
	import { goto } from '$app/navigation';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import BookCard from '$lib/components/books/BookCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	const tabs = $derived([
		{ key: 'all', label: m.status_all(), count: data.counts.all },
		{ key: 'planned', label: m.status_planned(), count: data.counts.planned },
		{ key: 'active', label: m.status_active(), count: data.counts.active },
		{ key: 'paused', label: m.status_paused(), count: data.counts.paused },
		{ key: 'completed', label: m.status_completed(), count: data.counts.completed },
		{ key: 'dropped', label: m.status_dropped(), count: data.counts.dropped }
	]);

	const sortOptions = $derived([
		{ key: 'added_desc', label: m.sort_added_desc() },
		{ key: 'added_asc', label: m.sort_added_asc() },
		{ key: 'title_asc', label: m.sort_title_asc() },
		{ key: 'title_desc', label: m.sort_title_desc() },
		{ key: 'author_asc', label: m.sort_author_asc() },
		{ key: 'author_desc', label: m.sort_author_desc() }
	]);

	function buildUrl(params: Record<string, string | number | undefined>): string {
		const parts: string[] = [];
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== '' && value !== 'all' && !(key === 'sort' && value === 'added_desc')) {
				parts.push(`${key}=${encodeURIComponent(String(value))}`);
			}
		}
		return href(`/books${parts.length > 0 ? '?' + parts.join('&') : ''}`);
	}

	function onSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		goto(buildUrl({
			status: data.currentFilter === 'all' ? undefined : data.currentFilter,
			q: data.search || undefined,
			sort: value
		}));
	}
</script>

<svelte:head>
	<title>{m.my_books_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.my_books_title()}</h1>
		<a href={href('/books/search')}>
			<Button size="sm"><Plus size="16" class="mr-1" /> {m.book_add_heading()}</Button>
		</a>
	</div>

	<!-- Search and Sort -->
	<form action={href('/books')} method="GET" class="flex gap-2">
		{#if data.currentFilter !== 'all'}
			<input type="hidden" name="status" value={data.currentFilter} />
		{/if}
		{#if data.currentSort !== 'added_desc'}
			<input type="hidden" name="sort" value={data.currentSort} />
		{/if}
		<div class="relative flex-1">
			<Search size="18" class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
			<input
				name="q"
				type="text"
				value={data.search}
				placeholder={m.search_placeholder()}
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
			/>
		</div>
		<Button type="submit" variant="secondary">{m.search_title()}</Button>
	</form>

	<!-- Sort -->
	<div class="flex items-center gap-2">
		<ArrowUpDown size="16" class="text-gray-400" />
		<select
			value={data.currentSort}
			onchange={onSortChange}
			class="min-h-[36px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
		>
			{#each sortOptions as opt (opt.key)}
				<option value={opt.key}>{opt.label}</option>
			{/each}
		</select>
	</div>

	<!-- Status tabs -->
	<div class="flex gap-1 overflow-x-auto pb-2">
		{#each tabs as tab (tab.key)}
			<a
				href={buildUrl({
					status: tab.key === 'all' ? undefined : tab.key,
					q: data.search || undefined,
					sort: data.currentSort
				})}
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
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each data.books as book (book.id)}
				<BookCard
					bookId={book.book_id}
					title={book.display_title}
					authors={book.authors}
					coverUrl={book.cover_url}
					statusCategory={book.system_category}
					shelvesJson={book.shelves_json}
					listsJson={book.lists_json}
					currentPercent={book.current_percent}
				/>
			{/each}
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="flex items-center justify-center gap-2 pt-4">
				{#if data.page > 1}
					<a
						href={buildUrl({
							status: data.currentFilter === 'all' ? undefined : data.currentFilter,
							q: data.search || undefined,
							sort: data.currentSort,
							page: data.page - 1
						})}
						class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
					>
						<ChevronLeft size="18" />
					</a>
				{/if}

				<span class="px-3 text-sm text-gray-600 dark:text-gray-400">
					{data.page} / {data.totalPages}
				</span>

				{#if data.page < data.totalPages}
					<a
						href={buildUrl({
							status: data.currentFilter === 'all' ? undefined : data.currentFilter,
							q: data.search || undefined,
							sort: data.currentSort,
							page: data.page + 1
						})}
						class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
					>
						<ChevronRight size="18" />
					</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>
