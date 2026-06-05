import { H as attr, W as escape_html, a as ensure_array_like, c as store_get, i as derived, u as unsubscribe_stores } from "../../../chunks/dev.js";
import { c as samples, l as species } from "../../../chunks/stores.js";
//#region src/routes/export/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let selectedSamples = /* @__PURE__ */ new Set();
		let shareExpireDays = 7;
		let allowDownload = true;
		let allSamples = derived(() => store_get($$store_subs ??= {}, "$samples", samples));
		let allSpecies = derived(() => store_get($$store_subs ??= {}, "$species", species));
		let selectedCount = derived(() => selectedSamples.size > 0 ? selectedSamples.size : allSamples().length);
		$$renderer.push(`<div class="space-y-6"><div class="flex justify-between items-center"><div><h2 class="text-2xl font-bold text-surface-900-50-token">数据导出与分享</h2> <p class="text-surface-500">导出样本数据或生成分享链接</p></div></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="card"><div class="card-header flex justify-between items-center"><h3 class="card-title">选择要导出的样本</h3> <button class="btn btn-outline btn-sm">${escape_html(selectedSamples.size === allSamples().length ? "取消全选" : "全选")}</button></div> <div class="card-section">`);
		if (allSamples().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="text-center py-8"><span class="material-icons text-4xl text-surface-300 mb-2">inbox</span> <p class="text-surface-500">暂无样本数据</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="overflow-x-auto max-h-96 overflow-y-auto"><table class="table table-hover"><thead class="sticky top-0 bg-surface-50-900-token"><tr><th class="w-12"><input type="checkbox" class="checkbox"${attr("checked", selectedSamples.size === allSamples().length, true)}/></th><th>样本编号</th><th>采集地点</th><th>物种</th><th>采集日期</th></tr></thead><tbody><!--[-->`);
			const each_array = ensure_array_like(allSamples());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let sample = each_array[$$index];
				$$renderer.push(`<tr class="cursor-pointer"><td><input type="checkbox" class="checkbox"${attr("checked", selectedSamples.has(sample.id), true)}/></td><td class="font-mono">${escape_html(sample.sampleNumber)}</td><td>${escape_html(sample.location)}</td><td>${escape_html(sample.suspectedSpecies || "未鉴定")}</td><td>${escape_html(sample.collectionDate)}</td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">导出选项</h3></div> <div class="card-section"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="p-4 border border-surface-200-700-token rounded-lg"><div class="flex items-center gap-3 mb-3"><span class="material-icons text-primary-500">table_view</span> <h4 class="font-semibold">CSV 格式</h4></div> <p class="text-sm text-surface-500 mb-4">适合在 Excel 或其他表格软件中打开和分析</p> <button class="btn btn-primary w-full"${attr("disabled", allSamples().length === 0, true)}><span class="material-icons">download</span> 导出 CSV (${escape_html(selectedCount())} 条)</button></div> <div class="p-4 border border-surface-200-700-token rounded-lg"><div class="flex items-center gap-3 mb-3"><span class="material-icons text-success-500">code</span> <h4 class="font-semibold">JSON 格式</h4></div> <p class="text-sm text-surface-500 mb-4">完整数据导出，包含所有字段和关联信息</p> <button class="btn btn-success w-full"${attr("disabled", allSamples().length === 0, true)}><span class="material-icons">download</span> 导出 JSON (${escape_html(selectedCount())} 条)</button></div></div></div></div></div> <div class="space-y-6"><div class="card"><div class="card-header"><h3 class="card-title">分享数据</h3></div> <div class="card-section"><div class="space-y-4"><p class="text-sm text-surface-500">生成分享链接，让其他人可以查看你选择的样本数据</p> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">链接有效期</span></label> `);
		$$renderer.select({
			value: shareExpireDays,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: 1 }, ($$renderer) => {
				$$renderer.push(`1 天`);
			});
			$$renderer.option({ value: 7 }, ($$renderer) => {
				$$renderer.push(`7 天`);
			});
			$$renderer.option({ value: 30 }, ($$renderer) => {
				$$renderer.push(`30 天`);
			});
			$$renderer.option({ value: 0 }, ($$renderer) => {
				$$renderer.push(`永久有效`);
			});
		});
		$$renderer.push(`</div> <div class="form-control"><div class="flex items-center gap-2"><input type="checkbox"${attr("checked", allowDownload, true)} id="allowDownload" class="checkbox"/> <label for="allowDownload" class="cursor-pointer">允许接收者下载数据</label></div></div> <button class="btn btn-primary w-full"${attr("disabled", selectedCount() === 0, true)}><span class="material-icons">share</span> 生成分享链接</button> <div class="text-sm text-surface-500 pt-4 border-t border-surface-200-700-token"><p class="mb-2"><span class="material-icons text-sm align-middle">info</span> 已选择 ${escape_html(selectedCount())} 条数据</p> <p><span class="material-icons text-sm align-middle">link</span> 分享链接包含所选样本的完整信息</p></div></div></div></div> <div class="card"><div class="card-header"><h3 class="card-title">数据统计</h3></div> <div class="card-section"><div class="space-y-3"><div class="flex justify-between items-center"><span class="text-surface-500">总样本数</span> <span class="font-bold">${escape_html(allSamples().length)}</span></div> <div class="flex justify-between items-center"><span class="text-surface-500">已鉴定</span> <span class="font-bold text-success-600">${escape_html(allSamples().filter((s) => s.identificationStatus === "identified").length)}</span></div> <div class="flex justify-between items-center"><span class="text-surface-500">高风险</span> <span class="font-bold text-error-600">${escape_html(allSamples().filter((s) => s.riskLevel === "high").length)}</span></div> <div class="flex justify-between items-center"><span class="text-surface-500">带图片</span> <span class="font-bold">${escape_html(allSamples().filter((s) => s.images && s.images.length > 0).length)}</span></div> <div class="flex justify-between items-center"><span class="text-surface-500">物种种类</span> <span class="font-bold">${escape_html(allSpecies().length)}</span></div></div></div></div> <div class="card"><div class="card-header"><h3 class="card-title">导入数据</h3></div> <div class="card-section"><p class="text-sm text-surface-500 mb-4">从 JSON 文件导入之前导出的数据</p> <label class="btn btn-outline w-full"><span class="material-icons">upload</span> 选择 JSON 文件 <input type="file" accept=".json" class="hidden"/></label></div></div></div></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
