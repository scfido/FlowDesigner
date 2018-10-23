var isIE = isIE();
var PauseDocUnid = "";
var SimProcessUnid = GetUrlArg("SimProcessUnid");
var Processid = GetUrlArg("Processid");
var DataDocUnid = GetUrlArg("DataUnid");
var PauseProcessid = Processid;

var initColor = '#ccab26';
var animateColor = '#ff0000';
var animateAfterColor = '#ffcc00';
var nodePath, index = 0;
var tipMsg = '';
var common;
$(function() {
	//读取配置
	$.ajax({
	    url: "linkey/bpm/newFlow/config/config.json",
	    //同步请求
	    async: false,
	    type: 'get',
	    success: function(data) {
			CONFIG = data;
	    }
	});
	
	tipMsg = CONFIG.msg.currentProgress;
	
	common = {
		connector: [CONFIG.conn.connectionType, { gap: CONFIG.conn.connectionGap, cornerRadius: CONFIG.conn.connectionCornerRadius, alwaysRespectStubs: CONFIG.conn.connectionAlwaysRespectStubs }],
		connectorOverlays: [
			['Arrow', { width: CONFIG.arrow.arrowWidth, length: CONFIG.arrow.arrowLength, location: CONFIG.arrow.arrowLocation }]
		],
		paintStyle: {
			strokeStyle: '#2a2929',
			stroke: '#2a2929',
			strokeWidth: CONFIG.endPonit.endPointStrokeWidth,
			fill: 'pink',
			fillStyle: '#1e8151',
			radius: CONFIG.endPonit.endPointRadius
		},
		hoverPaintStyle: {
			stroke: CONFIG.endPonit.hoverEndPointStroke,
		},
		isSource: true,
		isTarget: true
	}
	
	showFlow(JSON.parse(flowJsonObj));
	
	$('#loading', parent.document).remove();
	$('#loading-mask', parent.document).remove();
});

