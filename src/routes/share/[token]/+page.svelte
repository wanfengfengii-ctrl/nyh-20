<script lang="ts">
	import { page } from '$app/stores';
	import { samples, species, getShareData, exportToJSON, downloadFile } from '$lib/stores';
	import type { FungiSample } from '$lib/types';

	let token = $derived($page.params.token);
	let shareData = $state<{
		samples: FungiSample[];
		config: {
			allowDownload: boolean;
			expiresAt: string | null;
		};
	} | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	$effect(() => {
		loadShareData();
	});

	async function loadShareData() {
		try {
			loading = true;
			if (!token) {
				error = '分享链接无效';
				return;
			}
			const data = getShareData(token);
			if (data) {
				if (data.config.expiresAt && new Date(data.config.expiresAt) < new Date()) {
					error = '分享链接已过期';
				} else {
					shareData = data;
				}
			} else {
				error = '分享链接无效或已被删除';
			}
		} catch (e) {
			error = '加载分享数据失败';
		} finally {
			loading = false;
		}
	}

	function handleDownload() {
		if (!shareData) return;
		const data = {
			exportedAt: new Date().toISOString(),
			version: '1.0',
			samples: shareData.samples,
			species: $species
		};
		const json = exportToJSON(data);
		const filename = `fungi-shared-${new Date().toISOString().split('T')[0]}.json`;
		downloadFile(json, filename, 'application/json');
	}

	function goBack() {
		window.history.back();
	}

	let totalSamples = $derived(shareData?.samples.length || 0);
	let highRiskCount = $derived(shareData?.samples.filter((s) => s.riskLevel === 'high').length || 0);
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token">分享数据</h2>
			<p class="text-surface-500">查看分享的野生菌样本数据</p>
		</div>
		<button class="btn btn-outline" onclick={goBack}>
			<span class="material-icons">arrow_back</span>
			返回
		</button>
	</div>

	{#if loading}
		<div class="card">
			<div class="card-section text-center py-12">
				<span class="material-icons text-4xl text-primary-500 animate-spin">refresh</span>
				<p class="text-surface-500 mt-4">加载中...</p>
			</div>
		</div>
	{:else if error}
		<div class="card">
			<div class="card-section text-center py-12">
				<span class="material-icons text-4xl text-error-500">error</span>
				<p class="text-lg font-semibold mt-4">{error}</p>
				<button class="btn btn-primary mt-6" onclick={goBack}>
					<span class="material-icons">arrow_back</span>
					返回首页
				</button>
			</div>
		</div>
	{:else if shareData}
		<div class="card">
			<div class="card-header flex justify-between items-center">
				<div>
					<h3 class="card-title">分享摘要</h3>
					{#if shareData.config.expiresAt}
						<p class="text-sm text-surface-500">
							有效期至：{new Date(shareData.config.expiresAt).toLocaleString('zh-CN')}
						</p>
					{:else}
						<p class="text-sm text-surface-500">永久有效</p>
					{/if}
				</div>
				{#if shareData.config.allowDownload}
					<button class="btn btn-primary" onclick={handleDownload}>
						<span class="material-icons">download</span>
						下载数据
					</button>
				{/if}
			</div>
			<div class="card-section">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div class="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
						<p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{totalSamples}</p>
						<p class="text-sm text-surface-500">样本总数</p>
					</div>
					<div class="text-center p-4 bg-error-50 dark:bg-error-900/20 rounded-lg">
						<p class="text-3xl font-bold text-error-600 dark:text-error-400">{highRiskCount}</p>
						<p class="text-sm text-surface-500">高风险物种</p>
					</div>
					<div class="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
						<p class="text-3xl font-bold text-success-600 dark:text-success-400">
							{shareData.samples.filter((s) => s.identificationStatus === 'identified').length}
						</p>
						<p class="text-sm text-surface-500">已鉴定</p>
					</div>
					<div class="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
						<p class="text-3xl font-bold text-warning-600 dark:text-warning-400">
							{new Set(shareData.samples.map((s) => s.location)).size}
						</p>
						<p class="text-sm text-surface-500">采集地点</p>
					</div>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">样本列表</h3>
			</div>
			<div class="card-section p-0">
				<div class="overflow-x-auto">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>样本编号</th>
								<th>采集地点</th>
								<th>物种</th>
								<th>风险等级</th>
								<th>采集日期</th>
							</tr>
						</thead>
						<tbody>
							{#each shareData.samples as sample}
								<tr>
									<td class="font-mono">{sample.sampleNumber}</td>
									<td>{sample.location}</td>
									<td>{sample.suspectedSpecies || '未鉴定'}</td>
									<td>
										{#if sample.riskLevel === 'high'}
											<span class="badge badge-danger">高风险</span>
										{:else if sample.riskLevel === 'medium'}
											<span class="badge badge-warning">中风险</span>
										{:else}
											<span class="badge badge-success">低风险</span>
										{/if}
									</td>
									<td>{sample.collectionDate}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>
