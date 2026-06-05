import { k as writable } from "./dev.js";
import "./index-server2.js";
var STORES = {
	samples: "samples",
	species: "species",
	users: "users",
	syncInfo: "syncInfo"
};
async function initDB() {
	return new Promise((resolve, reject) => {
		reject(/* @__PURE__ */ new Error("Not in browser"));
	});
}
async function dbGetAll(storeName) {
	const database = await initDB();
	return new Promise((resolve, reject) => {
		const request = database.transaction(storeName, "readonly").objectStore(storeName).getAll();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function dbPut(storeName, data) {
	const database = await initDB();
	return new Promise((resolve, reject) => {
		const request = database.transaction(storeName, "readwrite").objectStore(storeName).put(data);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}
function createIndexedDBStore(key, storeName, initialValue) {
	const store = writable(initialValue);
	return {
		...store,
		async saveToDB(data) {
			if (Array.isArray(data)) for (const item of data) await dbPut(storeName, item);
		},
		async loadFromDB() {
			try {
				const data = await dbGetAll(storeName);
				store.set(data);
			} catch (e) {
				console.error("Failed to load from IndexedDB:", e);
			}
		}
	};
}
var defaultSpecies = [
	{
		id: "1",
		name: "白毒伞",
		isPoisonous: true,
		riskLevel: "high",
		description: "极毒，含有毒伞肽和毒肽，致死率高",
		identificationKeys: [
			"白色菌盖",
			"菌环",
			"菌托"
		],
		seasonality: ["夏季", "秋季"],
		commonLocations: ["阔叶林", "公园"],
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "2",
		name: "牛肝菌",
		isPoisonous: false,
		riskLevel: "low",
		description: "可食用，味道鲜美",
		identificationKeys: ["肉质厚实", "管孔状菌褶"],
		seasonality: ["夏季", "秋季"],
		commonLocations: ["针叶林", "混交林"],
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "3",
		name: "鸡枞",
		isPoisonous: false,
		riskLevel: "low",
		description: "珍贵食用菌",
		identificationKeys: ["与白蚁共生", "长柄"],
		seasonality: ["夏季"],
		commonLocations: ["草地", "林地"],
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "4",
		name: "毒蝇伞",
		isPoisonous: true,
		riskLevel: "medium",
		description: "有毒，致幻性",
		identificationKeys: ["红色菌盖", "白色鳞片"],
		seasonality: ["夏季", "秋季"],
		commonLocations: ["针叶林"],
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "5",
		name: "香菇",
		isPoisonous: false,
		riskLevel: "low",
		description: "常见食用菌",
		identificationKeys: ["褐色菌盖", "鳞片"],
		seasonality: ["秋季", "冬季"],
		commonLocations: ["枯木", "腐木"],
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "6",
		name: "羊肚菌",
		isPoisonous: false,
		riskLevel: "low",
		description: "珍贵食用菌",
		identificationKeys: ["蜂窝状菌盖", "中空"],
		seasonality: ["春季"],
		commonLocations: ["阔叶林", "火烧地"],
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	}
];
var defaultUsers = [{
	id: "system",
	username: "system",
	role: "admin",
	createdAt: (/* @__PURE__ */ new Date()).toISOString(),
	lastLoginAt: (/* @__PURE__ */ new Date()).toISOString()
}, {
	id: "guest",
	username: "访客用户",
	role: "guest",
	createdAt: (/* @__PURE__ */ new Date()).toISOString(),
	lastLoginAt: (/* @__PURE__ */ new Date()).toISOString()
}];
var getDeviceId = () => {
	return "server";
};
var samples = createIndexedDBStore("fungi-samples", STORES.samples, []);
var species = createIndexedDBStore("fungi-species", STORES.species, defaultSpecies);
var users = createIndexedDBStore("fungi-users", STORES.users, defaultUsers);
var currentUser = (() => {
	return writable(null);
})();
var syncInfo = (() => {
	return writable({
		lastSyncAt: (/* @__PURE__ */ new Date()).toISOString(),
		version: 1,
		deviceId: getDeviceId(),
		pendingChanges: []
	});
})();
var filters = createIndexedDBStore("fungi-filters", "filters", {
	location: "",
	capColor: "",
	sporePrintColor: "",
	identificationStatus: "",
	isAbnormal: null,
	riskLevel: "",
	createdBy: "",
	dateFrom: "",
	dateTo: ""
});
function generateId() {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
function hasPermission(user, permission) {
	if (!user) return permission === "read";
	return {
		guest: ["read"],
		user: [
			"read",
			"create",
			"edit_own"
		],
		identifier: [
			"read",
			"create",
			"edit_own",
			"edit_any",
			"identify"
		],
		admin: [
			"read",
			"create",
			"edit_any",
			"delete",
			"identify",
			"manage_users"
		]
	}[user.role]?.includes(permission) || false;
}
function canEditSample(user, sample) {
	if (!user) return false;
	if (hasPermission(user, "edit_any")) return true;
	if (hasPermission(user, "edit_own") && sample.createdBy === user.id) return true;
	return false;
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
		const lat = Number(sample.latitude);
		if (isNaN(lat) || lat < -90 || lat > 90) errors.push("纬度必须在 -90 到 90 之间");
	}
	if (sample.longitude !== null && sample.longitude !== void 0) {
		const lng = Number(sample.longitude);
		if (isNaN(lng) || lng < -180 || lng > 180) errors.push("经度必须在 -180 到 180 之间");
	}
	if ((sample.latitude !== null && sample.latitude !== void 0) !== (sample.longitude !== null && sample.longitude !== void 0)) errors.push("经纬度必须同时填写或同时为空");
	if (!sample.habitatType) errors.push("生境类型不能为空");
	if (!sample.capColor) errors.push("菌盖颜色不能为空");
	if (sample.identificationStatus === "identified") {
		if (!sample.identificationEvidences || sample.identificationEvidences.length === 0) errors.push("已鉴定的样本必须填写鉴定依据");
		if (!sample.hasSporePrint) errors.push("未完成孢子印记录的样本不能标记为已鉴定");
	}
	return {
		valid: errors.length === 0,
		errors
	};
}
function getSeason(date) {
	const month = new Date(date).getMonth() + 1;
	if (month >= 3 && month <= 5) return "春季";
	if (month >= 6 && month <= 8) return "夏季";
	if (month >= 9 && month <= 11) return "秋季";
	return "冬季";
}
async function initData() {}
//#endregion
export { getSeason as a, samples as c, users as d, validateSample as f, generateId as i, species as l, currentUser as n, hasPermission as o, filters as r, initData as s, canEditSample as t, syncInfo as u };
