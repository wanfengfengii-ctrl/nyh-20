import { n as onDestroy } from "../../../chunks/index-server.js";
import { V as escape_html, l as unsubscribe_stores, r as derived, s as store_get } from "../../../chunks/dev.js";
import { i as species, r as samples } from "../../../chunks/stores.js";
import "../../../chunks/types.js";
import { Chart, registerables } from "chart.js";
//#region src/routes/statistics/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		Chart.register(...registerables);
		let totalSamples = derived(() => store_get($$store_subs ??= {}, "$samples", samples).length);
		let withSporePrint = derived(() => store_get($$store_subs ??= {}, "$samples", samples).filter((s) => s.hasSporePrint).length);
		let identified = derived(() => store_get($$store_subs ??= {}, "$samples", samples).filter((s) => s.identificationStatus === "identified").length);
		let abnormal = derived(() => store_get($$store_subs ??= {}, "$samples", samples).filter((s) => s.isAbnormal).length);
		let poisonousCount = derived(() => store_get($$store_subs ??= {}, "$samples", samples).filter((s) => store_get($$store_subs ??= {}, "$species", species).some((sp) => sp.isPoisonous && sp.name === s.suspectedSpecies)).length);
		let uniqueLocations = derived(() => new Set(store_get($$store_subs ??= {}, "$samples", samples).map((s) => s.location)).size);
		onDestroy(() => {});
		$$renderer.push(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-surface-900-50-token">统计视图</h2> <p class="text-surface-500">查看真菌样本的统计数据和趋势</p></div> <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"><div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-primary-600">${escape_html(totalSamples())}</p> <p class="text-surface-500 text-sm">总样本数</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-success-600">${escape_html(withSporePrint())}</p> <p class="text-surface-500 text-sm">有孢子印</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-success-600">${escape_html(identified())}</p> <p class="text-surface-500 text-sm">已鉴定</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-error-600">${escape_html(abnormal())}</p> <p class="text-surface-500 text-sm">异常样本</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-warning-600">${escape_html(poisonousCount())}</p> <p class="text-surface-500 text-sm">疑似有毒</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-info-600">${escape_html(uniqueLocations())}</p> <p class="text-surface-500 text-sm">采集地点</p></div></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="card"><div class="card-header"><h3 class="card-title">生境分布</h3></div> <div class="card-section">`);
		if (totalSamples() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">孢子印颜色分布</h3></div> <div class="card-section">`);
		if (withSporePrint() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无孢子印数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">鉴定状态分布</h3></div> <div class="card-section">`);
		if (totalSamples() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">月度采集趋势</h3></div> <div class="card-section">`);
		if (totalSamples() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
