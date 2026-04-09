<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses = {
		primary:
			'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600',
		secondary:
			'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
		ghost:
			'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
		danger:
			'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm min-h-[36px]',
		md: 'px-4 py-2 text-sm min-h-[44px]',
		lg: 'px-6 py-3 text-base min-h-[48px]'
	};
</script>

<button class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}" {...rest}>
	{@render children()}
</button>
