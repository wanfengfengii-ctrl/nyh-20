<script lang="ts">
	import { species, generateId } from '$lib/stores';
	import type { Species } from '$lib/types';

	let showForm = $state(false);
	let editingSpecies: Species | null = $state(null);
	let formErrors: string[] = $state([]);

	let poisonousCount = $derived($species.filter((s) => s.isPoisonous).length);
	let edibleCount = $derived($species.filter((s) => !s.isPoisonous).length);

	function addSpecies() {
		editingSpecies = {
			id: '',
			name: '',
			isPoisonous: false,
			description: ''
		};
		formErrors = [];
		showForm = true;
	}

	function editSpecies(sp: Species) {
		editingSpecies = { ...sp };
		formErrors = [];
		showForm = true;
	}

	function deleteSpecies(id: string) {
		if (confirm('确定要删除这个物种吗？')) {
			species.update((s) => s.filter((sp) => sp.id !== id));
		}
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

		if (editingSpecies.id) {
			const updatedSpecies = editingSpecies;
			species.update((s) =>
				s.map((sp) => (sp.id === updatedSpecies.id ? updatedSpecies : sp))
			);
		} else {
			const newSpecies: Species = {
				id: generateId(),
				name: editingSpecies.name,
				isPoisonous: editingSpecies.isPoisonous,
				description: editingSpecies.description
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
</script>

{#if showForm && editingSpecies}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-lg w-full">
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
				<span class="badge badge-error">有毒: {poisonousCount}</span>
			</div>
		</div>
		<button class="btn btn-primary" onclick={addSpecies}>
			<span class="material-icons text-xl">add</span>
			新增物种
		</button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each $species as sp (sp.id)}
			<div class="card {sp.isPoisonous ? 'border-2 border-error-500' : ''}">
				<div class="card-header flex justify-between items-start">
					<div class="flex items-center gap-2">
						<span class="material-icons {sp.isPoisonous ? 'text-error-500' : 'text-success-500'}">
							{sp.isPoisonous ? 'warning' : 'check_circle'}
						</span>
						<h3 class="card-title">{sp.name}</h3>
					</div>
					{#if sp.isPoisonous}
						<span class="badge badge-error">有毒</span>
					{/if}
				</div>
				<div class="card-section">
					{#if sp.description}
						<p class="text-surface-600-400-token">{sp.description}</p>
					{:else}
						<p class="text-surface-400 italic">暂无描述</p>
					{/if}
				</div>
				<div class="card-footer flex justify-end gap-2">
					<button class="btn btn-ghost btn-sm" onclick={() => editSpecies(sp)}>
						<span class="material-icons">edit</span>
						编辑
					</button>
					<button class="btn btn-ghost btn-sm text-error" onclick={() => deleteSpecies(sp.id)}>
						<span class="material-icons">delete</span>
						删除
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
