<script lang="ts">
	import { species, generateId, hasPermission, currentUser, deleteSpecies } from '$lib/stores';
	import type { Species } from '$lib/types';
	import { SEASONS, HABITAT_TYPES, RISK_LEVELS } from '$lib/types';

	let showForm = $state(false);
	let editingSpecies: Species | null = $state(null);
	let formErrors: string[] = $state([]);

	let poisonousCount = $derived($species.filter((s) => s.isPoisonous).length);
	let edibleCount = $derived($species.filter((s) => !s.isPoisonous).length);
	let highRiskCount = $derived($species.filter((s) => s.riskLevel === 'high').length);

	let canManage = $derived(hasPermission($currentUser, 'manage_users'));

	let newIdKey = $state('');

	function addSpecies() {
		editingSpecies = {
			id: '',
			name: '',
			isPoisonous: false,
			riskLevel: 'low',
			description: '',
			identificationKeys: [],
			seasonality: [],
			commonLocations: [],
			createdAt: '',
			updatedAt: ''
		};
		formErrors = [];
		showForm = true;
	}

	function editSpecies(sp: Species) {
		editingSpecies = { ...sp };
		formErrors = [];
		showForm = true;
	}

	async function handleDeleteSpecies(id: string) {
		if (confirm('确定要删除这个物种吗？')) {
			await deleteSpecies(id);
		}
	}

	function toggleSeason(season: string) {
		if (!editingSpecies) return;
		if (editingSpecies.seasonality.includes(season)) {
			editingSpecies.seasonality = editingSpecies.seasonality.filter((s) => s !== season);
		} else {
			editingSpecies.seasonality = [...editingSpecies.seasonality, season];
		}
	}

	function toggleLocation(location: string) {
		if (!editingSpecies) return;
		if (editingSpecies.commonLocations.includes(location)) {
			editingSpecies.commonLocations = editingSpecies.commonLocations.filter((l) => l !== location);
		} else {
			editingSpecies.commonLocations = [...editingSpecies.commonLocations, location];
		}
	}

	function addIdKey() {
		if (!editingSpecies || !newIdKey.trim()) return;
		editingSpecies.identificationKeys = [...editingSpecies.identificationKeys, newIdKey.trim()];
		newIdKey = '';
	}

	function removeIdKey(index: number) {
		if (!editingSpecies) return;
		editingSpecies.identificationKeys = editingSpecies.identificationKeys.filter((_, i) => i !== index);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!editingSpecies) return;

		const errors: string[] = [];
		if (!editingSpecies.name.trim()) {
			errors.push('物种名称不能为空');
		}

		if (errors.length > 0) {
			formErrors = errors;
			return;
		}

		const now = new Date().toISOString();

		if (editingSpecies.id) {
			const updatedSpecies = { ...editingSpecies, updatedAt: now };
			species.update((s) => s.map((sp) => (sp.id === updatedSpecies.id ? updatedSpecies : sp)));
		} else {
			const newSpecies: Species = {
				...editingSpecies,
				id: generateId(),
				createdAt: now,
				updatedAt: now
			};
			species.update((s) => [...s, newSpecies]);
		}

		showForm = false;
		editingSpecies = null;
	}

	function handleCancel() {
		showForm = false;
		editingSpecies = null;
		formErrors = [];
	}

	function getRiskClass(riskLevel: string): string {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found?.class || 'badge';
	}

	function getRiskLabel(riskLevel: string): string {
		const found = RISK_LEVELS.find((r) => r.value === riskLevel);
		return found?.label || riskLevel;
	}
</script>

