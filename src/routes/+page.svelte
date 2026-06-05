<script lang="ts">
	import {
		samples,
		filters,
		species,
		currentUser,
		generateId,
		validateSample,
		hasPermission,
		canEditSample,
		deleteSample
	} from '$lib/stores';
	import { SPORE_COLORS, IDENTIFICATION_STATUS, CAP_COLORS, RISK_LEVELS } from '$lib/types';
	import SampleForm from '$lib/components/SampleForm.svelte';
	import WarningReportPanel from '$lib/components/WarningReportPanel.svelte';
	import type { FungiSample } from '$lib/types';

	let showForm = $state(false);
	let editingSample: FungiSample | null = $state(null);
	let formErrors: string[] = $state([]);
	let viewingSample: FungiSample | null = $state(null);

	let filteredSamples = $derived(
		$samples.filter((sample) => {
			if ($filters.location && !sample.location.includes($filters.location)) {
				return false;
			}
			if ($filters.capColor && sample.capColor !== $filters.capColor) {
				return false;
			}
			if ($filters.sporePrintColor && sample.sporePrintColor !== $filters.sporePrintColor) {
				return false;
			}
			if ($filters.identificationStatus && sample.identificationStatus !== $filters.identificationStatus) {
				return false;
			}
			if ($filters.isAbnormal !== null && sample.isAbnormal !== $filters.isAbnormal) {
				return false;
			}
			if ($filters.riskLevel && sample.riskLevel !== $filters.riskLevel) {
				return false;
			}
			if ($filters.dateFrom && sample.collectionDate < $filters.dateFrom) {
				return false;
			}
			if ($filters.dateTo && sample.collectionDate > $filters.dateTo) {
				return false;
			}
			return true;
		})
	);

	let locations = $derived([...new Set($samples.map((s) => s.location))]);
	let poisonousSpeciesNames = $derived($species.filter((s) => s.isPoisonous).map((s) => s.name));
	let highRiskSpeciesNames = $derived($species.filter((s) => s.riskLevel === 'high').map((s) => s.name));
	let canCreate = $derived(hasPermission($currentUser, 'create'));

	function addSample() {
		if (!canCreate) {
			alert('您没有创建样本的权限');
			return;
		}

		editingSample = {
			id: '',
			sampleNumber: '',
			collectionDate: new Date().toISOString().split('T')[0],
			location: '',
			latitude: null,
			longitude: null,
			habitatType: '',
			capColor: '',
			sporePrintColor: null,
			suspectedSpecies: null,
			identificationStatus: 'pending',
			identificationEvidences: [],
			identifiedBy: null,
			identifiedAt: null,
			notes: '',
			isAbnormal: false,
			hasSporePrint: false,
			riskLevel: 'low',
			riskConfirmed: false,
			images: [],
			createdBy: $currentUser?.id || 'guest',
			createdAt: '',
			updatedBy: null,
			updatedAt: '',
			views: 0,
			shared: false
		};
		formErrors = [];
		showForm = true;
	}

	function editSample(sample: FungiSample) {
		if (!canEditSample($currentUser, sample)) {
			alert('您没有编辑此样本的权限');
			return;
		}

		editingSample = { ...sample };
		formErrors = [];
		showForm = true;
	}

	function viewSample(sample: FungiSample) {
		viewingSample = sample;
	}

	async function handleDeleteSample(id: string) {
		if (!hasPermission($currentUser, 'delete')) {
			alert('您没有删除样本的权限');
			return;
		}

		if (confirm('确定要删除这个样本吗？')) {
			await deleteSample(id);
		}
	}

	function handleSubmit(submittedSample: FungiSample) {
		const validation = validateSample(submittedSample, $samples, editingSample?.id);

		if (!validation.valid) {
			formErrors = validation.errors;
			return;
		}

		const now = new Date().toISOString();
		const userId = $currentUser?.id || 'guest';

		if (editingSample && editingSample.id) {
			const sampleId = editingSample.id;
			samples.update((s) =>
				s.map((sample) =>
					sample.id === sampleId
						? { ...submittedSample, id: sampleId, updatedBy: userId, updatedAt: now }
						: sample
				)
			);
		} else {
			samples.update((s) => [
				...s,
				{
					...submittedSample,
					id: generateId(),
					createdBy: userId,
					createdAt: now,
					updatedAt: now
				}
			]);
		}

		showForm = false;
		editingSample = null;
	}

	function handleCancel() {
		showForm = false;
		editingSample = null;
		formErrors = [];
	}

	function getStatusBadge(status: string) {
		const statusMap: Record<string, { class: string; label: string }> = {
			pending: { class: 'badge-warning', label: '待鉴定' },
			identified: { class: 'badge-success', label: '已鉴定' },
			unidentified: { class: 'badge-error', label: '无法鉴定' }
		};
		return statusMap[status] || { class: 'badge', label: status };
	}

	function getRiskBadge(riskLevel: string) {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found || { class: 'badge', label: riskLevel };
	}

	function resetFilters() {
		$filters = {
			location: '',
			capColor: '',
			sporePrintColor: '',
			identificationStatus: '',
			isAbnormal: null,
			riskLevel: '',
			createdBy: '',
			dateFrom: '',
			dateTo: ''
		};
	}
