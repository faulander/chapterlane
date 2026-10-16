<script lang="ts">
	import { Sun, Moon } from 'svelte-lucide';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';
	import { href } from '$lib/utils/navigation';
	import { applyAppearance, isColorMode, isDark } from '$lib/themes';

	let prefersDark = $state(false);

	$effect(() => {
		const query = window.matchMedia('(prefers-color-scheme: dark)');
		prefersDark = query.matches;
		const onChange = () => (prefersDark = query.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	const dark = $derived(isDark(page.data.appearance.mode, prefersDark));
</script>

<!-- Switches between light and dark within the chosen theme; the theme itself is picked in Settings. -->
<form
	method="POST"
	action={href('/settings/appearance')}
	use:enhance={({ formData }) => {
		const mode = formData.get('mode');
		if (isColorMode(mode)) {
			applyAppearance(document.documentElement, { theme: page.data.appearance.theme, mode });
		}
	}}
>
	<input type="hidden" name="mode" value={dark ? 'light' : 'dark'} />
	<button
		type="submit"
		class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
		aria-label={m.theme_toggle()}
	>
		{#if dark}
			<Sun size="20" />
		{:else}
			<Moon size="20" />
		{/if}
	</button>
</form>