// 初始化流程图
function showFlow(o) {
	removeAll();

	var nodeArr = o.nodeDataArray;
	var linkArr = o.linkDataArray;
	
	for(var i = 0; i < nodeArr.length; i++) {
		
		var nodeObj = chooseNodeObjFromType(nodeArr[i].nodeType);
		//节点类型为泳道时特殊初始化处理
		if (nodeArr[i].nodeType == 'broadwiseLane' || nodeArr[i].nodeType == 'directionLane') {
			initLane(nodeObj, nodeArr[i]);
			continue;
		}
		
		//设置节点
		var t = nodeArr[i].text;
		if (t.length > 5) {
			t = t.substring(0, 5) + '...';
		}
		$("#Container").append('<div id="' + nodeArr[i].key + '" class="' + nodeObj.cla + '">' + 
							   	    '<span>' + t + '</span>' + 
							   	    nodeObj.icon + 
							   	'</div>'
							  );
		
		//设置节点的位置
		$("#" + nodeArr[i].key).offset({ top: nodeArr[i].locTop, left: nodeArr[i].locLeft });
		
		//设置节点的样式
		$("#" + nodeArr[i].key).css('background', getNodeBgFromHexColor(nodeArr[i].bgColor));
		$("#" + nodeArr[i].key).css('height', nodeArr[i].nodeHeight);
		$("#" + nodeArr[i].key).css('width', nodeArr[i].nodeWidth);
		$("#" + nodeArr[i].key).css('line-height', nodeArr[i].nodeHeight);
		$("#" + nodeArr[i].key).css('cursor', 'pointer');
		
		//设置节点的属性
		$("#" + nodeArr[i].key).attr('bgColor-gradient', nodeArr[i].bgColor);
		
		//设置节点的右键菜单
		Ext.get(nodeArr[i].key).on('contextmenu', function(e) {
			//阻止事件的传播行为，防止右击节点时触发父节点绑定的右击事件
			e.stopPropagation();
			
			var menu = new Ext.menu.Menu();
			
			var Nodeid = $(this).attr('id');
			var nodeType = graph.node(Nodeid).nodeType;
			var nodeName = $(getJquerySelectorPrefix(Nodeid)).attr('name');
			
			//为人工节点时
			if (nodeType == 'comm') {
				//指定处理用户
				menu.add(new Ext.menu.Item({
					text: CONFIG.msg.flowNodeItem11,
					handler: function() {
						SetNodeUser(Nodeid);
					}
				}));
				//取消设置
				menu.add(new Ext.menu.Item({
					text: CONFIG.msg.flowNodeItem12,
					handler: function() {
						DelNodeUser(Nodeid);
					}
				}));
			}
			
			//子流程节点菜单
			if (nodeType == 'innerChildFlow' || nodeType == 'outerChildFlow') {
				//指定子流程仿真策略
				menu.add(new Ext.menu.Item({
					text: CONFIG.msg.flowNodeItem13,
					handler: function() {
						SetSubProcess(Nodeid);
					}
				}));
				//取消设置
				menu.add(new Ext.menu.Item({
					text: CONFIG.msg.flowNodeItem12,
					handler: function() {
						DelNodeUser(Nodeid);
					}
				}));
			}
			
			//前继节点
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem5,
				handler: function() {
					ShowPrvNode(Nodeid);
				}
			}));
			
			//后续节点
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem6,
				handler: function() {
					ShowNextNode(Nodeid);
				}
			}));
			
			//阻止浏览器默认的右击事件
			e.preventDefault();
			//展示菜单
			menu.showAt(e.getXY());
		});
		
		//设置画板菜单
		Ext.get("shwoFlowId").on('contextmenu', function(e) {
			var menu = new Ext.menu.Menu();
			
			//自动运行
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem16,
				handler: function() {
					AutoRun(1);
				}
			}));
			//单步运行
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem17,
				handler: function() {
					AutoRun(0);
				}
			}));
			//继续运行
			menu.add(new Ext.menu.Item({
				id: 'NextRunMenu',
				text: CONFIG.msg.flowNodeItem18,
				handler: function() {
					AutoRun(0);
				}
			}));
			//清除运行数据
			menu.add(new Ext.menu.Item({
				id: 'DelDataMenu',
				text: CONFIG.msg.flowNodeItem19,
				handler: function() {
					location.reload();
				}
			}));
			if(PauseDocUnid == "") {
				Ext.getCmp("NextRunMenu").setDisabled(true);
				Ext.getCmp("DelDataMenu").setDisabled(true);
			}
			
			//阻止浏览器默认的右击事件
			e.preventDefault();
			//展示菜单
			menu.showAt(e.getXY());
		});
		
		
		//将节点添加到图对象中
		graph.setNode(nodeArr[i].key, {
			text: nodeArr[i].text,
			key: nodeArr[i].key,
			nodeType: nodeArr[i].nodeType,
			locTop: nodeArr[i].locTop,
			locLeft: nodeArr[i].locLeft,
			nodeHeight: nodeArr[i].nodeHeight,
			nodeWidth: nodeArr[i].nodeWidth,
			bgColor: nodeArr[i].bgColor,
			isSelected: false
		});
		
		//记录节点id
		recordNodeId(nodeArr[i].key);
	}
	
	for(var i = 0; i < linkArr.length; i++) {
		//连线
		connectTwoNode(linkArr[i].from, linkArr[i].to, linkArr[i].routerId, linkArr[i].sourceAnchors, linkArr[i].targetAnchors);
		
		//给路由添加id
		addRouterId(linkArr[i].from, linkArr[i].to, linkArr[i].routerId);
		
		//给路由添加文本信息
		if (linkArr[i].label != '') {
			INSTANCE_JSPLUMB.getConnections({
				source: linkArr[i].from,
				target: linkArr[i].to
			})[0].setLabel({
				label: linkArr[i].label, 
				cssClass: 'labelClass'
			});
		}
		
		//设置路由菜单
		Ext.get(linkArr[i].routerId).on('contextmenu', function(e) {
			//阻止事件的传播行为，防止右击节点时触发父节点绑定的右击事件
			e.stopPropagation();
			
			var menu = new Ext.menu.Menu();
			var routerId = $(this).attr('id');
			
			//强制路由
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem14,
				handler: function() {
					SetRouter("2", routerId);
				}
			}));
			//禁止路由
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem15,
				handler: function() {
					SetRouter("3", routerId);
				}
			}));
			//取消设置
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem12,
				handler: function() {
					SetRouter("4", routerId);
				}
			}));
			
			//阻止浏览器默认的右击事件
			e.preventDefault();
			//展示菜单
			menu.showAt(e.getXY());
		});
		
		//记录连接线id
		recordNodeId(linkArr[i].routerId);
	}
}

function ShowNodeRemark(item)
{
	OpenUrl(item.url, 300, 300);
}

