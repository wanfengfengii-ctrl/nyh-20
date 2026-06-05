<script lang="ts">
	import { samples, species } from '$lib/stores';
	import { RISK_LEVELS } from '$lib/types';
	import type { FungiSample } from '$lib/types';

	let selectedSample = $state<FungiSample | null>(null);
	let mapContainer = $state<HTMLDivElement | null>(null);

	let samplesWithLocation = $derived(
		$samples.filter((s) => s.latitude !== null && s.longitude !== null)
	);

	let speciesList = $derived($species);

	function getRiskColor(riskLevel: string): string {
		switch (riskLevel) {
			case 'high':
				return 'bg-error-500';
			case 'medium':
				return 'bg-warning-500';
			default:
				return 'bg-success-500';
		}
	}

	function getRiskLabel(riskLevel: string): string {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found?.label || riskLevel;
	}

	function getSpeciesInfo(sample: FungiSample) {
		return speciesList.find((s) => s.name === sample.suspectedSpecies);
	}

	function latLngToPosition(
		lat: number,
		lng: number,
		width: number,
		height: number
	): { x: number; y: number } {
		const minLat = 18;
		const maxLat = 54;
		const minLng = 73;
		const maxLng = 135;

		const x = ((lng - minLng) / (maxLng - minLng)) * width;
		const y = ((maxLat - lat) / (maxLat - minLat)) * height;

		return { x: Math.max(0, Math.min(width, x)), y: Math.max(0, Math.min(height, y)) };
	}

	let mapWidth = $state(800);
	let mapHeight = $state(500);

	$effect(() => {
		if (mapContainer) {
			const rect = mapContainer.getBoundingClientRect();
			mapWidth = rect.width;
			mapHeight = rect.height;
		}
	});
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token">地图分布</h2>
			<p class="text-surface-500">查看样本的地理位置分布</p>
		</div>
		<div class="flex gap-2">
			<span class="badge badge-success">低风险</span>
			<span class="badge badge-warning">中风险</span>
			<span class="badge badge-error">高风险</span>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2">
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">样本分布地图</h3>
				</div>
				<div class="card-section">
					<div
						bind:this={mapContainer}
						class="relative w-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden"
						style="height: 500px;"
					>
						<div class="absolute inset-0 opacity-20">
							<svg class="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
								<defs>
									<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
										<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" stroke-width="0.5" />
									</pattern>
								</defs>
								<rect width="100%" height="100%" fill="url(#grid)" />
							</svg>
						</div>

						{#each samplesWithLocation as sample}
							{@const pos = latLngToPosition(sample.latitude!, sample.longitude!, mapWidth, mapHeight)}
							<button
								class="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
								style="left: {pos.x}px; top: {pos.y}px;"
								onclick={() => (selectedSample = sample)}
							>
								<div
									class="w-6 h-6 rounded-full {getRiskColor(sample.riskLevel)} border-2 border-white shadow-lg 
										hover:scale-150 transition-transform cursor-pointer flex items-center justify-center"
								>
									<span class="text-white text-xs font-bold">
										{sample.sampleNumber.slice(-2)}
									</span>
								</div>
								<div
									class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
										bg-surface-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 
										transition-opacity whitespace-nowrap pointer-events-none"
								>
									{sample.sampleNumber} - {sample.location}
								</div>
							</button>
						{/each}

						{#if samplesWithLocation.length === 0}
							<div class="absolute inset-0 flex items-center justify-center">
								<div class="text-center">
									<span class="material-icons text-6xl text-surface-300 mb-4">map</span>
									<p class="text-surface-500">暂无带有地理位置的样本</p>
									<p class="text-sm text-surface-400">添加样本时填写经纬度即可在地图上显示</p>
								</div>
							</div>
						{/if}
					</div>

					<div class="mt-4 flex items-center justify-between text-sm text-surface-500">
						<span>共 {samplesWithLocation.length} 个样本带有地理位置信息</span>
						<span>纬度: 18°-54°N | 经度: 73°-135°E</span>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-6">
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">
						{selectedSample ? '样本详情' : '选择样本'}
					</h3>
				</div>
				<div class="card-section">
					{#if selectedSample}
						<div class="space-y-4">
							<div>
								<p class="text-sm text-surface-500">样本编号</p>
								<p class="font-mono font-bold text-lg">{selectedSample.sampleNumber}</p>
							</div>
							<div>
								<p class="text-sm text-surface-500">采集地点</p>
								<p>{selectedSample.location}</p>
							</div>
							<div>
								<p class="text-sm text-surface-500">坐标</p>
								<p class="font-mono text-sm">
									{selectedSample.latitude?.toFixed(4)}, {selectedSample.longitude?.toFixed(4)}
								</p>
							</div>
							<div>
								<p class="text-sm text-surface-500">疑似物种</p>
								<p class="flex items-center gap-2">
									{selectedSample.suspectedSpecies || '未鉴定'}
									{#if getSpeciesInfo(selectedSample)?.isPoisonous}
										<span class="material-icons text-error-500 text-sm">warning</span>
									{/if}
								</p>
							</div>
							<div>
								<p class="text-sm text-surface-500">风险等级</p>
								<span class="badge {getRiskColor(selectedSample.riskLevel).replace('bg-', 'badge-').replace('-500', '')}">
									{getRiskLabel(selectedSample.riskLevel)}
								</span>
							</div>
							<div>
								<p class="text-sm text-surface-500">生境类型</p>
								<p>{selectedSample.habitatType}</p>
							</div>
							{#if selectedSample.images && selectedSample.images.length > 0}
								<div>
									<p class="text-sm text-surface-500 mb-2">样本图片</p>
									<div class="grid grid-cols-3 gap-2">
										{#each selectedSample.images as image}
											<img
												src={image.dataUrl}
												alt={image.caption || '样本图片'}
												class="w-full h-16 object-cover rounded"
											/>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="text-center py-8">
							<span class="material-icons text-4xl text-surface-300 mb-2">touch_app</span>
							<p class="text-surface-500">点击地图上的标记查看样本详情</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="card">
				<div class="card-header">
					<h3 class="card-title">地理位置列表</h3>
				</div>
				<div class="card-section max-h-64 overflow-y-auto">
					{#if samplesWithLocation.length > 0}
						<div class="space-y-2">
							{#each samplesWithLocation as sample}
								<button
									class="w-full text-left p-2 rounded hover:bg-surface-100-800-token transition-colors {
										selectedSample?.id === sample.id ? 'bg-primary-100' : ''
									}"
									onclick={() => (selectedSample = sample)}
								>
									<div class="flex items-center gap-2">
										<div class="w-3 h-3 rounded-full {getRiskColor(sample.riskLevel)}"></div>
										<span class="font-mono text-sm">{sample.sampleNumber}</span>
									</div>
									<p class="text-sm text-surface-500 ml-5">{sample.location}</p>
								</button>
							{/each}
						</div>
					{:else}
						<p class="text-center text-surface-500 py-4">暂无数据</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
