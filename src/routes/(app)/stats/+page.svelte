<script lang="ts">
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import StatCard from '$lib/components/stats/StatCard.svelte';
	import ChartCanvas from '$lib/components/stats/ChartCanvas.svelte';

	let { data } = $props();

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	const completedChartData = $derived({
		labels: months,
		datasets: [
			{
				label: m.stats_books_completed(),
				data: months.map((_, i) => {
					const month = String(i + 1).padStart(2, '0');
					return data.completedByMonth.find((m) => m.month === month)?.count ?? 0;
				}),
				backgroundColor: 'rgba(99, 102, 241, 0.5)',
				borderColor: 'rgb(99, 102, 241)',
				borderWidth: 1
			}
		]
	});

	const pagesChartData = $derived({
		labels: months,
		datasets: [
			{
				label: m.stats_pages_read(),
				data: months.map((_, i) => {
					const month = String(i + 1).padStart(2, '0');
					return data.pagesReadByMonth.find((m) => m.month === month)?.pages ?? 0;
				}),
				backgroundColor: 'rgba(16, 185, 129, 0.5)',
				borderColor: 'rgb(16, 185, 129)',
				borderWidth: 1
			}
		]
	});

	const languageChartData = $derived({
		labels: data.byLanguage.map((l) => l.language.toUpperCase()),
		datasets: [
			{
				data: data.byLanguage.map((l) => l.count),
				backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
			}
		]
	});

	const authorScopes = [
		{ value: 'read', label: m.stats_authors_scope_read, note: m.stats_authors_note_read },
		{ value: 'wanted', label: m.stats_authors_scope_wanted, note: m.stats_authors_note_wanted },
		{ value: 'all', label: m.stats_authors_scope_all, note: m.stats_authors_note_all }
	];
	const authorNote = $derived(authorScopes.find((s) => s.value === data.authorScope)!.note());
</script>

<svelte:head>
	<title>{m.nav_stats()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.nav_stats()}</h1>
		<div class="flex gap-2">
			<a
				href={href(`/stats?year=${data.year - 1}&authors=${data.authorScope}`)}
				class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:text-gray-300"
			>
				{data.year - 1}
			</a>
			<span
				class="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
			>
				{data.year}
			</span>
			<a
				href={href(`/stats?year=${data.year + 1}&authors=${data.authorScope}`)}
				class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:text-gray-300"
			>
				{data.year + 1}
			</a>
		</div>
	</div>

	<!-- Summary cards -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
		<StatCard label={m.stats_total_books()} value={data.totalBooks} />
		<StatCard label={m.stats_active_reads()} value={data.activeReads} />
		<StatCard label={m.stats_avg_pages()} value={data.avgPages} />
	</div>

	<!-- Books completed by month -->
	<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
			{m.stats_books_completed()} ({data.year})
		</h2>
		<ChartCanvas type="bar" data={completedChartData} />
	</div>

	<!-- Pages read by month -->
	<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
			{m.stats_pages_read()} ({data.year})
		</h2>
		<ChartCanvas type="bar" data={pagesChartData} />
	</div>

	<!-- By language -->
	{#if data.byLanguage.length > 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
				{m.stats_by_language()}
			</h2>
			<ChartCanvas type="doughnut" data={languageChartData} class="mx-auto max-w-xs" />
		</div>
	{/if}

	<!-- Top authors -->
	<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
		<div class="mb-1 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
				{m.stats_top_authors()}
			</h2>
			<nav class="flex gap-1" aria-label={m.stats_top_authors()}>
				{#each authorScopes as scope (scope.value)}
					<a
						href={href(`/stats?year=${data.year}&authors=${scope.value}`)}
						aria-current={scope.value === data.authorScope ? 'true' : undefined}
						class="min-h-[36px] rounded-lg border px-3 py-1.5 text-sm {scope.value ===
						data.authorScope
							? 'border-indigo-300 bg-indigo-100 font-medium text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
							: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'}"
					>
						{scope.label()}
					</a>
				{/each}
			</nav>
		</div>
		<p class="mb-3 text-sm text-gray-500 dark:text-gray-400">{authorNote}</p>
		{#if data.topAuthors.length === 0}
			<p class="text-sm text-gray-500 dark:text-gray-400">{m.stats_authors_none()}</p>
		{:else}
			<div class="space-y-2">
				{#each data.topAuthors as author, i (author.name)}
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-700 dark:text-gray-300">{i + 1}. {author.name}</span>
						<span class="text-sm font-medium text-indigo-600 dark:text-indigo-400"
							>{author.count}</span
						>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
