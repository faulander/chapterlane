<script lang="ts">
	import { enhance } from '$app/forms';
	import { BookOpen } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.currently_reading_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.currently_reading_title()}</h1>

	{#if data.books.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.currently_reading_empty()}</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.books as book (book.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="flex gap-4">
						<a href={href(`/books/${book.book_id}`)} class="shrink-0">
							{#if book.cover_url}
								<img
									src={book.cover_url}
									alt={book.display_title}
									class="h-24 w-16 rounded object-cover"
								/>
							{:else}
								<div
									class="flex h-24 w-16 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
								>
									<BookOpen size="20" class="text-gray-400" />
								</div>
							{/if}
						</a>
						<div class="flex-1 space-y-2">
							<a
								href={href(`/books/${book.book_id}`)}
								class="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
							>
								{book.display_title}
							</a>
							{#if book.authors}
								<p class="text-sm text-gray-500 dark:text-gray-400">{book.authors}</p>
							{/if}

							{#if book.current_percent !== null || book.current_page !== null}
								<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
									{#if book.current_page !== null}
										<span
											>p. {book.current_page}{book.user_total_pages
												? `/${book.user_total_pages}`
												: ''}</span
										>
									{/if}
									{#if book.current_percent !== null}
										<span>{Math.round(book.current_percent)}%</span>
									{/if}
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-full rounded-full bg-indigo-500"
										style="width: {Math.min(book.current_percent ?? 0, 100)}%"
									></div>
								</div>
							{/if}

							<!-- Quick progress form -->
							<form
								method="POST"
								action="?/logProgress"
								use:enhance
								class="flex flex-wrap items-end gap-2"
							>
								<input type="hidden" name="user_book_id" value={book.id} />
								<input
									name="page"
									type="number"
									min="0"
									placeholder={m.progress_current_page()}
									class="min-h-[36px] w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
								/>
								{#if data.readingPlaces.length > 0}
									<select
										name="reading_place_id"
										class="min-h-[36px] rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
									>
										<option value="">{m.progress_reading_place()}</option>
										{#each data.readingPlaces as place (place.id)}
											<option value={place.id}>{place.name}</option>
										{/each}
									</select>
								{/if}
								<Button type="submit" size="sm" variant="secondary">
									{m.progress_update()}
								</Button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
