<script lang="ts">
	import { KeyRound } from 'svelte-lucide';
	import * as m from '$lib/paraglide/messages';
	let { data, form } = $props();
</script>

<svelte:head>
	<title>{m.device_title()} | {m.app_name()}</title>
</svelte:head>

<div class="max-w-2xl space-y-8 text-gray-900 dark:text-gray-100">
	<header class="space-y-2 border-b border-gray-200 pb-6 dark:border-gray-800">
		<div class="flex items-center gap-3">
			<KeyRound size="24" />
			<h1 class="text-2xl font-bold">{m.device_title()}</h1>
		</div>
		<p class="text-sm text-gray-600 dark:text-gray-400">{m.device_intro()}</p>
	</header>

	<section class="space-y-4">
		<h2 class="font-semibold">{m.device_new()}</h2>
		<form method="POST" action="?/create" class="flex flex-wrap items-end gap-3">
			<label class="flex min-w-48 flex-1 flex-col gap-1 text-sm"
				>{m.device_name()}
				<input
					required
					maxlength="80"
					name="name"
					placeholder="My KOReader"
					class="min-h-11 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
				/>
			</label>
			<button
				class="min-h-11 rounded-lg bg-indigo-700 px-4 font-medium text-white hover:bg-indigo-600"
				>{m.device_create()}</button
			>
		</form>
		{#if form?.error}<p role="alert" class="text-sm text-red-600">{form.error}</p>{/if}
		{#if form?.token}
			<div
				class="space-y-2 rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
			>
				<p class="font-semibold">{m.device_copy()}</p>
				<code class="block text-sm break-all select-all">{form.token}</code>
			</div>
		{/if}
	</section>

	<section class="space-y-4">
		<h2 class="font-semibold">{m.device_active()}</h2>
		{#if data.tokens.length === 0}<p class="text-sm text-gray-500">{m.device_none()}</p>{/if}
		<ul
			class="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800"
		>
			{#each data.tokens as token (token.id)}
				<li class="flex items-center justify-between gap-4 p-4">
					<div>
						<p class="font-medium">{token.name}</p>
						<p class="text-xs text-gray-500">{m.device_created({ date: token.created_at })}</p>
					</div>
					<form method="POST" action="?/revoke">
						<input type="hidden" name="id" value={token.id} /><button
							class="min-h-11 rounded-lg border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
							>{m.device_revoke()}</button
						>
					</form>
				</li>
			{/each}
		</ul>
	</section>
</div>
