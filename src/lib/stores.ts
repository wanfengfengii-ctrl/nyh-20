import { browser } from '$app/environment';
import { writable, type Writable, get } from 'svelte/store';
import type {
	FungiSample,
	Species,
	Filters,
	User,
	UserRole,
	DataSyncInfo,
	IdentificationEvidence,
	SampleImage,
	WarningReport,
	EdibleRiskWarning,
	HandlingAdvice,
	ToxicSpeciesWarning,
	ObservationAdvice,
	SimilarSpecies
} from './types';

const DB_NAME = 'FungiObservationDB';
const DB_VERSION = 2;
const STORES = {
	samples: 'samples',
	species: 'species',
	users: 'users',
	syncInfo: 'syncInfo'
};

let db: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (!browser) {
			reject(new Error('Not in browser'));
			return;
		}

		if (db) {
			resolve(db);
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			db = request.result;
			resolve(db);
		};

		request.onupgradeneeded = (event) => {
			const database = (event.target as IDBOpenDBRequest).result;

			if (!database.objectStoreNames.contains(STORES.samples)) {
				const sampleStore = database.createObjectStore(STORES.samples, { keyPath: 'id' });
				sampleStore.createIndex('sampleNumber', 'sampleNumber', { unique: true });
				sampleStore.createIndex('location', 'location', { unique: false });
				sampleStore.createIndex('createdBy', 'createdBy', { unique: false });
			}

			if (!database.objectStoreNames.contains(STORES.species)) {
				const speciesStore = database.createObjectStore(STORES.species, { keyPath: 'id' });
				speciesStore.createIndex('name', 'name', { unique: true });
			}

			if (!database.objectStoreNames.contains(STORES.users)) {
				const userStore = database.createObjectStore(STORES.users, { keyPath: 'id' });
				userStore.createIndex('username', 'username', { unique: true });
			}

			if (!database.objectStoreNames.contains(STORES.syncInfo)) {
				database.createObjectStore(STORES.syncInfo, { keyPath: 'deviceId' });
			}
		};
	});
}

