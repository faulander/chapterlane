<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	function formatEvent(event: (typeof data.feed)[0]): string {
		const name = event.actor_display_name || event.actor_username;
		const payload = event.payload_json ? JSON.parse(event.payload_json) : {};

		switch (event.event_type) {
			case 'status_changed':
				return m.feed_status_changed({
					name,
					book: payload.book_title || '?',
					status: payload.status_label || '?'
				});
			case 'book_completed':
				return m.feed_book_completed({ name, book: payload.book_title || '?' });
			case 'progress_milestone':
				return m.feed_progress_milestone({
					name,
					book: payload.book_title || '?',
					percent: String(payload.percent || 0)
				});
			default:
				return `${name}: ${event.event_type}`;
		}
	}
</script>

<svelte:head>
	<title>{m.nav_dashboard()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
		{m.dashboard_welcome({ name: data.user.display_name || data.user.username })}
	</h1>

	{#if data.feed.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-600 dark:text-gray-400">{m.feed_empty()}</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.feed as event (event.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
				>
					<p class="text-sm text-gray-700 dark:text-gray-300">{formatEvent(event)}</p>
					<p class="mt-1 text-xs text-gray-400">
						{new Date(event.created_at).toLocaleDateString()}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
