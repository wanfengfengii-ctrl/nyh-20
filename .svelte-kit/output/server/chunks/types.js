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
//#endregion
export { SPORE_COLORS as i, HABITAT_TYPES as n, IDENTIFICATION_STATUS as r, CAP_COLORS as t };
