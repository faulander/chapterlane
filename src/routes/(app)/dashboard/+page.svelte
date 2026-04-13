<script lang="ts">
	import { BookOpen } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	function formatEvent(event: (typeof data.feed)[0]): string {
		const name = event.actor_display_name || event.actor_username;
		const payload = event.payload_json ? JSON.parse(event.payload_json) : {};

		switch (event.event_type) {
			case 'status_changed':
				return m.feed_status_changed({
					name,
					status: payload.status_label || '?'
				});
			case 'book_completed':
				return m.feed_book_completed({ name });
			case 'book_started':
				return m.feed_book_started({ name });
			case 'book_added':
				return m.feed_book_added({ name });
			case 'progress_milestone':
				return m.feed_progress_milestone({
					name,
					percent: String(payload.percent || 0)
				});
			case 'progress_logged': {
				if (payload.page) {
					return m.feed_progress_logged_page({ name, page: String(payload.page) });
				}
				if (payload.percent) {
					return m.feed_progress_logged_percent({
						name,
						percent: String(Math.round(payload.percent))
					});
				}
				return m.feed_progress_logged({ name });
			}
			default:
				return `${name}: ${event.event_type}`;
		}
	}

	function timeAgo(dateStr: string): string {
		const now = new Date();
		const date = new Date(dateStr + 'Z');
		const diffMs = now.getTime() - date.getTime();
		const diffMin = Math.floor(diffMs / 60000);
		const diffHr = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHr / 24);

		if (diffMin < 1) return 'just now';
		if (diffMin < 60) return `${diffMin}m ago`;
		if (diffHr < 24) return `${diffHr}h ago`;
		if (diffDay < 7) return `${diffDay}d ago`;
		return date.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>{m.nav_dashboard()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
		{m.dashboard_welcome({ name: data.user.display_name || data.user.username })}
	</h1>

	{#if data.ownFeed}
		<h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
			{m.feed_own_activity()}
		</h2>
	{/if}

	{#if data.feed.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-600 dark:text-gray-400">{m.feed_empty()}</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.feed as event (event.id)}
				<a
					href={event.book_id ? href(`/books/${event.book_id}`) : '#'}
					class="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
				>
					{#if event.book_cover_url}
						<img
							src={event.book_cover_url}
							alt={event.book_title || ''}
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
								<h3
									class="truncate text-sm font-semibold text-gray-900 dark:text-white"
								>
									{event.book_title || '?'}
								</h3>
								{#if event.series_name}
									<p class="truncate text-xs text-gray-500 dark:text-gray-400">
										{event.series_name}{event.series_position
											? ` #${event.series_position}`
											: ''}
									</p>
								{/if}
							</div>
							<span
								class="shrink-0 text-xs text-gray-400 dark:text-gray-500"
							>
								{timeAgo(event.created_at)}
							</span>
						</div>

						<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
							{formatEvent(event)}
						</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
