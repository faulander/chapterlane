<script lang="ts">
	import { enhance } from '$app/forms';
	import { Check, X } from 'svelte-lucide';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.import_preview_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.import_preview_title()}</h1>

	<p class="text-sm text-gray-600 dark:text-gray-400">
		{data.job.total_rows} rows, {data.job.matched_rows} matched
	</p>

	<div class="space-y-2">
		{#each data.rows as row (row.id)}
			<div
				class="flex items-center gap-3 rounded-lg border px-4 py-3
					{row.user_action === 'skip'
					? 'border-gray-200 bg-gray-50 opacity-50 dark:border-gray-800 dark:bg-gray-950'
					: row.match_confidence && row.match_confidence > 0.7
						? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
						: 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}"
			>
				<div class="flex-1">
					<p class="font-medium text-gray-900 dark:text-white">{row.parsed_title}</p>
					{#if row.parsed_author}
						<p class="text-sm text-gray-500 dark:text-gray-400">{row.parsed_author}</p>
					{/if}
					<div class="flex gap-2 text-xs text-gray-400">
						{#if row.parsed_status}
							<span>{row.parsed_status}</span>
						{/if}
						{#if row.match_confidence}
							<span>
								{row.match_confidence > 0.7
									? m.import_confidence_high()
									: m.import_confidence_low()}
							</span>
						{/if}
					</div>
				</div>
				<div class="flex gap-1">
					<form method="POST" action="?/toggleRow" use:enhance>
						<input type="hidden" name="row_id" value={row.id} />
						<input
							type="hidden"
							name="action"
							value={row.user_action === 'skip' ? 'accept' : 'skip'}
						/>
						<button
							type="submit"
							class="rounded p-1.5 {row.user_action === 'skip'
								? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
								: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}"
						>
							{#if row.user_action === 'skip'}
								<Check size="16" />
							{:else}
								<X size="16" />
							{/if}
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>

	<form method="POST" action="?/confirm">
		<Button type="submit">{m.import_confirm()}</Button>
	</form>
</div>
