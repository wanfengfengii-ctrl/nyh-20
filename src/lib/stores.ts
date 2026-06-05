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
	SampleImage
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

export function generateShareToken(sampleId: string): string {
	return btoa(`${sampleId}:${Date.now()}`).replace(/=/g, '');
}

export function getSeason(date: string): string {
	const month = new Date(date).getMonth() + 1;
	if (month >= 3 && month <= 5) return '春季';
	if (month >= 6 && month <= 8) return '夏季';
	if (month >= 9 && month <= 11) return '秋季';
	return '冬季';
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
