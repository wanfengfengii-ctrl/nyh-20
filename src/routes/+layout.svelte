<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { children } = $props();

	const navItems = [
		{ path: '/', label: '样本列表', icon: 'list' },
		{ path: '/species', label: '物种管理', icon: 'category' },
		{ path: '/statistics', label: '统计视图', icon: 'bar_chart' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		href="https://fonts.googleapis.com/icon?family=Material+Icons"
		rel="stylesheet"
	/>
	<title>真菌观察记录</title>
</svelte:head>

<div class="min-h-screen bg-surface-50-900-token">
	<header class="bg-primary-500-900-token text-white shadow-lg">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<span class="material-icons text-3xl">nature</span>
					<h1 class="text-2xl font-bold">真菌观察记录</h1>
				</div>
			</div>
		</div>
	</header>

	<nav class="bg-surface-100-800-token shadow">
		<div class="container mx-auto px-4">
			<div class="flex gap-1 py-2">
				{#each navItems as item}
					<a
						href={item.path}
						class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors {
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
</div>
