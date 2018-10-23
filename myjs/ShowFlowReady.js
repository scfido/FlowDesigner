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
			Ext.menu.initMenu(menu);
			
			var Nodeid = $(this).attr('id');
			var nodeType = graph.node(Nodeid).nodeType;
			var nodeName = $(getJquerySelectorPrefix(Nodeid)).attr('name');
			
			var ProcessUNID = parent.processid;
			var DocUNID=parent.docUnid;
			
			//去掉开始、结束节点
			if (nodeType != 'start' && nodeType != 'end') {
				//查看审批日记
				if (nodeName == 'currentNode' || nodeName == 'publishNode') {
					var url="page?wf_num=P_S003_001&DocUnid=" + parent.docUnid + "&Nodeid=" + Nodeid;
					menu.add(new Ext.menu.Item({ text: CONFIG.msg.flowNodeItem1, url: url, handler: ShowNodeRemark }));
				} else {
					menu.add(new Ext.menu.Item({ text: CONFIG.msg.flowNodeItem1, disabled: true }));
				}
				
				//当前审批用户
				if (nodeName == 'currentNode') {
					var insMenu=new Ext.menu.Item( { text: CONFIG.msg.flowNodeItem2, menu: {items:[]} } );
					Ext.Ajax.request({
						url: 'rule?wf_num=R_S003_B047',
						method:'POST',
						success : function(response, action) {
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
				
				//展示菜单
				menu.showAt(e.getXY());
			}
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

function PlayTrace() {
	//测试用
	//CurrentNodeid = 'T00003';
	//EndNodeList = 'T00001,R00001,T00002,R00002';
	
	if (CurrentNodeid == '' && EndNodeList == '') {
		return;
	} else if (CurrentNodeid == '' && EndNodeList != '') {
		var a = EndNodeList.lastIndexOf(',');
		if (a != -1) {
			CurrentNodeid = EndNodeList.substring(a + 1, EndNodeList.length).trim();
			EndNodeList = EndNodeList.substring(0, a).trim();
			tipMsg = CONFIG.msg.flowPublish;
		} else {
			return;
		}
	}
	
	//获取节点路劲，当前节点为路径的最后一个节点
	nodePath = getNodePath(EndNodeList);
	nodePath.push(CurrentNodeid);
	
	//禁用播放按钮、关闭所有layer层
	window.parent.document.getElementById('ext-gen9').disabled = 'disabled';
	layer.closeAll();
	
	//初始化节点样式
	for (var i = 0; i < nodePath.length; i++) {
		if (isIE) {
			$(getJquerySelectorPrefix(nodePath[i])).css('background', getNodeBgFromHexColor4IE(initColor)); //兼容IE
		} else {
			$(getJquerySelectorPrefix(nodePath[i])).css('background', getNodeBgFromHexColor(initColor));
		}
	}
	
	//动画
	var gradientColorArr = getGradientColorArr(initColor, animateColor, 20);
	nodeAnimate(gradientColorArr);
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
 * 得到渐变颜色数组
 */
function getGradientColorArr(startColor, endColor, step) {
	var startRgbArr = getRgbaArrFromStr(changeHexColorToRgba(startColor));
	var endRgbArr = getRgbaArrFromStr(changeHexColorToRgba(endColor));
	
	if (startRgbArr.length != endRgbArr.length || startRgbArr.length != 3) return;
	
	var startR = parseInt(startRgbArr[0]);
	var startG = parseInt(startRgbArr[1]);
	var startB = parseInt(startRgbArr[2]);
	
	var sR = (endRgbArr[0] - startRgbArr[0]) / step;
	var sG = (endRgbArr[1] - startRgbArr[1]) / step;
	var sB = (endRgbArr[2] - startRgbArr[2]) / step;
	
	var gradientColorArr = [], i;
	for (i = 0; i < step; i++) {
		var rgbColor = 'rgb(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' + parseInt((sB * i + startB)) + ')';
		var hexColor = changeRgbColorToHex(rgbColor);
		gradientColorArr.push(hexColor);
	}
	
	return gradientColorArr;
}

/**
 * 节点动画
 */
function nodeAnimate(gradientColorArr) {
	var j = 0;
	var timer = setInterval(function() {
		if (j < gradientColorArr.length) {
			if (isIE) {
				$(getJquerySelectorPrefix(nodePath[index])).css('background', getNodeBgFromHexColor4IE(gradientColorArr[j])); //兼容IE
			} else {
				$(getJquerySelectorPrefix(nodePath[index])).css('background', getNodeBgFromHexColor(gradientColorArr[j]));
			}
			j++;
		} else {
			//清除定时器
			clearInterval(timer);
			//当前节点前的节点
			if (index < nodePath.length - 1) {
				if (isIE) {
					$(getJquerySelectorPrefix(nodePath[index])).css('background', getNodeBgFromHexColor4IE(animateAfterColor)); //兼容IE
				} else {
					$(getJquerySelectorPrefix(nodePath[index])).css('background', getNodeBgFromHexColor(animateAfterColor));
				}
				index++;
				nodeAnimate(gradientColorArr);
			} else if (index == nodePath.length - 1) { //当前节点
				layer.tips(tipMsg, getJquerySelectorPrefix(nodePath[index]), {
					tips: [1, '#23262e'],
					time: 2000
				});
				index = 0;
				//开启播放按钮
				window.parent.document.getElementById('ext-gen9').disabled = '';
			}
		}
	}, 100);
}
