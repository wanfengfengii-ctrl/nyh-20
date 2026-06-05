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
	SimilarSpecies,
	RiskAssessment,
	RiskFactor,
	SimilarSpeciesComparison,
	SpeciesComparison,
	EmergencyGuidance,
	EmergencyScenario,
	WarningHistory,
	Collaborator,
	ShareRecord,
	CompleteRiskReport,
	ReportSummary
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
		(s) => !suspected || s.name.toLowerCase().includes(suspected) || suspected.includes(s.name.toLowerCase())
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

function createSimpleStore<T>(key: string, initialValue: T): Writable<T> {
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

	return store;
}

export const warningHistory = createSimpleStore<WarningHistory[]>('warning-history', []);
export const shareRecords = createSimpleStore<ShareRecord[]>('share-records', []);

export function assessRisk(sample: FungiSample, speciesList: Species[]): RiskAssessment {
	const factors: RiskFactor[] = [];
	let totalScore = 0;
	let totalWeight = 0;

	if (sample.riskLevel === 'high') {
		factors.push({
			name: '风险等级标记',
			weight: 30,
			description: '样本已被标记为高风险',
			contribution: 'negative'
		});
		totalScore += 30;
	} else if (sample.riskLevel === 'medium') {
		factors.push({
			name: '风险等级标记',
			weight: 15,
			description: '样本已被标记为中风险',
			contribution: 'negative'
		});
		totalScore += 15;
	}
	totalWeight += 30;

	const suspected = sample.suspectedSpecies?.toLowerCase() || '';
	const matchedSpecies = speciesList.find(
		(s) => s.name.toLowerCase().includes(suspected) || suspected.includes(s.name.toLowerCase())
	);

	if (matchedSpecies) {
		if (matchedSpecies.isPoisonous) {
			const weight = matchedSpecies.riskLevel === 'high' ? 35 : 20;
			factors.push({
				name: '物种毒性',
				weight,
				description: `疑似物种"${matchedSpecies.name}"${matchedSpecies.riskLevel === 'high' ? '剧毒' : '有毒'}`,
				contribution: 'negative'
			});
			totalScore += weight;
		} else {
			factors.push({
				name: '物种毒性',
				weight: 10,
				description: `疑似物种"${matchedSpecies.name}"被标记为可食用`,
				contribution: 'positive'
			});
			totalScore -= 5;
		}
		totalWeight += 35;
	} else {
		factors.push({
			name: '物种不确定性',
			weight: 20,
			description: '未匹配到已知物种，风险未知',
			contribution: 'negative'
		});
		totalScore += 15;
		totalWeight += 20;
	}

	if (sample.identificationStatus !== 'identified') {
		factors.push({
			name: '鉴定状态',
			weight: 15,
			description: '样本未完成正式鉴定',
			contribution: 'negative'
		});
		totalScore += 10;
		totalWeight += 15;
	}

	const habitatRisks: Record<string, number> = {
		森林: 15,
		山地: 15,
		湿地: 12,
		草地: 10,
		公园: 8,
		庭院: 5,
		路边: 20,
		其他: 10
	};
	const habitatRisk = habitatRisks[sample.habitatType] || 10;
	factors.push({
		name: '生境风险',
		weight: 15,
		description: `${sample.habitatType}环境的野生菌风险指数`,
		contribution: habitatRisk > 12 ? 'negative' : 'positive'
	});
	totalScore += habitatRisk * 0.5;
	totalWeight += 15;

	if (sample.isAbnormal) {
		factors.push({
			name: '异常标记',
			weight: 20,
			description: '样本被标记为异常，需特别注意',
			contribution: 'negative'
		});
		totalScore += 15;
		totalWeight += 20;
	}

	const season = getSeason(sample.collectionDate);
	if (season === '夏季' || season === '秋季') {
		factors.push({
			name: '季节因素',
			weight: 10,
			description: `${season}是毒蘑菇高发季节`,
			contribution: 'negative'
		});
		totalScore += 8;
		totalWeight += 10;
	}

	const finalScore = Math.min(100, Math.max(0, Math.round((totalScore / Math.max(totalWeight, 1)) * 100)));

	let riskLevel: RiskAssessment['riskLevel'] = 'low';
	if (finalScore >= 86) riskLevel = 'critical';
	else if (finalScore >= 61) riskLevel = 'high';
	else if (finalScore >= 31) riskLevel = 'medium';

	const recommendations: Record<string, string> = {
		low: '风险较低，但仍需谨慎鉴别，确认无误后方可食用。',
		medium: '存在一定风险，建议由专业人员复核，不建议自行食用。',
		high: '风险较高，强烈建议不要食用，交由专业机构处理。',
		critical: '极高风险！严禁食用，如已接触请立即采取应急措施。'
	};

	return {
		id: generateId(),
		sampleId: sample.id,
		assessedAt: new Date().toISOString(),
		assessedBy: get(currentUser)?.id || null,
		riskLevel,
		riskScore: finalScore,
		confidence: matchedSpecies ? 85 : 60,
		factors,
		recommendation: recommendations[riskLevel]
	};
}

