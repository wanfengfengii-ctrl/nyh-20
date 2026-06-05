<script lang="ts">
	import {
		samples,
		species,
		assessRisk,
		generateSimilarSpeciesComparison,
		generateCompleteRiskReport,
		downloadCompleteRiskReport,
		addWarningHistory,
		generateWarningReport
	} from '$lib/stores';
	import type {
		FungiSample,
		RiskAssessment,
		SimilarSpeciesComparison,
		CompleteRiskReport,
		EmergencyScenario
	} from '$lib/types';
	import { RISK_LEVELS, EMERGENCY_SCENARIOS } from '$lib/types';
	import SimilarSpeciesCard from '$lib/components/SimilarSpeciesCard.svelte';
	import EmergencyGuidancePanel from '$lib/components/EmergencyGuidancePanel.svelte';
	import WarningHistoryPanel from '$lib/components/WarningHistoryPanel.svelte';
	import CollaboratorSharePanel from '$lib/components/CollaboratorSharePanel.svelte';

	let selectedSampleId = $state<string>('');
	let selectedSample = $state<FungiSample | null>(null);
	let activeTab = $state<'assessment' | 'comparison' | 'emergency' | 'history' | 'share'>('assessment');
	let batchSelected = $state<Set<string>>(new Set());
	let riskAssessment = $state<RiskAssessment | null>(null);
	let speciesComparison = $state<SimilarSpeciesComparison | null>(null);
	let completeReport = $state<CompleteRiskReport | null>(null);
	let isGenerating = $state(false);
	let showBatchReport = $state(false);

	let allSamples = $derived($samples);
	let allSpecies = $derived($species);

	let highRiskCount = $derived(allSamples.filter((s) => s.riskLevel === 'high').length);
	let mediumRiskCount = $derived(allSamples.filter((s) => s.riskLevel === 'medium').length);
	let unidentifiedCount = $derived(allSamples.filter((s) => s.identificationStatus !== 'identified').length);
	let totalRiskScore = $derived(
		allSamples.length > 0
			? Math.round(
					allSamples.reduce((sum, s) => {
						if (s.riskLevel === 'high') return sum + 70;
						if (s.riskLevel === 'medium') return sum + 40;
						return sum + 10;
					}, 0) / allSamples.length
				)
			: 0
	);

	function onSampleSelect(sampleId: string) {
		selectedSampleId = sampleId;
		selectedSample = allSamples.find((s) => s.id === sampleId) || null;
		riskAssessment = null;
		speciesComparison = null;
	}

	function generateRiskAssessment() {
		if (!selectedSample) return;
		riskAssessment = assessRisk(selectedSample, allSpecies);
	}

	function generateSpeciesComparison() {
		if (!selectedSample) return;
		speciesComparison = generateSimilarSpeciesComparison(selectedSample, allSpecies);
	}

	async function generateFullAssessment() {
		if (!selectedSample) return;
		isGenerating = true;

		try {
			riskAssessment = assessRisk(selectedSample, allSpecies);
			speciesComparison = generateSimilarSpeciesComparison(selectedSample, allSpecies);

			const warningReport = generateWarningReport(selectedSample, allSpecies);
			addWarningHistory(selectedSample, warningReport, 'single');
		} finally {
			isGenerating = false;
		}
	}

	function toggleBatchSelection(sampleId: string) {
		const newSet = new Set(batchSelected);
		if (newSet.has(sampleId)) {
			newSet.delete(sampleId);
		} else {
			newSet.add(sampleId);
		}
		batchSelected = newSet;
	}

	function selectAll() {
		if (batchSelected.size === allSamples.length) {
			batchSelected = new Set();
		} else {
			batchSelected = new Set(allSamples.map((s) => s.id));
		}
	}

	function generateBatchReport() {
		const selectedSamples = allSamples.filter((s) => batchSelected.has(s.id));
		if (selectedSamples.length === 0) return;

		isGenerating = true;
		try {
			completeReport = generateCompleteRiskReport(selectedSamples);
			showBatchReport = true;
		} finally {
			isGenerating = false;
		}
	}

	function handleDownloadCompleteReport() {
		if (completeReport) {
			downloadCompleteRiskReport(completeReport);
		}
	}

	function getRiskBadgeClass(riskLevel: string) {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found?.class || 'badge';
	}

	function getRiskLabel(riskLevel: string) {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found?.label || riskLevel;
	}

	function getRiskScoreColor(score: number) {
		if (score >= 86) return 'text-error-500';
		if (score >= 61) return 'text-error-400';
		if (score >= 31) return 'text-warning-500';
		return 'text-success-500';
	}

	function getRiskScoreBg(score: number) {
		if (score >= 86) return 'bg-error-500';
		if (score >= 61) return 'bg-error-400';
		if (score >= 31) return 'bg-warning-500';
		return 'bg-success-500';
	}

	const tabs = [
		{ id: 'assessment', label: '风险研判', icon: 'analytics' },
		{ id: 'comparison', label: '物种对比', icon: 'compare' },
		{ id: 'emergency', label: '应急指引', icon: 'emergency' },
		{ id: 'history', label: '历史记录', icon: 'history' },
		{ id: 'share', label: '协作者', icon: 'group' }
	] as const;
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token flex items-center gap-2">
				<span class="material-icons text-primary-500">shield</span>
				智能风险研判与应急指引中心
			</h2>
			<p class="text-surface-500">
				基于样本信息自动生成分级风险结论、相似物种对比及应急处理指引
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-surface-600">{allSamples.length}</p>
				<p class="text-sm text-surface-500">总样本数</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-error-600">{highRiskCount}</p>
				<p class="text-sm text-surface-500">高风险样本</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold text-warning-600">{mediumRiskCount}</p>
				<p class="text-sm text-surface-500">中风险样本</p>
			</div>
		</div>
		<div class="card">
			<div class="card-section text-center">
				<p class="text-3xl font-bold {getRiskScoreColor(totalRiskScore)}">{totalRiskScore}</p>
				<p class="text-sm text-surface-500">综合风险指数</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-1 space-y-4">
			<div class="card">
				<div class="card-header flex justify-between items-center">
					<h3 class="card-title">选择样本</h3>
					<button class="btn btn-outline btn-sm" onclick={selectAll}>
						{batchSelected.size === allSamples.length ? '取消全选' : '全选'}
					</button>
				</div>
				<div class="card-section p-0">
					{#if allSamples.length === 0}
						<div class="text-center py-8">
							<span class="material-icons text-4xl text-surface-300 mb-2">inbox</span>
							<p class="text-surface-500">暂无样本数据</p>
						</div>
					{:else}
						<div class="overflow-x-auto max-h-[500px] overflow-y-auto">
							<table class="table table-hover">
								<thead class="sticky top-0 bg-surface-50-900-token">
									<tr>
										<th class="w-10">
											<input
												type="checkbox"
												class="checkbox"
												checked={batchSelected.size === allSamples.length && allSamples.length > 0}
												onchange={selectAll}
											/>
										</th>
										<th>样本</th>
										<th>风险</th>
									</tr>
								</thead>
								<tbody>
									{#each allSamples as sample}
										<tr
											class="cursor-pointer {selectedSampleId === sample.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}"
											onclick={() => onSampleSelect(sample.id)}
										>
											<td onclick={(e) => e.stopPropagation()}>
												<input
													type="checkbox"
													class="checkbox"
													checked={batchSelected.has(sample.id)}
													onchange={() => toggleBatchSelection(sample.id)}
												/>
											</td>
											<td>
												<p class="font-mono text-sm">{sample.sampleNumber}</p>
												<p class="text-xs text-surface-500 truncate max-w-[120px]">
													{sample.suspectedSpecies || '未鉴定'}
												</p>
											</td>
											<td>
												<span class="badge badge-sm {getRiskBadgeClass(sample.riskLevel)}">
													{getRiskLabel(sample.riskLevel)}
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
				<div class="card-footer">
					<div class="flex justify-between items-center w-full">
						<p class="text-sm text-surface-500">已选择 {batchSelected.size} 个样本</p>
						<button
							class="btn btn-primary btn-sm"
							onclick={generateBatchReport}
							disabled={batchSelected.size === 0 || isGenerating}
						>
							{#if isGenerating}
								<span class="material-icons animate-spin">refresh</span>
							{:else}
								<span class="material-icons text-sm">description</span>
							{/if}
							生成完整报告
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="lg:col-span-2">
			{#if !selectedSample}
				<div class="card">
					<div class="card-section text-center py-16">
						<span class="material-icons text-6xl text-surface-300 mb-4">security</span>
						<p class="text-surface-500 text-lg">请从左侧选择一个样本</p>
						<p class="text-sm text-surface-400 mt-2">
							选择后可进行风险研判、物种对比、查看应急指引
						</p>
						<div class="mt-6 flex justify-center gap-4">
							<div class="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
								<span class="material-icons text-2xl text-primary-500">analytics</span>
								<p class="text-sm mt-2">智能风险研判</p>
							</div>
							<div class="text-center p-4 bg-error-50 dark:bg-error-900/20 rounded-lg">
								<span class="material-icons text-2xl text-error-500">compare</span>
								<p class="text-sm mt-2">高危物种对比</p>
							</div>
							<div class="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
								<span class="material-icons text-2xl text-warning-500">emergency</span>
								<p class="text-sm mt-2">应急处理指引</p>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="card">
					<div class="card-header flex justify-between items-center">
						<div>
							<h3 class="card-title">样本 {selectedSample.sampleNumber} - {selectedSample.suspectedSpecies || '未鉴定'}</h3>
							<p class="text-sm text-surface-500">
								{selectedSample.habitatType} · {selectedSample.collectionDate} · {selectedSample.location}
							</p>
						</div>
						<button
							class="btn btn-primary btn-sm"
							onclick={generateFullAssessment}
							disabled={isGenerating}
						>
							{#if isGenerating}
								<span class="material-icons animate-spin text-sm">refresh</span>
								生成中...
							{:else}
								<span class="material-icons text-sm">auto_awesome</span>
								一键研判
							{/if}
						</button>
					</div>

					<div class="tabs">
						{#each tabs as tab}
							<button
								class="tab {activeTab === tab.id ? 'tab-active' : ''}"
								onclick={() => (activeTab = tab.id)}
							>
								<span class="material-icons text-sm mr-1">{tab.icon}</span>
								{tab.label}
							</button>
						{/each}
					</div>

					<div class="card-section">
						{#if activeTab === 'assessment'}
							{#if !riskAssessment}
								<div class="text-center py-12">
									<span class="material-icons text-5xl text-surface-300 mb-4">analytics</span>
									<p class="text-surface-500">点击"一键研判"生成风险评估报告</p>
									<button class="btn btn-primary mt-4" onclick={generateRiskAssessment}>
										<span class="material-icons">trending_up</span>
										生成风险评估
									</button>
								</div>
							{:else}
								<div class="space-y-6">
									<div
										class="p-6 rounded-xl text-white {riskAssessment.riskLevel === 'critical'
											? 'bg-gradient-to-r from-red-600 to-red-700'
											: riskAssessment.riskLevel === 'high'
												? 'bg-gradient-to-r from-orange-500 to-red-500'
												: riskAssessment.riskLevel === 'medium'
													? 'bg-gradient-to-r from-yellow-500 to-orange-500'
													: 'bg-gradient-to-r from-green-500 to-teal-500'}"
									>
										<div class="flex items-center justify-between">
											<div>
												<p class="text-sm opacity-80">综合风险评分</p>
												<p class="text-5xl font-bold mt-1">{riskAssessment.riskScore}分</p>
											</div>
											<div class="text-right">
												<p class="text-sm opacity-80">风险等级</p>
												<p class="text-2xl font-bold mt-1">
													{riskAssessment.riskLevel === 'critical'
														? '🔴 极高风险'
														: riskAssessment.riskLevel === 'high'
															? '🟠 高风险'
															: riskAssessment.riskLevel === 'medium'
																? '🟡 中风险'
																: '🟢 低风险'}
												</p>
											</div>
										</div>
										<div class="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
											<div
												class="h-full bg-white rounded-full transition-all duration-500"
												style="width: {riskAssessment.riskScore}%"
											></div>
										</div>
									</div>

									<div class="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
										<h4 class="font-medium mb-3 flex items-center gap-2">
											<span class="material-icons text-primary-500">lightbulb</span>
											研判建议
										</h4>
										<p>{riskAssessment.recommendation}</p>
									</div>

									<div>
										<h4 class="font-medium mb-3 flex items-center gap-2">
											<span class="material-icons text-primary-500">fact_check</span>
											风险因素分析
										</h4>
										<div class="space-y-2">
											{#each riskAssessment.factors as factor}
												<div class="flex items-center gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
													<div class="w-20">
														<div class="text-lg font-bold {factor.contribution === 'negative' ? 'text-error-500' : 'text-success-500'}">
															{factor.weight}%
														</div>
														<div class="text-xs text-surface-500">权重</div>
													</div>
													<div class="flex-1">
														<p class="font-medium">{factor.name}</p>
														<p class="text-sm text-surface-500">{factor.description}</p>
													</div>
													<span
														class="material-icons {factor.contribution === 'negative' ? 'text-error-500' : 'text-success-500'}"
													>
														{factor.contribution === 'negative' ? 'trending_down' : 'trending_up'}
													</span>
												</div>
											{/each}
										</div>
									</div>

									<p class="text-xs text-surface-400">
										置信度：{riskAssessment.confidence}% · 研判时间：{new Date(riskAssessment.assessedAt).toLocaleString('zh-CN')}
									</p>
								</div>
							{/if}
						{:else if activeTab === 'comparison'}
							{#if !speciesComparison}
								<div class="text-center py-12">
									<span class="material-icons text-5xl text-surface-300 mb-4">compare</span>
									<p class="text-surface-500">点击"一键研判"生成相似物种对比</p>
									<button class="btn btn-primary mt-4" onclick={generateSpeciesComparison}>
										<span class="material-icons">swap_horiz</span>
										生成物种对比
									</button>
								</div>
							{:else}
								<SimilarSpeciesCard
									comparison={speciesComparison}
									targetSampleNumber={selectedSample.sampleNumber}
								/>
							{/if}
						{:else if activeTab === 'emergency'}
							<EmergencyGuidancePanel
								sample={selectedSample}
								speciesList={allSpecies}
								mode="relevant"
							/>
						{:else if activeTab === 'history'}
							<WarningHistoryPanel />
						{:else if activeTab === 'share'}
							<CollaboratorSharePanel reportId={riskAssessment?.id} />
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

{#if showBatchReport && completeReport}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6">
				<div class="flex justify-between items-center mb-6">
					<h3 class="text-xl font-bold flex items-center gap-2">
						<span class="material-icons text-primary-500">description</span>
						完整风险研判报告
					</h3>
					<button class="btn btn-ghost btn-sm" onclick={() => (showBatchReport = false)}>
						<span class="material-icons">close</span>
					</button>
				</div>

				<div class="grid grid-cols-4 gap-4 mb-6">
					<div class="text-center p-4 rounded-lg critical text-white bg-gradient-to-br from-red-600 to-red-700">
						<p class="text-3xl font-bold">{completeReport.summary.highRiskCount}</p>
						<p class="text-sm opacity-80">高/极高风险</p>
					</div>
					<div class="text-center p-4 rounded-lg text-white bg-gradient-to-br from-yellow-500 to-orange-500">
						<p class="text-3xl font-bold">{completeReport.summary.mediumRiskCount}</p>
						<p class="text-sm opacity-80">中风险</p>
					</div>
					<div class="text-center p-4 rounded-lg text-white bg-gradient-to-br from-green-500 to-teal-500">
						<p class="text-3xl font-bold">{completeReport.summary.lowRiskCount}</p>
						<p class="text-sm opacity-80">低风险</p>
					</div>
					<div class="text-center p-4 rounded-lg text-white bg-gradient-to-br from-indigo-500 to-purple-500">
						<p class="text-3xl font-bold">{completeReport.summary.totalSamples}</p>
						<p class="text-sm opacity-80">总样本数</p>
					</div>
				</div>

				{#if completeReport.summary.criticalFindings.length > 0}
					<div class="mb-6 p-4 bg-error-50 dark:bg-error-900/20 rounded-lg border-l-4 border-error-500">
						<h4 class="font-medium text-error-700 dark:text-error-400 mb-2 flex items-center gap-2">
							<span class="material-icons">warning</span>
							关键发现
						</h4>
						<ul class="space-y-1">
							{#each completeReport.summary.criticalFindings as finding}
								<li class="flex items-start gap-2 text-sm">
									<span class="material-icons text-error-500 text-sm mt-0.5">fiber_manual_record</span>
									{finding}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<div class="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-4 border-primary-500">
					<h4 class="font-medium text-primary-700 dark:text-primary-400 mb-2 flex items-center gap-2">
						<span class="material-icons">tips_and_updates</span>
						专家建议
					</h4>
					<ul class="space-y-1">
						{#each completeReport.summary.recommendations as rec}
							<li class="flex items-start gap-2 text-sm">
								<span class="material-icons text-primary-500 text-sm mt-0.5">check_circle</span>
								{rec}
							</li>
						{/each}
					</ul>
				</div>

				<div class="mb-6">
					<h4 class="font-medium mb-3">风险评估详情</h4>
					<div class="space-y-2 max-h-60 overflow-y-auto">
						{#each completeReport.riskAssessments as assessment, i}
							<div
								class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50"
							>
								<div>
									<p class="font-medium">{completeReport.samples[i].sampleNumber}</p>
									<p class="text-sm text-surface-500">
										{completeReport.samples[i].suspectedSpecies || '未鉴定'}
									</p>
								</div>
								<div class="text-right">
									<p class="font-bold {getRiskScoreColor(assessment.riskScore)}">{assessment.riskScore}分</p>
									<p class="text-xs text-surface-500">
										{assessment.riskLevel === 'critical'
											? '极高风险'
											: assessment.riskLevel === 'high'
												? '高风险'
												: assessment.riskLevel === 'medium'
													? '中风险'
													: '低风险'}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex justify-end gap-3">
					<button class="btn btn-ghost" onclick={() => (showBatchReport = false)}>
						关闭
					</button>
					<button class="btn btn-primary" onclick={handleDownloadCompleteReport}>
						<span class="material-icons">download</span>
						导出完整报告
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}