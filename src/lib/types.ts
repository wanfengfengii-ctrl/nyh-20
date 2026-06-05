export type UserRole = 'guest' | 'user' | 'identifier' | 'admin';

export interface User {
	id: string;
	username: string;
	role: UserRole;
	avatar?: string;
	createdAt: string;
	lastLoginAt: string;
}

export interface IdentificationEvidence {
	type: 'morphology' | 'spore' | 'microscope' | 'dna' | 'reference';
	description: string;
	confidence: number;
}

export interface SampleImage {
	id: string;
	dataUrl: string;
	caption?: string;
	uploadedAt: string;
	uploadedBy: string;
}

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
	identificationEvidences: IdentificationEvidence[];
	identifiedBy: string | null;
	identifiedAt: string | null;
	notes: string;
	isAbnormal: boolean;
	hasSporePrint: boolean;
	riskLevel: 'low' | 'medium' | 'high';
	riskConfirmed: boolean;
	images: SampleImage[];
	createdBy: string;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
	views: number;
	shared: boolean;
	shareToken?: string;
}

export interface Species {
	id: string;
	name: string;
	isPoisonous: boolean;
	riskLevel: 'low' | 'medium' | 'high';
	description: string;
	identificationKeys: string[];
	seasonality: string[];
	commonLocations: string[];
	createdAt: string;
	updatedAt: string;
}

export interface Filters {
	location: string;
	capColor: string;
	sporePrintColor: string;
	identificationStatus: string;
	isAbnormal: boolean | null;
	riskLevel: string;
	createdBy: string;
	dateFrom: string;
	dateTo: string;
}

export interface ShareConfig {
	enabled: boolean;
	token: string;
	expiresAt?: string;
	allowComments: boolean;
	allowDownload: boolean;
}

