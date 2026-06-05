<script lang="ts">
	import { species, generateWarningReport, downloadWarningReport } from '$lib/stores';
	import type { FungiSample, WarningReport } from '$lib/types';

	let { sample } = $props<{ sample: FungiSample }>();

	let report = $state<WarningReport | null>(null);
	let showReport = $state(false);
	let activeTab = $state<'risk' | 'handling' | 'toxic' | 'observation'>('risk');

	function generateReport() {
		report = generateWarningReport(sample, $species);
		showReport = true;
	}

	function handleDownload() {
		if (report) {
			downloadWarningReport(report, sample);
		}
	}

	function getRiskLevelClass(level: string) {
		const classes: Record<string, string> = {
			danger: 'bg-error-100 text-error-700 border-error-300',
			caution: 'bg-warning-100 text-warning-700 border-warning-300',
			safe: 'bg-success-100 text-success-700 border-success-300',
			unknown: 'bg-surface-100 text-surface-700 border-surface-300'
		};
		return classes[level] || classes.unknown;
	}

	function getRiskLevelIcon(level: string) {
		const icons: Record<string, string> = {
			danger: 'dangerous',
			caution: 'warning',
			safe: 'check_circle',
			unknown: 'help'
		};
		return icons[level] || icons.unknown;
	}

	function getRiskLevelLabel(level: string) {
		const labels: Record<string, string> = {
			danger: '高度危险',
			caution: '中等风险',
			safe: '低风险',
			unknown: '风险未知'
		};
		return labels[level] || '未知';
	}

	const tabs = [
		{ id: 'risk', label: '食用风险', icon: 'restaurant' },
		{ id: 'handling', label: '处理建议', icon: 'health_and_safety' },
		{ id: 'toxic', label: '有毒种预警', icon: 'skull' },
		{ id: 'observation', label: '观察建议', icon: 'visibility' }
	] as const;
</script>