</script>

{#if showForm && editingSample}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
			<SampleForm
				sample={editingSample}
				errors={formErrors}
				onsubmit={(detail) => handleSubmit(detail as FungiSample)}
				oncancel={handleCancel}
			/>
		</div>
	</div>
{/if}

{#if viewingSample}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="card">
				<div class="card-header flex justify-between items-center">
					<h2 class="card-title">样本详情 - {viewingSample.sampleNumber}</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => (viewingSample = null)}>
						<span class="material-icons">close</span>
					</button>
				</div>
				<div class="card-section">
					<div class="grid grid-cols-2 gap-4 mb-6">
						<div>
							<p class="text-sm text-surface-500">采集日期</p>
							<p class="font-medium">{viewingSample.collectionDate}</p>
						</div>
						<div>
							<p class="text-sm text-surface-500">采集地点</p>
							<p class="font-medium">{viewingSample.location}</p>
						</div>
						<div>
							<p class="text-sm text-surface-500">生境类型</p>
							<p class="font-medium">{viewingSample.habitatType}</p>
						</div>
						<div>
							<p class="text-sm text-surface-500">菌盖颜色</p>
							<p class="font-medium">{viewingSample.capColor}</p>
						</div>
						<div>
							<p class="text-sm text-surface-500">疑似物种</p>
							<p class="font-medium">{viewingSample.suspectedSpecies || '未鉴定'}</p>
						</div>
						<div>
							<p class="text-sm text-surface-500">鉴定状态</p>
							<span class="badge {getStatusBadge(viewingSample.identificationStatus).class}">
								{getStatusBadge(viewingSample.identificationStatus).label}
							</span>
						</div>
						<div>
							<p class="text-sm text-surface-500">风险等级</p>
							<span class="badge {getRiskBadge(viewingSample.riskLevel).class}">
								{getRiskBadge(viewingSample.riskLevel).label}
							</span>
						</div>
						<div>
							<p class="text-sm text-surface-500">孢子印</p>
							<p class="font-medium">
								{viewingSample.hasSporePrint ? viewingSample.sporePrintColor : '未采集'}
							</p>
						</div>
					</div>

					{#if viewingSample.images && viewingSample.images.length > 0}
						<div class="mb-6">
							<p class="text-sm text-surface-500 mb-2">样本图片</p>
							<div class="grid grid-cols-4 gap-2">
								{#each viewingSample.images as image}
									<img
										src={image.dataUrl}
										alt={image.caption || '样本图片'}
										class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
										onclick={() => window.open(image.dataUrl, '_blank')}
									/>
								{/each}
							</div>
						</div>
					{/if}

					{#if viewingSample.identificationEvidences && viewingSample.identificationEvidences.length > 0}
						<div class="mb-6">
							<p class="text-sm text-surface-500 mb-2">鉴定依据</p>
							<div class="space-y-2">
								{#each viewingSample.identificationEvidences as evidence}
									<div class="p-3 bg-surface-100-800-token rounded">
										<span class="badge badge-sm badge-outline mr-2">{evidence.type}</span>
										<span class="text-sm text-surface-500">置信度: {evidence.confidence}%</span>
										<p class="mt-1">{evidence.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if viewingSample.notes}
						<div>
							<p class="text-sm text-surface-500 mb-2">备注</p>
							<p class="p-3 bg-surface-100-800-token rounded">{viewingSample.notes}</p>
						</div>
					{/if}

					<WarningReportPanel sample={viewingSample} />

					<div class="flex gap-3 justify-end pt-4">
						<button class="btn btn-ghost" onclick={() => (viewingSample = null)}>关闭</button>
						{#if canEditSample($currentUser, viewingSample)}
							<button
								class="btn btn-primary"
								onclick={() => {
									editingSample = { ...viewingSample! };
									viewingSample = null;
									showForm = true;
								}}
							>
								编辑
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token">样本列表</h2>
			<p class="text-surface-500">共 {$samples.length} 个样本，当前显示 {filteredSamples.length} 个</p>
		</div>
		<button class="btn btn-primary" onclick={addSample} disabled={!canCreate}>
			<span class="material-icons text-xl">add</span>
			新增样本
		</button>
	</div>

	<div class="card">
		<div class="card-header">
			<h3 class="card-title flex items-center gap-2">
				<span class="material-icons">filter_alt</span>
				筛选条件
			</h3>
		</div>
		<div class="card-section">
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">采集地点</span>
					</label>
					<input
						type="text"
						bind:value={$filters.location}
						class="input"
						placeholder="输入地点关键词..."
						list="location-list"
					/>
					<datalist id="location-list">
						{#each locations as loc}
							<option value={loc}></option>
						{/each}
					</datalist>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">菌盖颜色</span>
					</label>
					<select bind:value={$filters.capColor} class="select">
						<option value="">全部颜色</option>
						{#each CAP_COLORS as color}
							<option value={color}>{color}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">孢子印颜色</span>
					</label>
					<select bind:value={$filters.sporePrintColor} class="select">
						<option value="">全部颜色</option>
						{#each SPORE_COLORS as color}
							<option value={color}>{color}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">鉴定状态</span>
					</label>
					<select bind:value={$filters.identificationStatus} class="select">
						<option value="">全部状态</option>
						{#each IDENTIFICATION_STATUS as status}
							<option value={status.value}>{status.label}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">风险等级</span>
					</label>
					<select bind:value={$filters.riskLevel} class="select">
						<option value="">全部等级</option>
						{#each RISK_LEVELS as level}
							<option value={level.value}>{level.label}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">异常标记</span>
					</label>
					<select bind:value={$filters.isAbnormal} class="select">
						<option value={null}>全部</option>
						<option value={true}>仅异常</option>
						<option value={false}>仅正常</option>
					</select>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">开始日期</span>
					</label>
					<input type="date" bind:value={$filters.dateFrom} class="input" />
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">结束日期</span>
					</label>
					<input type="date" bind:value={$filters.dateTo} class="input" />
				</div>
			</div>
			<div class="mt-4 flex justify-end">
				<button class="btn btn-ghost btn-sm" onclick={resetFilters}>
					重置筛选
				</button>
			</div>
		</div>
	</div>

	{#if filteredSamples.length === 0}
		<div class="card">
			<div class="card-section text-center py-12">
				<span class="material-icons text-6xl text-surface-300 mb-4">inbox</span>
				<p class="text-surface-500 text-lg">
					{$samples.length === 0
						? '暂无样本记录，点击"新增样本"开始记录'
						: '没有符合筛选条件的样本'}
				</p>
			</div>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="table table-hover table-zebra">
				<thead>
					<tr>
						<th>样本编号</th>
						<th>采集日期</th>
						<th>采集地点</th>
						<th>疑似物种</th>
						<th>风险等级</th>
						<th>状态</th>
						<th>图片</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredSamples as sample (sample.id)}
						<tr class={sample.isAbnormal ? 'bg-error-50' : ''}>
							<td class="font-mono font-bold cursor-pointer" onclick={() => viewSample(sample)}>
								{sample.sampleNumber}
							</td>
							<td>{sample.collectionDate}</td>
							<td>{sample.location}</td>
							<td>
								{#if sample.suspectedSpecies}
									<span
										class="inline-flex items-center gap-1 {highRiskSpeciesNames.includes(sample.suspectedSpecies)
											? 'text-error-600 font-bold'
											: poisonousSpeciesNames.includes(sample.suspectedSpecies)
												? 'text-warning-600'
												: ''}"
									>
										{sample.suspectedSpecies}
										{#if highRiskSpeciesNames.includes(sample.suspectedSpecies)}
											<span class="material-icons text-sm">danger</span>
										{:else if poisonousSpeciesNames.includes(sample.suspectedSpecies)}
											<span class="material-icons text-sm">warning</span>
										{/if}
									</span>
								{:else}
									<span class="text-surface-400">-</span>
								{/if}
							</td>
							<td>
								<span class="badge {getRiskBadge(sample.riskLevel).class}">
									{getRiskBadge(sample.riskLevel).label}
								</span>
							</td>
							<td>
								<span class="badge {getStatusBadge(sample.identificationStatus).class}">
									{getStatusBadge(sample.identificationStatus).label}
								</span>
							</td>
							<td>
								{#if sample.images && sample.images.length > 0}
									<span class="material-icons text-primary-500">photo_library</span>
									<span class="text-sm ml-1">{sample.images.length}</span>
								{:else}
									<span class="text-surface-400">-</span>
								{/if}
							</td>
							<td>
								<div class="flex gap-1">
									<button class="btn btn-ghost btn-sm" onclick={() => viewSample(sample)}>
										<span class="material-icons">visibility</span>
									</button>
									{#if canEditSample($currentUser, sample)}
										<button class="btn btn-ghost btn-sm" onclick={() => editSample(sample)}>
											<span class="material-icons">edit</span>
										</button>
									{/if}
									{#if hasPermission($currentUser, 'delete')}
										<button
											class="btn btn-ghost btn-sm text-error"
											onclick={() => handleDeleteSample(sample.id)}
										>
											<span class="material-icons">delete</span>
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
