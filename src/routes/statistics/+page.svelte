<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { samples, species } from '$lib/stores';
	import { SPORE_COLORS, HABITAT_TYPES } from '$lib/types';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	let habitatChartEl: HTMLCanvasElement | undefined = $state();
	let sporeColorChartEl: HTMLCanvasElement | undefined = $state();
	let statusChartEl: HTMLCanvasElement | undefined = $state();
	let monthlyChartEl: HTMLCanvasElement | undefined = $state();

	let habitatChart: Chart | null = null;
	let sporeColorChart: Chart | null = null;
	let statusChart: Chart | null = null;
	let monthlyChart: Chart | null = null;

	let totalSamples = $derived($samples.length);
	let withSporePrint = $derived($samples.filter((s) => s.hasSporePrint).length);
	let identified = $derived($samples.filter((s) => s.identificationStatus === 'identified').length);
	let abnormal = $derived($samples.filter((s) => s.isAbnormal).length);
	let poisonousCount = $derived($samples.filter((s) =>
		$species.some((sp) => sp.isPoisonous && sp.name === s.suspectedSpecies)
	).length);
	let uniqueLocations = $derived(new Set($samples.map((s) => s.location)).size);

	function destroyCharts() {
		if (habitatChart) habitatChart.destroy();
		if (sporeColorChart) sporeColorChart.destroy();
		if (statusChart) statusChart.destroy();
		if (monthlyChart) monthlyChart.destroy();
	}

	function createCharts() {
		destroyCharts();

		const habitatCounts = HABITAT_TYPES.map((h) => ({
			label: h,
			count: $samples.filter((s) => s.habitatType === h).length
		})).filter((h) => h.count > 0);

		const sporeColorCounts = SPORE_COLORS.map((c) => ({
			label: c,
			count: $samples.filter((s) => s.sporePrintColor === c).length
		})).filter((c) => c.count > 0);

		const statusCounts = {
			pending: $samples.filter((s) => s.identificationStatus === 'pending').length,
			identified: $samples.filter((s) => s.identificationStatus === 'identified').length,
			unidentified: $samples.filter((s) => s.identificationStatus === 'unidentified').length
		};

		const monthlyData: Record<string, number> = {};
		$samples.forEach((s) => {
			const month = s.collectionDate.substring(0, 7);
			monthlyData[month] = (monthlyData[month] || 0) + 1;
		});
		const sortedMonths = Object.keys(monthlyData).sort();

		const colors = [
			'#3b82f6',
			'#10b981',
			'#f59e0b',
			'#ef4444',
			'#8b5cf6',
			'#ec4899',
			'#06b6d4',
			'#84cc16'
		];

		if (habitatChartEl && habitatCounts.length > 0) {
			habitatChart = new Chart(habitatChartEl, {
				type: 'bar',
				data: {
					labels: habitatCounts.map((h) => h.label),
					datasets: [
						{
							label: '样本数量',
							data: habitatCounts.map((h) => h.count),
							backgroundColor: colors.slice(0, habitatCounts.length),
							borderWidth: 0
						}
					]
				},
				options: {
					responsive: true,
					plugins: { legend: { display: false } },
					scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
				}
			});
		}

		if (sporeColorChartEl && sporeColorCounts.length > 0) {
			sporeColorChart = new Chart(sporeColorChartEl, {
				type: 'doughnut',
				data: {
					labels: sporeColorCounts.map((c) => c.label),
					datasets: [
						{
							data: sporeColorCounts.map((c) => c.count),
							backgroundColor: colors.slice(0, sporeColorCounts.length),
							borderWidth: 2,
							borderColor: '#ffffff'
						}
					]
				},
				options: {
					responsive: true,
					plugins: { legend: { position: 'bottom' } }
				}
			});
		}

		if (statusChartEl) {
			statusChart = new Chart(statusChartEl, {
				type: 'pie',
				data: {
					labels: ['待鉴定', '已鉴定', '无法鉴定'],
					datasets: [
						{
							data: [statusCounts.pending, statusCounts.identified, statusCounts.unidentified],
							backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
							borderWidth: 2,
							borderColor: '#ffffff'
						}
					]
				},
				options: {
					responsive: true,
					plugins: { legend: { position: 'bottom' } }
				}
			});
		}

		if (monthlyChartEl && sortedMonths.length > 0) {
			monthlyChart = new Chart(monthlyChartEl, {
				type: 'line',
				data: {
					labels: sortedMonths,
					datasets: [
						{
							label: '采集数量',
							data: sortedMonths.map((m) => monthlyData[m]),
							fill: true,
							backgroundColor: 'rgba(59, 130, 246, 0.2)',
							borderColor: '#3b82f6',
							tension: 0.3
						}
					]
				},
				options: {
					responsive: true,
					scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
				}
			});
		}
	}

	onMount(() => {
		createCharts();
	});

	$effect(() => {
		if (habitatChartEl && sporeColorChartEl && statusChartEl && monthlyChartEl) {
			createCharts();
		}
	});

	onDestroy(() => {
		destroyCharts();
	});
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-surface-900-50-token">统计视图</h2>
		<p class="text-surface-500">查看真菌样本的统计数据和趋势</p>
	</div>

	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-primary-600">{totalSamples}</p>
				<p class="text-surface-500 text-sm">总样本数</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-success-600">{withSporePrint}</p>
				<p class="text-surface-500 text-sm">有孢子印</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-success-600">{identified}</p>
				<p class="text-surface-500 text-sm">已鉴定</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-error-600">{abnormal}</p>
				<p class="text-surface-500 text-sm">异常样本</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-warning-600">{poisonousCount}</p>
				<p class="text-surface-500 text-sm">疑似有毒</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-info-600">{uniqueLocations}</p>
				<p class="text-surface-500 text-sm">采集地点</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">生境分布</h3>
			</div>
			<div class="card-section">
				{#if totalSamples > 0}
					<canvas bind:this={habitatChartEl}></canvas>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无数据</p>
				{/if}
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">孢子印颜色分布</h3>
			</div>
			<div class="card-section">
				{#if withSporePrint > 0}
					<canvas bind:this={sporeColorChartEl}></canvas>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无孢子印数据</p>
				{/if}
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">鉴定状态分布</h3>
			</div>
			<div class="card-section">
				{#if totalSamples > 0}
					<canvas bind:this={statusChartEl}></canvas>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无数据</p>
				{/if}
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">月度采集趋势</h3>
			</div>
			<div class="card-section">
				{#if totalSamples > 0}
					<canvas bind:this={monthlyChartEl}></canvas>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无数据</p>
				{/if}
			</div>
		</div>
	</div>
</div>