<div class="card">
	<div class="card-header flex justify-between items-center">
		<div class="flex items-center gap-2">
			<span class="material-icons text-primary-500">security</span>
			<h3 class="card-title">真菌安全预警</h3>
		</div>
		<button class="btn btn-primary btn-sm" onclick={generateReport}>
			<span class="material-icons text-sm">generate</span>
			生成预警报告
		</button>
	</div>
	<div class="card-section">
		{#if !showReport}
			<div class="text-center py-8">
				<span class="material-icons text-5xl text-surface-300">shield</span>
				<p class="text-surface-500 mt-4">点击"生成预警报告"按钮</p>
				<p class="text-sm text-surface-400">系统将根据样本信息自动生成安全预警与处理建议</p>
			</div>
		{:else if report}
			<div class="mb-4 p-4 rounded-lg border-2 {getRiskLevelClass(report.edibleRisk.level)}">
				<div class="flex items-center gap-3">
					<span class="material-icons text-3xl">{getRiskLevelIcon(report.edibleRisk.level)}</span>
					<div>
						<p class="font-bold text-lg">{report.edibleRisk.title}</p>
						<p class="text-sm opacity-80">{getRiskLevelLabel(report.edibleRisk.level)} · {report.collectionSeason}采集 · {report.habitatType}</p>
					</div>
				</div>
			</div>

			<div class="tabs mb-4">
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

			<div class="min-h-[300px]">
				{#if activeTab === 'risk'}
					<div class="space-y-4">
						<div class="p-4 bg-surface-50 rounded-lg">
							<p class="mb-3">{report.edibleRisk.description}</p>
							<p class="font-medium mb-2">评估依据：</p>
							<ul class="space-y-1">
								{#each report.edibleRisk.reasons as reason}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5 text-primary-500">check_circle</span>
										{reason}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{:else if activeTab === 'handling'}
					<div class="space-y-4">
						<div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
							<h4 class="font-medium flex items-center gap-2 mb-2">
								<span class="material-icons text-sm text-blue-500">pan_tool</span>
								接触安全
							</h4>
							<ul class="space-y-1">
								{#each report.handlingAdvice.contactSafety as advice}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5">fiber_manual_record</span>
										{advice}
									</li>
								{/each}
							</ul>
						</div>
						<div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
							<h4 class="font-medium flex items-center gap-2 mb-2">
								<span class="material-icons text-sm text-purple-500">inventory_2</span>
								存储建议
							</h4>
							<ul class="space-y-1">
								{#each report.handlingAdvice.storageAdvice as advice}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5">fiber_manual_record</span>
										{advice}
									</li>
								{/each}
							</ul>
						</div>
						<div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
							<h4 class="font-medium flex items-center gap-2 mb-2">
								<span class="material-icons text-sm text-gray-500">delete</span>
								废弃处理
							</h4>
							<ul class="space-y-1">
								{#each report.handlingAdvice.disposalAdvice as advice}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5">fiber_manual_record</span>
										{advice}
									</li>
								{/each}
							</ul>
						</div>
						<div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
							<h4 class="font-medium flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
								<span class="material-icons text-sm">emergency</span>
								应急措施
							</h4>
							<ul class="space-y-1">
								{#each report.handlingAdvice.emergencySteps as step}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5 text-red-500">priority_high</span>
										{step}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{:else if activeTab === 'toxic'}
					<div class="space-y-4">
						<div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
							<p class="text-sm mb-2">
								<span class="font-medium">季节预警：</span>
								{report.toxicSpeciesWarning.seasonalWarning}
							</p>
							<p class="text-sm">
								<span class="font-medium">生境预警：</span>
								{report.toxicSpeciesWarning.habitatWarning}
							</p>
						</div>

						<h4 class="font-medium">需警惕的相似有毒种：</h4>
						{#each report.toxicSpeciesWarning.similarSpecies as species}
							<div class="border rounded-lg p-4 {species.riskLevel === 'high'
								? 'border-error-300 bg-error-50 dark:bg-error-900/10'
								: 'border-warning-300 bg-warning-50 dark:bg-warning-900/10'}">
								<div class="flex items-center gap-2 mb-2">
									<span class="font-bold">{species.name}</span>
									<span
										class="badge badge-sm {species.riskLevel === 'high'
											? 'badge-error'
											: 'badge-warning'}"
									>
										{species.riskLevel === 'high' ? '高毒' : '有毒'}
									</span>
								</div>
								<p class="text-sm mb-2">{species.description}</p>
								<p class="text-sm">
									<span class="font-medium">鉴别要点：</span>
									{species.distinguishingFeatures.join('；')}
								</p>
							</div>
						{/each}

						<div class="p-4 bg-surface-50 rounded-lg">
							<h4 class="font-medium mb-2">关键鉴别要点：</h4>
							<ul class="space-y-1">
								{#each report.toxicSpeciesWarning.keyDifferences as diff}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5 text-primary-500">lightbulb</span>
										{diff}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{:else if activeTab === 'observation'}
					<div class="space-y-4">
						<div class="p-4 bg-surface-50 rounded-lg">
							<h4 class="font-medium mb-2">建议补充检查：</h4>
							<ul class="space-y-2">
								{#each report.observationAdvice.additionalChecks as check, i}
									<li class="flex items-start gap-2 text-sm">
										<span class="badge badge-sm badge-outline">{i + 1}</span>
										{check}
									</li>
								{/each}
							</ul>
						</div>

						<div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
							<h4 class="font-medium mb-2">鉴定技巧：</h4>
							<ul class="space-y-1">
								{#each report.observationAdvice.identificationTips as tip}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5 text-blue-500">tips_and_updates</span>
										{tip}
									</li>
								{/each}
							</ul>
						</div>

						<div class="p-4 border-2 border-primary-200 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
							<h4 class="font-medium flex items-center gap-2 mb-2">
								<span class="material-icons text-primary-500">person</span>
								专家建议
							</h4>
							<p class="text-sm">{report.observationAdvice.expertRecommendation}</p>
						</div>

						<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
							<h4 class="font-medium mb-2">后续步骤：</h4>
							<ul class="space-y-1">
								{#each report.observationAdvice.followUpSteps as step}
									<li class="flex items-start gap-2 text-sm">
										<span class="material-icons text-xs mt-0.5 text-green-500">task_alt</span>
										{step}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</div>

			<div class="flex justify-between items-center pt-4 border-t mt-4">
				<p class="text-xs text-surface-400">
					报告生成时间：{new Date(report.generatedAt).toLocaleString('zh-CN')}
				</p>
				<button class="btn btn-primary" onclick={handleDownload}>
					<span class="material-icons">download</span>
					导出报告
				</button>
			</div>
		{/if}
	</div>
</div>
