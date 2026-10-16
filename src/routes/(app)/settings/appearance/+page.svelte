<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import { COLOR_MODES, THEMES, applyAppearance, isColorMode, isThemeId } from '$lib/themes';

	let { data, form } = $props();

	const modeLabels = {
		system: m.appearance_mode_system,
		light: m.appearance_mode_light,
		dark: m.appearance_mode_dark
	};
</script>

<svelte:head>
	<title>{m.settings_appearance()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.settings_appearance()}</h1>

	{#if form?.success}
		<div
			class="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
		>
			{m.common_success()}
		</div>
	{/if}

	<form
		method="POST"
		class="space-y-6"
		use:enhance={({ formData }) => {
			// Preview immediately; the saved value arrives with the refreshed page data.
			const theme = formData.get('theme');
			const mode = formData.get('mode');
			applyAppearance(document.documentElement, {
				theme: isThemeId(theme) ? theme : data.appearance.theme,
				mode: isColorMode(mode) ? mode : data.appearance.mode
			});
		}}
		onchange={(event) => event.currentTarget.requestSubmit()}
	>
		<fieldset class="space-y-2">
			<legend class="text-sm font-medium text-gray-700 dark:text-gray-300">
				{m.appearance_mode()}
			</legend>
			<div class="flex flex-wrap gap-2">
				{#each COLOR_MODES as mode (mode)}
					<label
						class="flex min-h-[44px] cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:has-[:checked]:bg-indigo-900/20 dark:has-[:checked]:text-indigo-300"
					>
						<input
							type="radio"
							name="mode"
							value={mode}
							checked={data.appearance.mode === mode}
							class="sr-only"
						/>
						{modeLabels[mode]()}
					</label>
				{/each}
			</div>
		</fieldset>

		<fieldset class="space-y-2">
			<legend class="text-sm font-medium text-gray-700 dark:text-gray-300">
				{m.appearance_theme()}
			</legend>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
				{#each THEMES as theme (theme.id)}
					<label
						class="cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-white has-[:checked]:border-indigo-500 has-[:checked]:ring-2 has-[:checked]:ring-indigo-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
					>
						<input
							type="radio"
							name="theme"
							value={theme.id}
							checked={data.appearance.theme === theme.id}
							class="sr-only"
						/>
						<span class="grid grid-cols-2" aria-hidden="true">
							{#each [theme.light, theme.dark] as palette, i (i)}
								<span
									class="flex h-16 flex-col justify-center gap-1.5 px-3"
									style:background-color={i === 0 ? palette.light : palette.dark}
								>
									<span class="block h-2 w-3/4 rounded-full" style:background-color={palette.accent}
									></span>
									<span
										class="block h-2 w-full rounded-full"
										style:background-color={palette.surface}
										style:box-shadow="0 0 0 1px color-mix(in oklab, {i === 0
											? palette.dark
											: palette.light} 25%, transparent)"
									></span>
									<span
										class="block h-2 w-1/2 rounded-full opacity-50"
										style:background-color={i === 0 ? palette.dark : palette.light}
									></span>
								</span>
							{/each}
						</span>
						<span class="block px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
							{theme.name}
						</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<noscript><Button type="submit">{m.common_save()}</Button></noscript>
	</form>
</div>