export function generateSimilarSpeciesComparison(
	sample: FungiSample,
	speciesList: Species[]
): SimilarSpeciesComparison {
	const targetName = sample.suspectedSpecies || '未知物种';
	const similarSpecies: SpeciesComparison[] = [];

	const poisonousSpecies = speciesList.filter((s) => s.isPoisonous);

	for (const sp of poisonousSpecies.slice(0, 5)) {
		const similarityScore = calculateSimilarity(sample, sp);
		if (similarityScore >= 30) {
			const keyDifferences = generateComparisonDifferences(sample, sp);
			similarSpecies.push({
				species: sp,
				similarityScore,
				keyDifferences,
				riskComparison: {
					targetRisk: sample.riskLevel,
					comparedRisk: sp.riskLevel,
					notes: sp.riskLevel === 'high' ? '该物种剧毒，需特别警惕！' : '该物种有毒，注意鉴别。'
				}
			});
		}
	}

	similarSpecies.sort((a, b) => b.similarityScore - a.similarityScore);

	return {
		id: generateId(),
		targetSpecies: targetName,
		similarSpecies: similarSpecies.slice(0, 3),
		generatedAt: new Date().toISOString()
	};
}

function calculateSimilarity(sample: FungiSample, species: Species): number {
	let score = 0;
	const sampleHabitat = sample.habitatType;
	if (species.commonLocations.some((loc) => loc.includes(sampleHabitat) || sampleHabitat.includes(loc))) {
		score += 25;
	}

	const season = getSeason(sample.collectionDate);
	if (species.seasonality.includes(season)) {
		score += 25;
	}

	const suspected = sample.suspectedSpecies?.toLowerCase() || '';
	const spName = species.name.toLowerCase();
	if (suspected && (spName.includes(suspected) || suspected.includes(spName))) {
		score += 40;
	}

	if (sample.capColor && species.description.includes(sample.capColor)) {
		score += 10;
	}

	return Math.min(100, score);
}

function generateComparisonDifferences(
	sample: FungiSample,
	species: Species
): SpeciesComparison['keyDifferences'] {
	return [
		{
			feature: '菌盖颜色',
			targetValue: sample.capColor || '未知',
			comparedValue: species.identificationKeys[0] || '查看详情',
			differenceLevel: 'moderate'
		},
		{
			feature: '生境类型',
			targetValue: sample.habitatType,
			comparedValue: species.commonLocations.join('、'),
			differenceLevel: sample.habitatType && species.commonLocations.includes(sample.habitatType) ? 'minor' : 'major'
		},
		{
			feature: '季节分布',
			targetValue: getSeason(sample.collectionDate),
			comparedValue: species.seasonality.join('、'),
			differenceLevel: species.seasonality.includes(getSeason(sample.collectionDate)) ? 'minor' : 'moderate'
		},
		{
			feature: '鉴别要点',
			targetValue: sample.identificationEvidences.length > 0 ? '有鉴定记录' : '无详细记录',
			comparedValue: species.identificationKeys.slice(0, 2).join('；'),
			differenceLevel: 'major'
		}
	];
}

