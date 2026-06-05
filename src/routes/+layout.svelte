<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { initData, syncData, syncInfo, currentUser } from '$lib/stores';
	import UserSelector from '$lib/components/UserSelector.svelte';

	let { children } = $props();

	const navItems = [
		{ path: '/', label: '样本列表', icon: 'list' },
		{ path: '/map', label: '地图分布', icon: 'map' },
		{ path: '/species', label: '物种管理', icon: 'category' },
		{ path: '/warning', label: '安全预警', icon: 'security' },
		{ path: '/statistics', label: '统计视图', icon: 'bar_chart' },
		{ path: '/export', label: '导出分享', icon: 'ios_share' }
	];

	onMount(async () => {
		await initData();
	});

	async function handleSync() {
		await syncData();
		alert('数据同步成功！');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		href="https://fonts.googleapis.com/icon?family=Material+Icons"
		rel="stylesheet"
	/>
	<title>野生菌观察平台</title>
</svelte:head>

<div class="min-h-screen bg-surface-50-900-token">
	<header class="bg-primary-500-900-token text-white shadow-lg">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<span class="material-icons text-3xl">nature</span>
					<div>
						<h1 class="text-2xl font-bold">野生菌观察平台</h1>
						<p class="text-sm text-white/80">Fungi Observation Platform</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<button
						class="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
						onclick={handleSync}
						title="同步数据"
					>
						<span class="material-icons">sync</span>
						<span class="text-sm">v{$syncInfo.version}</span>
					</button>
					<UserSelector />
				</div>
			</div>
		</div>
	</header>

	<nav class="bg-surface-100-800-token shadow">
		<div class="container mx-auto px-4">
			<div class="flex gap-1 py-2 overflow-x-auto">
				{#each navItems as item}
					<a
						href={item.path}
						class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap {
							$page.url.pathname === item.path
								? 'bg-primary-500 text-white'
								: 'hover:bg-surface-200-700-token text-surface-700-200-token'
						}"
					>
						<span class="material-icons text-xl">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</nav>

	<main class="container mx-auto px-4 py-6">
		{@render children()}
	</main>

	<footer class="bg-surface-100-800-token border-t border-surface-200-700-token mt-12">
		<div class="container mx-auto px-4 py-6">
			<div class="flex flex-col md:flex-row justify-between items-center gap-4">
				<div class="flex items-center gap-2">
					<span class="material-icons text-primary-500">nature</span>
					<span class="font-medium">野生菌观察平台</span>
				</div>
				<div class="text-sm text-surface-500">
					<span>最后同步: {new Date($syncInfo.lastSyncAt).toLocaleString()}</span>
					<span class="mx-2">|</span>
					<span>设备ID: {$syncInfo.deviceId.slice(0, 8)}</span>
				</div>
				<div class="text-sm text-surface-500">
					当前用户: {$currentUser?.username || '访客'}
				</div>
			</div>
		</div>
	</footer>
</div>
