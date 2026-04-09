<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import { BookOpen, Plus, X } from 'svelte-lucide';
	import Button from '$lib/components/ui/Button.svelte';
	import StatusBadge from '$lib/components/books/StatusBadge.svelte';

	let { data } = $props();
	const { book, translations } = $derived(data);
	const availableShelves = $derived(
		data.shelves.filter((s) => !data.bookShelves.some((bs) => bs.id === s.id))
	);
</script>

<svelte:head>
	<title>{book.display_title} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<!-- Book header -->
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

		<div class="flex-1 space-y-3">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{book.display_title}</h1>

			{#if book.display_title !== book.original_title}
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{m.book_original_title_label()}: {book.original_title}
				</p>
			{/if}

			{#if book.authors.length > 0}
				<p class="text-gray-700 dark:text-gray-300">
					{m.book_detail_by()}{book.authors.map((a) => a.name).join(', ')}
				</p>
			{/if}

			{#if book.original_language}
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{m.book_language()}: {book.original_language}
				</p>
			{/if}

			<!-- Library actions -->
			{#if !data.userBook}
				<form method="POST" action="?/addToLibrary" use:enhance>
					<Button size="sm">{m.book_add_to_library()}</Button>
				</form>
			{:else}
				<div class="space-y-3">
					<StatusBadge
						category={data.statuses.find((s) => s.id === data.userBook?.current_status_id)
							?.system_category ?? null}
						label={data.statuses.find((s) => s.id === data.userBook?.current_status_id)?.label}
					/>

					<!-- Status selector -->
					<form method="POST" action="?/setStatus" use:enhance class="flex items-center gap-2">
						<select
							name="status_id"
							class="min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
						>
							{#each data.statuses as status (status.id)}
								<option value={status.id} selected={status.id === data.userBook?.current_status_id}>
									{status.label}
								</option>
							{/each}
						</select>
						<Button type="submit" size="sm" variant="secondary">{m.book_set_status()}</Button>
					</form>

					<!-- Dates -->
					<form
						method="POST"
						action="?/updateDates"
						use:enhance
						class="flex flex-wrap items-end gap-3"
					>
						<div class="space-y-1">
							<label for="started_at" class="text-xs text-gray-500 dark:text-gray-400"
								>{m.book_started_at()}</label
							>
							<input
								id="started_at"
								name="started_at"
								type="date"
								value={data.userBook.started_at?.split('T')[0] ?? ''}
								class="min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
							/>
						</div>
						<div class="space-y-1">
							<label for="finished_at" class="text-xs text-gray-500 dark:text-gray-400"
								>{m.book_finished_at()}</label
							>
							<input
								id="finished_at"
								name="finished_at"
								type="date"
								value={data.userBook.finished_at?.split('T')[0] ?? ''}
								class="min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
							/>
						</div>
						<Button type="submit" size="sm" variant="secondary">{m.common_save()}</Button>
					</form>

					<!-- Shelf management -->
					{#if data.shelves.length > 0}
						<div class="space-y-2">
							<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
								{m.nav_shelves()}
							</h3>
							<div class="flex flex-wrap gap-2">
								{#each data.bookShelves as shelf (shelf.id)}
									<form method="POST" action="?/removeFromShelf" use:enhance class="inline">
										<input type="hidden" name="shelf_id" value={shelf.id} />
										<button
											type="submit"
											class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
										>
											{shelf.name}
											<X size="12" />
										</button>
									</form>
								{/each}
							</div>
							{#if availableShelves.length > 0}
								<form
									method="POST"
									action="?/addToShelf"
									use:enhance
									class="flex items-center gap-2"
								>
									<select
										name="shelf_id"
										class="min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
									>
										{#each availableShelves as shelf (shelf.id)}
											<option value={shelf.id}>{shelf.name}</option>
										{/each}
									</select>
									<Button type="submit" size="sm" variant="secondary">
										<Plus size="14" class="mr-1" />{m.shelf_add_book()}
									</Button>
								</form>
							{/if}
						</div>
					{/if}

					<form method="POST" action="?/removeFromLibrary" use:enhance>
						<Button size="sm" variant="danger">{m.book_remove_from_library()}</Button>
					</form>
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
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{m.book_translations()}</h2>
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
