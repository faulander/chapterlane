<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { BookOpen } from 'svelte-lucide';

	let { data } = $props();
	const { book, userBook, translations } = $derived(data);
</script>

<svelte:head>
	<title>{book.display_title} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-6 sm:flex-row">
		{#if book.cover_url}
			<img
				src={book.cover_url}
				alt={book.display_title}
				class="h-64 w-44 shrink-0 rounded-lg object-cover shadow-md"
			/>
		{:else}
			<div
				class="flex h-64 w-44 shrink-0 items-center justify-center rounded-lg bg-gray-200 shadow-md dark:bg-gray-800"
			>
				<BookOpen size="48" class="text-gray-400 dark:text-gray-600" />
			</div>
		{/if}

		<div class="space-y-3">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{book.display_title}</h1>

			{#if book.display_title !== book.original_title}
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{m.book_original_title_label()}: {book.original_title}
				</p>
			{/if}

			{#if book.authors.length > 0}
				<p class="text-gray-700 dark:text-gray-300">
					{m.book_detail_by()}
					{book.authors.map((a) => a.name).join(', ')}
				</p>
			{/if}

			{#if book.original_language}
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{m.book_language()}: {book.original_language}
				</p>
			{/if}

			{#if userBook}
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
					>
						{m.book_in_library()}
					</span>
				</div>
			{/if}
		</div>
	</div>

	{#if book.description}
		<div class="prose max-w-none dark:prose-invert">
			<p>{book.description}</p>
		</div>
	{/if}

	{#if translations.length > 0}
		<div class="space-y-2">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
				{m.book_translations()}
			</h2>
			<ul class="space-y-1">
				{#each translations as t (t.id)}
					<li class="text-sm text-gray-600 dark:text-gray-400">
						<span class="font-medium uppercase">{t.language_code}</span>: {t.translated_title}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