const EMERGENCY_GUIDANCE_DATABASE: Record<EmergencyScenario, Omit<EmergencyGuidance, 'id'>> = {
	contact: {
		scenario: 'contact',
		scenarioLabel: '皮肤接触',
		severity: 'medium',
		title: '毒蘑菇皮肤接触应急处理指引',
		description: '某些毒蘑菇的汁液可能引起皮肤过敏、瘙痒、红肿等反应。',
		immediateActions: [
			'立即用大量清水冲洗接触部位至少15分钟',
			'避免用手揉眼睛、鼻子或嘴巴',
			'如果有蘑菇汁液残留，用肥皂轻轻清洗',
			'不要抓挠受影响的皮肤区域'
		],
		firstAid: [
			'如有红肿，可用冷敷缓解症状',
			'可涂抹温和的抗过敏药膏',
			'保持皮肤清洁干燥',
			'穿宽松透气的衣物'
		],
		medicalAttention: [
			'如果出现严重红肿、水泡或疼痛加剧',
			'如果症状在24小时内没有改善',
			'如果接触部位是眼睛或黏膜',
			'如果出现全身过敏反应如呼吸困难'
		],
		preventionTips: [
			'采集和处理蘑菇时务必佩戴一次性手套',
			'避免让蘑菇汁液接触破损皮肤',
			'处理后彻底清洗双手和工具',
			'儿童应在成人监护下接触蘑菇'
		],
		relatedSpecies: ['白毒伞', '毒蝇伞', '毒粉褶菌']
	},
	ingestion: {
		scenario: 'ingestion',
		scenarioLabel: '误食中毒',
		severity: 'critical',
		title: '毒蘑菇误食中毒应急处理指引',
		description: '误食毒蘑菇可能导致严重中毒，甚至危及生命，必须立即采取行动。',
		immediateActions: [
			'立即拨打急救电话120',
			'保留剩余的蘑菇样本（非常重要！）',
			'如果患者清醒，可尝试催吐（注意：昏迷者禁止催吐）',
			'记录食用时间、食用量和症状',
			'让患者保持侧卧姿势，防止呕吐物窒息'
		],
		firstAid: [
			'给清醒患者饮用大量温水或淡盐水',
			'可服用活性炭吸附毒素（需遵医嘱）',
			'不要给昏迷患者喂食任何东西',
			'监测患者的意识和呼吸状态'
		],
		medicalAttention: [
			'立即送医院救治，切勿拖延！',
			'携带剩余蘑菇样本供医生鉴定',
			'告知医生食用蘑菇的详细情况',
			'如果多人同时食用，全部人员都应就医检查'
		],
		preventionTips: [
			'绝对不要食用不确定的野生菌',
			'不采集形态特征不明显的幼菇',
			'不采集过于成熟或腐烂的蘑菇',
			'食用野生菌应彻底煮熟，不生吃',
			'不同种类的野生菌分开烹饪'
		],
		relatedSpecies: ['白毒伞', '鳞柄白毒伞', '鬼笔鹅膏', '毒粉褶菌']
	},
	inhalation: {
		scenario: 'inhalation',
		scenarioLabel: '孢子吸入',
		severity: 'medium',
		title: '蘑菇孢子吸入应急处理指引',
		description: '某些蘑菇的孢子可能引起呼吸道过敏或肺部不适。',
		immediateActions: [
			'立即转移到空气新鲜的地方',
			'保持呼吸道通畅',
			'如果佩戴口罩，更换新的口罩',
			'用清水漱口和清洗鼻腔'
		],
		firstAid: [
			'如有咳嗽，可饮用温水缓解',
			'保持休息，避免剧烈活动',
			'室内保持通风',
			'如有必要可使用加湿器'
		],
		medicalAttention: [
			'如果出现呼吸困难或胸闷',
			'如果有哮喘发作的迹象',
			'如果咳嗽持续超过24小时',
			'如果出现发热或其他全身症状'
		],
		preventionTips: [
			'在孢子密集环境下佩戴口罩',
			'避免近距离嗅闻陌生蘑菇',
			'室内处理蘑菇时保持通风',
			'过敏体质者特别注意防护'
		],
		relatedSpecies: ['马勃类', '多孔菌', '大型伞菌']
	},
	mixedStorage: {
		scenario: 'mixedStorage',
		scenarioLabel: '混放污染',
		severity: 'high',
		title: '蘑菇混放污染应急处理指引',
		description: '有毒蘑菇与可食用蘑菇混放可能造成交叉污染，增加误食风险。',
		immediateActions: [
			'立即将可疑蘑菇与其他蘑菇分开',
			'清理接触过可疑蘑菇的容器和工具',
			'标记可疑样本，禁止食用',
			'检查是否有误食情况'
		],
		firstAid: [
			'用清洁剂彻底清洗受污染的容器',
			'用热水消毒接触过的刀具和砧板',
			'可疑蘑菇单独密封存放并标记警示',
			'如已食用混放蘑菇，按误食处理'
		],
		medicalAttention: [
			'如果有人误食混放的蘑菇',
			'如果出现任何不适症状',
			'如果无法确定哪些蘑菇被污染',
			'如果有高风险蘑菇混入'
		],
		preventionTips: [
			'不同种类蘑菇分开存放',
			'每个容器标注蘑菇种类和采集信息',
			'可疑蘑菇单独存放并做明显标记',
			'储存区域保持清洁和干燥',
			'定期检查储存的蘑菇状态'
		],
		relatedSpecies: ['所有有毒种类']
	},
	crossContamination: {
		scenario: 'crossContamination',
		scenarioLabel: '交叉污染',
		severity: 'high',
		title: '厨房交叉污染应急处理指引',
		description: '处理毒蘑菇的工具与食物加工工具混用可能造成交叉污染。',
		immediateActions: [
			'立即停止使用受污染的工具',
			'隔离可能受污染的食物',
			'标记污染区域和物品',
			'检查是否有误食情况'
		],
		firstAid: [
			'用热水和洗涤剂反复清洗受污染的厨具',
			'砧板可用漂白剂溶液消毒（1:9比例）',
			'受污染的食物建议丢弃，不要冒险食用',
			'双手用肥皂彻底清洗至少20秒'
		],
		medicalAttention: [
			'如果有人食用了可能受污染的食物',
			'如果出现任何中毒症状',
			'如果高毒蘑菇造成的污染',
			'如果不确定污染程度'
		],
		preventionTips: [
			'处理野生菌使用专用工具和砧板',
			'野生菌和日常食材分开处理',
			'处理完可疑蘑菇后彻底清洁和消毒',
			'厨房保持良好的卫生习惯',
			'加工野生菌时避免同时准备其他食物'
		],
		relatedSpecies: ['所有有毒种类']
	}
};

