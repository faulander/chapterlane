<script lang="ts">
	import {
		LayoutDashboard,
		BookOpen,
		Library,
		ListOrdered,
		ChartBar,
		Users,
		Settings,
		LogOut
	} from 'svelte-lucide';
	import { page } from '$app/state';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';

	const navItems = $derived([
		{ href: '/dashboard', label: m.nav_dashboard(), icon: LayoutDashboard },
		{ href: '/books', label: m.nav_my_books(), icon: BookOpen },
		{ href: '/shelves', label: m.nav_shelves(), icon: Library },
		{ href: '/lists', label: m.nav_lists(), icon: ListOrdered },
		{ href: '/stats', label: m.nav_stats(), icon: ChartBar },
		{ href: '/friends', label: m.nav_friends(), icon: Users },
		{ href: '/settings', label: m.nav_settings(), icon: Settings }
	]);

	function isActive(href: string): boolean {
		const pathname = page.url.pathname;
		// Strip locale prefix for comparison
		const clean = pathname.replace(/^\/(en|de)/, '') || '/';
		return clean === href || clean.startsWith(href + '/');
	}
</script>

<aside
	class="hidden md:flex md:w-56 md:flex-col md:border-r md:border-gray-200 md:bg-white md:dark:border-gray-800 md:dark:bg-gray-900"
>
	<nav class="flex flex-1 flex-col gap-1 p-3">
		{#each navItems as item (item.href)}
			<a
				href={href(item.href)}
				class="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
					{isActive(item.href)
					? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
					: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}"
			>
				<item.icon size="18" />
				{item.label}
			</a>
		{/each}
	</nav>

	<div class="border-t border-gray-200 p-3 dark:border-gray-800">
		<form method="POST" action={href('/logout')}>
			<button
				type="submit"
				class="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
			>
				<LogOut size="18" />
				{m.nav_logout()}
			</button>
		</form>
	</div>
</aside>
