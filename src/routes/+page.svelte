<script lang="ts">
	import { samples, filters, species, generateId, validateSample } from '$lib/stores';
	import { SPORE_COLORS, IDENTIFICATION_STATUS } from '$lib/types';
	import SampleForm from '$lib/components/SampleForm.svelte';
	import type { FungiSample } from '$lib/types';

	let showForm = $state(false);
	let editingSample: FungiSample | null = $state(null);
	let formErrors: string[] = $state([]);

	let filteredSamples = $derived($samples.filter((sample) => {
		if ($filters.location && !sample.location.includes($filters.location)) {
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
		return true;
	}));

	let locations = $derived([...new Set($samples.map((s) => s.location))]);
	let poisonousSpeciesNames = $derived($species.filter((s) => s.isPoisonous).map((s) => s.name));

	function addSample() {
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
			notes: '',
			isAbnormal: false,
			hasSporePrint: false,
			createdAt: '',
			updatedAt: ''
		};
		formErrors = [];
		showForm = true;
	}

	function editSample(sample: FungiSample) {
		editingSample = { ...sample };
		formErrors = [];
		showForm = true;
	}

	function deleteSample(id: string) {
		if (confirm('确定要删除这个样本吗？')) {
			samples.update((s) => s.filter((sample) => sample.id !== id));
		}
	}

	function handleSubmit(submittedSample: FungiSample) {
		const validation = validateSample(submittedSample, $samples, editingSample?.id);
		
		if (!validation.valid) {
			formErrors = validation.errors;
			return;
		}

		const now = new Date().toISOString();

		if (editingSample && editingSample.id) {
			const sampleId = editingSample.id;
			samples.update((s) =>
				s.map((sample) =>
					sample.id === sampleId ? { ...submittedSample, id: sampleId, updatedAt: now } : sample
				)
			);
		} else {
			samples.update((s) => [
				...s,
				{
					...submittedSample,
					id: generateId(),
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

	function resetFilters() {
		$filters = {
			location: '',
			sporePrintColor: '',
			identificationStatus: '',
			isAbnormal: null
		};
	}
</script>

{#if showForm && editingSample}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<SampleForm
				sample={editingSample}
				errors={formErrors}
				onsubmit={(detail) => handleSubmit(detail as FungiSample)}
				oncancel={handleCancel}
			/>
		</div>
	</div>
{/if}

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token">样本列表</h2>
			<p class="text-surface-500">共 {$samples.length} 个样本，当前显示 {filteredSamples.length} 个</p>
		</div>
		<button class="btn btn-primary" onclick={addSample}>
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
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
						<span class="form-control-label-text">异常标记</span>
					</label>
					<select
						bind:value={$filters.isAbnormal}
						class="select"
					>
						<option value={null}>全部</option>
						<option value={true}>仅异常</option>
						<option value={false}>仅正常</option>
					</select>
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
					{$samples.length === 0 ? '暂无样本记录，点击"新增样本"开始记录' : '没有符合筛选条件的样本'}
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
						<th>生境</th>
						<th>菌盖颜色</th>
						<th>孢子印颜色</th>
						<th>疑似物种</th>
						<th>状态</th>
						<th>异常</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredSamples as sample (sample.id)}
						<tr class={sample.isAbnormal ? 'bg-error-50' : ''}>
							<td class="font-mono font-bold">{sample.sampleNumber}</td>
							<td>{sample.collectionDate}</td>
							<td>{sample.location}</td>
							<td>{sample.habitatType}</td>
							<td>{sample.capColor}</td>
							<td>
								{sample.hasSporePrint
									? sample.sporePrintColor || '已采集未记录'
									: '<span class="text-surface-400">未采集</span>'}
							</td>
							<td>
								{#if sample.suspectedSpecies}
									<span
										class="inline-flex items-center gap-1 {poisonousSpeciesNames.includes(
											sample.suspectedSpecies
										)
											? 'text-error-600 font-bold'
											: ''}"
									>
										{sample.suspectedSpecies}
										{#if poisonousSpeciesNames.includes(sample.suspectedSpecies)}
											<span class="material-icons text-sm">warning</span>
										{/if}
									</span>
								{:else}
									<span class="text-surface-400">-</span>
								{/if}
							</td>
							<td>
								<span class="badge {getStatusBadge(sample.identificationStatus).class}">
									{getStatusBadge(sample.identificationStatus).label}
								</span>
							</td>
							<td>
								{#if sample.isAbnormal}
									<span class="badge badge-error">异常</span>
								{:else}
									<span class="text-surface-400">-</span>
								{/if}
							</td>
							<td>
								<div class="flex gap-2">
									<button class="btn btn-ghost btn-sm" onclick={() => editSample(sample)}>
										<span class="material-icons">edit</span>
									</button>
									<button class="btn btn-ghost btn-sm text-error" onclick={() => deleteSample(sample.id)}>
										<span class="material-icons">delete</span>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
