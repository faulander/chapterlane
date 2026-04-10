<script lang="ts">
	import { BookOpen } from 'svelte-lucide';
	import { goto } from '$app/navigation';
	import { href } from '$lib/utils/navigation';
	import StatusBadge from './StatusBadge.svelte';

	interface TagItem {
		id: string;
		name: string;
	}

	interface Props {
		bookId: string;
		title: string;
		authors?: string | null;
		coverUrl?: string | null;
		statusCategory?: string | null;
		shelvesJson?: string | null;
		listsJson?: string | null;
	}

	let { bookId, title, authors, coverUrl, statusCategory, shelvesJson, listsJson }: Props =
		$props();

	function parseTagItems(json: string | null | undefined): TagItem[] {
		if (!json) return [];
		try {
			const items = JSON.parse(json) as TagItem[];
			return items.filter((i) => i.id && i.name);
		} catch {
			return [];
		}
	}

	const shelves = $derived(parseTagItems(shelvesJson));
	const lists = $derived(parseTagItems(listsJson));
	const bookHref = $derived(href(`/books/${bookId}`));
	const authorList = $derived(
		authors
			? authors
					.split(', ')
					.map((a) => a.trim())
					.filter((a) => a)
			: []
	);

	function onCardClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName === 'A' || target.closest('a')) return;
		goto(bookHref);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow dark:border-gray-800 dark:bg-gray-900"
	role="group"
>
	<a href={bookHref} class="group block">
		{#if coverUrl}
			<img src={coverUrl} alt={title} class="h-48 w-full object-cover" />
		{:else}
			<div class="flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-800">
				<BookOpen size="32" class="text-gray-400 dark:text-gray-600" />
			</div>
		{/if}
		<div class="space-y-1 px-3 pt-3" class:pb-3={authorList.length === 0 && shelves.length === 0 && lists.length === 0}>
			<h3
				class="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
			>
				{title}
			</h3>
			{#if statusCategory}
				<StatusBadge category={statusCategory} />
			{/if}
		</div>
	</a>
	{#if authorList.length > 0 || shelves.length > 0 || lists.length > 0}
		<div class="space-y-1 px-3 pb-3">
			{#if authorList.length > 0}
				<p class="line-clamp-1 text-xs">
					{#each authorList as author, i}
						{#if i > 0}<span class="text-gray-400">, </span>{/if}
						<a
							href={href(`/books?q=${encodeURIComponent(author)}`)}
							class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
						>{author}</a>
					{/each}
				</p>
			{/if}
			{#if shelves.length > 0 || lists.length > 0}
				<div class="flex flex-wrap gap-1">
					{#each shelves as shelf (shelf.id)}
						<a
							href={href(`/shelves/${shelf.id}`)}
							class="inline-block max-w-full truncate rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
						>
							{shelf.name}
						</a>
					{/each}
					{#each lists as list (list.id)}
						<a
							href={href(`/lists/${list.id}`)}
							class="inline-block max-w-full truncate rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
						>
							{list.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
