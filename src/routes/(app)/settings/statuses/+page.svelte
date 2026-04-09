<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Trash2 } from 'svelte-lucide';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import StatusBadge from '$lib/components/books/StatusBadge.svelte';

	let { data, form: formData } = $props();
	let showCreate = $state(false);

	const categories = [
		{ value: 'planned', label: m.status_planned() },
		{ value: 'active', label: m.status_active() },
		{ value: 'paused', label: m.status_paused() },
		{ value: 'completed', label: m.status_completed() },
		{ value: 'dropped', label: m.status_dropped() }
	];
</script>

<svelte:head>
	<title>{m.settings_statuses_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.settings_statuses_title()}</h1>
		<Button size="sm" onclick={() => (showCreate = !showCreate)}>
			<Plus size="16" class="mr-1" />
			{m.status_create()}
		</Button>
	</div>

	{#if showCreate}
		<form
			method="POST"
			action="?/create"
			use:enhance
			class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			{#if formData?.error}
				<p class="text-sm text-red-600 dark:text-red-400">{formData.error}</p>
			{/if}
			<Input label={m.status_label()} name="label" required />
			<div class="space-y-1">
				<label
					for="system_category"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>{m.status_category()}</label
				>
				<select
					id="system_category"
					name="system_category"
					required
					class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
				>
					{#each categories as cat (cat.value)}
						<option value={cat.value}>{cat.label}</option>
					{/each}
				</select>
			</div>
			<Button type="submit" size="sm">{m.status_create()}</Button>
		</form>
	{/if}

	<div class="space-y-2">
		{#each data.statuses as status (status.id)}
			<div
				class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
			>
				<div class="flex items-center gap-3">
					<StatusBadge category={status.system_category} label={status.label} />
					{#if !status.user_id}
						<span class="text-xs text-gray-400">(system)</span>
					{/if}
				</div>
				{#if status.user_id}
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="status_id" value={status.id} />
						<button
							type="submit"
							class="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
							aria-label={m.common_delete()}
						>
							<Trash2 size="16" />
						</button>
					</form>
				{/if}
			</div>
		{/each}
	</div>
</div>
