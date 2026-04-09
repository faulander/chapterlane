<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{m.settings_privacy()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.settings_privacy()}</h1>

	{#if form?.success}
		<div
			class="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
		>
			{m.common_success()}
		</div>
	{/if}

	<form method="POST" use:enhance class="max-w-lg space-y-4">
		<div class="space-y-1">
			<label
				for="profile_visibility"
				class="block text-sm font-medium text-gray-700 dark:text-gray-300"
			>
				{m.privacy_profile_visibility()}
			</label>
			<select
				id="profile_visibility"
				name="profile_visibility"
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
			>
				<option value="public" selected={data.user.profile_visibility === 'public'}
					>{m.visibility_public()}</option
				>
				<option value="friends" selected={data.user.profile_visibility === 'friends'}
					>{m.visibility_friends()}</option
				>
				<option value="private" selected={data.user.profile_visibility === 'private'}
					>{m.visibility_private()}</option
				>
			</select>
		</div>
		<Button type="submit">{m.common_save()}</Button>
	</form>
</div>
