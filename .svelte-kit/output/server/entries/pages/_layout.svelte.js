import "../../chunks/index-server.js";
import { H as attr, W as escape_html, a as ensure_array_like, c as store_get, i as derived, n as attr_class, o as head, rt as getContext, u as unsubscribe_stores } from "../../chunks/dev.js";
import "../../chunks/client.js";
import { d as users, n as currentUser, u as syncInfo } from "../../chunks/stores.js";
import { c as USER_ROLES } from "../../chunks/types.js";
//#region src/lib/assets/favicon.svg
var favicon_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='107'%20height='128'%20viewBox='0%200%20107%20128'%3e%3ctitle%3esvelte-logo%3c/title%3e%3cpath%20d='M94.157%2022.819c-10.4-14.885-30.94-19.297-45.792-9.835L22.282%2029.608A29.92%2029.92%200%200%200%208.764%2049.65a31.5%2031.5%200%200%200%203.108%2020.231%2030%2030%200%200%200-4.477%2011.183%2031.9%2031.9%200%200%200%205.448%2024.116c10.402%2014.887%2030.942%2019.297%2045.791%209.835l26.083-16.624A29.92%2029.92%200%200%200%2098.235%2078.35a31.53%2031.53%200%200%200-3.105-20.232%2030%2030%200%200%200%204.474-11.182%2031.88%2031.88%200%200%200-5.447-24.116'%20style='fill:%23ff3e00'/%3e%3cpath%20d='M45.817%20106.582a20.72%2020.72%200%200%201-22.237-8.243%2019.17%2019.17%200%200%201-3.277-14.503%2018%2018%200%200%201%20.624-2.435l.49-1.498%201.337.981a33.6%2033.6%200%200%200%2010.203%205.098l.97.294-.09.968a5.85%205.85%200%200%200%201.052%203.878%206.24%206.24%200%200%200%206.695%202.485%205.8%205.8%200%200%200%201.603-.704L69.27%2076.28a5.43%205.43%200%200%200%202.45-3.631%205.8%205.8%200%200%200-.987-4.371%206.24%206.24%200%200%200-6.698-2.487%205.7%205.7%200%200%200-1.6.704l-9.953%206.345a19%2019%200%200%201-5.296%202.326%2020.72%2020.72%200%200%201-22.237-8.243%2019.17%2019.17%200%200%201-3.277-14.502%2017.99%2017.99%200%200%201%208.13-12.052l26.081-16.623a19%2019%200%200%201%205.3-2.329%2020.72%2020.72%200%200%201%2022.237%208.243%2019.17%2019.17%200%200%201%203.277%2014.503%2018%2018%200%200%201-.624%202.435l-.49%201.498-1.337-.98a33.6%2033.6%200%200%200-10.203-5.1l-.97-.294.09-.968a5.86%205.86%200%200%200-1.052-3.878%206.24%206.24%200%200%200-6.696-2.485%205.8%205.8%200%200%200-1.602.704L37.73%2051.72a5.42%205.42%200%200%200-2.449%203.63%205.79%205.79%200%200%200%20.986%204.372%206.24%206.24%200%200%200%206.698%202.486%205.8%205.8%200%200%200%201.602-.704l9.952-6.342a19%2019%200%200%201%205.295-2.328%2020.72%2020.72%200%200%201%2022.237%208.242%2019.17%2019.17%200%200%201%203.277%2014.503%2018%2018%200%200%201-8.13%2012.053l-26.081%2016.622a19%2019%200%200%201-5.3%202.328'%20style='fill:%23fff'/%3e%3c/svg%3e";
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/app/stores.js
/**
* A function that returns all of the contextual stores. On the server, this must be called during component initialization.
* Only use this if you need to defer store subscription until after the component has mounted, for some reason.
*
* @deprecated Use `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
*/
var getStores = () => {
	const stores$1 = getContext("__svelte__");
	return {
		/** @type {typeof page} */
		page: { subscribe: stores$1.page.subscribe },
		/** @type {typeof navigating} */
		navigating: { subscribe: stores$1.navigating.subscribe },
		/** @type {typeof updated} */
		updated: stores$1.updated
	};
};
/**
* A readable store whose value contains page data.
*
* On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.
*
* @deprecated Use `page` from `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
* @type {import('svelte/store').Readable<import('@sveltejs/kit').Page>}
*/
var page = { subscribe(fn) {
	return getStores().page.subscribe(fn);
} };
//#endregion
//#region src/lib/components/UserSelector.svelte
function UserSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		derived(() => store_get($$store_subs ??= {}, "$users", users));
		function getRoleLabel(role) {
			return USER_ROLES.find((r) => r.value === role)?.label || role;
		}
		$$renderer.push(`<div class="relative"><button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-200-700-token transition-colors"><span class="material-icons">account_circle</span> <span class="hidden md:inline">${escape_html(store_get($$store_subs ??= {}, "$currentUser", currentUser)?.username || "访客")}</span> <span class="badge badge-sm badge-outline">${escape_html(getRoleLabel(store_get($$store_subs ??= {}, "$currentUser", currentUser)?.role || "guest"))}</span></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const navItems = [
			{
				path: "/",
				label: "样本列表",
				icon: "list"
			},
			{
				path: "/map",
				label: "地图分布",
				icon: "map"
			},
			{
				path: "/species",
				label: "物种管理",
				icon: "category"
			},
			{
				path: "/statistics",
				label: "统计视图",
				icon: "bar_chart"
			},
			{
				path: "/export",
				label: "导出分享",
				icon: "ios_share"
			}
		];
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>野生菌观察平台</title>`);
			});
			$$renderer.push(`<link rel="icon"${attr("href", favicon_default)}/> <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>`);
		});
		$$renderer.push(`<div class="min-h-screen bg-surface-50-900-token"><header class="bg-primary-500-900-token text-white shadow-lg"><div class="container mx-auto px-4 py-4"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><span class="material-icons text-3xl">nature</span> <div><h1 class="text-2xl font-bold">野生菌观察平台</h1> <p class="text-sm text-white/80">Fungi Observation Platform</p></div></div> <div class="flex items-center gap-4"><button class="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors" title="同步数据"><span class="material-icons">sync</span> <span class="text-sm">v${escape_html(store_get($$store_subs ??= {}, "$syncInfo", syncInfo).version)}</span></button> `);
		UserSelector($$renderer, {});
		$$renderer.push(`<!----></div></div></div></header> <nav class="bg-surface-100-800-token shadow"><div class="container mx-auto px-4"><div class="flex gap-1 py-2 overflow-x-auto"><!--[-->`);
		const each_array = ensure_array_like(navItems);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<a${attr("href", item.path)}${attr_class(`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${store_get($$store_subs ??= {}, "$page", page).url.pathname === item.path ? "bg-primary-500 text-white" : "hover:bg-surface-200-700-token text-surface-700-200-token"}`)}><span class="material-icons text-xl">${escape_html(item.icon)}</span> <span>${escape_html(item.label)}</span></a>`);
		}
		$$renderer.push(`<!--]--></div></div></nav> <main class="container mx-auto px-4 py-6">`);
		children($$renderer);
		$$renderer.push(`<!----></main> <footer class="bg-surface-100-800-token border-t border-surface-200-700-token mt-12"><div class="container mx-auto px-4 py-6"><div class="flex flex-col md:flex-row justify-between items-center gap-4"><div class="flex items-center gap-2"><span class="material-icons text-primary-500">nature</span> <span class="font-medium">野生菌观察平台</span></div> <div class="text-sm text-surface-500"><span>最后同步: ${escape_html(new Date(store_get($$store_subs ??= {}, "$syncInfo", syncInfo).lastSyncAt).toLocaleString())}</span> <span class="mx-2">|</span> <span>设备ID: ${escape_html(store_get($$store_subs ??= {}, "$syncInfo", syncInfo).deviceId.slice(0, 8))}</span></div> <div class="text-sm text-surface-500">当前用户: ${escape_html(store_get($$store_subs ??= {}, "$currentUser", currentUser)?.username || "访客")}</div></div></div></footer></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _layout as default };
