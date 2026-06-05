import { B as clsx, V as escape_html, c as stringify, i as ensure_array_like, l as unsubscribe_stores, n as attr_class, r as derived, s as store_get, z as attr } from "../../chunks/dev.js";
import { a as validateSample, i as species, n as generateId, r as samples, t as filters } from "../../chunks/stores.js";
import { i as SPORE_COLORS, n as HABITAT_TYPES, r as IDENTIFICATION_STATUS, t as CAP_COLORS } from "../../chunks/types.js";
//#region src/lib/components/SampleForm.svelte
function SampleForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { sample, errors = [], onsubmit, oncancel } = $$props;
		let latitudeStr = sample.latitude?.toString() || "";
		let longitudeStr = sample.longitude?.toString() || "";
		let species$1 = derived(() => store_get($$store_subs ??= {}, "$speciesStore", species));
		let poisonousSpecies = derived(() => species$1().filter((s) => s.isPoisonous));
		$$renderer.push(`<div class="card"><div class="card-header"><h2 class="card-title">${escape_html(sample.id ? "编辑样本" : "新增样本")}</h2></div> <div class="card-section">`);
		if (errors.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="alert alert-error mb-4"><div class="alert-icon"><span class="material-icons">error</span></div> <div class="alert-content"><ul class="list-disc pl-4"><!--[-->`);
			const each_array = ensure_array_like(errors);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let error = each_array[$$index];
				$$renderer.push(`<li>${escape_html(error)}</li>`);
			}
			$$renderer.push(`<!--]--></ul></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="form-control"><label class="form-control-label"><span class="form-control-label-text">样本编号 *</span></label> <input type="text"${attr("value", sample.sampleNumber)} class="input" placeholder="例如: FG-2024-001"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">采集日期 *</span></label> <input type="date"${attr("value", sample.collectionDate)} class="input"${attr("max", (/* @__PURE__ */ new Date()).toISOString().split("T")[0])}/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">采集地点 *</span></label> <input type="text"${attr("value", sample.location)} class="input" placeholder="例如: 北京香山"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">生境类型 *</span></label> `);
		$$renderer.select({
			value: sample.habitatType,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`请选择生境类型`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(HABITAT_TYPES);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let habitat = each_array_1[$$index_1];
				$$renderer.option({ value: habitat }, ($$renderer) => {
					$$renderer.push(`${escape_html(habitat)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">纬度</span></label> <input type="number"${attr("value", latitudeStr)} class="input" placeholder="-90 到 90 之间" step="any"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">经度</span></label> <input type="number"${attr("value", longitudeStr)} class="input" placeholder="-180 到 180 之间" step="any"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">菌盖颜色 *</span></label> `);
		$$renderer.select({
			value: sample.capColor,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`请选择菌盖颜色`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_2 = ensure_array_like(CAP_COLORS);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let color = each_array_2[$$index_2];
				$$renderer.option({ value: color }, ($$renderer) => {
					$$renderer.push(`${escape_html(color)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">鉴定状态</span></label> `);
		$$renderer.select({
			value: sample.identificationStatus,
			class: "select"
		}, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			const each_array_3 = ensure_array_like(IDENTIFICATION_STATUS);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let status = each_array_3[$$index_3];
				$$renderer.option({ value: status.value }, ($$renderer) => {
					$$renderer.push(`${escape_html(status.label)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">疑似物种</span></label> `);
		$$renderer.select({
			value: sample.suspectedSpecies,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`请选择疑似物种`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_4 = ensure_array_like(species$1());
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let sp = each_array_4[$$index_4];
				$$renderer.option({ value: sp.name }, ($$renderer) => {
					$$renderer.push(`${escape_html(sp.name)} ${escape_html(sp.isPoisonous ? "⚠️ 有毒" : "")}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` `);
		if (sample.suspectedSpecies && poisonousSpecies().some((s) => s.name === sample.suspectedSpecies)) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="alert alert-warning mt-2"><div class="alert-icon"><span class="material-icons">warning</span></div> <div class="alert-content"><span class="font-bold">注意：</span>该物种为有毒物种，请谨慎处理！</div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="form-control"><label class="form-control-label"><span class="form-control-label-text">是否已采集孢子印</span></label> <div class="flex items-center gap-2 mt-2"><input type="checkbox"${attr("checked", sample.hasSporePrint, true)} id="hasSporePrint" class="checkbox"/> <label for="hasSporePrint" class="cursor-pointer">已采集孢子印</label></div></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">孢子印颜色</span></label> `);
		$$renderer.select({
			value: sample.sporePrintColor,
			class: "select",
			disabled: !sample.hasSporePrint
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`请选择孢子印颜色`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_5 = ensure_array_like(SPORE_COLORS);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let color = each_array_5[$$index_5];
				$$renderer.option({ value: color }, ($$renderer) => {
					$$renderer.push(`${escape_html(color)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` `);
		if (!sample.hasSporePrint) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-surface-500 mt-1">需要先勾选"已采集孢子印"</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> <div class="form-control"><div class="flex items-center gap-2"><input type="checkbox"${attr("checked", sample.isAbnormal, true)} id="isAbnormal" class="checkbox"/> <label for="isAbnormal" class="cursor-pointer">标记为异常样本</label></div></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">备注</span></label> <textarea class="textarea" rows="3" placeholder="输入备注信息...">`);
		const $$body = escape_html(sample.notes);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea></div> <div class="flex gap-3 justify-end pt-4"><button type="button" class="btn btn-ghost">取消</button> <button type="submit" class="btn btn-primary">保存</button></div></form></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showForm = false;
		let editingSample = null;
		let formErrors = [];
		let filteredSamples = derived(() => store_get($$store_subs ??= {}, "$samples", samples).filter((sample) => {
			if (store_get($$store_subs ??= {}, "$filters", filters).location && !sample.location.includes(store_get($$store_subs ??= {}, "$filters", filters).location)) return false;
			if (store_get($$store_subs ??= {}, "$filters", filters).capColor && sample.capColor !== store_get($$store_subs ??= {}, "$filters", filters).capColor) return false;
			if (store_get($$store_subs ??= {}, "$filters", filters).sporePrintColor && sample.sporePrintColor !== store_get($$store_subs ??= {}, "$filters", filters).sporePrintColor) return false;
			if (store_get($$store_subs ??= {}, "$filters", filters).identificationStatus && sample.identificationStatus !== store_get($$store_subs ??= {}, "$filters", filters).identificationStatus) return false;
			if (store_get($$store_subs ??= {}, "$filters", filters).isAbnormal !== null && sample.isAbnormal !== store_get($$store_subs ??= {}, "$filters", filters).isAbnormal) return false;
			return true;
		}));
		let locations = derived(() => [...new Set(store_get($$store_subs ??= {}, "$samples", samples).map((s) => s.location))]);
		let poisonousSpeciesNames = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => s.isPoisonous).map((s) => s.name));
		function handleSubmit(submittedSample) {
			const validation = validateSample(submittedSample, store_get($$store_subs ??= {}, "$samples", samples), editingSample?.id);
			if (!validation.valid) {
				formErrors = validation.errors;
				return;
			}
			const now = (/* @__PURE__ */ new Date()).toISOString();
			if (editingSample && editingSample.id) {
				const sampleId = editingSample.id;
				samples.update((s) => s.map((sample) => sample.id === sampleId ? {
					...submittedSample,
					id: sampleId,
					updatedAt: now
				} : sample));
			} else samples.update((s) => [...s, {
				...submittedSample,
				id: generateId(),
				createdAt: now,
				updatedAt: now
			}]);
			showForm = false;
			editingSample = null;
		}
		function handleCancel() {
			showForm = false;
			editingSample = null;
			formErrors = [];
		}
		function getStatusBadge(status) {
			return {
				pending: {
					class: "badge-warning",
					label: "待鉴定"
				},
				identified: {
					class: "badge-success",
					label: "已鉴定"
				},
				unidentified: {
					class: "badge-error",
					label: "无法鉴定"
				}
			}[status] || {
				class: "badge",
				label: status
			};
		}
		if (showForm && editingSample) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">`);
			SampleForm($$renderer, {
				sample: editingSample,
				errors: formErrors,
				onsubmit: (detail) => handleSubmit(detail),
				oncancel: handleCancel
			});
			$$renderer.push(`<!----></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-6"><div class="flex justify-between items-center"><div><h2 class="text-2xl font-bold text-surface-900-50-token">样本列表</h2> <p class="text-surface-500">共 ${escape_html(store_get($$store_subs ??= {}, "$samples", samples).length)} 个样本，当前显示 ${escape_html(filteredSamples().length)} 个</p></div> <button class="btn btn-primary"><span class="material-icons text-xl">add</span> 新增样本</button></div> <div class="card"><div class="card-header"><h3 class="card-title flex items-center gap-2"><span class="material-icons">filter_alt</span> 筛选条件</h3></div> <div class="card-section"><div class="grid grid-cols-1 md:grid-cols-5 gap-4"><div class="form-control"><label class="form-control-label"><span class="form-control-label-text">采集地点</span></label> <input type="text"${attr("value", store_get($$store_subs ??= {}, "$filters", filters).location)} class="input" placeholder="输入地点关键词..." list="location-list"/> <datalist id="location-list"><!--[-->`);
		const each_array = ensure_array_like(locations());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let loc = each_array[$$index];
			$$renderer.option({ value: loc }, ($$renderer) => {});
		}
		$$renderer.push(`<!--]--></datalist></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">菌盖颜色</span></label> `);
		$$renderer.select({
			value: store_get($$store_subs ??= {}, "$filters", filters).capColor,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`全部颜色`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(CAP_COLORS);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let color = each_array_1[$$index_1];
				$$renderer.option({ value: color }, ($$renderer) => {
					$$renderer.push(`${escape_html(color)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">孢子印颜色</span></label> `);
		$$renderer.select({
			value: store_get($$store_subs ??= {}, "$filters", filters).sporePrintColor,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`全部颜色`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_2 = ensure_array_like(SPORE_COLORS);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let color = each_array_2[$$index_2];
				$$renderer.option({ value: color }, ($$renderer) => {
					$$renderer.push(`${escape_html(color)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">鉴定状态</span></label> `);
		$$renderer.select({
			value: store_get($$store_subs ??= {}, "$filters", filters).identificationStatus,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`全部状态`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_3 = ensure_array_like(IDENTIFICATION_STATUS);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let status = each_array_3[$$index_3];
				$$renderer.option({ value: status.value }, ($$renderer) => {
					$$renderer.push(`${escape_html(status.label)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">异常标记</span></label> `);
		$$renderer.select({
			value: store_get($$store_subs ??= {}, "$filters", filters).isAbnormal,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: null }, ($$renderer) => {
				$$renderer.push(`全部`);
			});
			$$renderer.option({ value: true }, ($$renderer) => {
				$$renderer.push(`仅异常`);
			});
			$$renderer.option({ value: false }, ($$renderer) => {
				$$renderer.push(`仅正常`);
			});
		});
		$$renderer.push(`</div></div> <div class="mt-4 flex justify-end"><button class="btn btn-ghost btn-sm">重置筛选</button></div></div></div> `);
		if (filteredSamples().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card"><div class="card-section text-center py-12"><span class="material-icons text-6xl text-surface-300 mb-4">inbox</span> <p class="text-surface-500 text-lg">${escape_html(store_get($$store_subs ??= {}, "$samples", samples).length === 0 ? "暂无样本记录，点击\"新增样本\"开始记录" : "没有符合筛选条件的样本")}</p></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="overflow-x-auto"><table class="table table-hover table-zebra"><thead><tr><th>样本编号</th><th>采集日期</th><th>采集地点</th><th>生境</th><th>菌盖颜色</th><th>孢子印颜色</th><th>疑似物种</th><th>状态</th><th>异常</th><th>操作</th></tr></thead><tbody><!--[-->`);
			const each_array_4 = ensure_array_like(filteredSamples());
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let sample = each_array_4[$$index_4];
				$$renderer.push(`<tr${attr_class(clsx(sample.isAbnormal ? "bg-error-50" : ""))}><td class="font-mono font-bold">${escape_html(sample.sampleNumber)}</td><td>${escape_html(sample.collectionDate)}</td><td>${escape_html(sample.location)}</td><td>${escape_html(sample.habitatType)}</td><td>${escape_html(sample.capColor)}</td><td>${escape_html(sample.hasSporePrint ? sample.sporePrintColor || "已采集未记录" : "<span class=\"text-surface-400\">未采集</span>")}</td><td>`);
				if (sample.suspectedSpecies) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span${attr_class(`inline-flex items-center gap-1 ${poisonousSpeciesNames().includes(sample.suspectedSpecies) ? "text-error-600 font-bold" : ""}`)}>${escape_html(sample.suspectedSpecies)} `);
					if (poisonousSpeciesNames().includes(sample.suspectedSpecies)) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="material-icons text-sm">warning</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="text-surface-400">-</span>`);
				}
				$$renderer.push(`<!--]--></td><td><span${attr_class(`badge ${stringify(getStatusBadge(sample.identificationStatus).class)}`)}>${escape_html(getStatusBadge(sample.identificationStatus).label)}</span></td><td>`);
				if (sample.isAbnormal) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="badge badge-error">异常</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="text-surface-400">-</span>`);
				}
				$$renderer.push(`<!--]--></td><td><div class="flex gap-2"><button class="btn btn-ghost btn-sm"><span class="material-icons">edit</span></button> <button class="btn btn-ghost btn-sm text-error"><span class="material-icons">delete</span></button></div></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
