<script lang="ts">
	interface Props {
		message?: string | null;
	}

	let { message = null }: Props = $props();
</script>

{#if message}
	<div
		class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
	>
		<p class="text-sm text-red-700 dark:text-red-400">{message}</p>
	</div>
{/if}