function ShowSubDoc(item) {
	OpenUrl(item.url, 100, 100);
}

function addRouterId(sourceId, targetId, connId) {
	$.each($('svg.jtk-connector'), function() {
		if ($(this).attr('id') == undefined) {
			$(this).attr('id', connId);
			$(this).attr('sourceId', sourceId);
			$(this).attr('targetId', targetId);
		}
	});
}

/**
 * 显示前继节点
 * @param {String} nodeid 节点id
 */
function ShowPrvNode(nodeid) {
	var preNodeIdArr = graph.predecessors(nodeid), i;
	if (preNodeIdArr.length > 0) {
		for (i = 0; i < preNodeIdArr.length; i++) {
			layer.tips(CONFIG.msg.frontNode, getJquerySelectorPrefix(preNodeIdArr[i]), {
				tips: [1, '#23262e'],
				time: 1000,
				tipsMore: true
			});
		}
	} else {
		layer.tips(CONFIG.msg.noFrontNode, getJquerySelectorPrefix(nodeid), {
			tips: [1, '#23262e'],
			time: 1000,
		});
	}
}

/**
 * 显示后继节点
 * @param {String} nodeid 节点id
 */
function ShowNextNode(nodeid) {
	var nextNodeIdArr = graph.successors(nodeid), i;
	if (nextNodeIdArr.length > 0) {
		for (i = 0; i < nextNodeIdArr.length; i++) {
			layer.tips(CONFIG.msg.behindNode, getJquerySelectorPrefix(nextNodeIdArr[i]), {
				tips: [1, '#23262e'],
				time: 1000,
				tipsMore: true
			});
		}
	} else {
		layer.tips(CONFIG.msg.noBehindNode, getJquerySelectorPrefix(nodeid), {
			tips: [1, '#23262e'],
			time: 1000
		});
	}
}

/**
 * 指定处理用户
 * @param {String} nodeId 节点id
 */
function SetNodeUser(nodeId) {
	var b = "r?wf_num=F_S026_A004&Nodeid=" + nodeId + "&Processid=" + Processid + "&SimProcessUnid=" + SimProcessUnid + "&DataDocUnid=" + DataDocUnid;
	var c = new Ext.Window({
		html: "<iframe src='" + b + "' frameborder=0 width=100% height=100% ></iframe>",
		width: 450,
		height: 150,
		autoScroll: true,
		closeAction: 'hide',
		shim: false,
		title: "指定审批用户",
		iconCls: 'subform',
		collapsible: true,
		maximizable: true
	});
	c.show();
}

/**
 * 取消设置
 * @param {String} nodeId 节点id
 */
function DelNodeUser(nodeId) {
	Ext.getBody().mask('Waiting...', 'x-mask-loading');
	Ext.Ajax.request({
		url: 'r?wf_num=R_S026_B005',
		success: function(a, b) {
			var c = Ext.util.JSON.decode(a.responseText);
			alert("成功取消");
			Ext.getBody().unmask();
		},
		failure: function() {
			alert('URL Error!')
		},
		params: {
			Nodeid: nodeId,
			SimProcessUnid: SimProcessUnid
		}
	});
}

/**
 * 指定子流程仿真策略
 * @param {String} nodeId 节点id
 */
function SetSubProcess(nodeId) {
	var b = "r?wf_num=F_S026_A005&Nodeid=" + nodeId + "&Processid=" + Processid + "&SimProcessUnid=" + SimProcessUnid + "&DataDocUnid=" + DataDocUnid;
	OpenUrl(b, 800, 600);
}

/**
 * 流程仿真
 * @param {int} d
 */
var currentNodeIds;
function AutoRun(d) {
	Ext.getBody().mask('Waiting...', 'x-mask-loading');
	Ext.Ajax.request({
		url: 'r?wf_num=R_S026_B007',
		method: 'GET',
		success: function(a, b) {
			Ext.getBody().unmask();
			var c = Ext.util.JSON.decode(a.responseText);
			if(c.Status == "Error") {
				alert(c.msg);
				return false;
			}
			if(c.Status == "End") {
				console.log(c.Status);
				cancelCurentNodeid();
				alert(c.msg);
				return false;
			}
			try {
				if(c.Processid != "") PauseProcessid = c.Processid;
				if(c.DocUnid != "") {
					PauseDocUnid = c.DocUnid;
				}
				if(c.EndNodeList != "") {
					SetEndNodeColor(c.EndNodeList);
				}
				if(c.CurrentNodeList != "") {
					currentNodeIds = c.CurrentNodeList;
					SetCurrentNodeColor(c.CurrentNodeList);
				}
				if(d == 0) {
					if(confirm("成功运行至(" + c.msg + ")\n点击确定运行下一步!点击取消暂停运行!")) {
						AutoRun(0);
					}
				} else if(d == 1) {
					AutoRun(1);
				}
			} catch(e) {
				alert(e.message);
				alert("Error!(" + a.responseText + ")");
			}
		},
		failure: function() {
			alert('URL Error!');
		},
		params: {
			SimProcessUnid: SimProcessUnid,
			Processid: PauseProcessid,
			DocUnid: PauseDocUnid
		}
	})
}

