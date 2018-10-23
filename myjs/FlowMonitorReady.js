var isIE = isIE();
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
	initNode();
	
	$("#shwoFlowId").contextmenu(function(event) {
		event.preventDefault();
	});
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
			var menu = new Ext.menu.Menu();
			
			var Nodeid = $(this).attr('id');
			var nodeType = graph.node(Nodeid).nodeType;
			var nodeName = $(getJquerySelectorPrefix(Nodeid)).attr('name');
			
			var ProcessUNID = parent.processid;
			var DocUNID=parent.docUnid;
			
			//为人工节点时
			if (nodeType == 'comm') {
				//查看审批日记
				if (nodeName == 'currentNode' || nodeName == 'publishNode') {
					var url="page?wf_num=P_S003_001&DocUnid=" + parent.docUnid + "&Nodeid=" + Nodeid;
					menu.add(new Ext.menu.Item({ text: CONFIG.msg.flowNodeItem1, url: url, handler: ShowNodeRemark }));
				} else {
					menu.add(new Ext.menu.Item({ text: CONFIG.msg.flowNodeItem1, disabled: true }));
				}
			} else {
				menu.add(new Ext.menu.Item({ text: CONFIG.msg.flowNodeItem1, disabled: true }));
			}
			
			//前继节点
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem5,
				handler: function() {
					ShowPrvNode(Nodeid)
				}
			}));
			
			//后续节点
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem6,
				handler: function() {
					ShowNextNode(Nodeid)
				}
			}));
			
			//当前审批用户
			if (nodeName == 'currentNode') {
				var insMenu=new Ext.menu.Item( { text: CONFIG.msg.flowNodeItem2, menu: {items:[]} } );
				Ext.Ajax.request({
					url: 'rule?wf_num=R_S003_B047',
					method:'POST',
					success: function(response, action) {
						var responseArray = Ext.util.JSON.decode(response.responseText);
						var ItemArray=responseArray.item.split(",");
						for(i = 0; i < ItemArray.length; i++) {
							var UserName = ItemArray[i];
							var insSubMenu = new Ext.menu.Item( { text:UserName, icon:'linkey/bpm/images/icons/user_green.gif' } );
							insMenu.menu.add(insSubMenu);
						}           
					},
					params: { Processid: ProcessUNID, DocUnid: DocUNID, Nodeid: Nodeid, Action: 'Current' }
				});
				menu.add(insMenu);
			}
				
			//已处理用户
			if (nodeName == 'currentNode' || nodeName == 'publishNode') {
				var EndUserMenu=new Ext.menu.Item( { text: CONFIG.msg.flowNodeItem3, menu: {items:[]} } );
				Ext.Ajax.request({
					url: 'rule?wf_num=R_S003_B047',
					method:'POST',
					success : function(response, action) {
							var responseArray = Ext.util.JSON.decode(response.responseText);
							var ItemArray = responseArray.item.split(",");
							for(i = 0; i < ItemArray.length; i++) {
								var UserName = ItemArray[i];
								if(UserName == "") UserName = CONFIG.msg.flowNodeItem3Li1;
								var insSubMenu = new Ext.menu.Item( { text: UserName, icon: 'linkey/bpm/images/icons/user_green.gif' } );
								EndUserMenu.menu.add(insSubMenu);
							}           
					},
					params: { Processid: ProcessUNID, DocUnid: DocUNID, Nodeid: Nodeid, Action: 'End' }
				});
				menu.add(EndUserMenu);
			}
			
			if (nodeType == 'comm') {
				if (nodeName == 'currentNode') {
					//审批用户管理
					menu.add(new Ext.menu.Item({
						text: CONFIG.msg.flowNodeItem7,
						Nodeid: Nodeid,
						handler: ShowApproveUser
					}));
					//结束本节点
					menu.add(new Ext.menu.Item({
						text: CONFIG.msg.flowNodeItem8,
						Nodeid: Nodeid,
						Action: 'End',
						handler: StartEndNode
					}));
				} else {
					//启动本节点
					menu.add(new Ext.menu.Item({
						text: CONFIG.msg.flowNodeItem9,
						Nodeid: Nodeid,
						Action: 'Start',
						handler: StartEndNode
					}));
				}
			}
				
			//查看子流程文档
			if (nodeType == 'innerChildFlow' || nodeType == 'outerChildFlow') {
				var insDocMenu = new Ext.menu.Item( { text: CONFIG.msg.flowNodeItem4, menu: {items:[]} } );
				var url = 'rule?wf_num=R_S003_B063';
				Ext.Ajax.request({
					url: url,
					method: 'GET',
					success: function(response, action) {
						var responseArray = Ext.util.JSON.decode(response.responseText);
						var ItemArray = responseArray.item.split(",");
						for(i = 0; i < ItemArray.length; i++) {
							var sArray = ItemArray[i].split("$");
							var Subject = sArray[0];
							var url = sArray[1];
							var insDocSubMenu = new Ext.menu.Item( { text: Subject, icon: 'linkey/bpm/images/icons/doclist.gif', url: url, handler: ShowSubDoc } );
							if(Subject == '未找到...') {
								insDocSubMenu.setDisabled(true);
							}
							insDocMenu.menu.add(insDocSubMenu);
						}           
					},
					params: { Processid: ProcessUNID, DocUnid:DocUNID, Nodeid:Nodeid, wf_appid:top.GetUrlArg("WF_Appid") }
				});
				menu.add(insDocMenu);
			}
			
			//刷新
			menu.add(new Ext.menu.Item({
				text: CONFIG.msg.flowNodeItem10,
				handler: function() {
					location.reload();
				}
			}));
				
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