{#if showForm && editingSpecies}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="card">
				<div class="card-header">
					<h2 class="card-title">{editingSpecies.id ? '编辑物种' : '新增物种'}</h2>
				</div>
				<div class="card-section">
					{#if formErrors.length > 0}
						<div class="alert alert-error mb-4">
							<div class="alert-icon">
								<span class="material-icons">error</span>
							</div>
							<div class="alert-content">
								<ul class="list-disc pl-4">
									{#each formErrors as error}
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
									<span class="form-control-label-text">物种名称 *</span>
								</label>
								<input
									type="text"
									bind:value={editingSpecies.name}
									class="input"
									placeholder="输入物种名称..."
								/>
							</div>

							<div class="form-control">
								<label class="form-control-label">
									<span class="form-control-label-text">风险等级</span>
								</label>
								<select bind:value={editingSpecies.riskLevel} class="select">
									{#each RISK_LEVELS as level}
										<option value={level.value}>{level.label}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="form-control">
							<div class="flex items-center gap-3">
								<input
									type="checkbox"
									bind:checked={editingSpecies.isPoisonous}
									id="isPoisonous"
									class="checkbox"
								/>
								<label for="isPoisonous" class="cursor-pointer font-medium">
									标记为有毒物种
								</label>
							</div>
						</div>

						<div class="form-control">
							<label class="form-control-label">
								<span class="form-control-label-text">描述</span>
							</label>
							<textarea
								bind:value={editingSpecies.description}
								class="textarea"
								rows="3"
								placeholder="输入物种描述..."
							></textarea>
						</div>

						<div class="form-control">
							<label class="form-control-label">
								<span class="form-control-label-text">季节分布</span>
							</label>
							<div class="flex flex-wrap gap-2 mt-2">
								{#each SEASONS as season}
									<button
										type="button"
										class="btn btn-sm {editingSpecies.seasonality.includes(season)
											? 'btn-primary'
											: 'btn-outline'}"
										onclick={() => toggleSeason(season)}
									>
										{season}
									</button>
								{/each}
							</div>
						</div>

						<div class="form-control">
							<label class="form-control-label">
								<span class="form-control-label-text">常见生境</span>
							</label>
							<div class="flex flex-wrap gap-2 mt-2">
								{#each HABITAT_TYPES as habitat}
									<button
										type="button"
										class="btn btn-sm {editingSpecies.commonLocations.includes(habitat)
											? 'btn-primary'
											: 'btn-outline'}"
										onclick={() => toggleLocation(habitat)}
									>
										{habitat}
									</button>
								{/each}
							</div>
						</div>

						<div class="form-control">
							<label class="form-control-label">
								<span class="form-control-label-text">鉴定要点</span>
							</label>
							{#if editingSpecies.identificationKeys.length > 0}
								<div class="space-y-2 mb-2">
									{#each editingSpecies.identificationKeys as key, index}
										<div class="flex items-center gap-2">
											<span class="badge badge-sm">{index + 1}</span>
											<span class="flex-1">{key}</span>
											<button
												type="button"
												class="btn btn-ghost btn-sm text-error"
												onclick={() => removeIdKey(index)}
											>
												<span class="material-icons">close</span>
											</button>
										</div>
									{/each}
								</div>
							{/if}
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={newIdKey}
									class="input flex-1"
									placeholder="添加鉴定要点..."
									onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addIdKey())}
								/>
								<button type="button" class="btn btn-outline" onclick={addIdKey}>
									<span class="material-icons">add</span>
								</button>
							</div>
						</div>

						<div class="flex gap-3 justify-end pt-4">
							<button type="button" class="btn btn-ghost" onclick={handleCancel}>
								取消
							</button>
							<button type="submit" class="btn btn-primary">
								保存
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-2xl font-bold text-surface-900-50-token">物种管理</h2>
			<div class="flex gap-4 mt-2">
				<span class="badge badge-success">可食用: {edibleCount}</span>
				<span class="badge badge-warning">有毒: {poisonousCount}</span>
				<span class="badge badge-error">高风险: {highRiskCount}</span>
			</div>
		</div>
		<button class="btn btn-primary" onclick={addSpecies} disabled={!canManage}>
			<span class="material-icons text-xl">add</span>
			新增物种
		</button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each $species as sp (sp.id)}
			<div
				class="card {sp.riskLevel === 'high'
					? 'border-2 border-error-500'
					: sp.isPoisonous
						? 'border-2 border-warning-500'
						: ''}"
			>
				<div class="card-header flex justify-between items-start">
					<div class="flex items-center gap-2">
						<span
							class="material-icons {sp.isPoisonous ? (sp.riskLevel === 'high' ? 'text-error-500' : 'text-warning-500') : 'text-success-500'}"
						>
							{sp.isPoisonous ? 'warning' : 'check_circle'}
						</span>
						<h3 class="card-title">{sp.name}</h3>
					</div>
					<div class="flex gap-1">
						<span class="badge {getRiskClass(sp.riskLevel)}">{getRiskLabel(sp.riskLevel)}</span>
					</div>
				</div>
				<div class="card-section space-y-3">
					{#if sp.description}
						<p class="text-surface-600-400-token">{sp.description}</p>
					{:else}
						<p class="text-surface-400 italic">暂无描述</p>
					{/if}

					{#if sp.seasonality.length > 0}
						<div>
							<p class="text-xs text-surface-500 mb-1">季节分布</p>
							<div class="flex flex-wrap gap-1">
								{#each sp.seasonality as s}
									<span class="badge badge-sm badge-outline">{s}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if sp.commonLocations.length > 0}
						<div>
							<p class="text-xs text-surface-500 mb-1">常见生境</p>
							<div class="flex flex-wrap gap-1">
								{#each sp.commonLocations as loc}
									<span class="badge badge-sm badge-outline">{loc}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if sp.identificationKeys.length > 0}
						<div>
							<p class="text-xs text-surface-500 mb-1">鉴定要点</p>
							<ul class="text-sm list-disc pl-4 space-y-1">
								{#each sp.identificationKeys.slice(0, 3) as key}
									<li>{key}</li>
								{/each}
								{#if sp.identificationKeys.length > 3}
									<li class="text-surface-500">+{sp.identificationKeys.length - 3} 更多</li>
								{/if}
							</ul>
						</div>
					{/if}
				</div>
				<div class="card-footer flex justify-end gap-2">
					{#if canManage}
						<button class="btn btn-ghost btn-sm" onclick={() => editSpecies(sp)}>
							<span class="material-icons">edit</span>
							编辑
						</button>
						<button class="btn btn-ghost btn-sm text-error" onclick={() => handleDeleteSpecies(sp.id)}>
							<span class="material-icons">delete</span>
							删除
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
