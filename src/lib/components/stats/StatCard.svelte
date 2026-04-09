<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
	}

	let { label, value }: Props = $props();
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
	<p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
	<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
</div>
