<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { CircleCheck, CircleX, CircleAlert, LoaderCircle } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	// Auto-refresh while import is in progress
	$effect(() => {
		if (!data.inProgress) return;
		const interval = setInterval(() => invalidateAll(), 2000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>{data.inProgress ? m.import_in_progress() : m.import_complete()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
		{#if data.inProgress}
			<span class="flex items-center gap-2">
				<LoaderCircle size="24" class="animate-spin text-indigo-500" />
				{m.import_in_progress()}
			</span>
		{:else}
			{m.import_complete()}
		{/if}
	</h1>

	{#if data.inProgress}
		<!-- Progress bar -->
		<div class="space-y-2">
			<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
				<span>{data.imported + data.skipped + data.errors} / {data.total}</span>
				<span
					>{Math.round(
						((data.imported + data.skipped + data.errors) / Math.max(data.total, 1)) * 100
					)}%</span
				>
			</div>
			<div class="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
				<div
					class="h-full rounded-full bg-indigo-500 transition-all duration-500"
					style="width: {((data.imported + data.skipped + data.errors) / Math.max(data.total, 1)) *
						100}%"
				></div>
			</div>
		</div>
	{/if}

	<div class="grid gap-4 sm:grid-cols-3">
		<div
			class="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
		>
			<CircleCheck size="24" class="text-green-600 dark:text-green-400" />
			<div>
				<p class="text-2xl font-bold text-green-700 dark:text-green-400">{data.imported}</p>
				<p class="text-sm text-green-600 dark:text-green-500">{m.import_summary_imported()}</p>
			</div>
		</div>
		<div
			class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<CircleX size="24" class="text-gray-500 dark:text-gray-400" />
			<div>
				<p class="text-2xl font-bold text-gray-700 dark:text-gray-300">{data.skipped}</p>
				<p class="text-sm text-gray-500 dark:text-gray-400">{m.import_summary_skipped()}</p>
			</div>
		</div>
		{#if data.errors > 0}
			<div
				class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
			>
				<CircleAlert size="24" class="text-red-600 dark:text-red-400" />
				<div>
					<p class="text-2xl font-bold text-red-700 dark:text-red-400">{data.errors}</p>
					<p class="text-sm text-red-600 dark:text-red-500">{m.import_summary_errors()}</p>
				</div>
			</div>
		{/if}
	</div>

	{#if !data.inProgress}
		<p class="text-sm text-gray-500 dark:text-gray-400">
			{m.import_covers_auto()}
		</p>

		<a href={href('/books')}>
			<Button>{m.nav_my_books()}</Button>
		</a>
	{/if}
</div>
