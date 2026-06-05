<script lang="ts">
	import type { SimilarSpeciesComparison, SpeciesComparison } from '$lib/types';

	let { comparison, targetSampleNumber } = $props<{
		comparison: SimilarSpeciesComparison;
		targetSampleNumber?: string;
	}>();

	function getRiskBadgeClass(riskLevel: string) {
		const classes: Record<string, string> = {
			high: 'badge-error',
			medium: 'badge-warning',
			low: 'badge-success'
		};
		return classes[riskLevel] || 'badge';
	}

	function getRiskLabel(riskLevel: string) {
		const labels: Record<string, string> = {
			high: '高毒',
			medium: '有毒',
			low: '低风险'
		};
		return labels[riskLevel] || '未知';
	}

	function getDifferenceLevelClass(level: string) {
		const classes: Record<string, string> = {
			major: 'text-error-500',
			moderate: 'text-warning-500',
			minor: 'text-success-500'
		};
		return classes[level] || 'text-surface-500';
	}

	function getDifferenceLabel(level: string) {
		const labels: Record<string, string> = {
			major: '大差异',
			moderate: '中等差异',
			minor: '小差异'
		};
		return labels[level] || '';
	}
</script>

<div class="card">
	<div class="card-header">
		<div class="flex items-center gap-2">
			<span class="material-icons text-error-500">compare</span>
			<h3 class="card-title">相似高危物种对比</h3>
		</div>
		{#if targetSampleNumber}
			<span class="badge badge-outline">样本 {targetSampleNumber}</span>
		{/if}
	</div>
	<div class="card-section">
		<p class="text-sm text-surface-500 mb-4">
			目标物种：<span class="font-medium">{comparison.targetSpecies}</span>
		</p>

		{#if comparison.similarSpecies.length === 0}
			<div class="text-center py-8">
				<span class="material-icons text-4xl text-surface-300 mb-2">check_circle</span>
				<p class="text-surface-500">未发现相似的高危物种</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each comparison.similarSpecies as speciesComparison}
					{@const sp = speciesComparison.species}
					<div
						class="border rounded-lg overflow-hidden {sp.riskLevel === 'high'
							? 'border-error-300 bg-error-50 dark:bg-error-900/10'
							: 'border-warning-300 bg-warning-50 dark:bg-warning-900/10'}"
					>
						<div class="p-4 border-b border-inherit">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="material-icons text-lg {sp.riskLevel === 'high' ? 'text-error-500' : 'text-warning-500'}">skull</span>
									<span class="font-bold text-lg">{sp.name}</span>
									<span class="badge badge-sm {getRiskBadgeClass(sp.riskLevel)}">
										{getRiskLabel(sp.riskLevel)}
									</span>
								</div>
								<div class="text-right">
									<div class="text-2xl font-bold {speciesComparison.similarityScore >= 60
										? 'text-error-500'
										: speciesComparison.similarityScore >= 40
											? 'text-warning-500'
											: 'text-surface-500'}">
										{speciesComparison.similarityScore}%
									</div>
									<div class="text-xs text-surface-500">相似度</div>
								</div>
							</div>
							<p class="text-sm mt-2 opacity-80">{sp.description}</p>
						</div>

						<div class="p-4">
							<h4 class="font-medium mb-2">关键鉴别差异</h4>
							<div class="space-y-2">
								{#each speciesComparison.keyDifferences as diff}
									<div class="flex items-start gap-2 text-sm">
										<span
											class="material-icons text-sm mt-0.5 {getDifferenceLevelClass(diff.differenceLevel)}"
											title={getDifferenceLabel(diff.differenceLevel)}
										>
											{diff.differenceLevel === 'major' ? 'priority_high' : diff.differenceLevel === 'moderate' ? 'warning' : 'info'}
										</span>
										<div>
											<span class="font-medium">{diff.feature}：</span>
											<span class="text-primary-600 dark:text-primary-400">{diff.targetValue}</span>
											<span class="mx-1">vs</span>
											<span class="text-error-600 dark:text-error-400">{diff.comparedValue}</span>
										</div>
									</div>
								{/each}
							</div>

							<div class="mt-3 p-2 rounded bg-surface-50 dark:bg-surface-800/50 text-xs">
								<span class="font-medium">风险提示：</span>
								{speciesComparison.riskComparison.notes}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<p class="text-xs text-surface-400 mt-4">
			对比生成时间：{new Date(comparison.generatedAt).toLocaleString('zh-CN')}
		</p>
	</div>
</div>