<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { onDestroy } from 'svelte';

	interface Props {
		type: 'bar' | 'line' | 'doughnut' | 'pie';
		data: import('chart.js').ChartData;
		options?: import('chart.js').ChartOptions;
		class?: string;
	}

	let { type, data, options = {}, class: className = '' }: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined;

	Chart.register(...registerables);

	$effect(() => {
		if (!canvas) return;

		chart?.destroy();

		chart = new Chart(canvas, {
			type,
			data,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				...options
			}
		});
	});

	onDestroy(() => {
		chart?.destroy();
		chart = undefined;
	});
</script>

<div class="relative {className}" style="min-height: 250px">
	<canvas bind:this={canvas}></canvas>
</div>
