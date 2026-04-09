<script lang="ts">
	import { enhance } from '$app/forms';
	import { BookOpen, X } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.shelf.name} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{data.shelf.name}</h1>
		{#if data.shelf.description}
			<p class="mt-1 text-gray-600 dark:text-gray-400">{data.shelf.description}</p>
		{/if}
	</div>

	{#if data.books.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.shelf_empty()}</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each data.books as book (book.id)}
				<div class="group relative">
					<a
						href={href(`/books/${book.id}`)}
						class="block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
					>
						{#if book.cover_url}
							<img src={book.cover_url} alt={book.display_title} class="h-48 w-full object-cover" />
						{:else}
							<div class="flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-800">
								<BookOpen size="32" class="text-gray-400 dark:text-gray-600" />
							</div>
						{/if}
						<div class="p-3">
							<h3 class="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
								{book.display_title}
							</h3>
						</div>
					</a>
					<form method="POST" action="?/removeBook" use:enhance class="absolute top-1 right-1">
						<input type="hidden" name="user_book_id" value={book.userBookId} />
						<button
							type="submit"
							class="rounded-full bg-white/80 p-1 text-gray-500 hover:text-red-500 dark:bg-gray-900/80 dark:hover:text-red-400"
							aria-label={m.shelf_remove_book()}
						>
							<X size="14" />
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>
