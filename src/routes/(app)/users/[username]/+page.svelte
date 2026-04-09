<script lang="ts">
	import { User } from 'svelte-lucide';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.profile.display_name || data.profile.username} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		{#if data.profile.avatar_url}
			<img
				src={data.profile.avatar_url}
				alt={data.profile.username}
				class="h-16 w-16 rounded-full object-cover"
			/>
		{:else}
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800"
			>
				<User size="24" class="text-gray-500" />
			</div>
		{/if}
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				{data.profile.display_name || data.profile.username}
			</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400">@{data.profile.username}</p>
			<p class="text-xs text-gray-400">
				{m.profile_member_since({
					date: new Date(data.profile.created_at).toLocaleDateString()
				})}
			</p>
		</div>
	</div>

	{#if data.profile.bio}
		<p class="text-gray-700 dark:text-gray-300">{data.profile.bio}</p>
	{/if}

	<p class="text-sm text-gray-500 dark:text-gray-400">
		{data.bookCount} books
		{#if data.areFriends}
			<span
				class="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
			>
				Friend
			</span>
		{/if}
	</p>

	{#if data.activity.length > 0}
		<div class="space-y-2">
			{#each data.activity as event (event.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
				>
					{event.event_type}
					<span class="text-xs text-gray-400"
						>{new Date(event.created_at).toLocaleDateString()}</span
					>
				</div>
			{/each}
		</div>
	{/if}
</div>
