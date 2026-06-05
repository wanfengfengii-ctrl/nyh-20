import { D as writable } from "./dev.js";
import "./index-server2.js";
//#region src/lib/stores.ts
function createLocalStore(key, initialValue) {
	return writable(initialValue);
}
var samples = createLocalStore("fungi-samples", []);
var species = createLocalStore("fungi-species", [
	{
		id: "1",
		name: "白毒伞",
		isPoisonous: true,
		description: "极毒，含有毒伞肽和毒肽"
	},
	{
		id: "2",
		name: "牛肝菌",
		isPoisonous: false,
		description: "可食用，味道鲜美"
	},
	{
		id: "3",
		name: "鸡枞",
		isPoisonous: false,
		description: "珍贵食用菌"
	},
	{
		id: "4",
		name: "毒蝇伞",
		isPoisonous: true,
		description: "有毒，致幻性"
	},
	{
		id: "5",
		name: "香菇",
		isPoisonous: false,
		description: "常见食用菌"
	},
	{
		id: "6",
		name: "羊肚菌",
		isPoisonous: false,
		description: "珍贵食用菌"
	}
]);
var filters = createLocalStore("fungi-filters", {
	location: "",
	capColor: "",
	sporePrintColor: "",
	identificationStatus: "",
	isAbnormal: null
});
function generateId() {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
function validateSample(sample, existingSamples, excludeId) {
	const errors = [];
	if (!sample.sampleNumber) errors.push("样本编号不能为空");
	else if (existingSamples.find((s) => s.sampleNumber === sample.sampleNumber && s.id !== excludeId)) errors.push("样本编号已存在，不能重复");
	if (!sample.collectionDate) errors.push("采集日期不能为空");
	else {
		const collectionDate = new Date(sample.collectionDate);
		const today = /* @__PURE__ */ new Date();
		today.setHours(23, 59, 59, 999);
		if (collectionDate > today) errors.push("采集日期不能晚于当前日期");
	}
	if (!sample.location) errors.push("采集地点不能为空");
	if (sample.latitude !== null && sample.latitude !== void 0) {
		if (sample.latitude < -90 || sample.latitude > 90) errors.push("纬度必须在 -90 到 90 之间");
	}
	if (sample.longitude !== null && sample.longitude !== void 0) {
		if (sample.longitude < -180 || sample.longitude > 180) errors.push("经度必须在 -180 到 180 之间");
	}
	if ((sample.latitude === null || sample.latitude === void 0) !== (sample.longitude === null || sample.longitude === void 0)) errors.push("经纬度必须同时填写或同时为空");
	if (!sample.habitatType) errors.push("生境类型不能为空");
	if (!sample.capColor) errors.push("菌盖颜色不能为空");
	if (sample.identificationStatus === "identified" && !sample.hasSporePrint) errors.push("未完成孢子印记录的样本不能标记为已鉴定");
	return {
		valid: errors.length === 0,
		errors
	};
}
//#endregion
export { validateSample as a, species as i, generateId as n, samples as r, filters as t };
