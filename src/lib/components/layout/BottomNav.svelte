<script lang="ts">
	import { LayoutDashboard, BookOpen, Library, ChartBar, Users } from 'svelte-lucide';
	import { page } from '$app/state';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';

	const navItems = $derived([
		{ href: '/dashboard', label: m.nav_dashboard(), icon: LayoutDashboard },
		{ href: '/books', label: m.nav_my_books(), icon: BookOpen },
		{ href: '/shelves', label: m.nav_shelves(), icon: Library },
		{ href: '/stats', label: m.nav_stats(), icon: ChartBar },
		{ href: '/friends', label: m.nav_friends(), icon: Users }
	]);

	function isActive(href: string): boolean {
		const pathname = page.url.pathname;
		const clean = pathname.replace(/^\/(en|de)/, '') || '/';
		return clean === href || clean.startsWith(href + '/');
	}
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white md:hidden dark:border-gray-800 dark:bg-gray-900"
>
	<div class="flex items-center justify-around">
		{#each navItems as item (item.href)}
			<a
				href={href(item.href)}
				class="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs
					{isActive(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}"
			>
				<item.icon size="20" />
				<span>{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
