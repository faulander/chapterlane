<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import { BookOpen, Plus, X } from 'svelte-lucide';
	import Button from '$lib/components/ui/Button.svelte';
	import StatusBadge from '$lib/components/books/StatusBadge.svelte';
	import StatusQuickSelect from '$lib/components/books/StatusQuickSelect.svelte';

	let { data, form } = $props();
	const { book, translations } = $derived(data);
	const currentStatus = $derived(
		data.statuses.find((s) => s.id === data.userBook?.current_status_id)
	);
	const showPageCountSection = $derived(
		!!data.userBook && currentStatus?.system_category !== 'planned'
	);
	const availableShelves = $derived(
		data.shelves.filter((s) => !data.bookShelves.some((bs) => bs.id === s.id))
	);

	function confirmRemove(e: SubmitEvent) {
		if (!confirm(m.book_remove_from_library_confirm())) {
			e.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>{book.display_title} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	{#if form?.error}
		<p
			class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
		>
			{form.error}
		</p>
	{/if}

	<!-- Book hero -->
	<section
		class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
	>
		<div class="grid gap-0 lg:grid-cols-[260px_1fr]">
			<div
				class="relative flex justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-200 p-6 lg:p-8 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950"
			>
				{#if book.cover_url}
					<img
						src={book.cover_url}
						alt=""
						class="absolute inset-0 h-full w-full object-cover opacity-10 blur-xl dark:opacity-20"
					/>
					<img
						src={book.cover_url}
						alt={book.display_title}
						class="relative h-80 w-52 rounded-xl object-cover shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
					/>
				{:else}
					<div
						class="relative flex h-80 w-52 items-center justify-center rounded-xl bg-white/70 shadow-2xl ring-1 ring-black/10 dark:bg-gray-900/70 dark:ring-white/10"
					>
						<BookOpen size="56" class="text-gray-400 dark:text-gray-600" />
					</div>
				{/if}
			</div>

			<div class="space-y-6 p-6 lg:p-8">
				<div class="space-y-3">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="space-y-2">
							<h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
								{book.display_title}
							</h1>
							{#if book.authors.length > 0}
								<p class="text-lg text-gray-600 dark:text-gray-300">
									{m.book_detail_by()}{book.authors.map((a) => a.name).join(', ')}
								</p>
							{/if}
						</div>

						{#if data.userBook}
							<StatusBadge category={currentStatus?.system_category ?? null} />
						{/if}
					</div>

					<div class="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
						{#if book.original_language}
							<span class="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800 dark:text-gray-300">
								{m.book_language()}: {book.original_language}
							</span>
						{/if}
						{#if book.display_title !== book.original_title}
							<span class="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800 dark:text-gray-300">
								{m.book_original_title_label()}: {book.original_title}
							</span>
						{/if}
					</div>
				</div>

				{#if !data.userBook}
					<form method="POST" action="?/addToLibrary" use:enhance>
						<Button size="sm">{m.book_add_to_library()}</Button>
					</form>
				{:else}
					<div class="grid gap-4 xl:grid-cols-2">
						<div
							class="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/40"
						>
							<h2
								class="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
							>
								{m.book_reading_state()}
							</h2>

							<div class="space-y-1.5">
								<span class="text-xs font-medium text-gray-500 dark:text-gray-400"
									>{m.book_set_status()}</span
								>
								<StatusQuickSelect
									bookId={book.id}
									statuses={data.statuses}
									currentStatusId={data.userBook.current_status_id}
									hasTotalPages={!!data.userBook.user_total_pages}
								/>
							</div>

							{#if showPageCountSection}
								<form method="POST" action="?/updateTotalPages" use:enhance class="space-y-1.5">
									<label
										for="total_pages"
										class="text-xs font-medium text-gray-500 dark:text-gray-400"
										>{m.progress_total_pages()}</label
									>
									<div class="flex items-center gap-2">
										<input
											id="total_pages"
											name="total_pages"
											type="number"
											min="1"
											required
											value={data.userBook.user_total_pages ?? ''}
											class="min-h-[42px] w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
										/>
										<Button type="submit" size="sm" variant="secondary">{m.common_save()}</Button>
									</div>
								</form>
							{/if}
						</div>
						<div
							class="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/40"
						>
							<h2
								class="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
							>
								{m.book_dates()}
							</h2>
							<form method="POST" action="?/updateDates" use:enhance class="space-y-3">
								<div class="grid gap-3 sm:grid-cols-2">
									<div class="space-y-1.5">
										<label
											for="started_at"
											class="text-xs font-medium text-gray-500 dark:text-gray-400"
											>{m.book_started_at()}</label
										>
										<input
											id="started_at"
											name="started_at"
											type="date"
											value={data.userBook.started_at?.split('T')[0] ?? ''}
											class="min-h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
										/>
									</div>
									<div class="space-y-1.5">
										<label
											for="finished_at"
											class="text-xs font-medium text-gray-500 dark:text-gray-400"
											>{m.book_finished_at()}</label
										>
										<input
											id="finished_at"
											name="finished_at"
											type="date"
											value={data.userBook.finished_at?.split('T')[0] ?? ''}
											class="min-h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
										/>
									</div>
								</div>
								<Button type="submit" size="sm" variant="secondary">{m.common_save()}</Button>
							</form>
						</div>
					</div>

					<div
						class="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/40"
					>
						<div class="flex items-center justify-between gap-3">
							<h2
								class="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
							>
								{m.nav_shelves()}
							</h2>
							<form method="POST" action="?/removeFromLibrary" use:enhance onsubmit={confirmRemove}>
								<Button size="sm" variant="danger">{m.book_remove_from_library()}</Button>
							</form>
						</div>

						{#if data.bookShelves.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each data.bookShelves as shelf (shelf.id)}
									<form method="POST" action="?/removeFromShelf" use:enhance class="inline">
										<input type="hidden" name="shelf_id" value={shelf.id} />
										<button
											type="submit"
											class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
										>
											{shelf.name}
											<X size="12" />
										</button>
									</form>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-gray-500 dark:text-gray-400">No shelves yet.</p>
						{/if}

						{#if availableShelves.length > 0}
							<form
								method="POST"
								action="?/addToShelf"
								use:enhance
								class="flex flex-wrap items-center gap-2"
							>
								<select
									name="shelf_id"
									class="min-h-[42px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
			</div>
		</div>
	</section>

	{#if book.description}
		<section
			class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
		>
			<h2 class="mb-3 text-lg font-semibold text-gray-950 dark:text-white">
				{m.book_description_heading()}
			</h2>
			<div class="prose max-w-none dark:prose-invert">
				<p>{book.description}</p>
			</div>
		</section>
	{/if}

	<!-- Progress section (only for active books) -->
	{#if data.userBook && currentStatus?.system_category === 'active'}
		<div
			class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{m.progress_title()}</h2>

			<!-- Progress bar -->
			{#if data.userBook.current_percent !== null}
				<div class="space-y-1">
					<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
						<span
							>{data.userBook.current_page !== null ? `p. ${data.userBook.current_page}` : ''}</span
						>
						<span>{Math.round(data.userBook.current_percent)}%</span>
					</div>
					<div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
						<div
							class="h-full rounded-full bg-indigo-500"
							style="width: {Math.min(data.userBook.current_percent, 100)}%"
						></div>
					</div>
				</div>
			{/if}

			<!-- Log progress form -->
			<form method="POST" action="?/logProgress" use:enhance class="flex flex-wrap items-end gap-2">
				<div class="space-y-1">
					<label for="page" class="text-xs text-gray-500 dark:text-gray-400"
						>{m.progress_current_page()}</label
					>
					<input
						id="page"
						name="page"
						type="number"
						min="0"
						class="min-h-[36px] w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>
				</div>
				<div class="space-y-1">
					<label for="percent" class="text-xs text-gray-500 dark:text-gray-400"
						>{m.progress_percent()}</label
					>
					<input
						id="percent"
						name="percent"
						type="number"
						min="0"
						max="100"
						step="0.1"
						class="min-h-[36px] w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>
				</div>
				{#if data.readingPlaces.length > 0}
					<div class="space-y-1">
						<label for="reading_place_id" class="text-xs text-gray-500 dark:text-gray-400"
							>{m.progress_reading_place()}</label
						>
						<select
							id="reading_place_id"
							name="reading_place_id"
							class="min-h-[36px] rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
						>
							<option value="">—</option>
							{#each data.readingPlaces as place (place.id)}
								<option value={place.id}>{place.name}</option>
							{/each}
						</select>
					</div>
				{/if}
				<div class="space-y-1">
					<label for="note" class="text-xs text-gray-500 dark:text-gray-400"
						>{m.progress_note()}</label
					>
					<input
						id="note"
						name="note"
						type="text"
						class="min-h-[36px] w-40 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>
				</div>
				<Button type="submit" size="sm">{m.progress_update()}</Button>
			</form>

			<!-- Progress history -->
			{#if data.progressHistory.length > 0}
				<div class="space-y-2">
					<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
						{m.progress_history()}
					</h3>
					<div class="space-y-1">
						{#each data.progressHistory as entry (entry.id)}
							<div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
								<span class="shrink-0 text-xs text-gray-400"
									>{new Date(entry.created_at).toLocaleDateString()}</span
								>
								{#if entry.page !== null}<span>p. {entry.page}</span>{/if}
								{#if entry.percent !== null}<span>{Math.round(entry.percent)}%</span>{/if}
								{#if entry.note}<span class="italic">"{entry.note}"</span>{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
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
