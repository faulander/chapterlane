<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { href } from '$lib/utils/navigation';
	import { page } from '$app/state';

	const locales = [
		{ code: 'en', label: 'EN' },
		{ code: 'de', label: 'DE' }
	] as const;

	const currentLocale = $derived(getLocale());

	function getCleanPath(): string {
		const pathname = page.url.pathname;
		return pathname.replace(/^\/(en|de)/, '') || '/';
	}
</script>

<div class="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
	{#each locales as locale (locale.code)}
		<a
			href={href(getCleanPath(), { locale: locale.code })}
			data-sveltekit-reload
			class="flex min-h-[32px] items-center rounded-md px-2 py-1 text-xs font-medium
				{currentLocale === locale.code
				? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
				: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
		>
			{locale.label}
		</a>
	{/each}
</div>
