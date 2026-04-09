<script lang="ts">
	import { enhance } from '$app/forms';
	import { Library, Plus, Trash2 } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let showCreate = $state(false);
</script>

<svelte:head>
	<title>{m.shelves_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.shelves_title()}</h1>
		<Button size="sm" onclick={() => (showCreate = !showCreate)}>
			<Plus size="16" class="mr-1" />
			{m.shelf_create()}
		</Button>
	</div>

	{#if showCreate}
		<form
			method="POST"
			action="?/create"
			use:enhance
			class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<Input
				label={m.shelf_name()}
				name="name"
				required
				value={form?.name ?? ''}
				error={form?.error}
			/>
			<Input label={m.shelf_description()} name="description" value={form?.description ?? ''} />
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
			<Button type="submit" size="sm">{m.shelf_create()}</Button>
		</form>
	{/if}

	{#if data.shelves.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.shelves_empty()}</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.shelves as shelf (shelf.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="flex items-start justify-between">
						<a
							href={href(`/shelves/${shelf.id}`)}
							class="flex items-center gap-2 text-lg font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
						>
							<Library size="18" />
							{shelf.name}
						</a>
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="shelf_id" value={shelf.id} />
							<button
								type="submit"
								class="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
								aria-label={m.common_delete()}
							>
								<Trash2 size="16" />
							</button>
						</form>
					</div>
					{#if shelf.description}
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{shelf.description}</p>
					{/if}
					<p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
						{m.shelf_books_count({ count: shelf.book_count })} · {shelf.visibility === 'private'
							? m.visibility_private()
							: shelf.visibility === 'friends'
								? m.visibility_friends()
								: m.visibility_public()}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
