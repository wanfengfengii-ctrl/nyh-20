<script lang="ts">
	import { warningHistory, clearOldHistory, shareRecords } from '$lib/stores';
	import type { WarningHistory } from '$lib/types';
	import { RISK_LEVELS } from '$lib/types';

	let showClearDialog = $state(false);
	let clearDays = $state(30);

	function getRiskBadgeClass(riskLevel: string) {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found?.class || 'badge';
	}

	function getRiskLabel(riskLevel: string) {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found?.label || riskLevel;
	}

	function getReportTypeLabel(type: string) {
		const labels: Record<string, string> = {
			single: '单样本',
			batch: '批量',
			comparison: '对比分析'
		};
		return labels[type] || type;
	}

	function getReportTypeIcon(type: string) {
		const icons: Record<string, string> = {
			single: 'description',
			batch: 'batch_prediction',
			comparison: 'compare'
		};
		return icons[type] || 'description';
	}

	function handleClearHistory() {
		clearOldHistory(clearDays);
		showClearDialog = false;
	}

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			const hours = Math.floor(diff / (1000 * 60 * 60));
			if (hours === 0) {
				const minutes = Math.floor(diff / (1000 * 60));
				return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`;
			}
			return `${hours} 小时前`;
		} else if (days === 1) {
			return '昨天';
		} else if (days < 7) {
			return `${days} 天前`;
		} else {
			return date.toLocaleDateString('zh-CN');
		}
	}
</script>

<div class="card">
	<div class="card-header flex justify-between items-center">
		<div class="flex items-center gap-2">
			<span class="material-icons text-primary-500">history</span>
			<h3 class="card-title">预警生成历史</h3>
			<span class="badge badge-outline">{$warningHistory.length} 条记录</span>
		</div>
		<button class="btn btn-ghost btn-sm" onclick={() => (showClearDialog = true)}>
			<span class="material-icons text-sm">delete_sweep</span>
			清理记录
		</button>
	</div>

	<div class="card-section p-0">
		{#if $warningHistory.length === 0}
			<div class="text-center py-12">
				<span class="material-icons text-5xl text-surface-300 mb-4">history_off</span>
				<p class="text-surface-500">暂无预警历史记录</p>
				<p class="text-sm text-surface-400 mt-2">生成预警报告后，记录将显示在这里</p>
			</div>
		{:else}
			<div class="overflow-x-auto max-h-[400px] overflow-y-auto">
				<table class="table table-hover">
					<thead class="sticky top-0 bg-surface-50-900-token">
						<tr>
							<th>样本编号</th>
							<th>疑似物种</th>
							<th>风险等级</th>
							<th>报告类型</th>
							<th>分享状态</th>
							<th>生成时间</th>
						</tr>
					</thead>
					<tbody>
						{#each $warningHistory as item}
							<tr>
								<td class="font-mono text-sm">{item.sampleNumber}</td>
								<td>{item.suspectedSpecies || '未鉴定'}</td>
								<td>
									<span class="badge badge-sm {getRiskBadgeClass(item.riskLevel)}">
										{getRiskLabel(item.riskLevel)}
									</span>
								</td>
								<td>
									<span class="inline-flex items-center gap-1">
										<span class="material-icons text-sm">{getReportTypeIcon(item.reportType)}</span>
										{getReportTypeLabel(item.reportType)}
									</span>
								</td>
								<td>
									{#if item.shared}
										<span class="inline-flex items-center gap-1 text-success-600">
											<span class="material-icons text-sm">share</span>
											已分享 ({item.shareCount})
										</span>
									{:else}
										<span class="text-surface-400 text-sm">未分享</span>
									{/if}
								</td>
								<td class="text-sm text-surface-500">
									{formatDate(item.generatedAt)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<div class="card-footer">
		<div class="flex justify-between items-center text-sm text-surface-500">
			<span>共 {$warningHistory.length} 条记录</span>
			<span>最后一条：{$warningHistory[0] ? formatDate($warningHistory[0].generatedAt) : '无'}</span>
		</div>
	</div>
</div>

{#if showClearDialog}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-md w-full">
			<div class="p-6">
				<h3 class="text-lg font-bold mb-4 flex items-center gap-2">
					<span class="material-icons text-warning-500">warning</span>
					清理历史记录
				</h3>
				<p class="text-surface-600 mb-4">
					此操作将删除指定天数之前的历史记录，删除后不可恢复。
				</p>
				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">保留最近多少天的记录</span>
					</label>
					<select bind:value={clearDays} class="select">
						<option value={7}>7 天</option>
						<option value={14}>14 天</option>
						<option value={30}>30 天</option>
						<option value={90}>90 天</option>
					</select>
				</div>
				<div class="flex gap-3 justify-end mt-6">
					<button class="btn btn-ghost" onclick={() => (showClearDialog = false)}>
						取消
					</button>
					<button class="btn btn-error" onclick={handleClearHistory}>
						确认清理
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}