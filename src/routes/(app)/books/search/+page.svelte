<script lang="ts">
	import { enhance } from '$app/forms';
	import { Search, BookOpen, Plus, Check } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	let query = $state(data.query);
</script>

<svelte:head>
	<title>{m.search_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.search_title()}</h1>

	<form action={href('/books/search')} method="GET" class="flex gap-2">
		<div class="relative flex-1">
			<Search size="18" class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
			<input
				name="q"
				type="text"
				bind:value={query}
				placeholder={m.search_placeholder()}
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
			/>
		</div>
		<Button type="submit">{m.search_title()}</Button>
	</form>

	{#if data.query && data.results.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.search_no_results()}</p>
		</div>
	{/if}

	{#if data.results.length > 0}
		<div class="space-y-3">
			{#each data.results as result (result.id)}
				<div
					class="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
				>
					{#if result.coverUrl}
						<img
							src={result.coverUrl}
							alt={result.title}
							class="h-28 w-20 shrink-0 rounded object-cover"
						/>
					{:else}
						<div
							class="flex h-28 w-20 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
						>
							<BookOpen size="24" class="text-gray-400" />
						</div>
					{/if}

					<div class="flex-1 space-y-1">
						{#if result.inCatalog && result.existingBookId}
							<a
								href={href(`/books/${result.existingBookId}`)}
								class="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
							>
								{result.title}
							</a>
						{:else}
							<h3 class="font-medium text-gray-900 dark:text-white">{result.title}</h3>
						{/if}

						{#if result.authors.length > 0}
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{result.authors.join(', ')}
							</p>
						{/if}

						{#if result.description}
							<p class="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
								{result.description}
							</p>
						{/if}

						<div class="flex items-center gap-2 pt-1">
							<span
								class="rounded-full px-2 py-0.5 text-xs
									{result.source === 'internal'
									? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
									: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}"
							>
								{result.source === 'internal'
									? m.search_source_internal()
									: m.search_source_google()}
							</span>

							{#if result.inCatalog}
								<span class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
									<Check size="14" />
									{m.search_already_in_library()}
								</span>
							{:else}
								<form method="POST" action="?/addFromExternal" use:enhance>
									<input type="hidden" name="title" value={result.title} />
									<input type="hidden" name="authors" value={result.authors.join(', ')} />
									<input type="hidden" name="language" value={result.language} />
									<input type="hidden" name="description" value={result.description ?? ''} />
									<input type="hidden" name="cover_url" value={result.coverUrl ?? ''} />
									<input type="hidden" name="external_id" value={result.externalId ?? ''} />
									<input type="hidden" name="source" value="google_books" />
									<Button type="submit" size="sm" variant="secondary">
										<Plus size="14" class="mr-1" />
										{m.search_add_to_library()}
									</Button>
								</form>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
