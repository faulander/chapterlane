<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{m.settings_profile()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.settings_profile()}</h1>

	{#if form?.success}
		<div
			class="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
		>
			{m.common_success()}
		</div>
	{/if}

	<form method="POST" use:enhance class="max-w-lg space-y-4">
		<Input
			label={m.profile_display_name()}
			name="display_name"
			value={data.user.display_name ?? ''}
		/>
		<Input
			label={m.profile_avatar()}
			name="avatar_url"
			type="url"
			placeholder="https://..."
			value={data.user.avatar_url ?? ''}
		/>
		<div class="space-y-1">
			<label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>{m.profile_bio()}</label
			>
			<textarea
				id="bio"
				name="bio"
				rows="3"
				class="block min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
				>{data.user.bio ?? ''}</textarea
			>
		</div>
		<Button type="submit">{m.common_save()}</Button>
	</form>
</div>
