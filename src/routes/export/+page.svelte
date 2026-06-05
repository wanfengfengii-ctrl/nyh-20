<script lang="ts">
	import {
		samples,
		species,
		exportToCSV,
		exportToJSON,
		downloadFile,
		generateShareToken,
		importData,
		generateWarningReport,
		exportWarningReportToHTML
	} from '$lib/stores';
	import type { FungiSample, WarningReport } from '$lib/types';

	let selectedSamples = $state<Set<string>>(new Set());
	let shareLink = $state<string>('');
	let showShareModal = $state(false);
	let shareExpireDays = $state(7);
	let allowDownload = $state(true);

	let allSamples = $derived($samples);
	let allSpecies = $derived($species);

	function toggleSampleSelection(sampleId: string) {
		const newSet = new Set(selectedSamples);
		if (newSet.has(sampleId)) {
			newSet.delete(sampleId);
		} else {
			newSet.add(sampleId);
		}
		selectedSamples = newSet;
	}

	function selectAll() {
		if (selectedSamples.size === allSamples.length) {
			selectedSamples = new Set();
		} else {
			selectedSamples = new Set(allSamples.map((s) => s.id));
		}
	}

	function getSelectedSamples(): FungiSample[] {
		if (selectedSamples.size === 0) {
			return allSamples;
		}
		return allSamples.filter((s) => selectedSamples.has(s.id));
	}

	function handleExportCSV() {
		const data = getSelectedSamples();
		const csv = exportToCSV(data);
		const filename = `fungi-samples-${new Date().toISOString().split('T')[0]}.csv`;
		downloadFile(csv, filename, 'text/csv;charset=utf-8;');
	}

	function handleExportJSON() {
		const data = {
			exportedAt: new Date().toISOString(),
			version: '1.0',
			samples: getSelectedSamples(),
			species: allSpecies
		};
		const json = exportToJSON(data);
		const filename = `fungi-export-${new Date().toISOString().split('T')[0]}.json`;
		downloadFile(json, filename, 'application/json');
	}

	function handleExportWarningReport() {
		const samples = getSelectedSamples();
		if (samples.length === 0) return;

		const reports = samples.map((sample) => generateWarningReport(sample, allSpecies));

		const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>真菌安全预警报告 - 批量导出</title>
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
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    </style>
</head>
<body>
    <h1>🍄 真菌安全预警报告 - 批量导出</h1>
    <div class="summary">
        <p><strong>报告生成时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        <p><strong>报告样本数：</strong>${reports.length} 个</p>
        <p><strong>高风险样本：</strong>${reports.filter((r) => r.edibleRisk.level === 'danger').length} 个</p>
        <p><strong>中风险样本：</strong>${reports.filter((r) => r.edibleRisk.level === 'caution').length} 个</p>
        <p><strong>低风险样本：</strong>${reports.filter((r) => r.edibleRisk.level === 'safe').length} 个</p>
    </div>
    ${reports
			.map(
				(report) => {
					const sample = samples.find((s) => s.id === report.sampleId);
					return `
    <div class="report-card ${report.edibleRisk.level === 'danger' ? 'high-risk' : report.edibleRisk.level === 'caution' ? 'medium-risk' : 'low-risk'}">
        <h2>样本 ${sample?.sampleNumber || report.sampleId.slice(0, 8)} - ${report.suspectedSpecies || '未鉴定'}</h2>
        <div class="info-grid">
            <div><strong>采集日期：</strong>${sample?.collectionDate || '未知'}</div>
            <div><strong>采集地点：</strong>${sample?.location || '未知'}</div>
            <div><strong>采集季节：</strong>${report.collectionSeason}</div>
            <div><strong>生境类型：</strong>${report.habitatType}</div>
        </div>
        <h3>⚠️ 食用风险评估</h3>
        <p><strong>${report.edibleRisk.title}</strong></p>
        <p>${report.edibleRisk.description}</p>
        <h3>🧤 处理建议摘要</h3>
        <ul>
            ${report.handlingAdvice.contactSafety.slice(0, 2).map((s) => `<li>${s}</li>`).join('')}
        </ul>
        <h3>☠️ 相似有毒种预警</h3>
        <p>${report.toxicSpeciesWarning.seasonalWarning}</p>
        <h3>🔍 专家建议</h3>
        <p>${report.observationAdvice.expertRecommendation}</p>
    </div>`;
				}
			)
			.join('')}
    <div class="footer">
        <p>⚠️ 本报告仅供参考，不能替代专业鉴定。食用野生菌存在风险，请务必谨慎。</p>
    </div>
</body>
</html>`;

		const filename = `预警报告-批量-${new Date().toISOString().split('T')[0]}.html`;
		downloadFile(htmlContent, filename, 'text/html');
	}

	function generateShareLink() {
		const token = generateShareToken(
			Array.from(selectedSamples).join(','),
			shareExpireDays,
			allowDownload
		);
		const baseUrl = window.location.origin;
		shareLink = `${baseUrl}/share/${token}`;
		showShareModal = true;
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			alert('链接已复制到剪贴板！');
		});
	}

	let selectedCount = $derived(selectedSamples.size > 0 ? selectedSamples.size : allSamples.length);
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token">数据导出与分享</h2>
			<p class="text-surface-500">导出样本数据或生成分享链接</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 space-y-6">
			<div class="card">
				<div class="card-header flex justify-between items-center">
					<h3 class="card-title">选择要导出的样本</h3>
					<button class="btn btn-outline btn-sm" onclick={selectAll}>
						{selectedSamples.size === allSamples.length ? '取消全选' : '全选'}
					</button>
				</div>
				<div class="card-section">
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
												checked={selectedSamples.size === allSamples.length}
												onchange={selectAll}
											/>
										</th>
										<th>样本编号</th>
										<th>采集地点</th>
										<th>物种</th>
										<th>采集日期</th>
									</tr>
								</thead>
								<tbody>
									{#each allSamples as sample}
										<tr class="cursor-pointer" onclick={() => toggleSampleSelection(sample.id)}>
											<td onclick={(e) => e.stopPropagation()}>
												<input
													type="checkbox"
													class="checkbox"
													checked={selectedSamples.has(sample.id)}
													onchange={() => toggleSampleSelection(sample.id)}
												/>
											</td>
											<td class="font-mono">{sample.sampleNumber}</td>
											<td>{sample.location}</td>
											<td>{sample.suspectedSpecies || '未鉴定'}</td>
											<td>{sample.collectionDate}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>

			<div class="card">
				<div class="card-header">
					<h3 class="card-title">导出选项</h3>
				</div>
				<div class="card-section">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div class="p-4 border border-surface-200-700-token rounded-lg">
							<div class="flex items-center gap-3 mb-3">
								<span class="material-icons text-primary-500">table_view</span>
								<h4 class="font-semibold">CSV 格式</h4>
							</div>
							<p class="text-sm text-surface-500 mb-4">
								适合在 Excel 或其他表格软件中打开和分析
							</p>
							<button
								class="btn btn-primary w-full"
								onclick={handleExportCSV}
								disabled={allSamples.length === 0}
							>
								<span class="material-icons">download</span>
								导出 CSV ({selectedCount} 条)
							</button>
						</div>

						<div class="p-4 border border-surface-200-700-token rounded-lg">
							<div class="flex items-center gap-3 mb-3">
								<span class="material-icons text-success-500">code</span>
								<h4 class="font-semibold">JSON 格式</h4>
							</div>
							<p class="text-sm text-surface-500 mb-4">
								完整数据导出，包含所有字段和关联信息
							</p>
							<button
								class="btn btn-success w-full"
								onclick={handleExportJSON}
								disabled={allSamples.length === 0}
							>
								<span class="material-icons">download</span>
								导出 JSON ({selectedCount} 条)
							</button>
						</div>

						<div class="p-4 border border-surface-200-700-token rounded-lg">
							<div class="flex items-center gap-3 mb-3">
								<span class="material-icons text-warning-500">security</span>
								<h4 class="font-semibold">安全预警报告</h4>
							</div>
							<p class="text-sm text-surface-500 mb-4">
								生成包含食用风险、处理建议的HTML格式报告
							</p>
							<button
								class="btn btn-warning w-full"
								onclick={handleExportWarningReport}
								disabled={allSamples.length === 0}
							>
								<span class="material-icons">download</span>
								导出预警报告 ({selectedCount} 条)
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-6">
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">分享数据</h3>
				</div>
				<div class="card-section">
					<div class="space-y-4">
						<p class="text-sm text-surface-500">
							生成分享链接，让其他人可以查看你选择的样本数据
						</p>

						<div class="form-control">
							<label class="form-control-label">
								<span class="form-control-label-text">链接有效期</span>
							</label>
							<select bind:value={shareExpireDays} class="select">
								<option value={1}>1 天</option>
								<option value={7}>7 天</option>
								<option value={30}>30 天</option>
								<option value={0}>永久有效</option>
							</select>
						</div>

						<div class="form-control">
							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={allowDownload}
									id="allowDownload"
									class="checkbox"
								/>
								<label for="allowDownload" class="cursor-pointer">允许接收者下载数据</label>
							</div>
						</div>

						<button
							class="btn btn-primary w-full"
							onclick={generateShareLink}
							disabled={selectedCount === 0}
						>
							<span class="material-icons">share</span>
							生成分享链接
						</button>

						<div class="text-sm text-surface-500 pt-4 border-t border-surface-200-700-token">
							<p class="mb-2">
								<span class="material-icons text-sm align-middle">info</span>
								已选择 {selectedCount} 条数据
							</p>
							<p>
								<span class="material-icons text-sm align-middle">link</span>
								分享链接包含所选样本的完整信息
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="card">
				<div class="card-header">
					<h3 class="card-title">数据统计</h3>
				</div>
				<div class="card-section">
					<div class="space-y-3">
						<div class="flex justify-between items-center">
							<span class="text-surface-500">总样本数</span>
							<span class="font-bold">{allSamples.length}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-surface-500">已鉴定</span>
							<span class="font-bold text-success-600">
								{allSamples.filter((s) => s.identificationStatus === 'identified').length}
							</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-surface-500">高风险</span>
							<span class="font-bold text-error-600">
								{allSamples.filter((s) => s.riskLevel === 'high').length}
							</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-surface-500">带图片</span>
							<span class="font-bold">
								{allSamples.filter((s) => s.images && s.images.length > 0).length}
							</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-surface-500">物种种类</span>
							<span class="font-bold">{allSpecies.length}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="card">
				<div class="card-header">
					<h3 class="card-title">导入数据</h3>
				</div>
				<div class="card-section">
					<p class="text-sm text-surface-500 mb-4">
						从 JSON 文件导入之前导出的数据
					</p>
					<label class="btn btn-outline w-full">
						<span class="material-icons">upload</span>
						选择 JSON 文件
						<input
							type="file"
							accept=".json"
							class="hidden"
							onchange={async (e) => {
								const file = (e.target as HTMLInputElement).files?.[0];
								if (file) {
									const reader = new FileReader();
									reader.onload = async (ev) => {
										try {
											const data = JSON.parse(ev.target?.result as string);
											if (data.samples && Array.isArray(data.samples)) {
												const result = await importData(data);
												let message = `成功导入 ${result.imported} 条样本数据`;
												if (result.conflicts.length > 0) {
													message += `\n\n跳过 ${result.conflicts.length} 条已存在的数据：\n${result.conflicts.slice(0, 5).join('\n')}`;
													if (result.conflicts.length > 5) {
														message += `\n... 还有 ${result.conflicts.length - 5} 条`;
													}
												}
												alert(message);
											} else {
												alert('文件中没有找到样本数据');
											}
										} catch (error) {
											console.error('Import error:', error);
											alert('无效的 JSON 文件或导入失败');
										}
									};
									reader.readAsText(file);
								}
							}}
						/>
					</label>
				</div>
			</div>
		</div>
	</div>
</div>

{#if showShareModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-lg w-full">
			<div class="card">
				<div class="card-header flex justify-between items-center">
					<h2 class="card-title">分享链接已生成</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => (showShareModal = false)}>
						<span class="material-icons">close</span>
					</button>
				</div>
				<div class="card-section">
					<div class="alert alert-success mb-4">
						<div class="alert-icon">
							<span class="material-icons">check_circle</span>
						</div>
						<div class="alert-content">
							分享链接已生成！
						</div>
					</div>

					<div class="form-control mb-4">
						<label class="form-control-label">
							<span class="form-control-label-text">分享链接</span>
						</label>
						<div class="flex gap-2">
							<input
								type="text"
								value={shareLink}
								class="input flex-1"
								readonly
							/>
							<button class="btn btn-primary" onclick={() => copyToClipboard(shareLink)}>
								<span class="material-icons">content_copy</span>
								复制
							</button>
						</div>
					</div>

					<div class="text-sm text-surface-500">
						<p>
							<span class="material-icons text-sm align-middle">info</span>
							此链接包含 {selectedCount} 条样本数据
						</p>
						<p class="mt-1">
							<span class="material-icons text-sm align-middle">schedule</span>
							有效期：{shareExpireDays === 0 ? '永久有效' : `${shareExpireDays} 天`}
						</p>
					</div>

					<div class="flex gap-3 justify-end pt-4">
						<button class="btn btn-ghost" onclick={() => (showShareModal = false)}>
							关闭
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