function SetEndNodeColor(endNodeStrs) {
	if (endNodeStrs == "" || PauseProcessid != Processid) return false;
	var endNodeList = str2List(endNodeStrs, 'R'), i;
	for (i = 0; i < endNodeList.length; i++) {
		if (isIE) {
			$(getJquerySelectorPrefix(endNodeList[i])).css('background', getNodeBgFromHexColor4IE('#ffcc00')); //兼容IE
		} else {
			$(getJquerySelectorPrefix(endNodeList[i])).css('background', getNodeBgFromHexColor('#ffcc00'));
		}
	}
}

function SetCurrentNodeColor(currentNodeStrs) {
	if (currentNodeStrs == "" || PauseProcessid != Processid) return false;
	var currentNodeList = str2List(currentNodeStrs, 'R'), i;
	for (i = 0; i < currentNodeList.length; i++) {
		if (isIE) {
			$(getJquerySelectorPrefix(currentNodeList[i])).css('background', getNodeBgFromHexColor4IE('#ff0000')); //兼容IE
		} else {
			$(getJquerySelectorPrefix(currentNodeList[i])).css('background', getNodeBgFromHexColor('#ff0000'));
		}
		
	}
}

function cancelCurentNodeid() {
	if (currentNodeIds != undefined && currentNodeIds != "") {
		var currentNodes = str2List(currentNodeIds, 'R'), i;
		for (i = 0; i < currentNodes.length; i++) {
			if (isIE) {
				$(getJquerySelectorPrefix(currentNodes[i])).css('background', getNodeBgFromHexColor4IE('#ffcc00')); //兼容IE
			} else {
				$(getJquerySelectorPrefix(currentNodes[i])).css('background', getNodeBgFromHexColor('#ffcc00'));
			}
		}
	}
}

function str2List(list, prefix) {
	var res = [];
	var arr = list.split(','), i;
	for (i = 0; i < arr.length; i++) {
		if (arr[i].substring(0, 1) != prefix) {
			res.push(arr[i].trim());
		}
	}
	return res;
}

/**
 * 设置路由
 * @param {String} d 路由规则 2:强制路由 3:禁止路由 4:取消设置
 * @param {Object} e 路由id
 */
function SetRouter(d, e) {
	var sourceId = $(getJquerySelectorPrefix(e)).attr('sourceId');
	var targetId = $(getJquerySelectorPrefix(e)).attr('targetId');
	
	Ext.getBody().mask('Waiting...', 'x-mask-loading');
	Ext.Ajax.request({
		url: 'r?wf_num=R_S026_B004',
		success: function(a, b) {
			var c = Ext.util.JSON.decode(a.responseText);
			if(c.Status == "ok") {
				if(d == "2") {
					INSTANCE_JSPLUMB.getConnections({
						source: sourceId, target: targetId
					})[0].setPaintStyle({
						stroke: 'green'
					});
				} else if(d == "3") {
					INSTANCE_JSPLUMB.getConnections({
						source: sourceId, target: targetId
					})[0].setPaintStyle({
						stroke: 'red'
					});
				} else if(d == "4") {
					INSTANCE_JSPLUMB.getConnections({
						source: sourceId, target: targetId
					})[0].setPaintStyle({
						stroke: '#2a2929'
					});
				}
			} else {
				alert("设置失败!");
			}
			Ext.getBody().unmask();
		},
		failure: function() {
			alert('URL Error!');
		},
		params: {
			Nodeid: e,
			RouterRule: d,
			Processid: Processid,
			DataDocUnid: DataDocUnid,
			SimProcessUnid: SimProcessUnid
		}
	})
}
