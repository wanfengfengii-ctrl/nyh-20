<script lang="ts">
	import type { FungiSample, IdentificationEvidence, SampleImage } from '$lib/types';
	import {
		HABITAT_TYPES,
		CAP_COLORS,
		SPORE_COLORS,
		IDENTIFICATION_STATUS,
		RISK_LEVELS,
		EVIDENCE_TYPES
	} from '$lib/types';
	import { species as speciesStore, currentUser, generateId, hasPermission } from '$lib/stores';

	let {
		sample,
		errors = [],
		onsubmit,
		oncancel
	}: {
		sample: Partial<FungiSample>;
		errors?: string[];
		onsubmit?: (detail: FungiSample) => void;
		oncancel?: () => void;
	} = $props();

	let latitudeStr = $state(sample.latitude?.toString() || '');
	let longitudeStr = $state($state.snapshot(sample.longitude)?.toString() || '');

	let showHighRiskConfirm = $state(false);
	let highRiskConfirmed = $state(false);

	let newEvidenceType = $state<'morphology' | 'spore' | 'microscope' | 'dna' | 'reference'>('morphology');
	let newEvidenceDesc = $state('');
	let newEvidenceConfidence = $state(80);

	$effect.pre(() => {
		latitudeStr = sample.latitude?.toString() || '';
		longitudeStr = sample.longitude?.toString() || '';
	});

	let speciesList = $derived($speciesStore);
	let poisonousSpecies = $derived(speciesList.filter((s) => s.isPoisonous));
	let highRiskSpecies = $derived(speciesList.filter((s) => s.riskLevel === 'high'));
	let canIdentify = $derived(hasPermission($currentUser, 'identify'));

	function handleSubmit(e: Event) {
		e.preventDefault();

		const selectedSpecies = speciesList.find((s) => s.name === sample.suspectedSpecies);
		if (selectedSpecies?.riskLevel === 'high' && !sample.riskConfirmed && !highRiskConfirmed) {
			showHighRiskConfirm = true;
			return;
		}

		submitSample();
	}

	function confirmHighRisk() {
		highRiskConfirmed = true;
		showHighRiskConfirm = false;
		submitSample();
	}

	function submitSample() {
		const selectedSpecies = speciesList.find((s) => s.name === sample.suspectedSpecies);
		const submittedSample: Partial<FungiSample> = {
			...sample,
			latitude: latitudeStr ? parseFloat(latitudeStr) : null,
			longitude: longitudeStr ? parseFloat(longitudeStr) : null,
			riskLevel: selectedSpecies?.riskLevel || sample.riskLevel || 'low',
			riskConfirmed: selectedSpecies?.riskLevel === 'high' ? highRiskConfirmed : true
		};
		onsubmit?.(submittedSample as FungiSample);
	}

	function addEvidence() {
		if (!newEvidenceDesc.trim()) return;

		const evidence: IdentificationEvidence = {
			type: newEvidenceType,
			description: newEvidenceDesc.trim(),
			confidence: newEvidenceConfidence
		};

		if (!sample.identificationEvidences) {
			sample.identificationEvidences = [];
		}
		sample.identificationEvidences = [...sample.identificationEvidences, evidence];
		newEvidenceDesc = '';
		newEvidenceConfidence = 80;
	}

	function removeEvidence(index: number) {
		sample.identificationEvidences = sample.identificationEvidences?.filter((_, i) => i !== index);
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		for (const file of Array.from(files)) {
			const dataUrl = await readFileAsDataURL(file);
			const image: SampleImage = {
				id: generateId(),
				dataUrl,
				caption: file.name,
				uploadedAt: new Date().toISOString(),
				uploadedBy: $currentUser?.id || 'guest'
			};

			if (!sample.images) {
				sample.images = [];
			}
			sample.images = [...sample.images, image];
		}

		input.value = '';
	}

	function readFileAsDataURL(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	function removeImage(imageId: string) {
		sample.images = sample.images?.filter((img) => img.id !== imageId);
	}

	function getEvidenceLabel(type: string): string {
		const found = EVIDENCE_TYPES.find((e) => e.value === type);
		return found?.label || type;
	}
</script>

<div class="card">
	<div class="card-header">
		<h2 class="card-title">{sample.id ? '编辑样本' : '新增样本'}</h2>
	</div>
	<div class="card-section">
		{#if errors.length > 0}
			<div class="alert alert-error mb-4">
				<div class="alert-icon">
					<span class="material-icons">error</span>
				</div>
				<div class="alert-content">
					<ul class="list-disc pl-4">
						{#each errors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">样本编号 *</span>
					</label>
					<input
						type="text"
						bind:value={sample.sampleNumber}
						class="input"
						placeholder="例如: FG-2024-001"
					/>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">采集日期 *</span>
					</label>
					<input
						type="date"
						bind:value={sample.collectionDate}
						class="input"
						max={new Date().toISOString().split('T')[0]}
					/>
				</div>

				<div class="form-control md:col-span-2">
					<label class="form-control-label">
						<span class="form-control-label-text">采集地点 *</span>
					</label>
					<input
						type="text"
						bind:value={sample.location}
						class="input"
						placeholder="例如: 北京香山"
					/>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">纬度</span>
					</label>
					<input
						type="number"
						bind:value={latitudeStr}
						class="input"
						placeholder="-90 到 90 之间"
						step="any"
					/>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">经度</span>
					</label>
					<input
						type="number"
						bind:value={longitudeStr}
						class="input"
						placeholder="-180 到 180 之间"
						step="any"
					/>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">生境类型 *</span>
					</label>
					<select bind:value={sample.habitatType} class="select">
						<option value="">请选择生境类型</option>
						{#each HABITAT_TYPES as habitat}
							<option value={habitat}>{habitat}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">菌盖颜色 *</span>
					</label>
					<select bind:value={sample.capColor} class="select">
						<option value="">请选择菌盖颜色</option>
						{#each CAP_COLORS as color}
							<option value={color}>{color}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">疑似物种</span>
					</label>
					<select bind:value={sample.suspectedSpecies} class="select">
						<option value="">请选择疑似物种</option>
						{#each speciesList as sp}
							<option value={sp.name}>
								{sp.name}
								{#if sp.isPoisonous} ⚠️ 有毒{/if}
								{#if sp.riskLevel === 'high'} 🔴 高风险{/if}
							</option>
						{/each}
					</select>
					{#if sample.suspectedSpecies && highRiskSpecies.some((s) => s.name === sample.suspectedSpecies)}
						<div class="alert alert-error mt-2">
							<div class="alert-icon">
								<span class="material-icons">danger</span>
							</div>
							<div class="alert-content">
								<span class="font-bold">警告：</span>该物种为高风险有毒物种！
							</div>
						</div>
					{:else if sample.suspectedSpecies && poisonousSpecies.some((s) => s.name === sample.suspectedSpecies)}
						<div class="alert alert-warning mt-2">
							<div class="alert-icon">
								<span class="material-icons">warning</span>
							</div>
							<div class="alert-content">
								<span class="font-bold">注意：</span>该物种为有毒物种，请谨慎处理！
							</div>
						</div>
					{/if}
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">鉴定状态</span>
					</label>
					<select bind:value={sample.identificationStatus} class="select" disabled={!canIdentify}>
						{#each IDENTIFICATION_STATUS as status}
							<option value={status.value}>{status.label}</option>
						{/each}
					</select>
					{#if !canIdentify}
						<p class="text-sm text-surface-500 mt-1">仅鉴定师或管理员可修改鉴定状态</p>
					{/if}
				</div>
			</div>

			<div class="card">
				<div class="card-header">
					<h3 class="card-title">样本图片</h3>
				</div>
				<div class="card-section">
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
						{#each sample.images || [] as image}
							<div class="relative group">
								<img
									src={image.dataUrl}
									alt={image.caption || '样本图片'}
									class="w-full h-24 object-cover rounded-lg"
								/>
								<button
									type="button"
									class="absolute top-1 right-1 btn btn-error btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
									onclick={() => removeImage(image.id)}
								>
									<span class="material-icons">close</span>
								</button>
								<p class="text-xs text-center mt-1 truncate">{image.caption}</p>
							</div>
						{/each}
					</div>
					<label class="btn btn-outline btn-sm">
						<span class="material-icons">add_photo_alternate</span>
						上传图片
						<input
							type="file"
							accept="image/*"
							multiple
							class="hidden"
							onchange={handleImageUpload}
						/>
					</label>
				</div>
			</div>

			{#if sample.identificationStatus === 'identified' || canIdentify}
				<div class="card">
					<div class="card-header">
						<h3 class="card-title">鉴定依据 {sample.identificationStatus === 'identified' ? '*' : ''}</h3>
					</div>
					<div class="card-section">
						{#if sample.identificationEvidences && sample.identificationEvidences.length > 0}
							<div class="space-y-2 mb-4">
								{#each sample.identificationEvidences as evidence, index}
									<div class="flex items-start gap-3 p-3 bg-surface-100-800-token rounded-lg">
										<div class="flex-1">
											<span class="badge badge-sm badge-outline mr-2">
												{getEvidenceLabel(evidence.type)}
											</span>
											<span class="text-sm">置信度: {evidence.confidence}%</span>
											<p class="mt-1">{evidence.description}</p>
										</div>
										<button
											type="button"
											class="btn btn-ghost btn-sm text-error"
											onclick={() => removeEvidence(index)}
										>
											<span class="material-icons">delete</span>
										</button>
									</div>
								{/each}
							</div>
						{/if}

						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="form-control">
								<label class="form-control-label">
									<span class="form-control-label-text">依据类型</span>
								</label>
								<select bind:value={newEvidenceType} class="select">
									{#each EVIDENCE_TYPES as type}
										<option value={type.value}>{type.label}</option>
									{/each}
								</select>
							</div>
							<div class="form-control">
								<label class="form-control-label">
									<span class="form-control-label-text">置信度 (%)</span>
								</label>
								<input
									type="number"
									bind:value={newEvidenceConfidence}
									class="input"
									min="0"
									max="100"
								/>
							</div>
							<div class="form-control md:col-span-2">
								<label class="form-control-label">
									<span class="form-control-label-text">依据描述</span>
								</label>
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={newEvidenceDesc}
										class="input flex-1"
										placeholder="描述鉴定依据..."
									/>
									<button type="button" class="btn btn-primary" onclick={addEvidence}>
										<span class="material-icons">add</span>
										添加
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">是否已采集孢子印</span>
					</label>
					<div class="flex items-center gap-2 mt-2">
						<input
							type="checkbox"
							bind:checked={sample.hasSporePrint}
							id="hasSporePrint"
							class="checkbox"
						/>
						<label for="hasSporePrint" class="cursor-pointer">已采集孢子印</label>
					</div>
				</div>

				<div class="form-control">
					<label class="form-control-label">
						<span class="form-control-label-text">孢子印颜色</span>
					</label>
					<select
						bind:value={sample.sporePrintColor}
						class="select"
						disabled={!sample.hasSporePrint}
					>
						<option value="">请选择孢子印颜色</option>
						{#each SPORE_COLORS as color}
							<option value={color}>{color}</option>
						{/each}
					</select>
					{#if !sample.hasSporePrint}
						<p class="text-sm text-surface-500 mt-1">需要先勾选"已采集孢子印"</p>
					{/if}
				</div>
			</div>

			<div class="form-control">
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={sample.isAbnormal}
						id="isAbnormal"
						class="checkbox"
					/>
					<label for="isAbnormal" class="cursor-pointer">标记为异常样本</label>
				</div>
			</div>

			<div class="form-control">
				<label class="form-control-label">
					<span class="form-control-label-text">备注</span>
				</label>
				<textarea
					bind:value={sample.notes}
					class="textarea"
					rows="3"
					placeholder="输入备注信息..."
				></textarea>
			</div>

			<div class="flex gap-3 justify-end pt-4">
				<button type="button" class="btn btn-ghost" onclick={() => oncancel?.()}>
					取消
				</button>
				<button type="submit" class="btn btn-primary">
					保存
				</button>
			</div>
		</form>
	</div>
</div>

{#if showHighRiskConfirm}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-md w-full">
			<div class="card">
				<div class="card-header">
					<h2 class="card-title text-error-600">
						<span class="material-icons align-middle">warning</span>
						高风险物种确认
					</h2>
				</div>
				<div class="card-section">
					<div class="alert alert-error mb-4">
						<div class="alert-icon">
							<span class="material-icons">danger</span>
						</div>
						<div class="alert-content">
							<p>您选择的物种 <strong>{sample.suspectedSpecies}</strong> 为高风险有毒物种！</p>
							<p class="mt-2">请确认已了解该物种的危险性，并采取适当的安全措施。</p>
						</div>
					</div>
					<div class="flex gap-3 justify-end">
						<button class="btn btn-ghost" onclick={() => (showHighRiskConfirm = false)}>
							取消
						</button>
						<button class="btn btn-error" onclick={confirmHighRisk}>
							确认保存
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
