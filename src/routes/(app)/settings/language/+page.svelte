<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>{m.settings_language()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.settings_language()}</h1>

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
				for="preferred_language"
				class="block text-sm font-medium text-gray-700 dark:text-gray-300"
			>
				{m.language_select()}
			</label>
			<select
				id="preferred_language"
				name="preferred_language"
				class="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
			>
				<option value="en" selected={data.user.preferred_language === 'en'}
					>{m.language_en()}</option
				>
				<option value="de" selected={data.user.preferred_language === 'de'}
					>{m.language_de()}</option
				>
			</select>
		</div>
		<Button type="submit">{m.common_save()}</Button>
	</form>
</div>
