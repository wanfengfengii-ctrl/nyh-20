<script lang="ts">
	import { EMERGENCY_SCENARIOS, type EmergencyGuidance, type EmergencyScenario } from '$lib/types';
	import { getEmergencyGuidance, getAllEmergencyGuidance, getRelevantEmergencyGuidance } from '$lib/stores';
	import type { FungiSample, Species } from '$lib/types';

	let {
		sample,
		speciesList,
		mode = 'relevant'
	}: {
		sample?: FungiSample;
		speciesList?: Species[];
		mode?: 'relevant' | 'all' | 'single';
	} = $props();

	let activeScenario = $state<EmergencyScenario | null>(null);
	let guidanceList = $state<EmergencyGuidance[]>([]);

	$effect(() => {
		if (mode === 'all') {
			guidanceList = getAllEmergencyGuidance();
		} else if (mode === 'single' && activeScenario) {
			guidanceList = [getEmergencyGuidance(activeScenario)];
		} else if (sample && speciesList) {
			guidanceList = getRelevantEmergencyGuidance(sample, speciesList);
		} else {
			guidanceList = getAllEmergencyGuidance();
		}
		if (!activeScenario && guidanceList.length > 0) {
			activeScenario = guidanceList[0].scenario;
		}
	});

	function getSeverityBadgeClass(severity: string) {
		const classes: Record<string, string> = {
			critical: 'badge-error',
			high: 'badge-warning',
			medium: 'badge-outline text-warning-500'
		};
		return classes[severity] || 'badge';
	}

	function getSeverityLabel(severity: string) {
		const labels: Record<string, string> = {
			critical: '极严重',
			high: '严重',
			medium: '中等',
			low: '轻微'
		};
		return labels[severity] || '未知';
	}

	function getSeverityIcon(severity: string) {
		const icons: Record<string, string> = {
			critical: 'emergency',
			high: 'warning',
			medium: 'info',
			low: 'check_circle'
		};
		return icons[severity] || 'help';
	}

	function getSeverityBorderClass(severity: string) {
		const classes: Record<string, string> = {
			critical: 'border-l-4 border-error-500',
			high: 'border-l-4 border-warning-500',
			medium: 'border-l-4 border-primary-500',
			low: 'border-l-4 border-success-500'
		};
		return classes[severity] || '';
	}
</script>

<div class="card">
	<div class="card-header">
		<div class="flex items-center gap-2">
			<span class="material-icons text-error-500">local_hospital</span>
			<h3 class="card-title">场景化应急处理指引</h3>
		</div>
	</div>

	{#if mode !== 'single'}
		<div class="card-section border-b">
			<div class="flex flex-wrap gap-2">
				{#each EMERGENCY_SCENARIOS as scenario}
					<button
						class="btn btn-sm {activeScenario === scenario.value ? 'btn-primary' : 'btn-ghost'}"
						onclick={() => {
							activeScenario = scenario.value;
							if (mode === 'single') {
								guidanceList = [getEmergencyGuidance(scenario.value)];
							}
						}}
					>
						<span class="material-icons text-sm mr-1">{scenario.icon}</span>
						{scenario.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="card-section">
		<div class="space-y-6">
			{#each guidanceList as guidance}
				{#if mode === 'single' || activeScenario === guidance.scenario}
					<div class="{getSeverityBorderClass(guidance.severity)} pl-4">
						<div class="flex items-center justify-between mb-4">
							<div>
								<h4 class="text-lg font-bold flex items-center gap-2">
									<span class="material-icons {guidance.severity === 'critical'
										? 'text-error-500'
										: guidance.severity === 'high'
											? 'text-warning-500'
											: 'text-primary-500'}">
										{getSeverityIcon(guidance.severity)}
									</span>
									{guidance.title}
								</h4>
								<p class="text-sm text-surface-500 mt-1">{guidance.description}</p>
							</div>
							<span class="badge {getSeverityBadgeClass(guidance.severity)}">
								{getSeverityLabel(guidance.severity)}
							</span>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="p-4 rounded-lg bg-error-50 dark:bg-error-900/20">
								<h5 class="font-medium flex items-center gap-2 mb-3 text-error-600 dark:text-error-400">
									<span class="material-icons text-sm">flash_on</span>
									立即行动
								</h5>
								<ul class="space-y-2">
									{#each guidance.immediateActions as action}
										<li class="flex items-start gap-2 text-sm">
											<span class="material-icons text-xs mt-0.5 text-error-500">priority_high</span>
											{action}
										</li>
									{/each}
								</ul>
							</div>

							<div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
								<h5 class="font-medium flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
									<span class="material-icons text-sm">healing</span>
									急救措施
								</h5>
								<ul class="space-y-2">
									{#each guidance.firstAid as aid}
										<li class="flex items-start gap-2 text-sm">
											<span class="material-icons text-xs mt-0.5 text-blue-500">medical_services</span>
											{aid}
										</li>
									{/each}
								</ul>
							</div>

							<div class="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
								<h5 class="font-medium flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400">
									<span class="material-icons text-sm">local_hospital</span>
									需就医情况
								</h5>
								<ul class="space-y-2">
									{#each guidance.medicalAttention as condition}
										<li class="flex items-start gap-2 text-sm">
											<span class="material-icons text-xs mt-0.5 text-purple-500">add_alert</span>
											{condition}
										</li>
									{/each}
								</ul>
							</div>

							<div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
								<h5 class="font-medium flex items-center gap-2 mb-3 text-green-600 dark:text-green-400">
									<span class="material-icons text-sm">shield</span>
									预防措施
								</h5>
								<ul class="space-y-2">
									{#each guidance.preventionTips as tip}
										<li class="flex items-start gap-2 text-sm">
											<span class="material-icons text-xs mt-0.5 text-green-500">verified</span>
											{tip}
										</li>
									{/each}
								</ul>
							</div>
						</div>

						{#if guidance.relatedSpecies.length > 0}
							<div class="mt-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
								<p class="text-sm">
									<span class="font-medium">相关高危物种：</span>
									{guidance.relatedSpecies.join('、')}
								</p>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>