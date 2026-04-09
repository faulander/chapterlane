<script lang="ts">
	import { BookOpen } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		bookId: string;
		title: string;
		authors?: string | null;
		coverUrl?: string | null;
		statusLabel?: string | null;
		statusCategory?: string | null;
	}

	let { bookId, title, authors, coverUrl, statusLabel, statusCategory }: Props = $props();
</script>

<a href={href(`/books/${bookId}`)} class="group block">
	<div
		class="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
	>
		{#if coverUrl}
			<img src={coverUrl} alt={title} class="h-48 w-full object-cover" />
		{:else}
			<div class="flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-800">
				<BookOpen size="32" class="text-gray-400 dark:text-gray-600" />
			</div>
		{/if}
		<div class="space-y-1 p-3">
			<h3
				class="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
			>
				{title}
			</h3>
			{#if authors}
				<p class="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{authors}</p>
			{/if}
			{#if statusCategory}
				<StatusBadge category={statusCategory} label={statusLabel} />
			{/if}
		</div>
	</div>
</a>
