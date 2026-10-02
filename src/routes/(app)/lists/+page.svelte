<script lang="ts">
	import { enhance } from '$app/forms';
	import { BookOpen, Plus, Trash2 } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let showCreate = $state(false);

	function listCovers(list: { cover_urls_json: string | null }): string[] {
		if (!list.cover_urls_json) return [];
		try {
			return JSON.parse(list.cover_urls_json).filter(Boolean).slice(0, 4);
		} catch {
			return [];
		}
	}
</script>

<svelte:head>
	<title>{m.nav_lists()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.nav_lists()}</h1>
		<Button size="sm" onclick={() => (showCreate = !showCreate)}>
			<Plus size="16" class="mr-1" />{m.list_create()}
		</Button>
	</div>

	{#if showCreate}
		<form
			method="POST"
			action="?/create"
			use:enhance
			class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<Input label={m.list_title_label()} name="title" required error={form?.error} />
			<Input label={m.list_description_label()} name="description" />
			<div class="space-y-1">
				<label for="visibility" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>{m.shelf_visibility()}</label
				>
				<select
					id="visibility"
					name="visibility"
					class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
				>
					<option value="private">{m.visibility_private()}</option>
					<option value="friends">{m.visibility_friends()}</option>
					<option value="public">{m.visibility_public()}</option>
				</select>
			</div>
			<Button type="submit" size="sm">{m.list_create()}</Button>
		</form>
	{/if}

	{#if data.lists.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.lists_empty()}</p>
		</div>
	{:else}
		<div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.lists as list (list.id)}
				{@const covers = listCovers(list)}
				<article
					class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
				>
					<a href={href(`/lists/${list.id}`)} class="block">
						<div
							class="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-100 via-slate-100 to-indigo-100 dark:from-gray-800 dark:via-gray-950 dark:to-emerald-950"
						>
							{#if covers.length > 0}
								<div class="absolute inset-0 grid grid-cols-4 items-end gap-2 px-5 pt-6 pb-4">
									{#each covers as cover, index}
										<img
											src={cover}
											alt=""
											class="h-28 w-full rounded-md object-cover shadow-xl ring-1 ring-black/10 transition duration-200 group-hover:-translate-y-1 dark:ring-white/10"
											style="transform: rotate({(index - 1.5) * 3}deg);"
										/>
									{/each}
								</div>
							{:else}
								<div class="flex h-full items-center justify-center">
									<div
										class="rounded-full bg-white/70 p-5 text-gray-400 shadow-sm dark:bg-gray-900/70 dark:text-gray-600"
									>
										<BookOpen size="34" />
									</div>
								</div>
							{/if}
							<div
								class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-gray-900"
							></div>
						</div>

						<div class="space-y-2 p-5 pt-4">
							<h2
								class="line-clamp-1 text-xl font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
							>
								{list.title}
							</h2>
							{#if list.description}
								<p class="line-clamp-2 min-h-10 text-sm text-gray-500 dark:text-gray-400">
									{list.description}
								</p>
							{/if}
							<p class="text-sm text-gray-500 dark:text-gray-400">
								<span class="font-medium text-gray-700 dark:text-gray-300"
									>{m.shelf_books_count({ count: list.item_count })}</span
								>
								<span class="px-1 text-gray-300 dark:text-gray-700">·</span>
								{list.visibility === 'private'
									? m.visibility_private()
									: list.visibility === 'friends'
										? m.visibility_friends()
										: m.visibility_public()}
							</p>
						</div>
					</a>

					<form method="POST" action="?/delete" use:enhance class="absolute top-3 right-3">
						<input type="hidden" name="list_id" value={list.id} />
						<button
							type="submit"
							class="rounded-full bg-white/85 p-2 text-gray-500 shadow-sm backdrop-blur hover:bg-red-50 hover:text-red-600 dark:bg-gray-950/75 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-300"
							aria-label={m.common_delete()}
						>
							<Trash2 size="16" />
						</button>
					</form>
				</article>
			{/each}
		</div>
	{/if}
</div>
