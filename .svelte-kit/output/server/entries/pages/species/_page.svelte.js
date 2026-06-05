import { H as attr, W as escape_html, a as ensure_array_like, c as store_get, i as derived, l as stringify, n as attr_class, u as unsubscribe_stores } from "../../../chunks/dev.js";
import { l as species, n as currentUser, o as hasPermission } from "../../../chunks/stores.js";
import { a as RISK_LEVELS } from "../../../chunks/types.js";
//#region src/routes/species/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let poisonousCount = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => s.isPoisonous).length);
		let edibleCount = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => !s.isPoisonous).length);
		let highRiskCount = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => s.riskLevel === "high").length);
		let canManage = derived(() => hasPermission(store_get($$store_subs ??= {}, "$currentUser", currentUser), "manage_users"));
		function getRiskClass(riskLevel) {
			return RISK_LEVELS.find((r) => r.value === riskLevel)?.class || "badge";
		}
		function getRiskLabel(riskLevel) {
			return RISK_LEVELS.find((r) => r.value === riskLevel)?.label || riskLevel;
		}
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-6"><div class="flex justify-between items-center"><div><h2 class="text-2xl font-bold text-surface-900-50-token">物种管理</h2> <div class="flex gap-4 mt-2"><span class="badge badge-success">可食用: ${escape_html(edibleCount())}</span> <span class="badge badge-warning">有毒: ${escape_html(poisonousCount())}</span> <span class="badge badge-error">高风险: ${escape_html(highRiskCount())}</span></div></div> <button class="btn btn-primary"${attr("disabled", !canManage(), true)}><span class="material-icons text-xl">add</span> 新增物种</button></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
		const each_array_5 = ensure_array_like(store_get($$store_subs ??= {}, "$species", species));
		for (let $$index_8 = 0, $$length = each_array_5.length; $$index_8 < $$length; $$index_8++) {
			let sp = each_array_5[$$index_8];
			$$renderer.push(`<div${attr_class(`card ${sp.riskLevel === "high" ? "border-2 border-error-500" : sp.isPoisonous ? "border-2 border-warning-500" : ""}`)}><div class="card-header flex justify-between items-start"><div class="flex items-center gap-2"><span${attr_class(`material-icons ${sp.isPoisonous ? sp.riskLevel === "high" ? "text-error-500" : "text-warning-500" : "text-success-500"}`)}>${escape_html(sp.isPoisonous ? "warning" : "check_circle")}</span> <h3 class="card-title">${escape_html(sp.name)}</h3></div> <div class="flex gap-1"><span${attr_class(`badge ${stringify(getRiskClass(sp.riskLevel))}`)}>${escape_html(getRiskLabel(sp.riskLevel))}</span></div></div> <div class="card-section space-y-3">`);
			if (sp.description) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-surface-600-400-token">${escape_html(sp.description)}</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<p class="text-surface-400 italic">暂无描述</p>`);
			}
			$$renderer.push(`<!--]--> `);
			if (sp.seasonality.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div><p class="text-xs text-surface-500 mb-1">季节分布</p> <div class="flex flex-wrap gap-1"><!--[-->`);
				const each_array_6 = ensure_array_like(sp.seasonality);
				for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
					let s = each_array_6[$$index_5];
					$$renderer.push(`<span class="badge badge-sm badge-outline">${escape_html(s)}</span>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (sp.commonLocations.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div><p class="text-xs text-surface-500 mb-1">常见生境</p> <div class="flex flex-wrap gap-1"><!--[-->`);
				const each_array_7 = ensure_array_like(sp.commonLocations);
				for (let $$index_6 = 0, $$length = each_array_7.length; $$index_6 < $$length; $$index_6++) {
					let loc = each_array_7[$$index_6];
					$$renderer.push(`<span class="badge badge-sm badge-outline">${escape_html(loc)}</span>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (sp.identificationKeys.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div><p class="text-xs text-surface-500 mb-1">鉴定要点</p> <ul class="text-sm list-disc pl-4 space-y-1"><!--[-->`);
				const each_array_8 = ensure_array_like(sp.identificationKeys.slice(0, 3));
				for (let $$index_7 = 0, $$length = each_array_8.length; $$index_7 < $$length; $$index_7++) {
					let key = each_array_8[$$index_7];
					$$renderer.push(`<li>${escape_html(key)}</li>`);
				}
				$$renderer.push(`<!--]--> `);
				if (sp.identificationKeys.length > 3) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<li class="text-surface-500">+${escape_html(sp.identificationKeys.length - 3)} 更多</li>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></ul></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="card-footer flex justify-end gap-2">`);
			if (canManage()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="btn btn-ghost btn-sm"><span class="material-icons">edit</span> 编辑</button> <button class="btn btn-ghost btn-sm text-error"><span class="material-icons">delete</span> 删除</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
