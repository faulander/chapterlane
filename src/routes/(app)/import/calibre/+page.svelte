<script lang="ts">
	import { BookOpen, Database } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import FormError from '$lib/components/ui/FormError.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{m.import_calibre_columns_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
			{m.import_calibre_columns_title()}
		</h1>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
			<Database size="14" class="mr-1 inline" />
			{data.libraryPath}
		</p>
	</div>

	<FormError message={form?.error} />

	<form
		method="POST"
		action="?/confirm"
		class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
	>
		<input type="hidden" name="library_path" value={data.libraryPath} />

		<div class="space-y-2">
			<label for="status_column" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				{m.import_calibre_status_column()}
			</label>
			<p class="text-xs text-gray-500 dark:text-gray-400">
				{m.import_calibre_status_column_hint()}
			</p>
			<select
				id="status_column"
				name="status_column"
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
			>
				<option value="none">{m.import_calibre_no_status_column()}</option>
				{#each data.columns as col (col.id)}
					<option value={col.id}>
						#{col.label} ({col.name}) — {col.sampleValues.slice(0, 3).join(', ')}
					</option>
				{/each}
			</select>
		</div>

		{#if data.columns.length > 0}
			<div class="space-y-2">
				<p class="text-sm font-medium text-gray-700 dark:text-gray-300">
					{m.import_calibre_detected_columns()}
				</p>
				<div class="space-y-1">
					{#each data.columns as col (col.id)}
						<div
							class="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
						>
							<span class="font-medium text-gray-900 dark:text-white">#{col.label}</span>
							<span class="text-gray-500 dark:text-gray-400"> ({col.datatype})</span>
							<div class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
								{m.import_calibre_sample_values()}: {col.sampleValues.slice(0, 5).join(', ')}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{m.import_calibre_no_custom_columns()}
			</p>
		{/if}

		<Button type="submit">
			<BookOpen size="16" class="mr-1" />
			{m.import_calibre_start_import()}
		</Button>
	</form>
</div>
