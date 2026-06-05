import { H as attr, N as snapshot, U as clsx, W as escape_html, a as ensure_array_like, c as store_get, i as derived, l as stringify, n as attr_class, u as unsubscribe_stores } from "../../chunks/dev.js";
import { c as samples, f as validateSample, i as generateId, l as species, n as currentUser, o as hasPermission, r as filters, t as canEditSample } from "../../chunks/stores.js";
import { a as RISK_LEVELS, i as IDENTIFICATION_STATUS, n as EVIDENCE_TYPES, r as HABITAT_TYPES, s as SPORE_COLORS, t as CAP_COLORS } from "../../chunks/types.js";
//#region src/lib/components/SampleForm.svelte
function SampleForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { sample, errors = [], onsubmit, oncancel } = $$props;
		let latitudeStr = sample.latitude?.toString() || "";
		let longitudeStr = snapshot(sample.longitude)?.toString() || "";
		let newEvidenceType = "morphology";
		let newEvidenceDesc = "";
		let newEvidenceConfidence = 80;
		let speciesList = derived(() => store_get($$store_subs ??= {}, "$speciesStore", species));
		let poisonousSpecies = derived(() => speciesList().filter((s) => s.isPoisonous));
		let highRiskSpecies = derived(() => speciesList().filter((s) => s.riskLevel === "high"));
		let canIdentify = derived(() => hasPermission(store_get($$store_subs ??= {}, "$currentUser", currentUser), "identify"));
		function getEvidenceLabel(type) {
			return EVIDENCE_TYPES.find((e) => e.value === type)?.label || type;
		}
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
		$$renderer.push(`<!--]--> <form class="space-y-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="form-control"><label class="form-control-label"><span class="form-control-label-text">样本编号 *</span></label> <input type="text"${attr("value", sample.sampleNumber)} class="input" placeholder="例如: FG-2024-001"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">采集日期 *</span></label> <input type="date"${attr("value", sample.collectionDate)} class="input"${attr("max", (/* @__PURE__ */ new Date()).toISOString().split("T")[0])}/></div> <div class="form-control md:col-span-2"><label class="form-control-label"><span class="form-control-label-text">采集地点 *</span></label> <input type="text"${attr("value", sample.location)} class="input" placeholder="例如: 北京香山"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">纬度</span></label> <input type="number"${attr("value", latitudeStr)} class="input" placeholder="-90 到 90 之间" step="any"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">经度</span></label> <input type="number"${attr("value", longitudeStr)} class="input" placeholder="-180 到 180 之间" step="any"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">生境类型 *</span></label> `);
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
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">菌盖颜色 *</span></label> `);
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
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">疑似物种</span></label> `);
		$$renderer.select({
			value: sample.suspectedSpecies,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`请选择疑似物种`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_3 = ensure_array_like(speciesList());
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let sp = each_array_3[$$index_3];
				$$renderer.option({ value: sp.name }, ($$renderer) => {
					$$renderer.push(`${escape_html(sp.name)} `);
					if (sp.isPoisonous) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`⚠️ 有毒`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (sp.riskLevel === "high") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`🔴 高风险`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` `);
		if (sample.suspectedSpecies && highRiskSpecies().some((s) => s.name === sample.suspectedSpecies)) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="alert alert-error mt-2"><div class="alert-icon"><span class="material-icons">danger</span></div> <div class="alert-content"><span class="font-bold">警告：</span>该物种为高风险有毒物种！</div></div>`);
		} else if (sample.suspectedSpecies && poisonousSpecies().some((s) => s.name === sample.suspectedSpecies)) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="alert alert-warning mt-2"><div class="alert-icon"><span class="material-icons">warning</span></div> <div class="alert-content"><span class="font-bold">注意：</span>该物种为有毒物种，请谨慎处理！</div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">鉴定状态</span></label> `);
		$$renderer.select({
			value: sample.identificationStatus,
			class: "select",
			disabled: !canIdentify()
		}, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			const each_array_4 = ensure_array_like(IDENTIFICATION_STATUS);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let status = each_array_4[$$index_4];
				$$renderer.option({ value: status.value }, ($$renderer) => {
					$$renderer.push(`${escape_html(status.label)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` `);
		if (!canIdentify()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-surface-500 mt-1">仅鉴定师或管理员可修改鉴定状态</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> <div class="card"><div class="card-header"><h3 class="card-title">样本图片</h3></div> <div class="card-section"><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"><!--[-->`);
		const each_array_5 = ensure_array_like(sample.images || []);
		for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
			let image = each_array_5[$$index_5];
			$$renderer.push(`<div class="relative group"><img${attr("src", image.dataUrl)}${attr("alt", image.caption || "样本图片")} class="w-full h-24 object-cover rounded-lg"/> <button type="button" class="absolute top-1 right-1 btn btn-error btn-xs opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-icons">close</span></button> <p class="text-xs text-center mt-1 truncate">${escape_html(image.caption)}</p></div>`);
		}
		$$renderer.push(`<!--]--></div> <label class="btn btn-outline btn-sm"><span class="material-icons">add_photo_alternate</span> 上传图片 <input type="file" accept="image/*" multiple="" class="hidden"/></label></div></div> `);
		if (sample.identificationStatus === "identified" || canIdentify()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card"><div class="card-header"><h3 class="card-title">鉴定依据 ${escape_html(sample.identificationStatus === "identified" ? "*" : "")}</h3></div> <div class="card-section">`);
			if (sample.identificationEvidences && sample.identificationEvidences.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="space-y-2 mb-4"><!--[-->`);
				const each_array_6 = ensure_array_like(sample.identificationEvidences);
				for (let index = 0, $$length = each_array_6.length; index < $$length; index++) {
					let evidence = each_array_6[index];
					$$renderer.push(`<div class="flex items-start gap-3 p-3 bg-surface-100-800-token rounded-lg"><div class="flex-1"><span class="badge badge-sm badge-outline mr-2">${escape_html(getEvidenceLabel(evidence.type))}</span> <span class="text-sm">置信度: ${escape_html(evidence.confidence)}%</span> <p class="mt-1">${escape_html(evidence.description)}</p></div> <button type="button" class="btn btn-ghost btn-sm text-error"><span class="material-icons">delete</span></button></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="form-control"><label class="form-control-label"><span class="form-control-label-text">依据类型</span></label> `);
			$$renderer.select({
				value: newEvidenceType,
				class: "select"
			}, ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				const each_array_7 = ensure_array_like(EVIDENCE_TYPES);
				for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
					let type = each_array_7[$$index_7];
					$$renderer.option({ value: type.value }, ($$renderer) => {
						$$renderer.push(`${escape_html(type.label)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			});
			$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">置信度 (%)</span></label> <input type="number"${attr("value", newEvidenceConfidence)} class="input" min="0" max="100"/></div> <div class="form-control md:col-span-2"><label class="form-control-label"><span class="form-control-label-text">依据描述</span></label> <div class="flex gap-2"><input type="text"${attr("value", newEvidenceDesc)} class="input flex-1" placeholder="描述鉴定依据..."/> <button type="button" class="btn btn-primary"><span class="material-icons">add</span> 添加</button></div></div></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="form-control"><label class="form-control-label"><span class="form-control-label-text">是否已采集孢子印</span></label> <div class="flex items-center gap-2 mt-2"><input type="checkbox"${attr("checked", sample.hasSporePrint, true)} id="hasSporePrint" class="checkbox"/> <label for="hasSporePrint" class="cursor-pointer">已采集孢子印</label></div></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">孢子印颜色</span></label> `);
		$$renderer.select({
			value: sample.sporePrintColor,
			class: "select",
			disabled: !sample.hasSporePrint
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`请选择孢子印颜色`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_8 = ensure_array_like(SPORE_COLORS);
			for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
				let color = each_array_8[$$index_8];
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
		$$renderer.push(`</textarea></div> <div class="flex gap-3 justify-end pt-4"><button type="button" class="btn btn-ghost">取消</button> <button type="submit" class="btn btn-primary">保存</button></div></form></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
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
			if (store_get($$store_subs ??= {}, "$filters", filters).riskLevel && sample.riskLevel !== store_get($$store_subs ??= {}, "$filters", filters).riskLevel) return false;
			if (store_get($$store_subs ??= {}, "$filters", filters).dateFrom && sample.collectionDate < store_get($$store_subs ??= {}, "$filters", filters).dateFrom) return false;
			if (store_get($$store_subs ??= {}, "$filters", filters).dateTo && sample.collectionDate > store_get($$store_subs ??= {}, "$filters", filters).dateTo) return false;
			return true;
		}));
		let locations = derived(() => [...new Set(store_get($$store_subs ??= {}, "$samples", samples).map((s) => s.location))]);
		let poisonousSpeciesNames = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => s.isPoisonous).map((s) => s.name));
		let highRiskSpeciesNames = derived(() => store_get($$store_subs ??= {}, "$species", species).filter((s) => s.riskLevel === "high").map((s) => s.name));
		let canCreate = derived(() => hasPermission(store_get($$store_subs ??= {}, "$currentUser", currentUser), "create"));
		function handleSubmit(submittedSample) {
			const validation = validateSample(submittedSample, store_get($$store_subs ??= {}, "$samples", samples), editingSample?.id);
			if (!validation.valid) {
				formErrors = validation.errors;
				return;
			}
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const userId = store_get($$store_subs ??= {}, "$currentUser", currentUser)?.id || "guest";
			if (editingSample && editingSample.id) {
				const sampleId = editingSample.id;
				samples.update((s) => s.map((sample) => sample.id === sampleId ? {
					...submittedSample,
					id: sampleId,
					updatedBy: userId,
					updatedAt: now
				} : sample));
			} else samples.update((s) => [...s, {
				...submittedSample,
				id: generateId(),
				createdBy: userId,
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
		function getRiskBadge(riskLevel) {
			return RISK_LEVELS.find((r) => r.value === riskLevel) || {
				class: "badge",
				label: riskLevel
			};
		}
		if (showForm && editingSample) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div class="bg-surface-50-900-token rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">`);
			SampleForm($$renderer, {
				sample: editingSample,
				errors: formErrors,
				onsubmit: (detail) => handleSubmit(detail),
				oncancel: handleCancel
			});
			$$renderer.push(`<!----></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-6"><div class="flex justify-between items-center"><div><h2 class="text-2xl font-bold text-surface-900-50-token">样本列表</h2> <p class="text-surface-500">共 ${escape_html(store_get($$store_subs ??= {}, "$samples", samples).length)} 个样本，当前显示 ${escape_html(filteredSamples().length)} 个</p></div> <button class="btn btn-primary"${attr("disabled", !canCreate(), true)}><span class="material-icons text-xl">add</span> 新增样本</button></div> <div class="card"><div class="card-header"><h3 class="card-title flex items-center gap-2"><span class="material-icons">filter_alt</span> 筛选条件</h3></div> <div class="card-section"><div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"><div class="form-control"><label class="form-control-label"><span class="form-control-label-text">采集地点</span></label> <input type="text"${attr("value", store_get($$store_subs ??= {}, "$filters", filters).location)} class="input" placeholder="输入地点关键词..." list="location-list"/> <datalist id="location-list"><!--[-->`);
		const each_array_2 = ensure_array_like(locations());
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let loc = each_array_2[$$index_2];
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
			const each_array_3 = ensure_array_like(CAP_COLORS);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let color = each_array_3[$$index_3];
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
			const each_array_4 = ensure_array_like(SPORE_COLORS);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let color = each_array_4[$$index_4];
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
			const each_array_5 = ensure_array_like(IDENTIFICATION_STATUS);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let status = each_array_5[$$index_5];
				$$renderer.option({ value: status.value }, ($$renderer) => {
					$$renderer.push(`${escape_html(status.label)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">风险等级</span></label> `);
		$$renderer.select({
			value: store_get($$store_subs ??= {}, "$filters", filters).riskLevel,
			class: "select"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`全部等级`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_6 = ensure_array_like(RISK_LEVELS);
			for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
				let level = each_array_6[$$index_6];
				$$renderer.option({ value: level.value }, ($$renderer) => {
					$$renderer.push(`${escape_html(level.label)}`);
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
		$$renderer.push(`</div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">开始日期</span></label> <input type="date"${attr("value", store_get($$store_subs ??= {}, "$filters", filters).dateFrom)} class="input"/></div> <div class="form-control"><label class="form-control-label"><span class="form-control-label-text">结束日期</span></label> <input type="date"${attr("value", store_get($$store_subs ??= {}, "$filters", filters).dateTo)} class="input"/></div></div> <div class="mt-4 flex justify-end"><button class="btn btn-ghost btn-sm">重置筛选</button></div></div></div> `);
		if (filteredSamples().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card"><div class="card-section text-center py-12"><span class="material-icons text-6xl text-surface-300 mb-4">inbox</span> <p class="text-surface-500 text-lg">${escape_html(store_get($$store_subs ??= {}, "$samples", samples).length === 0 ? "暂无样本记录，点击\"新增样本\"开始记录" : "没有符合筛选条件的样本")}</p></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="overflow-x-auto"><table class="table table-hover table-zebra"><thead><tr><th>样本编号</th><th>采集日期</th><th>采集地点</th><th>疑似物种</th><th>风险等级</th><th>状态</th><th>图片</th><th>操作</th></tr></thead><tbody><!--[-->`);
			const each_array_7 = ensure_array_like(filteredSamples());
			for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
				let sample = each_array_7[$$index_7];
				$$renderer.push(`<tr${attr_class(clsx(sample.isAbnormal ? "bg-error-50" : ""))}><td class="font-mono font-bold cursor-pointer">${escape_html(sample.sampleNumber)}</td><td>${escape_html(sample.collectionDate)}</td><td>${escape_html(sample.location)}</td><td>`);
				if (sample.suspectedSpecies) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span${attr_class(`inline-flex items-center gap-1 ${highRiskSpeciesNames().includes(sample.suspectedSpecies) ? "text-error-600 font-bold" : poisonousSpeciesNames().includes(sample.suspectedSpecies) ? "text-warning-600" : ""}`)}>${escape_html(sample.suspectedSpecies)} `);
					if (highRiskSpeciesNames().includes(sample.suspectedSpecies)) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="material-icons text-sm">danger</span>`);
					} else if (poisonousSpeciesNames().includes(sample.suspectedSpecies)) {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<span class="material-icons text-sm">warning</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="text-surface-400">-</span>`);
				}
				$$renderer.push(`<!--]--></td><td><span${attr_class(`badge ${stringify(getRiskBadge(sample.riskLevel).class)}`)}>${escape_html(getRiskBadge(sample.riskLevel).label)}</span></td><td><span${attr_class(`badge ${stringify(getStatusBadge(sample.identificationStatus).class)}`)}>${escape_html(getStatusBadge(sample.identificationStatus).label)}</span></td><td>`);
				if (sample.images && sample.images.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="material-icons text-primary-500">photo_library</span> <span class="text-sm ml-1">${escape_html(sample.images.length)}</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="text-surface-400">-</span>`);
				}
				$$renderer.push(`<!--]--></td><td><div class="flex gap-1"><button class="btn btn-ghost btn-sm"><span class="material-icons">visibility</span></button> `);
				if (canEditSample(store_get($$store_subs ??= {}, "$currentUser", currentUser), sample)) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="btn btn-ghost btn-sm"><span class="material-icons">edit</span></button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (hasPermission(store_get($$store_subs ??= {}, "$currentUser", currentUser), "delete")) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="btn btn-ghost btn-sm text-error"><span class="material-icons">delete</span></button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
