import { n as onDestroy } from "../../../chunks/index-server.js";
import { W as escape_html, a as ensure_array_like, c as store_get, i as derived, l as stringify, n as attr_class, r as attr_style, u as unsubscribe_stores } from "../../../chunks/dev.js";
import { a as getSeason, c as samples, l as species } from "../../../chunks/stores.js";
import { o as SEASONS } from "../../../chunks/types.js";
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
		let highRiskCount = derived(() => store_get($$store_subs ??= {}, "$samples", samples).filter((s) => s.riskLevel === "high").length);
		let topLocations = derived(() => (() => {
			const counts = {};
			store_get($$store_subs ??= {}, "$samples", samples).forEach((s) => {
				counts[s.location] = (counts[s.location] || 0) + 1;
			});
			return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
		})());
		let seasonStats = derived(() => (() => {
			const counts = {
				春季: 0,
				夏季: 0,
				秋季: 0,
				冬季: 0
			};
			store_get($$store_subs ??= {}, "$samples", samples).forEach((s) => {
				const season = getSeason(s.collectionDate);
				counts[season]++;
			});
			return counts;
		})());
		onDestroy(() => {});
		$$renderer.push(`<div class="space-y-6"><div><h2 class="text-2xl font-bold text-surface-900-50-token">统计视图</h2> <p class="text-surface-500">查看真菌样本的统计数据和趋势分析</p></div> <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"><div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-primary-600">${escape_html(totalSamples())}</p> <p class="text-surface-500 text-sm">总样本数</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-success-600">${escape_html(withSporePrint())}</p> <p class="text-surface-500 text-sm">有孢子印</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-success-600">${escape_html(identified())}</p> <p class="text-surface-500 text-sm">已鉴定</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-error-600">${escape_html(abnormal())}</p> <p class="text-surface-500 text-sm">异常样本</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-warning-600">${escape_html(highRiskCount())}</p> <p class="text-surface-500 text-sm">高风险</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-warning-600">${escape_html(poisonousCount())}</p> <p class="text-surface-500 text-sm">疑似有毒</p></div></div> <div class="card"><div class="card-section text-center"><p class="text-3xl font-bold text-info-600">${escape_html(uniqueLocations())}</p> <p class="text-surface-500 text-sm">采集地点</p></div></div></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div class="card"><div class="card-header"><h3 class="card-title">季节分布热度</h3></div> <div class="card-section">`);
		if (totalSamples() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">地点热度排行</h3></div> <div class="card-section">`);
		if (topLocations().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">风险等级分布</h3></div> <div class="card-section">`);
		if (totalSamples() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">生境分布</h3></div> <div class="card-section">`);
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
		$$renderer.push(`<!--]--></div></div></div> <div class="card"><div class="card-header"><h3 class="card-title">月度采集趋势</h3></div> <div class="card-section">`);
		if (totalSamples() > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<canvas></canvas>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="card"><div class="card-header"><h3 class="card-title">热门采集地点</h3></div> <div class="card-section">`);
		if (topLocations().length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="space-y-3"><!--[-->`);
			const each_array = ensure_array_like(topLocations());
			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let [location, count] = each_array[index];
				$$renderer.push(`<div class="flex items-center gap-3"><span${attr_class(`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index < 3 ? "bg-warning-500" : "bg-surface-300"}`)}>${escape_html(index + 1)}</span> <div class="flex-1"><div class="flex justify-between items-center mb-1"><span class="font-medium">${escape_html(location)}</span> <span class="text-sm text-surface-500">${escape_html(count)} 个样本</span></div> <div class="w-full bg-surface-200 rounded-full h-2"><div class="bg-primary-500 h-2 rounded-full transition-all"${attr_style(`width: ${stringify(count / Math.max(...topLocations().map(([, c]) => c)) * 100)}%;`)}></div></div></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="text-center text-surface-400 py-8">暂无数据</p>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">季节统计详情</h3></div> <div class="card-section"><div class="grid grid-cols-2 gap-4"><!--[-->`);
		const each_array_1 = ensure_array_like(SEASONS);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let season = each_array_1[$$index_1];
			$$renderer.push(`<div class="p-4 rounded-lg bg-surface-100-800-token"><div class="flex items-center justify-between mb-2"><span class="font-medium">${escape_html(season)}</span> <span class="material-icons">${escape_html(season === "春季" ? "eco" : season === "夏季" ? "sunny" : season === "秋季" ? "park" : "ac_unit")}</span></div> <p class="text-2xl font-bold">${escape_html(seasonStats()[season])}</p> <p class="text-sm text-surface-500">个样本</p> <div class="mt-2 w-full bg-surface-300 rounded-full h-2"><div${attr_class(`${season === "春季" ? "bg-green-500" : season === "夏季" ? "bg-yellow-500" : season === "秋季" ? "bg-orange-500" : "bg-blue-500"} h-2 rounded-full`)}${attr_style(`width: ${stringify(totalSamples() > 0 ? seasonStats()[season] / totalSamples() * 100 : 0)}%;`)}></div></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
