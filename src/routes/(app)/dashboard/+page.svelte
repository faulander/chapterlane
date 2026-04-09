<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.nav_dashboard()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
		{m.dashboard_welcome({ name: data.user.display_name || data.user.username })}
	</h1>

	<div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		<p class="text-gray-600 dark:text-gray-400">
			{m.dashboard_empty()}
		</p>
	</div>
</div>
