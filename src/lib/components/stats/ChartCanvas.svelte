<script lang="ts">
	import { Chart, registerables } from 'chart.js';

	interface Props {
		type: 'bar' | 'line' | 'doughnut' | 'pie';
		data: import('chart.js').ChartData;
		options?: import('chart.js').ChartOptions;
		class?: string;
	}

	let { type, data, options = {}, class: className = '' }: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined = $state();

	Chart.register(...registerables);

	$effect(() => {
		if (!canvas) return;

		if (chart) chart.destroy();

		chart = new Chart(canvas, {
			type,
			data,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				...options
			}
		});

		return () => {
			chart?.destroy();
		};
	});
</script>

<div class="relative {className}" style="min-height: 250px">
	<canvas bind:this={canvas}></canvas>
</div>
