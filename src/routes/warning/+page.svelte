<script lang="ts">
	import {
		samples,
		species,
		generateWarningReport,
		downloadWarningReport,
		exportWarningReportToHTML
	} from '$lib/stores';
	import type { FungiSample, WarningReport } from '$lib/types';
	import WarningReportPanel from '$lib/components/WarningReportPanel.svelte';

	let selectedSampleId = $state<string>('');
	let selectedSample = $state<FungiSample | null>(null);
	let batchSelected = $state<Set<string>>(new Set());
	let activeTab = $state<'single' | 'batch'>('single');
	let showReport = $state(false);
	let batchReport = $state<WarningReport[]>([]);

	let allSamples = $derived($samples);
	let allSpecies = $derived($species);

	let highRiskCount = $derived(allSamples.filter((s) => s.riskLevel === 'high').length);
	let mediumRiskCount = $derived(allSamples.filter((s) => s.riskLevel === 'medium').length);
	let unidentifiedCount = $derived(allSamples.filter((s) => s.identificationStatus !== 'identified').length);

	function onSampleSelect(sampleId: string) {
		selectedSampleId = sampleId;
		selectedSample = allSamples.find((s) => s.id === sampleId) || null;
		showReport = false;
	}

	function generateBatchReports() {
		batchReport = allSamples
			.filter((s) => batchSelected.has(s.id))
			.map((sample) => generateWarningReport(sample, allSpecies));
	}

	function downloadBatchReports() {
		if (batchReport.length === 0) return;

		const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>批量真菌安全预警报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
        h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #1f2937; margin-top: 32px; border-left: 4px solid #3b82f6; padding-left: 12px; }
        h3 { color: #374151; margin-top: 16px; }
        .summary { background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .report-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; page-break-inside: avoid; }
        .high-risk { background: #fef2f2; border-color: #fecaca; }
        .medium-risk { background: #fffbeb; border-color: #fde68a; }
        .low-risk { background: #f0fdf4; border-color: #bbf7d0; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
    <h1>🍄 批量真菌安全预警报告</h1>
    <div class="summary">
        <p><strong>报告生成时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        <p><strong>报告样本数：</strong>${batchReport.length} 个</p>
        <p><strong>高风险样本：</strong>${batchReport.filter((r) => r.edibleRisk.level === 'danger').length} 个</p>
        <p><strong>中风险样本：</strong>${batchReport.filter((r) => r.edibleRisk.level === 'caution').length} 个</p>
    </div>
    ${batchReport
			.map(
				(report) => `
    <div class="report-card ${report.edibleRisk.level === 'danger' ? 'high-risk' : report.edibleRisk.level === 'caution' ? 'medium-risk' : 'low-risk'}">
        <h2>样本 ${report.suspectedSpecies || '未鉴定'} (${report.sampleId.slice(0, 8)})</h2>
        <p><strong>采集季节：</strong>${report.collectionSeason}</p>
        <p><strong>生境类型：</strong>${report.habitatType}</p>
        <p><strong>食用风险：</strong>${report.edibleRisk.title}</p>
        <p>${report.edibleRisk.description}</p>
        <h3>专家建议</h3>
        <p>${report.observationAdvice.expertRecommendation}</p>
    </div>`
			)
			.join('')}
    <div class="footer">
        <p>⚠️ 本报告仅供参考，不能替代专业鉴定。食用野生菌存在风险，请务必谨慎。</p>
    </div>
</body>
</html>`;

		const blob = new Blob([htmlContent], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `批量预警报告-${new Date().toISOString().split('T')[0]}.html`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
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

	function getRiskBadge(riskLevel: string) {
		const badges: Record<string, string> = {
			high: 'badge-error',
			medium: 'badge-warning',
			low: 'badge-success'
		};
		return badges[riskLevel] || 'badge';
	}

	function getRiskLabel(riskLevel: string) {
		const labels: Record<string, string> = {
			high: '高风险',
			medium: '中风险',
			low: '低风险'
		};
		return labels[riskLevel] || '未知';
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token">真菌安全预警中心</h2>
			<p class="text-surface-500">生成和管理样本安全预警报告</p>
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
				<p class="text-3xl font-bold text-surface-500">{unidentifiedCount}</p>
				<p class="text-sm text-surface-500">待鉴定</p>
			</div>
		</div>
	</div>

	<div class="tabs">
		<button class="tab {activeTab === 'single' ? 'tab-active' : ''}" onclick={() => (activeTab = 'single')}>
			<span class="material-icons text-sm mr-1">pageview</span>
			单样本预警
		</button>
		<button class="tab {activeTab === 'batch' ? 'tab-active' : ''}" onclick={() => (activeTab = 'batch')}>
			<span class="material-icons text-sm mr-1">batch_prediction</span>
			批量预警
		</button>
	</div>

	{#if activeTab === 'single'}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">选择样本</h3>
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
										<th>样本编号</th>
										<th>物种</th>
										<th>风险</th>
									</tr>
								</thead>
								<tbody>
									{#each allSamples as sample}
										<tr
											class="cursor-pointer {selectedSampleId === sample.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}"
											onclick={() => onSampleSelect(sample.id)}
										>
											<td class="font-mono text-sm">{sample.sampleNumber}</td>
											<td class="text-sm">{sample.suspectedSpecies || '未鉴定'}</td>
											<td>
												<span class="badge badge-sm {getRiskBadge(sample.riskLevel)}">
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
			</div>

			<div class="lg:col-span-2">
				{#if selectedSample}
					<WarningReportPanel sample={selectedSample} />
				{:else}
					<div class="card">
						<div class="card-section text-center py-16">
							<span class="material-icons text-6xl text-surface-300 mb-4">security</span>
							<p class="text-surface-500 text-lg">请从左侧选择一个样本</p>
							<p class="text-sm text-surface-400">选择后可生成并查看该样本的安全预警报告</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="space-y-6">
			<div class="card">
				<div class="card-header flex justify-between items-center">
					<h3 class="card-title">选择要生成预警报告的样本</h3>
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
						<div class="overflow-x-auto max-h-96 overflow-y-auto">
							<table class="table table-hover">
								<thead class="sticky top-0 bg-surface-50-900-token">
									<tr>
										<th class="w-12">
											<input
												type="checkbox"
												class="checkbox"
												checked={batchSelected.size === allSamples.length && allSamples.length > 0}
												onchange={selectAll}
											/>
										</th>
										<th>样本编号</th>
										<th>采集地点</th>
										<th>物种</th>
										<th>风险等级</th>
										<th>采集日期</th>
									</tr>
								</thead>
								<tbody>
									{#each allSamples as sample}
										<tr class="cursor-pointer" onclick={() => toggleBatchSelection(sample.id)}>
											<td onclick={(e) => e.stopPropagation()}>
												<input
													type="checkbox"
													class="checkbox"
													checked={batchSelected.has(sample.id)}
													onchange={() => toggleBatchSelection(sample.id)}
												/>
											</td>
											<td class="font-mono">{sample.sampleNumber}</td>
											<td>{sample.location}</td>
											<td>{sample.suspectedSpecies || '未鉴定'}</td>
											<td>
												<span class="badge badge-sm {getRiskBadge(sample.riskLevel)}">
													{getRiskLabel(sample.riskLevel)}
												</span>
											</td>
											<td>{sample.collectionDate}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
				<div class="card-footer flex justify-between items-center">
					<p class="text-sm text-surface-500">已选择 {batchSelected.size} 个样本</p>
					<div class="flex gap-3">
						<button
							class="btn btn-primary"
							onclick={generateBatchReports}
							disabled={batchSelected.size === 0}
						>
							<span class="material-icons">generate</span>
							生成批量报告
						</button>
						<button
							class="btn btn-success"
							onclick={downloadBatchReports}
							disabled={batchReport.length === 0}
						>
							<span class="material-icons">download</span>
							导出报告
						</button>
					</div>
				</div>
			</div>

			{#if batchReport.length > 0}
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">生成的预警报告摘要</h3>
					</div>
					<div class="card-section">
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{#each batchReport as report}
								<div
									class="p-4 rounded-lg border {report.edibleRisk.level === 'danger'
										? 'border-error-300 bg-error-50'
										: report.edibleRisk.level === 'caution'
											? 'border-warning-300 bg-warning-50'
											: 'border-success-300 bg-success-50'}"
								>
									<p class="font-bold mb-1">{report.suspectedSpecies || '未鉴定'}</p>
									<p class="text-sm">{report.edibleRisk.title}</p>
									<p class="text-xs text-surface-500 mt-2">
										{report.collectionSeason} · {report.habitatType}
									</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
