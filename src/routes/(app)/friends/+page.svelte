<script lang="ts">
	import { enhance } from '$app/forms';
	import { UserPlus, UserMinus, Check, X, Search } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.friends_title()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.friends_title()}</h1>

	<!-- Search users -->
	<form action={href('/friends')} method="GET" class="flex gap-2">
		<div class="relative flex-1">
			<Search size="18" class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
			<input
				name="q"
				type="text"
				value={data.searchQuery}
				placeholder={m.friends_search()}
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
			/>
		</div>
		<Button type="submit" variant="secondary">{m.search_title()}</Button>
	</form>

	{#if data.searchResults.length > 0}
		<div class="space-y-2">
			{#each data.searchResults as user (user.id)}
				<div
					class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
				>
					<a
						href={href(`/users/${user.username}`)}
						class="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
					>
						{user.display_name || user.username}
						<span class="text-sm text-gray-500">@{user.username}</span>
					</a>
					<form method="POST" action="?/sendRequest" use:enhance>
						<input type="hidden" name="username" value={user.username} />
						<Button type="submit" size="sm" variant="secondary">
							<UserPlus size="14" class="mr-1" />{m.friends_send_request()}
						</Button>
					</form>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Pending requests -->
	{#if data.pending.length > 0}
		<div class="space-y-3">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{m.friends_pending()}</h2>
			{#each data.pending as req (req.id)}
				<div
					class="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-900 dark:bg-yellow-950"
				>
					<span class="font-medium text-gray-900 dark:text-white">
						{req.sender.display_name || req.sender.username}
					</span>
					<div class="flex gap-1">
						<form method="POST" action="?/accept" use:enhance>
							<input type="hidden" name="request_id" value={req.id} />
							<button
								type="submit"
								class="rounded bg-green-500 p-1.5 text-white hover:bg-green-600"
								aria-label={m.friends_accept()}
							>
								<Check size="16" />
							</button>
						</form>
						<form method="POST" action="?/reject" use:enhance>
							<input type="hidden" name="request_id" value={req.id} />
							<button
								type="submit"
								class="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
								aria-label={m.friends_reject()}
							>
								<X size="16" />
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Friends list -->
	{#if data.friends.length === 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
		>
			<p class="text-gray-500 dark:text-gray-400">{m.friends_empty()}</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each data.friends as friend (friend.id)}
				<div
					class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
				>
					<a
						href={href(`/users/${friend.username}`)}
						class="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
					>
						{friend.display_name || friend.username}
						<span class="ml-1 text-sm text-gray-500">@{friend.username}</span>
					</a>
					<form method="POST" action="?/remove" use:enhance>
						<input type="hidden" name="friend_id" value={friend.id} />
						<button
							type="submit"
							class="rounded p-1 text-gray-400 hover:text-red-500"
							aria-label={m.friends_remove()}
						>
							<UserMinus size="16" />
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>