export function getEmergencyGuidance(scenario: EmergencyScenario): EmergencyGuidance {
	const guidance = EMERGENCY_GUIDANCE_DATABASE[scenario];
	return {
		...guidance,
		id: generateId()
	};
}

export function getAllEmergencyGuidance(): EmergencyGuidance[] {
	return Object.keys(EMERGENCY_GUIDANCE_DATABASE).map((key) =>
		getEmergencyGuidance(key as EmergencyScenario)
	);
}

export function getRelevantEmergencyGuidance(
	sample: FungiSample,
	speciesList: Species[]
): EmergencyGuidance[] {
	const relevantScenarios: EmergencyScenario[] = ['ingestion', 'contact'];
	const matchedSpecies = speciesList.find(
		(s) =>
			s.name.toLowerCase().includes(sample.suspectedSpecies?.toLowerCase() || '') ||
			sample.suspectedSpecies?.toLowerCase().includes(s.name.toLowerCase())
	);

	if (matchedSpecies?.riskLevel === 'high') {
		relevantScenarios.push('mixedStorage', 'crossContamination');
	}

	return relevantScenarios.map((s) => getEmergencyGuidance(s));
}

export function addWarningHistory(
	sample: FungiSample,
	report: WarningReport,
	reportType: WarningHistory['reportType'] = 'single'
): WarningHistory {
	const historyItem: WarningHistory = {
		id: generateId(),
		sampleId: sample.id,
		sampleNumber: sample.sampleNumber,
		suspectedSpecies: sample.suspectedSpecies,
		generatedAt: new Date().toISOString(),
		generatedBy: get(currentUser)?.id || null,
		riskLevel: sample.riskLevel,
		reportType,
		reportId: report.id,
		shared: false,
		shareCount: 0
	};

	warningHistory.update((history) => [historyItem, ...history]);
	return historyItem;
}

