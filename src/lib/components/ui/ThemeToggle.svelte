<script lang="ts">
	import { Sun, Moon } from 'svelte-lucide';
	import * as m from '$lib/paraglide/messages';

	let dark = $state(false);

	function init() {
		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem('theme');
		if (
			stored === 'dark' ||
			(!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			dark = true;
			document.documentElement.classList.add('dark');
		} else {
			dark = false;
			document.documentElement.classList.remove('dark');
		}
	}

	function toggle() {
		dark = !dark;
		if (dark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	$effect(() => {
		init();
	});
</script>

<button
	onclick={toggle}
	class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
	aria-label={m.theme_toggle()}
>
	{#if dark}
		<Sun size="20" />
	{:else}
		<Moon size="20" />
	{/if}
</button>
