<script lang="ts">
	import { currentUser, users, hasPermission, generateId, deleteUser } from '$lib/stores';
	import { USER_ROLES } from '$lib/types';
	import type { User, UserRole } from '$lib/types';

	let showUserMenu = $state(false);
	let showUserManager = $state(false);
	let showAddUser = $state(false);
	let newUsername = $state('');
	let newRole: UserRole = $state('user');

	let userList = $derived($users);

	function switchUser(user: User) {
		currentUser.set(user);
		showUserMenu = false;
	}

	function addUser() {
		if (!newUsername.trim()) return;

		const newUser: User = {
			id: generateId(),
			username: newUsername.trim(),
			role: newRole,
			createdAt: new Date().toISOString(),
			lastLoginAt: new Date().toISOString()
		};

		users.update((u) => [...u, newUser]);
		newUsername = '';
		newRole = 'user';
		showAddUser = false;
	}

	function updateRole(userId: string, role: UserRole) {
		users.update((u) =>
			u.map((user) => (user.id === userId ? { ...user, role } : user))
		);
	}

	function getRoleLabel(role: string): string {
		const found = USER_ROLES.find((r) => r.value === role);
		return found?.label || role;
	}
</script>

<div class="relative">
	<button
		class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors"
		onclick={() => (showUserMenu = !showUserMenu)}
	>
		<span class="material-icons">account_circle</span>
		<span class="hidden md:inline">{$currentUser?.username || '访客'}</span>
		<span class="badge badge-sm badge-outline">
			{getRoleLabel($currentUser?.role || 'guest')}
		</span>
	</button>

	{#if showUserMenu}
		<div class="absolute right-0 mt-2 w-64 bg-surface-50-900-token rounded-lg shadow-xl border border-surface-200-700-token z-50">
			<div class="p-3 border-b border-surface-200-700-token">
				<p class="font-medium">{$currentUser?.username}</p>
				<p class="text-sm text-surface-500">角色: {getRoleLabel($currentUser?.role || 'guest')}</p>
			</div>

			<div class="p-2">
				<p class="text-xs text-surface-500 px-2 py-1">切换用户</p>
				{#each userList as user}
					<button
						class="w-full text-left px-3 py-2 rounded hover:bg-surface-100-800-token {
							$currentUser?.id === user.id ? 'bg-primary-100 text-primary-700' : ''
						}"
						onclick={() => switchUser(user)}
					>
						{user.username}
						<span class="text-xs text-surface-500 ml-2">({getRoleLabel(user.role)})</span>
					</button>
				{/each}
			</div>

			{#if hasPermission($currentUser, 'manage_users')}
				<div class="p-2 border-t border-surface-200-700-token">
					<button
						class="w-full text-left px-3 py-2 rounded hover:bg-surface-100-800-token text-primary-600"
						onclick={() => {
							showUserManager = true;
							showUserMenu = false;
						}}
					>
						<span class="material-icons text-sm align-middle mr-1">manage_accounts</span>
						用户管理
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if showUserManager}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
			<div class="card">
				<div class="card-header flex justify-between items-center">
					<h2 class="card-title">用户管理</h2>
					<button class="btn btn-ghost btn-sm" onclick={() => (showUserManager = false)}>
						<span class="material-icons">close</span>
					</button>
				</div>
				<div class="card-section">
					<div class="flex justify-end mb-4">
						<button class="btn btn-primary btn-sm" onclick={() => (showAddUser = true)}>
							<span class="material-icons">add</span>
							添加用户
						</button>
					</div>

					<table class="table table-hover">
						<thead>
							<tr>
								<th>用户名</th>
								<th>角色</th>
								<th>创建时间</th>
								<th>操作</th>
							</tr>
						</thead>
						<tbody>
							{#each userList as user}
								<tr>
									<td class="font-medium">{user.username}</td>
									<td>
										<select
											class="select select-sm"
											value={user.role}
											onchange={(e) =>
												updateRole(user.id, (e.target as HTMLSelectElement).value as UserRole)}
											disabled={user.id === 'system' || user.id === 'guest'}
										>
											{#each USER_ROLES as role}
												<option value={role.value}>{role.label}</option>
											{/each}
										</select>
									</td>
									<td class="text-sm text-surface-500">
										{new Date(user.createdAt).toLocaleDateString()}
									</td>
									<td>
										{#if user.id !== 'system' && user.id !== 'guest'}
											<button
												class="btn btn-ghost btn-sm text-error"
												onclick={async () => {
													if (confirm('确定删除此用户？')) {
														await deleteUser(user.id);
													}
												}}
											>
												<span class="material-icons">delete</span>
											</button>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if showAddUser}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
		<div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-md w-full">
			<div class="card">
				<div class="card-header">
					<h2 class="card-title">添加用户</h2>
				</div>
				<div class="card-section">
					<div class="space-y-4">
						<div class="form-control">
							<label class="form-control-label">
								<span class="form-control-label-text">用户名</span>
							</label>
							<input
								type="text"
								bind:value={newUsername}
								class="input"
								placeholder="输入用户名"
							/>
						</div>
						<div class="form-control">
							<label class="form-control-label">
								<span class="form-control-label-text">角色</span>
							</label>
							<select bind:value={newRole} class="select">
								{#each USER_ROLES as role}
									<option value={role.value}>{role.label}</option>
								{/each}
							</select>
						</div>
						<div class="flex gap-3 justify-end pt-4">
							<button class="btn btn-ghost" onclick={() => (showAddUser = false)}>取消</button>
							<button class="btn btn-primary" onclick={addUser}>添加</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