export function clearOldHistory(days: number = 30): void {
	const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
	warningHistory.update((history) =>
		history.filter((item) => new Date(item.generatedAt).getTime() > cutoff)
	);
}

export function createShareRecord(
	reportId: string,
	options: {
		expireDays?: number;
		allowDownload?: boolean;
		allowComments?: boolean;
	} = {}
): ShareRecord {
	const { expireDays = 7, allowDownload = true, allowComments = true } = options;
	const token = generateShareToken(reportId, expireDays, allowDownload);

	const record: ShareRecord = {
		id: generateId(),
		reportId,
		token,
		createdAt: new Date().toISOString(),
		expiresAt: expireDays > 0 ? new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000).toISOString() : null,
		collaborators: [],
		allowDownload,
		allowComments,
		viewCount: 0
	};

	shareRecords.update((records) => [record, ...records]);

	warningHistory.update((history) =>
		history.map((item) =>
			item.reportId === reportId ? { ...item, shared: true, shareCount: item.shareCount + 1 } : item
		)
	);

	return record;
}

export function addCollaborator(
	shareRecordId: string,
	collaborator: Omit<Collaborator, 'id' | 'sharedAt' | 'lastViewedAt'>
): ShareRecord | null {
	let updated: ShareRecord | null = null;
	shareRecords.update((records) =>
		records.map((record) => {
			if (record.id === shareRecordId) {
				const newCollaborator: Collaborator = {
					...collaborator,
					id: generateId(),
					sharedAt: new Date().toISOString(),
					lastViewedAt: null
				};
				updated = { ...record, collaborators: [...record.collaborators, newCollaborator] };
				return updated;
			}
			return record;
		})
	);
	return updated;
}

export function generateCompleteRiskReport(samples: FungiSample[]): CompleteRiskReport {
	const speciesList = get(species);
	const riskAssessments = samples.map((s) => assessRisk(s, speciesList));
	const speciesComparisons = samples.map((s) => generateSimilarSpeciesComparison(s, speciesList));
	const emergencyGuidance = getAllEmergencyGuidance();

	const highRiskCount = riskAssessments.filter((r) => r.riskLevel === 'high' || r.riskLevel === 'critical').length;
	const mediumRiskCount = riskAssessments.filter((r) => r.riskLevel === 'medium').length;
	const lowRiskCount = riskAssessments.filter((r) => r.riskLevel === 'low').length;

	const criticalFindings: string[] = [];
	if (highRiskCount > 0) {
		criticalFindings.push(`发现 ${highRiskCount} 个高/极高风险样本，需立即处理`);
	}
	if (samples.some((s) => s.identificationStatus !== 'identified')) {
		criticalFindings.push('部分样本未完成鉴定，建议补充鉴定后再食用');
	}
	if (samples.some((s) => s.isAbnormal)) {
		criticalFindings.push('存在标记为异常的样本，需特别关注');
	}

	const recommendations: string[] = [
		'高风险样本建议销毁或交由专业机构处理',
		'所有样本食用前必须经过专业鉴定确认',
		'建议建立样本追踪档案，记录处理过程',
		'定期开展野生菌安全知识培训'
	];

	return {
		id: generateId(),
		generatedAt: new Date().toISOString(),
		generatedBy: get(currentUser)?.id || null,
		samples,
		riskAssessments,
		speciesComparisons,
		emergencyGuidance,
		summary: {
			totalSamples: samples.length,
			highRiskCount,
			mediumRiskCount,
			lowRiskCount,
			criticalFindings,
			recommendations,
			generatedDate: new Date().toISOString()
		}
	};
}

