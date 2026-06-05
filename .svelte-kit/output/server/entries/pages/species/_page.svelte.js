import { V as escape_html, i as ensure_array_like, l as unsubscribe_stores, n as attr_class, r as derived, s as store_get } from "../../../chunks/dev.js";
import { i as species } from "../../../chunks/stores.js";
//#region src/routes/species/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let poisonousCount = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => s.isPoisonous).length);
		let edibleCount = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => !s.isPoisonous).length);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-6"><div class="flex justify-between items-center"><div><h2 class="text-2xl font-bold text-surface-900-50-token">物种管理</h2> <div class="flex gap-4 mt-2"><span class="badge badge-success">可食用: ${escape_html(edibleCount())}</span> <span class="badge badge-error">有毒: ${escape_html(poisonousCount())}</span></div></div> <button class="btn btn-primary"><span class="material-icons text-xl">add</span> 新增物种</button></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
		const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$species", species));
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let sp = each_array_1[$$index_1];
			$$renderer.push(`<div${attr_class(`card ${sp.isPoisonous ? "border-2 border-error-500" : ""}`)}><div class="card-header flex justify-between items-start"><div class="flex items-center gap-2"><span${attr_class(`material-icons ${sp.isPoisonous ? "text-error-500" : "text-success-500"}`)}>${escape_html(sp.isPoisonous ? "warning" : "check_circle")}</span> <h3 class="card-title">${escape_html(sp.name)}</h3></div> `);
			if (sp.isPoisonous) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="badge badge-error">有毒</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="card-section">`);
			if (sp.description) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-surface-600-400-token">${escape_html(sp.description)}</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<p class="text-surface-400 italic">暂无描述</p>`);
			}
			$$renderer.push(`<!--]--></div> <div class="card-footer flex justify-end gap-2"><button class="btn btn-ghost btn-sm"><span class="material-icons">edit</span> 编辑</button> <button class="btn btn-ghost btn-sm text-error"><span class="material-icons">delete</span> 删除</button></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
