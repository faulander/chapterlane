<script lang="ts">
	import { page } from '$app/state';
	import { locales } from '$lib/paraglide/runtime';
	import { href } from '$lib/utils/navigation';
	import { THEME_CSS, applyAppearance } from '$lib/themes';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();

	// Keeps the document in sync after saving a setting, and follows the OS preference
	// while the mode is "system".
	$effect(() => {
		const appearance = data.appearance;
		applyAppearance(document.documentElement, appearance);
		if (appearance.mode !== 'system') return;
		const query = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = () => applyAppearance(document.documentElement, appearance);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static palette constants, no user input -->
	{@html `<style>${THEME_CSS}</style>`}
</svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={href(page.url.pathname, { locale })} data-sveltekit-reload>{locale}</a>
	{/each}
</div>
