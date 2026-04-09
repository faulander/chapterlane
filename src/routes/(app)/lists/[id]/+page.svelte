<script lang="ts">
	import { enhance } from '$app/forms';
	import { BookOpen, X } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.list.title} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{data.list.title}</h1>
		{#if data.list.description}
			<p class="mt-1 text-gray-600 dark:text-gray-400">{data.list.description}</p>
		{/if}
	</div>

	{#if data.items.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.lists_empty()}</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each data.items as item, i (item.id)}
				<div
					class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
				>
					<span class="w-6 text-center text-sm font-medium text-gray-400">{i + 1}</span>
					{#if item.cover_url}
						<img
							src={item.cover_url}
							alt={item.original_title}
							class="h-12 w-8 rounded object-cover"
						/>
					{:else}
						<div
							class="flex h-12 w-8 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
						>
							<BookOpen size="14" class="text-gray-400" />
						</div>
					{/if}
					<div class="flex-1">
						<a
							href={href(`/books/${item.book_id}`)}
							class="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
						>
							{item.original_title}
						</a>
						{#if item.authors}
							<p class="text-xs text-gray-500 dark:text-gray-400">{item.authors}</p>
						{/if}
						{#if item.note}
							<p class="text-xs text-gray-400 italic">"{item.note}"</p>
						{/if}
					</div>
					<form method="POST" action="?/removeBook" use:enhance>
						<input type="hidden" name="book_id" value={item.book_id} />
						<button
							type="submit"
							class="rounded p-1 text-gray-400 hover:text-red-500"
							aria-label={m.common_delete()}
						>
							<X size="16" />
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>
