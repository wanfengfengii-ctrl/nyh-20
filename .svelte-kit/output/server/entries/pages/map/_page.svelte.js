import { W as escape_html, a as ensure_array_like, c as store_get, i as derived, l as stringify, n as attr_class, r as attr_style, u as unsubscribe_stores } from "../../../chunks/dev.js";
import { c as samples, l as species } from "../../../chunks/stores.js";
//#region src/routes/map/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let samplesWithLocation = derived(() => store_get($$store_subs ??= {}, "$samples", samples).filter((s) => s.latitude !== null && s.longitude !== null));
		derived(() => store_get($$store_subs ??= {}, "$species", species));
		function getRiskColor(riskLevel) {
			switch (riskLevel) {
				case "high": return "bg-error-500";
				case "medium": return "bg-warning-500";
				default: return "bg-success-500";
			}
		}
		function latLngToPosition(lat, lng, width, height) {
			const minLat = 18;
			const maxLat = 54;
			const minLng = 73;
			const x = (lng - minLng) / (135 - minLng) * width;
			const y = (maxLat - lat) / (maxLat - minLat) * height;
			return {
				x: Math.max(0, Math.min(width, x)),
				y: Math.max(0, Math.min(height, y))
			};
		}
		let mapWidth = 800;
		let mapHeight = 500;
		$$renderer.push(`<div class="space-y-6"><div class="flex justify-between items-center"><div><h2 class="text-2xl font-bold text-surface-900-50-token">地图分布</h2> <p class="text-surface-500">查看样本的地理位置分布</p></div> <div class="flex gap-2"><span class="badge badge-success">低风险</span> <span class="badge badge-warning">中风险</span> <span class="badge badge-error">高风险</span></div></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2"><div class="card"><div class="card-header"><h3 class="card-title">样本分布地图</h3></div> <div class="card-section"><div class="relative w-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden" style="height: 500px;"><div class="absolute inset-0 opacity-20"><svg class="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" stroke-width="0.5"></path></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"></rect></svg></div> <!--[-->`);
		const each_array = ensure_array_like(samplesWithLocation());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let sample = each_array[$$index];
			const pos = latLngToPosition(sample.latitude, sample.longitude, mapWidth, mapHeight);
			$$renderer.push(`<button class="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"${attr_style(`left: ${stringify(pos.x)}px; top: ${stringify(pos.y)}px;`)}><div${attr_class(`w-6 h-6 rounded-full ${stringify(getRiskColor(sample.riskLevel))} border-2 border-white shadow-lg hover:scale-150 transition-transform cursor-pointer flex items-center justify-center`)}><span class="text-white text-xs font-bold">${escape_html(sample.sampleNumber.slice(-2))}</span></div> <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-surface-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${escape_html(sample.sampleNumber)} - ${escape_html(sample.location)}</div></button>`);
		}
		$$renderer.push(`<!--]--> `);
		if (samplesWithLocation().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="absolute inset-0 flex items-center justify-center"><div class="text-center"><span class="material-icons text-6xl text-surface-300 mb-4">map</span> <p class="text-surface-500">暂无带有地理位置的样本</p> <p class="text-sm text-surface-400">添加样本时填写经纬度即可在地图上显示</p></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="mt-4 flex items-center justify-between text-sm text-surface-500"><span>共 ${escape_html(samplesWithLocation().length)} 个样本带有地理位置信息</span> <span>纬度: 18°-54°N | 经度: 73°-135°E</span></div></div></div></div> <div class="space-y-6"><div class="card"><div class="card-header"><h3 class="card-title">${escape_html("选择样本")}</h3></div> <div class="card-section">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<div class="text-center py-8"><span class="material-icons text-4xl text-surface-300 mb-2">touch_app</span> <p class="text-surface-500">点击地图上的标记查看样本详情</p></div>`);
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">地理位置列表</h3></div> <div class="card-section max-h-64 overflow-y-auto">`);
		if (samplesWithLocation().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array_2 = ensure_array_like(samplesWithLocation());
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let sample = each_array_2[$$index_2];
				$$renderer.push(`<button${attr_class(`w-full text-left p-2 rounded hover:bg-surface-100-800-token transition-colors ${void 0 === sample.id ? "bg-primary-100" : ""}`)}><div class="flex items-center gap-2"><div${attr_class(`w-3 h-3 rounded-full ${stringify(getRiskColor(sample.riskLevel))}`)}></div> <span class="font-mono text-sm">${escape_html(sample.sampleNumber)}</span></div> <p class="text-sm text-surface-500 ml-5">${escape_html(sample.location)}</p></button>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-500 py-4">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
