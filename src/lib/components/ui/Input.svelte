<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label: string;
		error?: string | null;
	}

	let { label, error = null, id, class: className = '', ...rest }: Props = $props();

	const inputId = $derived(id || label.toLowerCase().replace(/\s+/g, '-'));
</script>

<div class="space-y-1">
	<label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>
	<input
		id={inputId}
		class="block min-h-[44px] w-full rounded-lg border px-3 py-2 text-sm
			{error
			? 'border-red-500 focus:border-red-500 focus:ring-red-500'
			: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}
			bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2
			focus:outline-none dark:bg-gray-800
			dark:text-gray-100 dark:placeholder:text-gray-500 {className}"
		{...rest}
	/>
	{#if error}
		<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}
</div>