export function exportCompleteRiskReportToHTML(report: CompleteRiskReport): string {
	const riskColors: Record<string, string> = {
		critical: '#dc2626',
		high: '#ef4444',
		medium: '#f59e0b',
		low: '#10b981'
	};

	const riskLabels: Record<string, string> = {
		critical: '极高风险',
		high: '高风险',
		medium: '中风险',
		low: '低风险'
	};

	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能风险研判与应急指引完整报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
        h2 { color: #1f2937; margin-top: 32px; border-left: 4px solid #3b82f6; padding-left: 12px; }
        h3 { color: #374151; margin-top: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
        .summary-card { text-align: center; padding: 20px; border-radius: 12px; color: white; }
        .summary-card .number { font-size: 36px; font-weight: bold; }
        .summary-card .label { font-size: 14px; opacity: 0.9; }
        .critical { background: linear-gradient(135deg, #dc2626, #b91c1c); }
        .high { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .medium { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .low { background: linear-gradient(135deg, #10b981, #059669); }
        .section { background: #f9fafb; padding: 20px; border-radius: 12px; margin-top: 16px; }
        .sample-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .sample-header { display: flex; justify-content: space-between; align-items: center; }
        .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: 500; font-size: 12px; }
        .findings { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; }
        .recommendations { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; }
        ul { margin: 8px 0; padding-left: 20px; }
        li { margin: 6px 0; }
        .comparison-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .comparison-table th, .comparison-table td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        .comparison-table th { background: #f3f4f6; }
        .emergency-card { border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .emergency-critical { background: #fef2f2; border: 1px solid #fecaca; }
        .emergency-high { background: #fffbeb; border: 1px solid #fde68a; }
        .emergency-medium { background: #fef3c7; border: 1px solid #fcd34d; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        .risk-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .risk-bar-fill { height: 100%; transition: width 0.3s; }
    </style>
</head>
<body>
    <h1><span>🛡️</span> 智能风险研判与应急指引完整报告</h1>
    
    <div class="section">
        <p><strong>报告生成时间：</strong>${new Date(report.generatedAt).toLocaleString('zh-CN')}</p>
        <p><strong>分析样本数：</strong>${report.summary.totalSamples} 个</p>
    </div>

    <h2>📊 风险概览</h2>
    <div class="summary-grid">
        <div class="summary-card critical">
            <div class="number">${report.summary.highRiskCount}</div>
            <div class="label">高/极高风险</div>
        </div>
        <div class="summary-card medium">
            <div class="number">${report.summary.mediumRiskCount}</div>
            <div class="label">中风险</div>
        </div>
        <div class="summary-card low">
            <div class="number">${report.summary.lowRiskCount}</div>
            <div class="label">低风险</div>
        </div>
        <div class="summary-card" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
            <div class="number">${report.summary.totalSamples}</div>
            <div class="label">总样本</div>
        </div>
    </div>

    ${
			report.summary.criticalFindings.length > 0
				? `
    <div class="findings">
        <h3 style="margin-top: 0; color: #dc2626;">⚠️ 关键发现</h3>
        <ul>
            ${report.summary.criticalFindings.map((f) => `<li>${f}</li>`).join('')}
        </ul>
    </div>`
				: ''
		}

    <div class="recommendations">
        <h3 style="margin-top: 0; color: #2563eb;">💡 专家建议</h3>
        <ul>
            ${report.summary.recommendations.map((r) => `<li>${r}</li>`).join('')}
        </ul>
    </div>

    <h2>🧪 样本风险详细评估</h2>
    ${report.riskAssessments
			.map((assessment, index) => {
				const sample = report.samples[index];
				return `
    <div class="sample-card">
        <div class="sample-header">
            <div>
                <strong>${sample.sampleNumber}</strong> - ${sample.suspectedSpecies || '未鉴定'}
                <span class="text-sm text-gray-500">${sample.habitatType} · ${sample.collectionDate}</span>
            </div>
            <span class="risk-badge" style="background-color: ${riskColors[assessment.riskLevel]};">
                ${riskLabels[assessment.riskLevel]} (${assessment.riskScore}分)
            </span>
        </div>
        <div class="risk-bar">
            <div class="risk-bar-fill" style="width: ${assessment.riskScore}%; background-color: ${riskColors[assessment.riskLevel]};"></div>
        </div>
        <p style="margin-top: 12px; color: #374151;">${assessment.recommendation}</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
            置信度：${assessment.confidence}% | 评估因素：${assessment.factors.length} 项
        </p>
    </div>`;
			})
			.join('')}

    <h2>☠️ 相似高危物种对比</h2>
    ${report.speciesComparisons
			.slice(0, 3)
			.map((comparison) => {
				if (comparison.similarSpecies.length === 0) return '';
				return `
    <div class="section">
        <h3 style="margin-top: 0;">目标物种：${comparison.targetSpecies}</h3>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>对比物种</th>
                    <th>相似度</th>
                    <th>风险等级</th>
                    <th>主要区别</th>
                </tr>
            </thead>
            <tbody>
                ${comparison.similarSpecies
									.map(
										(sp) => `
                <tr>
                    <td><strong>${sp.species.name}</strong></td>
                    <td>${sp.similarityScore}%</td>
                    <td><span class="risk-badge" style="background-color: ${riskColors[sp.species.riskLevel] || '#6b7280'};">${riskLabels[sp.species.riskLevel] || sp.species.riskLevel}</span></td>
                    <td>${sp.keyDifferences.map((d) => `${d.feature}: ${d.targetValue} vs ${d.comparedValue}`).join('；')}</td>
                </tr>`
									)
									.join('')}
            </tbody>
        </table>
    </div>`;
			})
			.join('')}

    <h2>🚨 场景化应急处理指引</h2>
    ${report.emergencyGuidance
			.map((guidance) => {
				const severityClass =
					guidance.severity === 'critical'
						? 'emergency-critical'
						: guidance.severity === 'high'
							? 'emergency-high'
							: 'emergency-medium';
				return `
    <div class="emergency-card ${severityClass}">
        <h3 style="margin-top: 0;">${guidance.title}</h3>
        <p><strong>场景：</strong>${guidance.scenarioLabel} | <strong>严重程度：</strong>${guidance.severity === 'critical' ? '🔴 极严重' : guidance.severity === 'high' ? '🟠 严重' : '🟡 中等'}</p>
        <p>${guidance.description}</p>
        <h4>立即行动：</h4>
        <ul>${guidance.immediateActions.map((a) => `<li>${a}</li>`).join('')}</ul>
        <h4>急救措施：</h4>
        <ul>${guidance.firstAid.map((a) => `<li>${a}</li>`).join('')}</ul>
        <h4>需就医情况：</h4>
        <ul>${guidance.medicalAttention.map((a) => `<li>${a}</li>`).join('')}</ul>
    </div>`;
			})
			.join('')}

    <div class="footer">
        <p>📅 报告生成时间：${new Date(report.generatedAt).toLocaleString('zh-CN')}</p>
        <p>⚠️ 本报告由智能风险研判系统自动生成，仅供参考。</p>
        <p>🍄 食用野生菌存在风险，请务必经过专业鉴定确认后再食用。</p>
    </div>
</body>
</html>`;
}

export function downloadCompleteRiskReport(report: CompleteRiskReport): void {
	const html = exportCompleteRiskReportToHTML(report);
	const filename = `智能风险研判完整报告-${new Date().toISOString().split('T')[0]}.html`;
	downloadFile(html, filename, 'text/html');
}
