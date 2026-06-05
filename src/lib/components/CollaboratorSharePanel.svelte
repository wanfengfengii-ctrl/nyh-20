<script lang="ts">
	import { createShareRecord, addCollaborator, shareRecords, warningHistory } from '$lib/stores';
	import type { ShareRecord, Collaborator } from '$lib/types';

	let { reportId } = $props<{ reportId?: string }>();

	let showShareDialog = $state(false);
	let expireDays = $state(7);
	let allowDownload = $state(true);
	let allowComments = $state(true);
	let newCollaboratorName = $state('');
	let newCollaboratorEmail = $state('');
	let newCollaboratorRole = $state<'viewer' | 'editor' | 'reviewer'>('viewer');
	let selectedRecordId = $state<string | null>(null);

	function getRoleLabel(role: string) {
		const labels: Record<string, string> = {
			viewer: '查看者',
			editor: '编辑者',
			reviewer: '审核者'
		};
		return labels[role] || role;
	}

	function getRoleIcon(role: string) {
		const icons: Record<string, string> = {
			viewer: 'visibility',
			editor: 'edit',
			reviewer: 'rate_review'
		};
		return icons[role] || 'person';
	}

	function handleCreateShare() {
		if (!reportId) return;
		const record = createShareRecord(reportId, {
			expireDays,
			allowDownload,
			allowComments
		});
		selectedRecordId = record.id;
	}

	function handleAddCollaborator() {
		if (!selectedRecordId || !newCollaboratorName) return;

		addCollaborator(selectedRecordId, {
			username: newCollaboratorName,
			email: newCollaboratorEmail || undefined,
			role: newCollaboratorRole,
			sharedBy: 'current-user',
			canExport: newCollaboratorRole !== 'viewer',
			canComment: allowComments
		});

		newCollaboratorName = '';
		newCollaboratorEmail = '';
	}

	function copyShareLink(token: string) {
		const link = `${window.location.origin}/share/${token}`;
		navigator.clipboard.writeText(link).then(() => {
			alert('分享链接已复制到剪贴板');
		});
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('zh-CN');
	}

	const currentRecord = $derived(
		selectedRecordId ? $shareRecords.find((r) => r.id === selectedRecordId) : null
	);
</script>

<div class="card">
	<div class="card-header">
		<div class="flex items-center gap-2">
			<span class="material-icons text-primary-500">group</span>
			<h3 class="card-title">协作者分享</h3>
		</div>
	</div>
	<div class="card-section">
		{#if $shareRecords.length === 0}
			<div class="text-center py-8">
				<span class="material-icons text-5xl text-surface-300 mb-4">share</span>
				<p class="text-surface-500">暂无分享记录</p>
				<p class="text-sm text-surface-400 mt-2">创建分享链接并邀请协作者查看</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each $shareRecords as record}
					<div
						class="border rounded-lg p-4 cursor-pointer transition-all {selectedRecordId === record.id
							? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
							: 'hover:border-primary-300'}"
						onclick={() => (selectedRecordId = record.id)}
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">分享链接 #{record.id.slice(0, 8)}</p>
								<p class="text-sm text-surface-500">
									创建于 {formatDate(record.createdAt)}
									{#if record.expiresAt}
										· 有效期至 {formatDate(record.expiresAt)}
									{:else}
										· 永久有效
									{/if}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="badge badge-sm badge-outline">
									{record.collaborators.length} 位协作者
								</span>
								<button
									class="btn btn-ghost btn-sm"
									onclick={(e) => {
										e.stopPropagation();
										copyShareLink(record.token);
									}}
									title="复制链接"
								>
									<span class="material-icons">content_copy</span>
								</button>
							</div>
						</div>

						{#if selectedRecordId === record.id && record.collaborators.length > 0}
							<div class="mt-4 pt-4 border-t">
								<h4 class="text-sm font-medium mb-3">协作者列表</h4>
								<div class="space-y-2">
									{#each record.collaborators as collaborator}
										<div class="flex items-center justify-between p-2 rounded bg-surface-50 dark:bg-surface-800/50">
											<div class="flex items-center gap-3">
												<div
													class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
												>
													<span class="material-icons text-sm text-primary-600">
														{getRoleIcon(collaborator.role)}
													</span>
												</div>
												<div>
													<p class="font-medium text-sm">{collaborator.username}</p>
													<p class="text-xs text-surface-500">
														{collaborator.email || '无邮箱'}
													</p>
												</div>
											</div>
											<div class="flex items-center gap-2">
												<span class="badge badge-sm badge-outline">
													{getRoleLabel(collaborator.role)}
												</span>
												{#if collaborator.canExport}
													<span class="material-icons text-sm text-success-500" title="可导出">
														download
													</span>
												{/if}
												{#if collaborator.canComment}
													<span class="material-icons text-sm text-primary-500" title="可评论">
														comment
													</span>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if reportId}
		<div class="card-footer">
			<button class="btn btn-primary w-full" onclick={() => (showShareDialog = true)}>
				<span class="material-icons">add_link</span>
				创建分享链接
			</button>
		</div>
	{/if}
</div>

{#if showShareDialog}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6">
				<h3 class="text-lg font-bold mb-6 flex items-center gap-2">
					<span class="material-icons text-primary-500">share</span>
					创建分享链接
				</h3>

				<div class="space-y-4">
					<div class="form-control">
						<label class="form-control-label">
							<span class="form-control-label-text">有效期</span>
						</label>
						<select bind:value={expireDays} class="select">
							<option value={1}>1 天</option>
							<option value={7}>7 天</option>
							<option value={14}>14 天</option>
							<option value={30}>30 天</option>
							<option value={0}>永久有效</option>
						</select>
					</div>

					<div class="form-control">
						<label class="form-control-label">
							<span class="form-control-label-text">权限设置</span>
						</label>
						<div class="space-y-2">
							<label class="flex items-center gap-2 cursor-pointer">
								<input type="checkbox" class="checkbox" bind:checked={allowDownload} />
								<span class="text-sm">允许下载报告</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input type="checkbox" class="checkbox" bind:checked={allowComments} />
								<span class="text-sm">允许添加评论</span>
							</label>
						</div>
					</div>

					<div class="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
						<h4 class="font-medium mb-3 flex items-center gap-2">
							<span class="material-icons text-sm">person_add</span>
							添加协作者（可选）
						</h4>
						<div class="space-y-3">
							<div class="grid grid-cols-2 gap-3">
								<div class="form-control">
									<label class="form-control-label">
										<span class="form-control-label-text">姓名</span>
									</label>
									<input
										type="text"
										bind:value={newCollaboratorName}
										class="input"
										placeholder="输入姓名"
									/>
								</div>
								<div class="form-control">
									<label class="form-control-label">
										<span class="form-control-label-text">角色</span>
									</label>
									<select bind:value={newCollaboratorRole} class="select">
										<option value="viewer">查看者</option>
										<option value="editor">编辑者</option>
										<option value="reviewer">审核者</option>
									</select>
								</div>
							</div>
							<div class="form-control">
								<label class="form-control-label">
									<span class="form-control-label-text">邮箱（可选）</span>
								</label>
								<input
									type="email"
									bind:value={newCollaboratorEmail}
									class="input"
									placeholder="输入邮箱地址"
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-3 justify-end mt-6">
					<button class="btn btn-ghost" onclick={() => (showShareDialog = false)}>
						取消
					</button>
					<button
						class="btn btn-primary"
						onclick={() => {
							handleCreateShare();
							showShareDialog = false;
						}}
					>
						创建分享
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}