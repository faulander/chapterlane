<script lang="ts">
	import { BookOpen, ChevronRight } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import type { FeedGroup, FeedStep } from '$lib/utils/feed-groups';

	let { group }: { group: FeedGroup } = $props();

	function stepLabel(step: FeedStep): string {
		switch (step.kind) {
			case 'added':
				return m.feed_step_added();
			case 'started':
				return m.feed_step_started();
			case 'status':
				return step.label;
			case 'progress':
				if (step.page !== null) return m.feed_step_page({ page: String(step.page) });
				if (step.percent !== null) {
					return m.feed_step_percent({ percent: String(Math.round(step.percent)) });
				}
				return m.feed_step_progress();
			case 'finished':
				return m.feed_book_completed({ name: group.actorName });
			case 'other':
				return step.type;
		}
	}

	function timeAgo(dateStr: string): string {
		const date = new Date(dateStr.replace(' ', 'T') + 'Z');
		const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
		const diffHr = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHr / 24);

		if (diffMin < 1) return 'just now';
		if (diffMin < 60) return `${diffMin}m ago`;
		if (diffHr < 24) return `${diffHr}h ago`;
		if (diffDay < 7) return `${diffDay}d ago`;
		return date.toLocaleDateString();
	}

	const percent = $derived(group.percent === null ? null : Math.round(group.percent));
</script>

<a
	href={group.bookId ? href(`/books/${group.bookId}`) : '#'}
	class="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
>
	{#if group.coverUrl}
		<img
			src={group.coverUrl}
			alt={group.bookTitle || ''}
			class="h-20 w-14 shrink-0 rounded object-cover"
		/>
	{:else}
		<div
			class="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
		>
			<BookOpen size="20" class="text-gray-400 dark:text-gray-600" />
		</div>
	{/if}

	<div class="min-w-0 flex-1">
		<div class="flex items-start justify-between gap-2">
			<div class="min-w-0">
				<h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
					{group.bookTitle || '?'}
				</h3>
				{#if group.seriesName}
					<p class="truncate text-xs text-gray-500 dark:text-gray-400">
						{group.seriesName}{group.seriesPosition ? ` #${group.seriesPosition}` : ''}
					</p>
				{/if}
			</div>
			<span class="shrink-0 text-xs text-gray-400 dark:text-gray-500">
				{timeAgo(group.latestAt)}
			</span>
		</div>

		{#if group.finished}
			<p class="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
				{m.feed_book_completed({ name: group.actorName })}
			</p>
		{:else}
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
				<span class="font-medium text-gray-900 dark:text-white">{group.actorName}</span>
				{#each group.steps as step, index (index)}
					{#if index > 0}<ChevronRight
							size="12"
							class="mx-0.5 inline text-gray-400"
							aria-hidden="true"
						/>{:else}
						<span class="mx-1 text-gray-400">·</span>
					{/if}<span>{stepLabel(step)}</span>
				{/each}
			</p>
		{/if}

		{#if percent !== null}
			<div
				class="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
				role="progressbar"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={percent}
				aria-label={m.feed_step_percent({ percent: String(percent) })}
			>
				<div
					class="h-full rounded-full {group.finished ? 'bg-emerald-500' : 'bg-indigo-500'}"
					style="width: {percent}%"
				></div>
			</div>
		{/if}
	</div>
</a>
