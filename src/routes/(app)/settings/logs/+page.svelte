<script lang="ts">
	import { ScrollText } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const levelStyles: Record<string, string> = {
		debug: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
		warn: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
		error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
	};

	const olderHref = $derived.by(() => {
		if (data.nextBefore === null) return null;
		const params = new URLSearchParams({
			level: data.filters.level,
			before: String(data.nextBefore)
		});
		if (data.filters.module) params.set('module', data.filters.module);
		if (data.filters.search) params.set('q', data.filters.search);
		return `${href('/settings/logs')}?${params}`;
	});

	const levelLabels: Record<string, () => string> = {
		debug: m.logs_level_debug,
		info: m.logs_level_info,
		warn: m.logs_level_warn,
		error: m.logs_level_error
	};
</script>

<svelte:head>
	<title>{m.logs_title()} | {m.app_name()}</title>
</svelte:head>

<div class="max-w-4xl space-y-6 text-gray-900 dark:text-gray-100">
	<header class="space-y-2 border-b border-gray-200 pb-6 dark:border-gray-800">
		<div class="flex items-center gap-3">
			<ScrollText size="24" />
			<h1 class="text-2xl font-bold">{m.logs_title()}</h1>
		</div>
		<p class="text-sm text-gray-600 dark:text-gray-400">{m.logs_intro()}</p>
	</header>

	<form method="GET" class="flex flex-wrap items-end gap-3">
		<label class="flex flex-col gap-1 text-sm"
			>{m.logs_level()}
			<select
				name="level"
				class="min-h-11 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
			>
				{#each data.levels as level (level)}
					<option value={level} selected={level === data.filters.level}
						>{levelLabels[level]()}</option
					>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1 text-sm"
			>{m.logs_module()}
			<select
				name="module"
				class="min-h-11 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
			>
				<option value="">{m.logs_all_modules()}</option>
				{#each data.modules as module (module)}
					<option value={module} selected={module === data.filters.module}>{module}</option>
				{/each}
			</select>
		</label>
		<label class="flex min-w-48 flex-1 flex-col gap-1 text-sm"
			>{m.logs_search()}
			<input
				name="q"
				maxlength="200"
				value={data.filters.search}
				class="min-h-11 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
			/>
		</label>
		<button
			class="min-h-11 rounded-lg bg-indigo-700 px-4 font-medium text-white hover:bg-indigo-600"
			>{m.logs_filter()}</button
		>
	</form>

	{#if data.entries.length === 0}
		<p class="text-sm text-gray-500">{m.logs_none()}</p>
	{:else}
		<ul
			class="divide-y divide-gray-200 rounded-lg border border-gray-200 font-mono text-xs dark:divide-gray-800 dark:border-gray-800"
		>
			{#each data.entries as entry (entry.id)}
				<li class="space-y-1 p-3">
					<div class="flex flex-wrap items-center gap-2">
						<time datetime={entry.created_at} class="text-gray-500"
							>{entry.created_at.replace('T', ' ').slice(0, 19)} UTC</time
						>
						<span class="rounded px-1.5 py-0.5 font-semibold uppercase {levelStyles[entry.level]}"
							>{entry.level}</span
						>
						<span class="text-gray-500">{entry.module}</span>
					</div>
					<p class="break-words whitespace-pre-wrap">{entry.message}</p>
					{#if entry.data}
						<details>
							<summary class="cursor-pointer text-gray-500">{m.logs_details()}</summary>
							<pre
								class="mt-1 overflow-x-auto rounded bg-gray-50 p-2 dark:bg-gray-900">{entry.data}</pre>
						</details>
					{/if}
				</li>
			{/each}
		</ul>
		{#if olderHref}
			<a
				href={olderHref}
				class="inline-flex min-h-11 items-center rounded-lg border border-gray-300 px-4 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
				>{m.logs_older()}</a
			>
		{/if}
	{/if}
</div>
