//#region src/lib/types.ts
var HABITAT_TYPES = [
	"森林",
	"草地",
	"公园",
	"庭院",
	"路边",
	"山地",
	"湿地",
	"其他"
];
var SPORE_COLORS = [
	"白色",
	"奶油色",
	"黄色",
	"橙色",
	"粉色",
	"红色",
	"棕色",
	"巧克力色",
	"紫褐色",
	"黑色",
	"其他"
];
var CAP_COLORS = [
	"白色",
	"黄色",
	"橙色",
	"红色",
	"粉色",
	"紫色",
	"蓝色",
	"绿色",
	"棕色",
	"灰色",
	"黑色",
	"其他"
];
var IDENTIFICATION_STATUS = [
	{
		value: "pending",
		label: "待鉴定"
	},
	{
		value: "identified",
		label: "已鉴定"
	},
	{
		value: "unidentified",
		label: "无法鉴定"
	}
];
var RISK_LEVELS = [
	{
		value: "low",
		label: "低风险",
		class: "badge-success"
	},
	{
		value: "medium",
		label: "中风险",
		class: "badge-warning"
	},
	{
		value: "high",
		label: "高风险",
		class: "badge-error"
	}
];
var USER_ROLES = [
	{
		value: "guest",
		label: "访客",
		permissions: ["read"]
	},
	{
		value: "user",
		label: "普通用户",
		permissions: [
			"read",
			"create",
			"edit_own"
		]
	},
	{
		value: "identifier",
		label: "鉴定师",
		permissions: [
			"read",
			"create",
			"edit_own",
			"edit_any",
			"identify"
		]
	},
	{
		value: "admin",
		label: "管理员",
		permissions: [
			"read",
			"create",
			"edit_any",
			"delete",
			"identify",
			"manage_users"
		]
	}
];
var EVIDENCE_TYPES = [
	{
		value: "morphology",
		label: "形态特征"
	},
	{
		value: "spore",
		label: "孢子特征"
	},
	{
		value: "microscope",
		label: "显微镜观察"
	},
	{
		value: "dna",
		label: "DNA检测"
	},
	{
		value: "reference",
		label: "文献参考"
	}
];
var SEASONS = [
	"春季",
	"夏季",
	"秋季",
	"冬季"
];
//#endregion
export { RISK_LEVELS as a, USER_ROLES as c, IDENTIFICATION_STATUS as i, EVIDENCE_TYPES as n, SEASONS as o, HABITAT_TYPES as r, SPORE_COLORS as s, CAP_COLORS as t };