async function dbGetAll<T>(storeName: string): Promise<T[]> {
	const database = await initDB();
	return new Promise((resolve, reject) => {
		const transaction = database.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);
		const request = store.getAll();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function dbPut<T>(storeName: string, data: T): Promise<void> {
	const database = await initDB();
	return new Promise((resolve, reject) => {
		const transaction = database.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.put(data);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

async function dbDelete(storeName: string, key: string): Promise<void> {
	const database = await initDB();
	return new Promise((resolve, reject) => {
		const transaction = database.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.delete(key);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

function createIndexedDBStore<T>(
	key: string,
	storeName: string,
	initialValue: T
): Writable<T> & {
	saveToDB: (data: T) => Promise<void>;
	loadFromDB: () => Promise<void>;
} {
	let storedValue: T = initialValue;

	if (browser) {
		const saved = localStorage.getItem(key);
		if (saved) {
			try {
				storedValue = JSON.parse(saved);
			} catch {
				storedValue = initialValue;
			}
		}
	}

	const store = writable<T>(storedValue);

	if (browser) {
		store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return {
		...store,
		async saveToDB(data: T) {
			if (Array.isArray(data)) {
				for (const item of data) {
					await dbPut(storeName, item);
				}
			}
		},
		async loadFromDB() {
			try {
				const data = await dbGetAll(storeName);
				store.set(data as T);
			} catch (e) {
				console.error('Failed to load from IndexedDB:', e);
			}
		}
	};
}

const defaultSpecies: Species[] = [
	{
		id: '1',
		name: '白毒伞',
		isPoisonous: true,
		riskLevel: 'high',
		description: '极毒，含有毒伞肽和毒肽，致死率高',
		identificationKeys: ['白色菌盖', '菌环', '菌托'],
		seasonality: ['夏季', '秋季'],
		commonLocations: ['阔叶林', '公园'],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: '2',
		name: '牛肝菌',
		isPoisonous: false,
		riskLevel: 'low',
		description: '可食用，味道鲜美',
		identificationKeys: ['肉质厚实', '管孔状菌褶'],
		seasonality: ['夏季', '秋季'],
		commonLocations: ['针叶林', '混交林'],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: '3',
		name: '鸡枞',
		isPoisonous: false,
		riskLevel: 'low',
		description: '珍贵食用菌',
		identificationKeys: ['与白蚁共生', '长柄'],
		seasonality: ['夏季'],
		commonLocations: ['草地', '林地'],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: '4',
		name: '毒蝇伞',
		isPoisonous: true,
		riskLevel: 'medium',
		description: '有毒，致幻性',
		identificationKeys: ['红色菌盖', '白色鳞片'],
		seasonality: ['夏季', '秋季'],
		commonLocations: ['针叶林'],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: '5',
		name: '香菇',
		isPoisonous: false,
		riskLevel: 'low',
		description: '常见食用菌',
		identificationKeys: ['褐色菌盖', '鳞片'],
		seasonality: ['秋季', '冬季'],
		commonLocations: ['枯木', '腐木'],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: '6',
		name: '羊肚菌',
		isPoisonous: false,
		riskLevel: 'low',
		description: '珍贵食用菌',
		identificationKeys: ['蜂窝状菌盖', '中空'],
		seasonality: ['春季'],
		commonLocations: ['阔叶林', '火烧地'],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	}
];

const defaultUsers: User[] = [
	{
		id: 'system',
		username: 'system',
		role: 'admin',
		createdAt: new Date().toISOString(),
		lastLoginAt: new Date().toISOString()
	},
	{
		id: 'guest',
		username: '访客用户',
		role: 'guest',
		createdAt: new Date().toISOString(),
		lastLoginAt: new Date().toISOString()
	}
];

const getDeviceId = (): string => {
	if (!browser) return 'server';
	let deviceId = localStorage.getItem('device-id');
	if (!deviceId) {
		deviceId = generateId();
		localStorage.setItem('device-id', deviceId);
	}
	return deviceId;
};

export const samples = createIndexedDBStore<FungiSample[]>('fungi-samples', STORES.samples, []);
export const species = createIndexedDBStore<Species[]>('fungi-species', STORES.species, defaultSpecies);
export const users = createIndexedDBStore<User[]>('fungi-users', STORES.users, defaultUsers);

export const currentUser = (() => {
	let storedUser: User | null = null;
	if (browser) {
		const saved = localStorage.getItem('current-user');
		if (saved) {
			try {
				storedUser = JSON.parse(saved);
			} catch {
				storedUser = null;
			}
		}
	}

	const store = writable<User | null>(storedUser);

	if (browser) {
		store.subscribe((value) => {
			if (value) {
				localStorage.setItem('current-user', JSON.stringify(value));
			} else {
				localStorage.removeItem('current-user');
			}
		});
	}

	return store;
})();

export const syncInfo = (() => {
	const initialSyncInfo: DataSyncInfo = {
		lastSyncAt: new Date().toISOString(),
		version: 1,
		deviceId: getDeviceId(),
		pendingChanges: []
	};

	let stored: DataSyncInfo = initialSyncInfo;
	if (browser) {
		const saved = localStorage.getItem('sync-info');
		if (saved) {
			try {
				stored = JSON.parse(saved);
			} catch {
				stored = initialSyncInfo;
			}
		}
	}

	const store = writable<DataSyncInfo>(stored);

	if (browser) {
		store.subscribe((value) => {
			localStorage.setItem('sync-info', JSON.stringify(value));
		});
	}

	return store;
})();

export const filters = createIndexedDBStore<Filters>('fungi-filters', 'filters', {
	location: '',
	capColor: '',
	sporePrintColor: '',
	identificationStatus: '',
	isAbnormal: null,
	riskLevel: '',
	createdBy: '',
	dateFrom: '',
	dateTo: ''
});

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function hasPermission(user: User | null, permission: string): boolean {
	if (!user) return permission === 'read';
	const role = user.role;
	const permissions: Record<UserRole, string[]> = {
		guest: ['read'],
		user: ['read', 'create', 'edit_own'],
		identifier: ['read', 'create', 'edit_own', 'edit_any', 'identify'],
		admin: ['read', 'create', 'edit_any', 'delete', 'identify', 'manage_users']
	};
	return permissions[role]?.includes(permission) || false;
}

export function canEditSample(user: User | null, sample: FungiSample): boolean {
	if (!user) return false;
	if (hasPermission(user, 'edit_any')) return true;
	if (hasPermission(user, 'edit_own') && sample.createdBy === user.id) return true;
	return false;
}

export function validateSample(
	sample: Partial<FungiSample>,
	existingSamples: FungiSample[],
	excludeId?: string
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!sample.sampleNumber) {
		errors.push('样本编号不能为空');
	} else {
		const duplicate = existingSamples.find(
			(s) => s.sampleNumber === sample.sampleNumber && s.id !== excludeId
		);
		if (duplicate) {
			errors.push('样本编号已存在，不能重复');
		}
	}

	if (!sample.collectionDate) {
		errors.push('采集日期不能为空');
	} else {
		const collectionDate = new Date(sample.collectionDate);
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		if (collectionDate > today) {
			errors.push('采集日期不能晚于当前日期');
		}
	}

	if (!sample.location) {
		errors.push('采集地点不能为空');
	}

	if (sample.latitude !== null && sample.latitude !== undefined) {
		const lat = Number(sample.latitude);
		if (isNaN(lat) || lat < -90 || lat > 90) {
			errors.push('纬度必须在 -90 到 90 之间');
		}
	}

	if (sample.longitude !== null && sample.longitude !== undefined) {
		const lng = Number(sample.longitude);
		if (isNaN(lng) || lng < -180 || lng > 180) {
			errors.push('经度必须在 -180 到 180 之间');
		}
	}

	const hasLat = sample.latitude !== null && sample.latitude !== undefined;
	const hasLng = sample.longitude !== null && sample.longitude !== undefined;
	if (hasLat !== hasLng) {
		errors.push('经纬度必须同时填写或同时为空');
	}

	if (!sample.habitatType) {
		errors.push('生境类型不能为空');
	}

	if (!sample.capColor) {
		errors.push('菌盖颜色不能为空');
	}

	if (sample.identificationStatus === 'identified') {
		if (!sample.identificationEvidences || sample.identificationEvidences.length === 0) {
			errors.push('已鉴定的样本必须填写鉴定依据');
		}
		if (!sample.hasSporePrint) {
			errors.push('未完成孢子印记录的样本不能标记为已鉴定');
		}
	}

	return { valid: errors.length === 0, errors };
}

export function exportToCSV(samplesData: FungiSample[]): string {
	const headers = [
		'样本编号',
		'采集日期',
		'采集地点',
		'纬度',
		'经度',
		'生境类型',
		'菌盖颜色',
		'孢子印颜色',
		'疑似物种',
		'鉴定状态',
		'风险等级',
		'创建者',
		'创建时间'
	];

	const rows = samplesData.map((s) => [
		s.sampleNumber,
		s.collectionDate,
		s.location,
		s.latitude || '',
		s.longitude || '',
		s.habitatType,
		s.capColor,
		s.sporePrintColor || '',
		s.suspectedSpecies || '',
		s.identificationStatus,
		s.riskLevel,
		s.createdBy,
		s.createdAt
	]);

	return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

export function exportToJSON(data: unknown): string {
	return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
	if (!browser) return;
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export function generateShareToken(
	sampleIds: string,
	expireDays: number = 7,
	allowDownload: boolean = true
): string {
	const token = btoa(`${sampleIds}:${Date.now()}`).replace(/=/g, '');
	const shareData = {
		sampleIds: sampleIds.split(','),
		config: {
			allowDownload,
			expiresAt: expireDays > 0 ? new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000).toISOString() : null
		},
		createdAt: new Date().toISOString()
	};
	if (browser) {
		localStorage.setItem(`share-${token}`, JSON.stringify(shareData));
	}
	return token;
}

export function getShareData(token: string): {
	samples: FungiSample[];
	config: { allowDownload: boolean; expiresAt: string | null };
} | null {
	if (!browser) return null;
	const shareDataStr = localStorage.getItem(`share-${token}`);
	if (!shareDataStr) return null;

	try {
		const shareData = JSON.parse(shareDataStr);
		const currentSamples = get(samples);
		const sharedSamples = currentSamples.filter((s) => shareData.sampleIds.includes(s.id));
		return {
			samples: sharedSamples,
			config: shareData.config
		};
	} catch {
		return null;
	}
}

export function getSeason(date: string): string {
	const month = new Date(date).getMonth() + 1;
	if (month >= 3 && month <= 5) return '春季';
	if (month >= 6 && month <= 8) return '夏季';
	if (month >= 9 && month <= 11) return '秋季';
	return '冬季';
}

export async function importData(data: {
	samples?: FungiSample[];
	species?: Species[];
}): Promise<{ imported: number; conflicts: string[] }> {
	const imported: string[] = [];
	const conflicts: string[] = [];

	if (data.samples && Array.isArray(data.samples)) {
		const currentSamples = get(samples);
		const newSamples = [...currentSamples];

		for (const sample of data.samples) {
			const exists = currentSamples.find((s) => s.id === sample.id);
			if (exists) {
				conflicts.push(`样本 ${sample.sampleNumber || sample.id} 已存在`);
			} else {
				newSamples.push(sample);
				imported.push(sample.id);
			}
		}

		samples.set(newSamples);
		await samples.saveToDB(newSamples);
	}

	if (data.species && Array.isArray(data.species)) {
		const currentSpecies = get(species);
		const newSpecies = [...currentSpecies];

		for (const sp of data.species) {
			const exists = currentSpecies.find((s) => s.id === sp.id);
			if (!exists) {
				newSpecies.push(sp);
			}
		}

		if (newSpecies.length !== currentSpecies.length) {
			species.set(newSpecies);
			await species.saveToDB(newSpecies);
		}
	}

	return { imported: imported.length, conflicts };
}

export async function deleteSample(id: string): Promise<void> {
	const currentSamples = get(samples);
	const newSamples = currentSamples.filter((s) => s.id !== id);
	samples.set(newSamples);
	await samples.saveToDB(newSamples);
	await dbDelete('samples', id);
}

export async function deleteSpecies(id: string): Promise<void> {
	const currentSpecies = get(species);
	const newSpecies = currentSpecies.filter((s) => s.id !== id);
	species.set(newSpecies);
	await species.saveToDB(newSpecies);
	await dbDelete('species', id);
}

export async function deleteUser(id: string): Promise<void> {
	const currentUsers = get(users);
	const newUsers = currentUsers.filter((u) => u.id !== id);
	users.set(newUsers);
	await users.saveToDB(newUsers);
	await dbDelete('users', id);
}

export async function initData() {
	if (!browser) return;

	try {
		await samples.loadFromDB();
		await species.loadFromDB();
		await users.loadFromDB();

		const currentSpecies = get(species);
		if (currentSpecies.length === 0) {
			species.set(defaultSpecies);
			await species.saveToDB(defaultSpecies);
		}

		const currentUsers = get(users);
		if (currentUsers.length === 0) {
			users.set(defaultUsers);
			await users.saveToDB(defaultUsers);
		}

		const user = get(currentUser);
		if (!user) {
			const guestUser = defaultUsers.find((u) => u.id === 'guest');
			if (guestUser) {
				currentUser.set(guestUser);
			}
		}
	} catch (e) {
		console.error('Failed to initialize data:', e);
	}
}

export async function syncData() {
	if (!browser) return;

	try {
		await samples.saveToDB(get(samples));
		await species.saveToDB(get(species));
		await users.saveToDB(get(users));

		syncInfo.update((info) => ({
			...info,
			lastSyncAt: new Date().toISOString(),
			version: info.version + 1,
			pendingChanges: []
		}));
	} catch (e) {
		console.error('Sync failed:', e);
	}
}

const TOXIC_SPECIES_DATABASE: Record<string, SimilarSpecies[]> = {
	default: [
		{
			name: '白毒伞',
			riskLevel: 'high',
			description: '极毒蘑菇，含有毒伞肽，致死率极高',
			distinguishingFeatures: ['纯白色菌盖', '具有菌环和菌托', '菌托杯状明显']
		},
		{
			name: '毒蝇伞',
			riskLevel: 'medium',
			description: '具有致幻作用的有毒蘑菇',
			distinguishingFeatures: ['红色菌盖带白色鳞片', '菌环明显', '菌托呈杯状']
		},
		{
			name: '毒粉褶菌',
			riskLevel: 'high',
			description: '含有胃肠道刺激毒素',
			distinguishingFeatures: ['粉红色菌褶', '无菌环和菌托', '菌盖呈灰褐色']
		}
	],
	森林: [
		{
			name: '鳞柄白毒伞',
			riskLevel: 'high',
			description: '剧毒，与多种树木共生',
			distinguishingFeatures: ['白色菌盖带鳞片', '柄上有鳞片', '具有明显菌托']
		}
	],
	草地: [
		{
			name: '鬼笔鹅膏',
			riskLevel: 'high',
			description: '剧毒，常出现在草地上',
			distinguishingFeatures: ['绿色菌盖', '白色菌褶', '具有菌环和菌托']
		}
	]
};

function generateEdibleRiskWarning(sample: FungiSample, speciesList: Species[]): EdibleRiskWarning {
	const suspected = sample.suspectedSpecies?.toLowerCase() || '';
	const matchedSpecies = speciesList.find((s) => s.name.toLowerCase().includes(suspected) || suspected.includes(s.name.toLowerCase()));

	const reasons: string[] = [];
	let level: EdibleRiskWarning['level'] = 'unknown';
	let title = '食用风险未知';
	let description = '由于物种信息不足，无法准确评估食用风险。请务必谨慎，切勿食用不确定的野生菌。';

	if (sample.riskLevel === 'high') {
		level = 'danger';
		title = '高度危险 - 严禁食用';
		description = '该样本具有极高的毒性风险，绝对不能食用，误食可能导致严重中毒甚至死亡。';
		reasons.push('样本风险等级被评定为高风险');
	} else if (sample.riskLevel === 'medium') {
		level = 'caution';
		title = '中等风险 - 谨慎处理';
		description = '该样本存在一定毒性风险，需特别注意鉴别，不建议食用。';
		reasons.push('样本风险等级被评定为中风险');
	} else if (matchedSpecies) {
		if (matchedSpecies.isPoisonous) {
			level = matchedSpecies.riskLevel === 'high' ? 'danger' : 'caution';
			title = matchedSpecies.riskLevel === 'high' ? '高度危险 - 严禁食用' : '有毒风险 - 避免食用';
			description = matchedSpecies.description;
			reasons.push(`疑似物种"${matchedSpecies.name}"被标记为有毒`);
		} else {
			level = 'safe';
			title = '低风险 - 可谨慎食用';
			description = '根据现有信息，该物种被认为是可食用的，但仍需确保正确鉴别。';
			reasons.push(`疑似物种"${matchedSpecies.name}"被标记为可食用`);
		}
	}

	if (!sample.suspectedSpecies || sample.identificationStatus !== 'identified') {
		if (level === 'safe') {
			level = 'caution';
			title = '需进一步确认 - 建议谨慎';
		}
		reasons.push('样本未完成正式鉴定');
	}

	if (sample.riskConfirmed) {
		reasons.push('风险状态已由专业人员确认');
	} else {
		reasons.push('风险状态尚未经过专业确认');
	}

	return { level, title, description, reasons };
}

function generateHandlingAdvice(sample: FungiSample): HandlingAdvice {
	const isHighRisk = sample.riskLevel === 'high';
	const isMediumRisk = sample.riskLevel === 'medium';

	const contactSafety: string[] = [
		'处理蘑菇时务必佩戴一次性手套',
		'避免蘑菇汁液接触皮肤和黏膜',
		'处理后立即用肥皂彻底洗手'
	];

	if (isHighRisk) {
		contactSafety.push('高风险样本：避免直接接触，建议使用双层手套');
		contactSafety.push('处理区域需进行消毒处理');
	}

	const storageAdvice: string[] = [
		'样本应单独存放，与食物隔离',
		'冷藏保存可延长保存时间',
		'标注明确的"样本 - 不可食用"警示',
		'存放于儿童和宠物无法触及的地方'
	];

	if (isHighRisk || isMediumRisk) {
		storageAdvice.push('有毒样本建议密封包装后存放');
	}

	const disposalAdvice: string[] = [
		'废弃样本应妥善包装后丢弃',
		'避免随意丢弃在自然环境中',
		'不可作为动物饲料'
	];

	if (isHighRisk) {
		disposalAdvice.push('高风险样本建议焚烧或交由专业机构处理');
	}

	const emergencySteps: string[] = [
		'如误食，立即拨打急救电话',
		'保留剩余蘑菇样本供医生鉴定',
		'记录误食时间和症状',
		'尽快就医，告知医生食用蘑菇史'
	];

	return { contactSafety, storageAdvice, disposalAdvice, emergencySteps };
}

function generateToxicSpeciesWarning(sample: FungiSample, speciesList: Species[]): ToxicSpeciesWarning {
	const habitatKey = TOXIC_SPECIES_DATABASE[sample.habitatType] ? sample.habitatType : 'default';
	const similarSpecies: SimilarSpecies[] = [...TOXIC_SPECIES_DATABASE.default];

	if (habitatKey !== 'default') {
		similarSpecies.push(...TOXIC_SPECIES_DATABASE[habitatKey]);
	}

	const suspected = sample.suspectedSpecies?.toLowerCase() || '';
	const filteredSpecies = similarSpecies.filter(
		(s) => !suspected || s.name.toLowerCase().includes(suspected) || suspected.includes(s.name.toLowerCase()) || Math.random() > 0.5
	);

	const keyDifferences: string[] = [
		'注意观察是否有菌环和菌托：大多数剧毒蘑菇都有这两个特征',
		'检查菌盖颜色和鳞片：毒蘑菇常有鲜艳颜色或明显鳞片',
		'闻气味：有毒蘑菇常伴有异味或刺激气味',
		'观察受伤后颜色变化：部分毒蘑菇受伤后会变色'
	];

	const season = getSeason(sample.collectionDate);
	const seasonalWarning = `当前采集季节为${season}，${season === '夏季' || season === '秋季' ? '这是毒蘑菇高发季节，需特别警惕' : '仍需注意鉴别，不可大意'}`;

	const habitatWarnings: Record<string, string> = {
		森林: '森林环境中毒蘑菇种类繁多，尤其注意与树木共生的菌类',
		草地: '草地中的蘑菇可能含有毒成分，注意与可食用品种的区分',
		公园: '公园环境复杂，可能有不明菌种，谨慎采集',
		庭院: '庭院中的蘑菇可能受土壤影响，不建议食用',
		路边: '路边蘑菇可能受汽车尾气和重金属污染',
		山地: '山地环境物种丰富，毒蘑菇种类多，需专业鉴别',
		湿地: '湿地环境潮湿，适合有毒菌类生长',
		其他: '该生境类型的菌类信息有限，建议谨慎处理'
	};

	const habitatWarning = habitatWarnings[sample.habitatType] || habitatWarnings.其他;

	return {
		similarSpecies: filteredSpecies.slice(0, 3),
		keyDifferences,
		seasonalWarning,
		habitatWarning
	};
}

function generateObservationAdvice(sample: FungiSample): ObservationAdvice {
	const additionalChecks: string[] = [
		'建议采集孢子印辅助鉴定',
		'记录完整的生境信息：土壤类型、伴生植物等',
		'拍摄多个角度的清晰照片',
		'记录气味、触感等感官特征'
	];

	if (!sample.hasSporePrint) {
		additionalChecks.unshift('重要：尚未采集孢子印，建议尽快完成');
	}

	if (sample.identificationEvidences.length < 2) {
		additionalChecks.push('鉴定证据不足，建议补充更多形态描述');
	}

	const identificationTips: string[] = [
		'使用图鉴对照时，务必比对所有特征，不可只看单一特征',
		'注意区分相似种的微小差异',
		'不同生长阶段形态可能有变化',
		'建议使用多个可靠来源进行交叉验证'
	];

	let expertRecommendation = '建议咨询专业真菌学家或蘑菇鉴定机构进行最终确认';
	if (sample.riskLevel === 'high') {
		expertRecommendation = '高风险样本强烈建议由专业鉴定机构复核，切勿自行判断';
	} else if (sample.identificationStatus === 'identified') {
		expertRecommendation = '虽然已完成鉴定，如有条件建议进行专家复核，确保食用安全';
	}

	const followUpSteps: string[] = [
		'持续观察样本特征变化',
		'与同类样本进行对比分析',
		'记录详细的采集和观察笔记',
		'如有需要，可进行显微观察'
	];

	return { additionalChecks, identificationTips, expertRecommendation, followUpSteps };
}

export function generateWarningReport(sample: FungiSample, speciesList: Species[]): WarningReport {
	return {
		id: generateId(),
		sampleId: sample.id,
		generatedAt: new Date().toISOString(),
		suspectedSpecies: sample.suspectedSpecies,
		riskLevel: sample.riskLevel,
		collectionSeason: getSeason(sample.collectionDate),
		habitatType: sample.habitatType,
		edibleRisk: generateEdibleRiskWarning(sample, speciesList),
		handlingAdvice: generateHandlingAdvice(sample),
		toxicSpeciesWarning: generateToxicSpeciesWarning(sample, speciesList),
		observationAdvice: generateObservationAdvice(sample)
	};
}

export function exportWarningReportToHTML(report: WarningReport, sample: FungiSample): string {
	const riskColors: Record<string, string> = {
		danger: '#dc2626',
		caution: '#d97706',
		safe: '#059669',
		unknown: '#6b7280'
	};

	const riskLabels: Record<string, string> = {
		danger: '高度危险',
		caution: '中等风险',
		safe: '低风险',
		unknown: '风险未知'
	};

	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>真菌安全预警报告 - ${sample.sampleNumber}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #1f2937; margin-top: 24px; border-left: 4px solid #3b82f6; padding-left: 12px; }
        h3 { color: #374151; margin-top: 16px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f3f4f6; padding: 16px; border-radius: 8px; }
        .info-item { display: flex; flex-direction: column; }
        .info-label { font-size: 12px; color: #6b7280; }
        .info-value { font-weight: 500; }
        .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: 500; }
        .section { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 12px; }
        ul { margin: 8px 0; padding-left: 20px; }
        li { margin: 6px 0; }
        .species-card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin: 8px 0; }
        .high-risk { background: #fef2f2; border-color: #fecaca; }
        .medium-risk { background: #fffbeb; border-color: #fde68a; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
    <h1>🍄 真菌安全预警报告</h1>
    
    <div class="info-grid">
        <div class="info-item"><span class="info-label">样本编号</span><span class="info-value">${sample.sampleNumber}</span></div>
        <div class="info-item"><span class="info-label">疑似物种</span><span class="info-value">${sample.suspectedSpecies || '未鉴定'}</span></div>
        <div class="info-item"><span class="info-label">采集日期</span><span class="info-value">${sample.collectionDate}</span></div>
        <div class="info-item"><span class="info-label">采集季节</span><span class="info-value">${report.collectionSeason}</span></div>
        <div class="info-item"><span class="info-label">采集地点</span><span class="info-value">${sample.location}</span></div>
        <div class="info-item"><span class="info-label">生境类型</span><span class="info-value">${sample.habitatType}</span></div>
        <div class="info-item" style="grid-column: span 2;">
            <span class="info-label">食用风险评估</span>
            <span class="risk-badge" style="background-color: ${riskColors[report.edibleRisk.level]};">${riskLabels[report.edibleRisk.level]}</span>
        </div>
    </div>

    <h2>⚠️ 食用风险提示</h2>
    <div class="section">
        <h3>${report.edibleRisk.title}</h3>
        <p>${report.edibleRisk.description}</p>
        <h4>评估依据：</h4>
        <ul>
            ${report.edibleRisk.reasons.map((r) => `<li>${r}</li>`).join('')}
        </ul>
    </div>

    <h2>🧤 接触与处理建议</h2>
    <div class="section">
        <h3>接触安全</h3>
        <ul>${report.handlingAdvice.contactSafety.map((s) => `<li>${s}</li>`).join('')}</ul>
        <h3>存储建议</h3>
        <ul>${report.handlingAdvice.storageAdvice.map((s) => `<li>${s}</li>`).join('')}</ul>
        <h3>废弃处理</h3>
        <ul>${report.handlingAdvice.disposalAdvice.map((s) => `<li>${s}</li>`).join('')}</ul>
        <h3>应急措施</h3>
        <ul>${report.handlingAdvice.emergencySteps.map((s) => `<li>${s}</li>`).join('')}</ul>
    </div>

    <h2>☠️ 相似有毒种预警</h2>
    <div class="section">
        <p><strong>季节预警：</strong>${report.toxicSpeciesWarning.seasonalWarning}</p>
        <p><strong>生境预警：</strong>${report.toxicSpeciesWarning.habitatWarning}</p>
        <h3>需警惕的相似有毒种：</h3>
        ${report.toxicSpeciesWarning.similarSpecies
					.map(
						(s) => `
            <div class="species-card ${s.riskLevel === 'high' ? 'high-risk' : s.riskLevel === 'medium' ? 'medium-risk' : ''}">
                <h4>${s.name} <span class="risk-badge" style="background-color: ${s.riskLevel === 'high' ? '#dc2626' : '#d97706'}; font-size: 12px;">${s.riskLevel === 'high' ? '高毒' : '有毒'}</span></h4>
                <p>${s.description}</p>
                <p><strong>鉴别要点：</strong>${s.distinguishingFeatures.join('；')}</p>
            </div>
        `
					)
					.join('')}
        <h3>关键鉴别要点：</h3>
        <ul>${report.toxicSpeciesWarning.keyDifferences.map((d) => `<li>${d}</li>`).join('')}</ul>
    </div>

    <h2>🔍 观察补充建议</h2>
    <div class="section">
        <h3>建议补充检查：</h3>
        <ul>${report.observationAdvice.additionalChecks.map((c) => `<li>${c}</li>`).join('')}</ul>
        <h3>鉴定技巧：</h3>
        <ul>${report.observationAdvice.identificationTips.map((t) => `<li>${t}</li>`).join('')}</ul>
        <h3>专家建议：</h3>
        <p>${report.observationAdvice.expertRecommendation}</p>
        <h3>后续步骤：</h3>
        <ul>${report.observationAdvice.followUpSteps.map((s) => `<li>${s}</li>`).join('')}</ul>
    </div>

    <div class="footer">
        <p>报告生成时间：${new Date(report.generatedAt).toLocaleString('zh-CN')}</p>
        <p>⚠️ 本报告仅供参考，不能替代专业鉴定。食用野生菌存在风险，请务必谨慎。</p>
    </div>
</body>
</html>`;
}

export function downloadWarningReport(report: WarningReport, sample: FungiSample) {
	const html = exportWarningReportToHTML(report, sample);
	const filename = `预警报告-${sample.sampleNumber}-${new Date().toISOString().split('T')[0]}.html`;
	downloadFile(html, filename, 'text/html');
}
