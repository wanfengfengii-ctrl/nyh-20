<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { samples, species, getSeason } from '$lib/stores';
	import { SPORE_COLORS, HABITAT_TYPES, SEASONS } from '$lib/types';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	let habitatChartEl: HTMLCanvasElement | undefined = $state();
	let sporeColorChartEl: HTMLCanvasElement | undefined = $state();
	let statusChartEl: HTMLCanvasElement | undefined = $state();
	let monthlyChartEl: HTMLCanvasElement | undefined = $state();
	let seasonChartEl: HTMLCanvasElement | undefined = $state();
	let locationChartEl: HTMLCanvasElement | undefined = $state();
	let riskChartEl: HTMLCanvasElement | undefined = $state();

	let habitatChart: Chart | null = null;
	let sporeColorChart: Chart | null = null;
	let statusChart: Chart | null = null;
	let monthlyChart: Chart | null = null;
	let seasonChart: Chart | null = null;
	let locationChart: Chart | null = null;
	let riskChart: Chart | null = null;

	let totalSamples = $derived($samples.length);
	let withSporePrint = $derived($samples.filter((s) => s.hasSporePrint).length);
	let identified = $derived($samples.filter((s) => s.identificationStatus === 'identified').length);
	let abnormal = $derived($samples.filter((s) => s.isAbnormal).length);
	let poisonousCount = $derived($samples.filter((s) =>
		$species.some((sp) => sp.isPoisonous && sp.name === s.suspectedSpecies)
	).length);
	let uniqueLocations = $derived(new Set($samples.map((s) => s.location)).size);
	let highRiskCount = $derived($samples.filter((s) => s.riskLevel === 'high').length);

	let topLocations = $derived(
		(() => {
			const counts: Record<string, number> = {};
			$samples.forEach((s) => {
				counts[s.location] = (counts[s.location] || 0) + 1;
			});
			return Object.entries(counts)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10);
		})()
	);

	let seasonStats = $derived(
		(() => {
			const counts: Record<string, number> = {
				春季: 0,
				夏季: 0,
				秋季: 0,
				冬季: 0
			};
			$samples.forEach((s) => {
				const season = getSeason(s.collectionDate);
				counts[season]++;
			});
			return counts;
		})()
	);

	function destroyCharts() {
		if (habitatChart) habitatChart.destroy();
		if (sporeColorChart) sporeColorChart.destroy();
		if (statusChart) statusChart.destroy();
		if (monthlyChart) monthlyChart.destroy();
		if (seasonChart) seasonChart.destroy();
		if (locationChart) locationChart.destroy();
		if (riskChart) riskChart.destroy();
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

		const riskCounts = {
			low: $samples.filter((s) => s.riskLevel === 'low').length,
			medium: $samples.filter((s) => s.riskLevel === 'medium').length,
			high: $samples.filter((s) => s.riskLevel === 'high').length
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
			'#84cc16',
			'#f97316',
			'#6366f1'
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

		if (seasonChartEl) {
			seasonChart = new Chart(seasonChartEl, {
				type: 'bar',
				data: {
					labels: SEASONS,
					datasets: [
						{
							label: '样本数量',
							data: SEASONS.map((s) => seasonStats[s]),
							backgroundColor: ['#22c55e', '#eab308', '#f97316', '#3b82f6'],
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

		if (locationChartEl && topLocations.length > 0) {
			locationChart = new Chart(locationChartEl, {
				type: 'bar',
				data: {
					labels: topLocations.map(([loc]) => loc),
					datasets: [
						{
							label: '样本数量',
							data: topLocations.map(([, count]) => count),
							backgroundColor: colors.slice(0, topLocations.length),
							borderWidth: 0
						}
					]
				},
				options: {
					indexAxis: 'y',
					responsive: true,
					plugins: { legend: { display: false } },
					scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
				}
			});
		}

		if (riskChartEl) {
			riskChart = new Chart(riskChartEl, {
				type: 'doughnut',
				data: {
					labels: ['低风险', '中风险', '高风险'],
					datasets: [
						{
							data: [riskCounts.low, riskCounts.medium, riskCounts.high],
							backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
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
	}

	onMount(() => {
		createCharts();
	});

	$effect(() => {
		if (
			habitatChartEl &&
			sporeColorChartEl &&
			statusChartEl &&
			monthlyChartEl &&
			seasonChartEl &&
			locationChartEl &&
			riskChartEl
		) {
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
		<p class="text-surface-500">查看真菌样本的统计数据和趋势分析</p>
	</div>

	<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
				<p class="text-3xl font-bold text-warning-600">{highRiskCount}</p>
				<p class="text-surface-500 text-sm">高风险</p>
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

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">季节分布热度</h3>
			</div>
			<div class="card-section">
				{#if totalSamples > 0}
					<canvas bind:this={seasonChartEl}></canvas>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无数据</p>
				{/if}
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">地点热度排行</h3>
			</div>
			<div class="card-section">
				{#if topLocations.length > 0}
					<canvas bind:this={locationChartEl}></canvas>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无数据</p>
				{/if}
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">风险等级分布</h3>
			</div>
			<div class="card-section">
				{#if totalSamples > 0}
					<canvas bind:this={riskChartEl}></canvas>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无数据</p>
				{/if}
			</div>
		</div>

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

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">热门采集地点</h3>
			</div>
			<div class="card-section">
				{#if topLocations.length > 0}
					<div class="space-y-3">
						{#each topLocations as [location, count], index}
							<div class="flex items-center gap-3">
								<span
									class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white {index < 3
										? 'bg-warning-500'
										: 'bg-surface-300'}"
								>
									{index + 1}
								</span>
								<div class="flex-1">
									<div class="flex justify-between items-center mb-1">
										<span class="font-medium">{location}</span>
										<span class="text-sm text-surface-500">{count} 个样本</span>
									</div>
									<div class="w-full bg-surface-200 rounded-full h-2">
										<div
											class="bg-primary-500 h-2 rounded-full transition-all"
											style="width: {(count / Math.max(...topLocations.map(([, c]) => c))) * 100}%;"
										></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-center text-surface-400 py-8">暂无数据</p>
				{/if}
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">季节统计详情</h3>
			</div>
			<div class="card-section">
				<div class="grid grid-cols-2 gap-4">
					{#each SEASONS as season}
						<div class="p-4 rounded-lg bg-surface-100-800-token">
							<div class="flex items-center justify-between mb-2">
								<span class="font-medium">{season}</span>
								<span class="material-icons">
									{season === '春季'
										? 'eco'
										: season === '夏季'
											? 'sunny'
											: season === '秋季'
												? 'park'
												: 'ac_unit'}
								</span>
							</div>
							<p class="text-2xl font-bold">{seasonStats[season]}</p>
							<p class="text-sm text-surface-500">个样本</p>
							<div class="mt-2 w-full bg-surface-300 rounded-full h-2">
								<div
									class="{season === '春季'
										? 'bg-green-500'
										: season === '夏季'
											? 'bg-yellow-500'
											: season === '秋季'
												? 'bg-orange-500'
												: 'bg-blue-500'} h-2 rounded-full"
									style="width: {totalSamples > 0 ? (seasonStats[season] / totalSamples) * 100 : 0}%;"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
