<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavBar from '$lib/components/layout/NavBar.svelte';
	import SideBar from '$lib/components/layout/SideBar.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
	<NavBar />

	<div class="flex flex-1">
		<SideBar />

		<main class="min-w-0 flex-1 overflow-x-hidden pb-16 md:pb-0">
			<div class="mx-auto max-w-5xl px-4 py-6">
				{@render children()}
			</div>
		</main>
	</div>

	<BottomNav />
</div>
