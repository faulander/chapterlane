<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import FormError from '$lib/components/ui/FormError.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>{m.auth_register()} | {m.app_name()}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.app_name()}</h1>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{m.auth_register_title()}</p>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			<FormError message={form?.errors?.form} />

			<Input
				label={m.auth_username()}
				name="username"
				type="text"
				autocomplete="username"
				required
				value={form?.username ?? ''}
				error={form?.errors?.username}
			/>

			<Input
				label={m.auth_email()}
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
				error={form?.errors?.email}
			/>

			<Input
				label={m.auth_password()}
				name="password"
				type="password"
				autocomplete="new-password"
				required
				error={form?.errors?.password}
			/>

			<Input
				label={m.auth_confirm_password()}
				name="confirm_password"
				type="password"
				autocomplete="new-password"
				required
				error={form?.errors?.confirm_password}
			/>

			<Button type="submit" class="w-full">{m.auth_register_submit()}</Button>
		</form>

		<p class="text-center text-sm text-gray-600 dark:text-gray-400">
			{m.auth_has_account()}
			<a
				href={resolve(localizeHref('/login'))}
				class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
			>
				{m.auth_login()}
			</a>
		</p>
	</div>
</div>
