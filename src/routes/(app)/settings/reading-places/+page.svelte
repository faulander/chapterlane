<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Trash2 } from 'svelte-lucide';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let showCreate = $state(false);
</script>

<svelte:head>
	<title>{m.reading_places_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.reading_places_title()}</h1>
		<Button size="sm" onclick={() => (showCreate = !showCreate)}>
			<Plus size="16" class="mr-1" />
			{m.reading_place_create()}
		</Button>
	</div>

	{#if showCreate}
		<form
			method="POST"
			action="?/create"
			use:enhance
			class="flex items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<div class="flex-1">
				<Input label={m.reading_place_name()} name="name" required error={form?.error} />
			</div>
			<Button type="submit" size="sm">{m.reading_place_create()}</Button>
		</form>
	{/if}

	{#if data.places.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.reading_places_empty()}</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each data.places as place (place.id)}
				<div
					class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
				>
					<span class="text-gray-900 dark:text-white">{place.name}</span>
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="place_id" value={place.id} />
						<button
							type="submit"
							class="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
							aria-label={m.common_delete()}
						>
							<Trash2 size="16" />
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>
