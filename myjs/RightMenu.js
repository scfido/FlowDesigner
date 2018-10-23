//节点右击菜单
var nodeMenuJson = [
	{
		name: "节点属性",
		id: "nodeAttr",
		callback: function(tempId) {
			//editNodeAttribute(tempId);
			editProperty(tempId);
		}
	},
	{
		name: "复制节点",
		id: "copyNode",
		callback: function(tempId) {
			copyNode(tempId);
		}
	},
	{
		name: "删除节点",
		id: "deleteNode",
		callback: function(tempId) {
			deleteNode(tempId);
		}
	},
	{
		name: "显示节点前继路径",
		id: "connRouteFront",
		callback: function(tempId) {
			showConnectionRoute(tempId, 'front');
		}
	},
	{
		name: "显示节点后续路径",
		id: "connRouteBehind",
		callback: function(tempId) {
			showConnectionRoute(tempId, 'behind');
		}
	}
	/*{
		name: "节点样式",
		id: "nodeStyle",
		callback: function(tempId) {
			console.log("设置节点样式：" + tempId);
			setNodeStyle(tempId);
		}
	}*/
];

//连接线右击菜单
var connectionMenuJson = [
	{
		name: "路由属性",
		id: "connectionAttr",
		callback: function(tempId) {
			//编辑路由属性
			editProperty(tempId);
			//connectionAttr(tempId);
		}
	},
	{
		name: "删除连线",
		id: "deleteConnection",
		callback: function(tempId) {
			deleteConnection(tempId);
		}
	}
];

//泳道右击菜单
var laneMenuJson = [
	{
		name: "属性编辑",
		id: "laneAttr",
		callback: function(tempId) {
			//编辑泳道属性
			laneAttr(tempId)
		}
	},
	{
		name: "删除泳道",
		id: "deleteLane",
		callback: function(tempId) {
			deleteLane(tempId);
		}
	}
];

//画布右击菜单
var canvasMenuJson = [
	{
		name: "过程属性",
		id: "processAttribute",
		callback: function(tempId) {
			//编辑过程属性
			editProperty('Process');
		}
	},
	{
		name: "粘贴",
		id: "pasteNode",
		callback: function(tempId) {
			pasteNode();
		}
	},
	{
		name: "全选",
		id: "selectAll",
		callback: function(tempId) {
			selectedAll();
		}
	},
	{
		name: "保存流程",
		id: "saveFlowChart",
		callback: function(tempId) {
			save();
		}
	},
	{
		name: "快捷工具",
		id: "shortcutTools"
	},
	{
		name: "对齐方式",
		id: "alignWay"
	},
	{
		name: "流程图信息",
		id: "flowChartInfo",
		callback: function(tempId) {
			alert("预留功能。。。。。");
		}
	},
	
	//快捷工具子菜单
	{
		name: "移除连接线",
		id: "removeAllConnection",
		parent: "shortcutTools",
		callback: function(tempId) {
			alert("预留功能。。。。。");
		}
	},
	
	//对齐方式子菜单
	{
		name: "左对齐",
		id: "leftAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				leftAlign(selectedNodeIdArr);
				setTimeout(function(){
					leftAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "垂直居中",
		id: "verticalCenter",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				verticalCenter(selectedNodeIdArr);
				setTimeout(function(){
					verticalCenter(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "右对齐",
		id: "rightAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				rightAlign(selectedNodeIdArr);
				setTimeout(function(){
					rightAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "上对齐",
		id: "upAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				upAlign(selectedNodeIdArr);
				setTimeout(function(){
					upAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "水平居中",
		id: "levelAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				levelAlign(selectedNodeIdArr);
				setTimeout(function(){
					levelAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "下对齐",
		id: "downAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				downAlign(selectedNodeIdArr);
				setTimeout(function(){
					downAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	}
];

//查看流程图画布右击菜单
var showFlowMenuJson = [
	{
		name: "背景切换",
		id: "bgToggle",
		callback: function() {
			console.log('bgToggle...');
		}
	}
];
