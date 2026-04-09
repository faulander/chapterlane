<script lang="ts">
	import { enhance } from '$app/forms';
	import { CircleCheck, CircleX, CircleAlert, Image } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{m.import_complete()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.import_complete()}</h1>

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

	<div class="flex flex-wrap gap-3">
		<form method="POST" action="?/fetchCovers" use:enhance>
			<Button type="submit" variant="secondary">
				<Image size="16" class="mr-1" />{m.import_fetch_covers()}
			</Button>
		</form>
		<a href={href('/books')}>
			<Button>{m.nav_my_books()}</Button>
		</a>
	</div>

	{#if form?.coversFetched !== undefined}
		<div
			class="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
		>
			{m.import_covers_fetched({ count: String(form.coversFetched) })}
		</div>
	{/if}
</div>
