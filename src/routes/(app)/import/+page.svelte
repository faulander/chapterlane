<script lang="ts">
	import { Upload } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import FormError from '$lib/components/ui/FormError.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{m.import_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.import_title()}</h1>

	<form
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
	>
		<FormError message={form?.error} />

		<div class="space-y-1">
			<label for="source" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>{m.import_source()}</label
			>
			<select
				id="source"
				name="source"
				required
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
			>
				<option value="goodreads">{m.import_source_goodreads()}</option>
				<option value="storygraph">{m.import_source_storygraph()}</option>
				<option value="calibre">{m.import_source_calibre()}</option>
			</select>
		</div>

		<div class="space-y-1">
			<label for="file" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>{m.import_select_file()}</label
			>
			<input
				id="file"
				name="file"
				type="file"
				accept=".csv"
				required
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:text-indigo-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
			/>
		</div>

		<Button type="submit">
			<Upload size="16" class="mr-1" />
			{m.import_upload()}
		</Button>
	</form>

	{#if data.jobs.length > 0}
		<div class="space-y-2">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{m.import_history()}</h2>
			{#each data.jobs as job (job.id)}
				<a
					href={job.status === 'completed'
						? href(`/import/${job.id}/summary`)
						: href(`/import/${job.id}`)}
					class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
				>
					<div>
						<span class="font-medium text-gray-900 dark:text-white">{job.source}</span>
						<span class="ml-2 text-sm text-gray-500"
							>{new Date(job.created_at).toLocaleDateString()}</span
						>
					</div>
					<span
						class="rounded-full px-2 py-0.5 text-xs font-medium
							{job.status === 'completed'
							? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
							: job.status === 'failed'
								? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
								: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}"
					>
						{job.status}
					</span>
				</a>
			{/each}
		</div>
	{/if}
</div>
