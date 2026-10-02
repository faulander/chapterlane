<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	interface Props {
		category: string | null;
		label?: string | null;
	}

	let { category, label }: Props = $props();

	const categoryColors: Record<string, string> = {
		planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
		dropped: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
	};

	const categoryLabels: Record<string, () => string> = {
		planned: m.status_planned,
		active: m.status_active,
		paused: m.status_paused,
		completed: m.status_completed,
		dropped: m.status_dropped
	};

	const colorClass = $derived(
		categoryColors[category ?? ''] ??
			'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
	);
	const displayLabel = $derived(label ?? categoryLabels[category ?? '']?.() ?? category);
</script>

{#if category || label}
	<span
		class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colorClass}"
	>
		{displayLabel}
	</span>
{/if}
