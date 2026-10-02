<script lang="ts">
	import { enhance } from '$app/forms';
	import { BookOpen, CalendarDays, Flame, Trophy } from 'svelte-lucide';
	import { href } from '$lib/utils/navigation';
	import * as m from '$lib/paraglide/messages';
	import type { SoloStats } from '$lib/server/db/dashboard-stats';

	let { solo, goalError = false }: { solo: SoloStats; goalError?: boolean } = $props();

	const RING_RADIUS = 24;
	const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

	let editingGoal = $state(false);
	const goalReached = $derived(solo.goal !== null && solo.booksFinishedThisYear >= solo.goal);
	const ringFill = $derived(
		solo.goal === null ? 0 : Math.min(1, solo.booksFinishedThisYear / solo.goal)
	);
</script>

<section class="space-y-3">
	<div class="grid gap-3 sm:grid-cols-3">
		<div
			class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<Flame
				size="32"
				class={solo.streak > 0 ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}
				aria-hidden="true"
			/>
			<div>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
					{m.dash_solo_streak_title()}
				</p>
				<p class="text-2xl leading-tight font-bold text-gray-900 dark:text-white">{solo.streak}</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					{solo.streak > 0 ? m.dash_solo_streak_caption() : m.dash_solo_streak_start()}
				</p>
			</div>
		</div>

		<div
			class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<CalendarDays size="32" class="text-indigo-500" aria-hidden="true" />
			<div>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
					{m.dash_solo_week_title()}
				</p>
				<p class="text-2xl leading-tight font-bold text-gray-900 dark:text-white">
					{solo.daysReadThisWeek}<span class="text-base font-medium text-gray-400">/7</span>
				</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					{m.dash_solo_week_caption()} · {m.dash_solo_week_finished({
						count: String(solo.booksFinishedThisWeek)
					})}
				</p>
			</div>
		</div>

		<div
			class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<div class="flex items-center gap-3">
				<div class="relative h-14 w-14 shrink-0">
					<svg viewBox="0 0 56 56" class="h-14 w-14 -rotate-90" aria-hidden="true">
						<circle
							cx="28"
							cy="28"
							r={RING_RADIUS}
							fill="none"
							stroke-width="5"
							class="stroke-gray-100 dark:stroke-gray-800"
						/>
						<circle
							cx="28"
							cy="28"
							r={RING_RADIUS}
							fill="none"
							stroke-width="5"
							stroke-linecap="round"
							stroke-dasharray="{RING_CIRCUMFERENCE * ringFill} {RING_CIRCUMFERENCE}"
							class={goalReached ? 'stroke-emerald-500' : 'stroke-indigo-500'}
						/>
					</svg>
					<div class="absolute inset-0 flex items-center justify-center">
						{#if goalReached}
							<Trophy size="20" class="text-emerald-500" aria-hidden="true" />
						{:else}
							<span class="text-sm font-bold text-gray-900 dark:text-white"
								>{solo.booksFinishedThisYear}</span
							>
						{/if}
					</div>
				</div>
				<div>
					<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
						{m.dash_solo_goal_title({ year: String(solo.year) })}
					</p>
					<p class="text-2xl leading-tight font-bold text-gray-900 dark:text-white">
						{solo.booksFinishedThisYear}{#if solo.goal !== null}<span
								class="text-base font-medium text-gray-400">/{solo.goal}</span
							>{/if}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">{m.dash_solo_goal_caption()}</p>
				</div>
			</div>

			<details
				class="mt-2 text-xs"
				open={editingGoal || goalError}
				ontoggle={(e) => (editingGoal = e.currentTarget.open)}
			>
				<summary class="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400">
					{solo.goal === null ? m.dash_solo_goal_set() : m.dash_solo_goal_change()}
				</summary>
				<form
					method="POST"
					action="?/setGoal"
					class="mt-2 space-y-1"
					use:enhance={() =>
						async ({ result, update }) => {
							await update();
							if (result.type === 'success') editingGoal = false;
						}}
				>
					<label class="flex flex-col gap-1 text-gray-600 dark:text-gray-300"
						>{m.dash_solo_goal_label()}
						<span class="flex gap-2">
							<input
								name="goal"
								type="number"
								min="1"
								max="1000"
								value={solo.goal ?? ''}
								class="min-h-9 w-24 rounded-lg border border-gray-300 bg-white px-2 dark:border-gray-700 dark:bg-gray-900"
							/>
							<button
								class="min-h-9 rounded-lg bg-indigo-700 px-3 font-medium text-white hover:bg-indigo-600"
								>{m.common_save()}</button
							>
						</span>
					</label>
					<p class="text-gray-500 dark:text-gray-400">{m.dash_solo_goal_hint()}</p>
					{#if goalError}
						<p role="alert" class="text-red-600">{m.dash_solo_goal_error()}</p>
					{/if}
				</form>
			</details>
		</div>
	</div>

	{#if solo.recentlyFinished.length > 0}
		<div
			class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
		>
			<h3
				class="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
			>
				{m.dash_solo_recent()}
			</h3>
			<div class="flex gap-2 overflow-x-auto pb-1">
				{#each solo.recentlyFinished as book (book.book_id)}
					<a
						href={href(`/books/${book.book_id}`)}
						title={book.title}
						class="shrink-0 transition-transform hover:-translate-y-0.5"
					>
						{#if book.cover_url}
							<img
								src={book.cover_url}
								alt={book.title}
								class="h-24 w-16 rounded object-cover shadow-sm"
							/>
						{:else}
							<div
								class="flex h-24 w-16 items-center justify-center rounded bg-gray-100 shadow-sm dark:bg-gray-800"
								role="img"
								aria-label={book.title}
							>
								<BookOpen size="20" class="text-gray-400 dark:text-gray-600" />
							</div>
						{/if}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</section>
