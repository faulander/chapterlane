<script lang="ts">
	import {
		User,
		Shield,
		Globe,
		BookMarked,
		Tag,
		Upload,
		KeyRound,
		ScrollText
	} from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	const sections = $derived([
		{ href: '/settings/profile', icon: User, label: m.settings_profile() },
		{ href: '/settings/privacy', icon: Shield, label: m.settings_privacy() },
		{ href: '/settings/language', icon: Globe, label: m.settings_language() },
		{ href: '/settings/statuses', icon: Tag, label: m.settings_statuses_title() },
		{ href: '/settings/reading-places', icon: BookMarked, label: m.reading_places_title() },
		{ href: '/settings/devices', icon: KeyRound, label: m.device_title() },
		{ href: '/import', icon: Upload, label: m.import_title() },
		...(data.canViewLogs
			? [{ href: '/settings/logs', icon: ScrollText, label: m.logs_title() }]
			: [])
	]);
</script>

<svelte:head>
	<title>{m.nav_settings()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.nav_settings()}</h1>
	<div class="grid gap-3 sm:grid-cols-2">
		{#each sections as section (section.href)}
			<a
				href={href(section.href)}
				class="flex min-h-[44px] items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20"
			>
				<section.icon size="18" class="text-gray-500 dark:text-gray-400" />
				<span class="font-medium">{section.label}</span>
			</a>
		{/each}
	</div>
</div>
