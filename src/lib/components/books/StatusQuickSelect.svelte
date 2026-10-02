<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import { href } from '$lib/utils/navigation';
	import { Check, LoaderCircle } from 'svelte-lucide';

	interface StatusOption {
		id: string;
		label: string;
		system_category: string | null;
	}

	interface Props {
		bookId: string;
		statuses: StatusOption[];
		currentStatusId: string | null;
		hasTotalPages: boolean;
		size?: 'sm' | 'md';
	}

	let { bookId, statuses, currentStatusId, hasTotalPages, size = 'md' }: Props = $props();

	// Local override while the user has an uncommitted/in-flight choice;
	// cleared once the server round-trip resolves so the control reflects
	// `currentStatusId`/`hasTotalPages` again.
	let localSelected = $state<string | null>(null);
	let pendingPages = $state(false);
	let totalPagesValue = $state('');
	let phase = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let errorMessage = $state('');
	let formEl: HTMLFormElement;

	const selected = $derived(localSelected ?? currentStatusId ?? statuses[0]?.id ?? '');

	const categoryLabels: Record<string, () => string> = {
		planned: m.status_planned,
		active: m.status_active,
		paused: m.status_paused,
		completed: m.status_completed,
		dropped: m.status_dropped
	};

	function statusLabel(status: StatusOption): string {
		if (status.system_category && categoryLabels[status.system_category]) {
			return categoryLabels[status.system_category]();
		}
		return status.label;
	}

	function selectedNeedsPages(candidate: string): boolean {
		const status = statuses.find((s) => s.id === candidate);
		return !!status && status.system_category !== 'planned' && !hasTotalPages;
	}

	function onSelectChange(value: string) {
		errorMessage = '';
		phase = 'idle';
		localSelected = value;
		if (selectedNeedsPages(value)) {
			pendingPages = true;
			return;
		}
		pendingPages = false;
		formEl.requestSubmit();
	}

	function submitWithPages() {
		if (!totalPagesValue) return;
		formEl.requestSubmit();
	}

	const selectClass = $derived(
		size === 'sm'
			? 'min-h-[32px] rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
			: 'min-h-[44px] w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
	);
</script>

<form
	bind:this={formEl}
	method="POST"
	action="{href(`/books/${bookId}`)}?/setStatus"
	use:enhance={() => {
		phase = 'saving';
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				phase = 'error';
				errorMessage = (result.data?.error as string | undefined) ?? m.status_update_failed();
				localSelected = null;
			} else if (result.type === 'success') {
				phase = 'saved';
				pendingPages = false;
				totalPagesValue = '';
				localSelected = null;
				setTimeout(() => {
					if (phase === 'saved') phase = 'idle';
				}, 1500);
			}
			await update();
		};
	}}
	class="flex flex-col gap-1.5"
>
	<div class="flex items-center gap-2">
		<select
			name="status_id"
			value={selected}
			onchange={(e) => onSelectChange(e.currentTarget.value)}
			disabled={phase === 'saving'}
			class={selectClass}
			aria-label={m.status_change()}
		>
			{#each statuses as status (status.id)}
				<option value={status.id}>{statusLabel(status)}</option>
			{/each}
		</select>
		{#if phase === 'saving'}
			<LoaderCircle size="16" class="shrink-0 animate-spin text-gray-400" />
		{:else if phase === 'saved'}
			<Check size="16" class="shrink-0 text-green-600 dark:text-green-400" />
		{/if}
	</div>

	{#if pendingPages}
		<div
			class="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-900/60 dark:bg-amber-950/25"
		>
			<input
				type="number"
				name="total_pages"
				min="1"
				placeholder="320"
				bind:value={totalPagesValue}
				class="w-20 rounded border border-amber-300 bg-white px-2 py-1 text-sm dark:border-amber-800 dark:bg-gray-950 dark:text-gray-100"
			/>
			<button
				type="button"
				onclick={submitWithPages}
				disabled={!totalPagesValue}
				class="text-xs font-medium text-amber-800 underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-300"
			>
				{m.common_save()}
			</button>
			<span class="w-full text-xs text-amber-700 dark:text-amber-400">
				{m.status_total_pages_hint()}
			</span>
		</div>
	{/if}

	{#if phase === 'error' && errorMessage}
		<p class="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
	{/if}
</form>
