<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import FormError from '$lib/components/ui/FormError.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>{m.book_add_heading()} | {m.app_name()}</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{m.book_add_heading()}</h1>

	<form method="POST" use:enhance class="max-w-lg space-y-4">
		<FormError message={form?.errors?.form} />

		<Input
			label={m.book_original_title()}
			name="title"
			type="text"
			required
			value={form?.title ?? ''}
			error={form?.errors?.title}
		/>

		<Input
			label={m.book_language()}
			name="language"
			type="text"
			placeholder="en"
			value={form?.language ?? 'en'}
		/>

		<Input
			label={m.book_authors()}
			name="authors"
			type="text"
			placeholder={m.book_authors_placeholder()}
			value={form?.authors ?? ''}
		/>

		<div class="space-y-1">
			<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				{m.book_description()}
			</label>
			<textarea
				id="description"
				name="description"
				rows="3"
				class="block min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
				>{form?.description ?? ''}</textarea
			>
		</div>

		<Input
			label={m.book_cover_url()}
			name="cover_url"
			type="url"
			placeholder="https://..."
			value={form?.coverUrl ?? ''}
		/>

		<Button type="submit">{m.book_add_submit()}</Button>
	</form>
</div>
