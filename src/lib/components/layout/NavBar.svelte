<script lang="ts">
	import { BookOpen, Menu, X } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import LanguageSwitcher from '$lib/components/layout/LanguageSwitcher.svelte';

	let menuOpen = $state(false);
</script>

<header
	class="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
>
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
		<a
			href={href('/dashboard')}
			class="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white"
		>
			<BookOpen size="24" />
			<span class="hidden sm:inline">{m.app_name()}</span>
		</a>

		<div class="flex items-center gap-1">
			<LanguageSwitcher />
			<ThemeToggle />
			<button
				onclick={() => (menuOpen = !menuOpen)}
				class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
				aria-label="Menu"
			>
				{#if menuOpen}
					<X size="20" />
				{:else}
					<Menu size="20" />
				{/if}
			</button>
		</div>
	</div>

	{#if menuOpen}
		<nav class="border-t border-gray-200 bg-white md:hidden dark:border-gray-800 dark:bg-gray-900">
			<div class="space-y-1 px-4 py-2">
				<a
					href={href('/dashboard')}
					class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					onclick={() => (menuOpen = false)}
				>
					{m.nav_dashboard()}
				</a>
				<a
					href={href('/books')}
					class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					onclick={() => (menuOpen = false)}
				>
					{m.nav_my_books()}
				</a>
				<a
					href={href('/shelves')}
					class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					onclick={() => (menuOpen = false)}
				>
					{m.nav_shelves()}
				</a>
				<a
					href={href('/lists')}
					class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					onclick={() => (menuOpen = false)}
				>
					{m.nav_lists()}
				</a>
				<a
					href={href('/stats')}
					class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					onclick={() => (menuOpen = false)}
				>
					{m.nav_stats()}
				</a>
				<a
					href={href('/friends')}
					class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					onclick={() => (menuOpen = false)}
				>
					{m.nav_friends()}
				</a>
				<a
					href={href('/settings')}
					class="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					onclick={() => (menuOpen = false)}
				>
					{m.nav_settings()}
				</a>
			</div>
		</nav>
	{/if}
</header>
