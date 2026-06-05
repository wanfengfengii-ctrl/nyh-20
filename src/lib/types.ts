export interface FungiSample {
	id: string;
	sampleNumber: string;
	collectionDate: string;
	location: string;
	latitude: number | null;
	longitude: number | null;
	habitatType: string;
	capColor: string;
	sporePrintColor: string | null;
	suspectedSpecies: string | null;
	identificationStatus: 'pending' | 'identified' | 'unidentified';
	notes: string;
	isAbnormal: boolean;
	hasSporePrint: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Species {
	id: string;
	name: string;
	isPoisonous: boolean;
	description: string;
}

export interface Filters {
	location: string;
	sporePrintColor: string;
	identificationStatus: string;
	isAbnormal: boolean | null;
}

export const HABITAT_TYPES = [
	'森林',
	'草地',
	'公园',
	'庭院',
	'路边',
	'山地',
	'湿地',
	'其他'
];

export const SPORE_COLORS = [
	'白色',
	'奶油色',
	'黄色',
	'橙色',
	'粉色',
	'红色',
	'棕色',
	'巧克力色',
	'紫褐色',
	'黑色',
	'其他'
];

export const CAP_COLORS = [
	'白色',
	'黄色',
	'橙色',
	'红色',
	'粉色',
	'紫色',
	'蓝色',
	'绿色',
	'棕色',
	'灰色',
	'黑色',
	'其他'
];

export const IDENTIFICATION_STATUS = [
	{ value: 'pending', label: '待鉴定' },
	{ value: 'identified', label: '已鉴定' },
	{ value: 'unidentified', label: '无法鉴定' }
];