function initNode() {
	//测试用
	//CurrentNodeid = 'T00003';
	//EndNodeList = 'T00001,R00001,T00002,R00002';
	
	//修改当前审批节点的样式
	var currentNodeidArr = CurrentNodeid.split(','), j;
	for (j = 0; j < currentNodeidArr.length; j++) {
		if (isIE) {
			$(getJquerySelectorPrefix(currentNodeidArr[j].trim())).css('background', getNodeBgFromHexColor4IE('#ff0000')); //兼容IE
		} else {
			$(getJquerySelectorPrefix(currentNodeidArr[j].trim())).css('background', getNodeBgFromHexColor('#ff0000'));
		}
		$(getJquerySelectorPrefix(currentNodeidArr[j].trim())).attr('name', 'currentNode');
	}
	
	//修改当前审批节点前已经审批完的节点样式
	var nodePath = getNodePath(EndNodeList), i;
	for (i = 0; i < nodePath.length; i++) {
		var thisNode = nodePath[i].trim();
		if (currentNodeidArr.indexOf(thisNode) == -1) {
			if (isIE) {
				$(getJquerySelectorPrefix(thisNode)).css('background', getNodeBgFromHexColor4IE('#ffcc00')); //兼容IE
			} else {
				$(getJquerySelectorPrefix(thisNode)).css('background', getNodeBgFromHexColor('#ffcc00'));
			}
			$(getJquerySelectorPrefix(thisNode)).attr('name', 'publishNode');
		}
	}
}

/**
 * 获取节点路劲
 * @param {String} endNodeList
 */
function getNodePath(endNodeList) {
	var nodePath = [];
	var flowPath = endNodeList.split(','), i;
	for (i = 0; i < flowPath.length; i++) {
		if (flowPath[i].substring(0, 1) != 'R') {
			nodePath.push(flowPath[i]);
		}
	}
	return nodePath;
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
 * 审批用户管理
 */
function ShowApproveUser(item) {
	var url = "form?wf_num=F_S014_A002&WF_Action=edit&Nodeid=" + item.Nodeid + "&WF_DocUnid=" + parent.docUnid;
	parent.$('#win').html("<iframe height='200px' width='100%' frameborder='0' src='" + url + "'></iframe>");
	parent.$('#win').window({
		width: 600,
		height: 260,
		modal: true,
		title: '用户管理'
	});
}

/**
 * 启动/结束本节点
 */
function StartEndNode(item) {
	var url = "rule?wf_num=R_S014_B001";
	Ext.Ajax.request({
		url: url,
		method: 'POST',
		success: function(response, action) {
			alert(response.responseText);
			location.reload();
		},
		params: {
			WF_Processid: parent.processid,
			WF_DocUnid: parent.docUnid,
			WF_Nodeid: item.Nodeid,
			WF_Action: item.Action
		}
	});
}
