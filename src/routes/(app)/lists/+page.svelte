<script lang="ts">
	import { enhance } from '$app/forms';
	import { ListOrdered, Plus, Trash2 } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let showCreate = $state(false);
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
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.lists as list (list.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="flex items-start justify-between">
						<a
							href={href(`/lists/${list.id}`)}
							class="flex items-center gap-2 text-lg font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
						>
							<ListOrdered size="18" />
							{list.title}
						</a>
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="list_id" value={list.id} />
							<button
								type="submit"
								class="rounded p-1 text-gray-400 hover:text-red-500"
								aria-label={m.common_delete()}
							>
								<Trash2 size="16" />
							</button>
						</form>
					</div>
					{#if list.description}
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{list.description}</p>
					{/if}
					<p class="mt-2 text-xs text-gray-400">{list.item_count} books</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
