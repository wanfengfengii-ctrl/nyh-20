<script lang="ts">
	import type { FungiSample } from '$lib/types';
	import { HABITAT_TYPES, CAP_COLORS, SPORE_COLORS, IDENTIFICATION_STATUS } from '$lib/types';
	import { species as speciesStore } from '$lib/stores';

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
	let longitudeStr = $state(sample.longitude?.toString() || '');

	$effect.pre(() => {
		latitudeStr = sample.latitude?.toString() || '';
		longitudeStr = sample.longitude?.toString() || '';
	});

	let species = $derived($speciesStore);
	let poisonousSpecies = $derived(species.filter((s) => s.isPoisonous));

	function handleSubmit(e: Event) {
		e.preventDefault();
		const submittedSample: Partial<FungiSample> = {
			...sample,
			latitude: latitudeStr ? parseFloat(latitudeStr) : null,
			longitude: longitudeStr ? parseFloat(longitudeStr) : null
		};
		onsubmit?.(submittedSample as FungiSample);
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

		<form onsubmit={handleSubmit} class="space-y-4">
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

				<div class="form-control">
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
						<span class="form-control-label-text">鉴定状态</span>
					</label>
					<select bind:value={sample.identificationStatus} class="select">
						{#each IDENTIFICATION_STATUS as status}
							<option value={status.value}>{status.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-control">
				<label class="form-control-label">
					<span class="form-control-label-text">疑似物种</span>
				</label>
				<select bind:value={sample.suspectedSpecies} class="select">
					<option value="">请选择疑似物种</option>
					{#each species as sp}
						<option value={sp.name}>{sp.name} {sp.isPoisonous ? '⚠️ 有毒' : ''}</option>
					{/each}
				</select>
				{#if sample.suspectedSpecies && poisonousSpecies.some((s) => s.name === sample.suspectedSpecies)}
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