export interface DataSyncInfo {
	lastSyncAt: string;
	version: number;
	deviceId: string;
	pendingChanges: string[];
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

export const RISK_LEVELS = [
	{ value: 'low', label: '低风险', class: 'badge-success' },
	{ value: 'medium', label: '中风险', class: 'badge-warning' },
	{ value: 'high', label: '高风险', class: 'badge-error' }
];

export const USER_ROLES = [
	{ value: 'guest', label: '访客', permissions: ['read'] },
	{ value: 'user', label: '普通用户', permissions: ['read', 'create', 'edit_own'] },
	{ value: 'identifier', label: '鉴定师', permissions: ['read', 'create', 'edit_own', 'edit_any', 'identify'] },
	{ value: 'admin', label: '管理员', permissions: ['read', 'create', 'edit_any', 'delete', 'identify', 'manage_users'] }
];

export const EVIDENCE_TYPES = [
	{ value: 'morphology', label: '形态特征' },
	{ value: 'spore', label: '孢子特征' },
	{ value: 'microscope', label: '显微镜观察' },
	{ value: 'dna', label: 'DNA检测' },
	{ value: 'reference', label: '文献参考' }
];

export const SEASONS = ['春季', '夏季', '秋季', '冬季'];

export interface WarningReport {
	id: string;
	sampleId: string;
	generatedAt: string;
	suspectedSpecies: string | null;
	riskLevel: 'low' | 'medium' | 'high';
	collectionSeason: string;
	habitatType: string;
	edibleRisk: EdibleRiskWarning;
	handlingAdvice: HandlingAdvice;
	toxicSpeciesWarning: ToxicSpeciesWarning;
	observationAdvice: ObservationAdvice;
}

export interface EdibleRiskWarning {
	level: 'safe' | 'caution' | 'danger' | 'unknown';
	title: string;
	description: string;
	reasons: string[];
}

export interface HandlingAdvice {
	contactSafety: string[];
	storageAdvice: string[];
	disposalAdvice: string[];
	emergencySteps: string[];
}

export interface ToxicSpeciesWarning {
	similarSpecies: SimilarSpecies[];
	keyDifferences: string[];
	seasonalWarning: string;
	habitatWarning: string;
}

export interface SimilarSpecies {
	name: string;
	riskLevel: 'low' | 'medium' | 'high';
	description: string;
	distinguishingFeatures: string[];
}

export interface ObservationAdvice {
	additionalChecks: string[];
	identificationTips: string[];
	expertRecommendation: string;
	followUpSteps: string[];
}

export interface RiskAssessment {
	id: string;
	sampleId: string;
	assessedAt: string;
	assessedBy: string | null;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
	riskScore: number;
	confidence: number;
	factors: RiskFactor[];
	recommendation: string;
}

export interface RiskFactor {
	name: string;
	weight: number;
	description: string;
	contribution: 'positive' | 'negative';
}

export interface SimilarSpeciesComparison {
	id: string;
	targetSpecies: string;
	similarSpecies: SpeciesComparison[];
	generatedAt: string;
}

export interface SpeciesComparison {
	species: Species;
	similarityScore: number;
	keyDifferences: ComparisonDifference[];
	riskComparison: RiskComparison;
}

export interface ComparisonDifference {
	feature: string;
	targetValue: string;
	comparedValue: string;
	differenceLevel: 'minor' | 'moderate' | 'major';
}

export interface RiskComparison {
	targetRisk: string;
	comparedRisk: string;
	notes: string;
}

export type EmergencyScenario = 'contact' | 'ingestion' | 'inhalation' | 'mixedStorage' | 'crossContamination';

export interface EmergencyGuidance {
	id: string;
	scenario: EmergencyScenario;
	scenarioLabel: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	title: string;
	description: string;
	immediateActions: string[];
	firstAid: string[];
	medicalAttention: string[];
	preventionTips: string[];
	relatedSpecies: string[];
}

export interface WarningHistory {
	id: string;
	sampleId: string;
	sampleNumber: string;
	suspectedSpecies: string | null;
	generatedAt: string;
	generatedBy: string | null;
	riskLevel: 'low' | 'medium' | 'high';
	reportType: 'single' | 'batch' | 'comparison';
	reportId: string;
	shared: boolean;
	shareCount: number;
}

export interface Collaborator {
	id: string;
	username: string;
	email?: string;
	role: 'viewer' | 'editor' | 'reviewer';
	sharedAt: string;
	sharedBy: string;
	lastViewedAt: string | null;
	canExport: boolean;
	canComment: boolean;
}

export interface ShareRecord {
	id: string;
	reportId: string;
	token: string;
	createdAt: string;
	expiresAt: string | null;
	collaborators: Collaborator[];
	allowDownload: boolean;
	allowComments: boolean;
	viewCount: number;
}

export interface CompleteRiskReport {
	id: string;
	generatedAt: string;
	generatedBy: string | null;
	samples: FungiSample[];
	riskAssessments: RiskAssessment[];
	speciesComparisons: SimilarSpeciesComparison[];
	emergencyGuidance: EmergencyGuidance[];
	summary: ReportSummary;
	exportedAt?: string;
}

export interface ReportSummary {
	totalSamples: number;
	highRiskCount: number;
	mediumRiskCount: number;
	lowRiskCount: number;
	criticalFindings: string[];
	recommendations: string[];
	generatedDate: string;
}

export const EMERGENCY_SCENARIOS: { value: EmergencyScenario; label: string; icon: string }[] = [
	{ value: 'contact', label: '皮肤接触', icon: 'pan_tool' },
	{ value: 'ingestion', label: '误食中毒', icon: 'restaurant' },
	{ value: 'inhalation', label: '孢子吸入', icon: 'air' },
	{ value: 'mixedStorage', label: '混放污染', icon: 'inventory_2' },
	{ value: 'crossContamination', label: '交叉污染', icon: 'warning' }
];

export const RISK_SCORE_THRESHOLDS = {
	low: { min: 0, max: 30, label: '低风险' },
	medium: { min: 31, max: 60, label: '中风险' },
	high: { min: 61, max: 85, label: '高风险' },
	critical: { min: 86, max: 100, label: '极高风险' }
};
