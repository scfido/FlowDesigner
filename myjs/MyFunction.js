var projectName = getProjectName();

/**
 * 初始化
 */
function init() {
	//初始化配置
	NODE_RESIZABLE_FLAG = CONFIG.defaultConfig.resizableFlag;
	NODE_SELECTED_BOX_SHADOW = CONFIG.defaultStyle.selectedBoxShadow;
	NODE_NO_SELECTED_BOX_SHADOW = CONFIG.defaultStyle.noSelectedBoxShadow;
	
	//初始化节点id对象
	NODEIDOBJ_INIT();
	
	//初始化jsPlumb实例化对象
	initJsPlumbInstance();
}

/**
 * 创建新节点
 */
function createNewNode(nodeType, p) {
	var msg = checkCurrentGraph(nodeType);
	if (msg != '0') {
		layer.msg(msg, {
			icon: 5,
			time: 2000
		});
		return;
	}
	
	//保存状态为未保存
	$("#saveStatus").css('display', '');
	
	var newNode, createType;
	if (graph.hasNode(nodeType)) {
		//通过复制粘贴创建新节点
		newNode = copyNodeAttrById(nodeType, p);
		createType = 1;
	} else {
		UNDO_ARR.push(getCurrentFlowDoc());
		
		//通过拖拽创建新节点
		newNode = chooseNodeObjFromType(nodeType, p);
		createType = 2;
	}
	
	//创建的节点类型是泳道时需要做特殊处理
	if(newNode.nodeType == 'broadwiseLane' || newNode.nodeType == 'directionLane') {
		createLane(newNode);
		return newNode.newId;
	}
	
	//添加到画板中
	$("#Container").append('<div id="' + newNode.newId + '" class="' + newNode.cla + '" ondblclick="editProperty(\'' + newNode.newId + '\')">' + 
						       '<span>' + newNode.text + '</span>' + 
						       newNode.icon + 
						   '</div>'
	);
	
	//设置节点位置
	var l = (newNode.locLeft - 250) < 0 ? 251 : newNode.locLeft;
	$("#" + newNode.newId).offset( { top: newNode.locTop, left: l } );
	
	//设置节点的属性
	$("#" + newNode.newId).attr('bgColor-gradient', newNode.bgColor);
	
	//设置节点样式
	switch (createType) {
		case 1:
			$("#" + newNode.newId).css('height', newNode.nodeHeight);
			$("#" + newNode.newId).css('width', newNode.nodeWidth);
			$("#" + newNode.newId).css('line-height', newNode.nodeHeight);
			$("#" + newNode.newId).css('background', getNodeBgFromHexColor(newNode.bgColor));
			break;
		case 2:
			$("#" + newNode.newId).css('height', parseInt($("#" + newNode.newId).css('height')) + 30 + 'px');
			$("#" + newNode.newId).css('width', parseInt($("#" + newNode.newId).css('width')) + 30 + 'px');
			$("#" + newNode.newId).css('line-height', $("#" + newNode.newId).css('height'));
			break;
	}
	
	//设置节点的右键菜单
	window.ContextMenu.bind("#" + newNode.newId, nodeMenuJson);
	
	//设置节点可拖拽
	setNodeDraggable(newNode.newId);
	
	//根据标识设置节点是否可缩放
	if (NODE_RESIZABLE_FLAG) nodeResizable(newNode.newId);
	
	//记录节点id
	recordNodeId(newNode.newId);
	
	//为节点注册事件
	registerNodeEvent(newNode.newId);
	
	//将新节点添加到图对象中
	graph.setNode(newNode.newId, {
		text: newNode.text,
		key: newNode.newId,
		nodeType: newNode.nodeType,
		locTop: newNode.locTop,
		locLeft: newNode.locLeft,
		nodeHeight: $('#' + newNode.newId).css('height'),
		nodeWidth: $('#' + newNode.newId).css('width'),
		bgColor: newNode.bgColor,
		isSelected: false
	});
	
	//设置节点为源目标节点，当第一次使节点unmakeSource时线不会混乱
	INSTANCE_JSPLUMB.makeSource(newNode.newId);
	
	//拖拽、粘贴生成新元素时，工具切换为鼠标工具
	mouseTool();
	
	//重绘
	repaintAll();
	
	return newNode.newId;
}

/**
 * 创建泳道
 * @param {Object} newNode
 */
function createLane(newNode) {
	//添加到画板中
	var textArr = newNode.text.split(''), i, tempText = '', a, b, c;
	if (newNode.nodeType == 'broadwiseLane') {
		for (i = 0; i < textArr.length; i++) {
			tempText += '<span style="display: block;">' + textArr[i] + '</span>';
		}
		a = '50px';
		b = '247px';
	} else {
		tempText = '<span>' + newNode.text + '</span>';
	}
	c = 'lane-' + uuid();
	$("#Container").append('<div id="' + newNode.newId + '" class="' + newNode.cla + '">' + 
								'<div id="' + c + '" class="laneLabelDivClass" style="width: ' + a + '; height: ' + b + ';">' + 
						    		tempText + 
						       '</div>' + 
						   '</div>'
	);
	
	//设置节点位置
	var t = newNode.nodeType == 'broadwiseLane' ? newNode.locTop : 61;
	var l = newNode.nodeType == 'broadwiseLane' ? 251 : newNode.locLeft;
	$("#" + newNode.newId).offset( { top: t, left: l } );
	
	//设置节点的属性
	$("#" + newNode.newId).attr('bgColor-gradient', newNode.bgColor);
	
	//设置右键菜单
	window.ContextMenu.bind("#" + c, laneMenuJson);
	
	//设置节点可拖拽
	$('#'+  newNode.newId).draggable({
		containment: '#Container',
		handle: '.laneLabelDivClass',
		axis: newNode.nodeType == 'broadwiseLane' ? 'y' : 'x',
		//拖拽结束后更新图对象中存储的泳道位置
		stop: function(event) {
			//更新泳道对象
			updateLaneObjs(event.target.id);
		}
	});
	
	//设置泳道可被缩放
	laneResizable(newNode.newId);
	
	//记录节点id
	recordNodeId(newNode.newId);
	
	/**
	 * 阻止事件的传播行为，防止点击节点时触发父节点绑定的click事件，以及在拖动泳道时会出现多选框
	 */
	$(getJquerySelectorPrefix(c)).click(function(event) {
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		event.stopPropagation();
	}).mousemove(function(event) {
		px = '';
		py = '';
	});
	
	//将泳道节点添加到泳道对象中
	var laneObj = {
		text: newNode.text,
		key: newNode.newId,
		nodeType: newNode.nodeType,
		locTop: t,
		locLeft: l,
		nodeHeight: $('#' + newNode.newId).css('height'),
		nodeWidth: $('#' + newNode.newId).css('width'),
		bgColor: newNode.bgColor
	};
	LANEOBJS[newNode.newId] = laneObj;
}

/**
 * 删除泳道
 * @param {String} tempId
 */
function deleteLane(tempId) {
	var id = $(getJquerySelectorPrefix(tempId)).parent().attr('id');
	//删除泳道对象中的数据
	delete LANEOBJS[id];
	//removeNodeId(id);
	$(getJquerySelectorPrefix(id)).remove();
	
	layer.msg(CONFIG.msg.deleteLane, {
		icon: 1,
		time: 1000
	});
}

/**
 * 根据节点类型获取节点对象
 * @param {String} type
 * @param {Object} p 位置信息
 */
function chooseNodeObjFromType(type, p) {
	var nodeObj = {};
	
	if (p != undefined) {
		nodeObj.locTop = p.top + 70;
		nodeObj.locLeft = p.left + 50;
	}
	
	//为不同类型的节点选择不同的样式
	switch(type) {
		case 'start':
			nodeObj.newId = getNextNodeId('E');
			nodeObj.cla = "startNode moveLight";
			nodeObj.nodeType = 'start';
			nodeObj.text = "开始";
			nodeObj.bgColor = '#78dc6b';
			nodeObj.icon = '';
			break;
		case 'end':
			nodeObj.newId = getNextNodeId('E');
			nodeObj.cla = "endNode moveLight";
			nodeObj.nodeType = 'end';
			nodeObj.text = "结束";
			nodeObj.bgColor = '#dc6b6b';
			nodeObj.icon = '';
			break;
		case 'comm':
			nodeObj.newId = getNextNodeId('T');
			nodeObj.cla = "commNode moveLight";
			nodeObj.nodeType = 'comm';
			nodeObj.text = "人工活动";
			nodeObj.bgColor = '#6babdc';
			nodeObj.icon = '<i class="layui-icon layui-icon-username" style="font-size: 15px; color: #666666; position: absolute; right: 78px; margin-top: -15px;"></i>';
			break;
		case 'freedom':
			nodeObj.newId = getNextNodeId('T');
			nodeObj.cla = "freedomNode moveLight";
			nodeObj.nodeType = 'freedom';
			nodeObj.text = "自由活动";
			nodeObj.bgColor = '#6babdc';
			nodeObj.icon = '<i class="layui-icon layui-icon-set-sm" style="font-size: 15px; color: #666666; position: absolute; right: 78px; margin-top: -15px;"></i>';
			break;
		case 'gateWay':
			nodeObj.newId = getNextNodeId('G');
			nodeObj.cla = "gateWayNode moveLight";
			nodeObj.nodeType = 'gateWay';
			nodeObj.text = "网关";
			nodeObj.bgColor = '#6babdc';
			nodeObj.icon = '';
			break;
		case 'event':
			nodeObj.newId = getNextNodeId('E');
			nodeObj.cla = "eventNode moveLight";
			nodeObj.nodeType = 'event';
			nodeObj.text = "事件";
			nodeObj.bgColor = '#6babdc';
			nodeObj.icon = '';
			break;
		case 'innerChildFlow':
			nodeObj.newId = getNextNodeId('S');
			nodeObj.cla = "innerChildFlowNode moveLight";
			nodeObj.nodeType = 'innerChildFlow';
			nodeObj.text = "内部子流程";
			nodeObj.bgColor = '#edef31';
			nodeObj.icon = '';
			break;
		case 'outerChildFlow':
			nodeObj.newId = getNextNodeId('S');
			nodeObj.cla = "outerChildFlowNode moveLight";
			nodeObj.nodeType = 'outerChildFlow';
			nodeObj.text = "外部子流程";
			nodeObj.bgColor = '#edef31';
			nodeObj.icon = '';
			break;
		case 'broadwiseLane':
			nodeObj.newId = getNextNodeId('L');
			nodeObj.cla = "broadwiseLaneNodeOnContainer laneNode";
			nodeObj.nodeType = 'broadwiseLane';
			nodeObj.text = "横向泳道";
			nodeObj.bgColor = '#edef31';
			nodeObj.icon = '';
			break;
		case 'directionLane':
			nodeObj.newId = getNextNodeId('L');
			nodeObj.cla = "directionLaneNodeOnContainer laneNode";
			nodeObj.nodeType = 'directionLane';
			nodeObj.text = "纵向泳道";
			nodeObj.bgColor = '#edef31';
			nodeObj.icon = '';
			break;
		default:
			layer.msg(CONFIG.msg.chooseNodeObjErr, { icon: 5 });
			return;
	}
	return nodeObj;
}

/**
 * 编辑节点属性
 */
function editProperty(nodeId) {
	var frameType = chooseOpenFrameType(getRemovePrefixId(nodeId));
	SetProperty(getRemovePrefixId(nodeId), frameType);
}

/**
 * 根据节点类型选择打开的页面类型
 * @param {String} nodeId
 */
function chooseOpenFrameType(nodeId) {
	var frameType;
	if (nodeId == 'Process') {
		frameType = 'Process';
		return frameType;
	} else if (nodeId.substring(0, 1) == 'R') {
		frameType = 'Router';
		return frameType;
	}
	var nodeType = graph.node(nodeId).nodeType;
	switch (nodeType) {
		case 'start':
			frameType = 'StartNode';
			break;
		case 'end':
			frameType = 'EndNode';
			break;
		case 'event':
			frameType = 'Event';
			break;
		case 'gateWay':
			frameType = 'Edge';
			break;
		case 'comm':
			frameType = 'Activity';
			break;
		case 'freedom':
			frameType = 'AutoActivity';
			break;
		case 'innerChildFlow':
			frameType = 'SubProcess';
			break;
		case 'outerChildFlow':
			frameType = 'OutProcess';
			break;
	}
	return frameType;
}

// 初始化流程图
function initFlowCharts(o) {
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
		$("#Container").append('<div id="' + nodeArr[i].key + '" class="' + nodeObj.cla + '" ondblclick="editProperty(\'' + nodeArr[i].key + '\')">' + 
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
		
		//设置节点的属性
		$("#" + nodeArr[i].key).attr('bgColor-gradient', nodeArr[i].bgColor);
		
		//设置节点的右键菜单
		window.ContextMenu.bind("#" + nodeArr[i].key, nodeMenuJson);

		//设置节点可以被拖拽，containment 限制元素拖动的范围，grid 使元素对齐网格
		setNodeDraggable(nodeArr[i].key);
		
		//根据标识设置节点是否可缩放
		var nt = nodeArr[i].nodeType;
		if (NODE_RESIZABLE_FLAG) nodeResizable(nodeArr[i].key);
		
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
			isSelected: false,
			alreadySetName: true
		});
		
		//记录节点id
		recordNodeId(nodeArr[i].key);
	}
	
	//为节点注册事件
	registerNodeEvent();
	
	for(var i = 0; i < linkArr.length; i++) {
		//连线
		connectTwoNode(linkArr[i].from, linkArr[i].to, linkArr[i].routerId, linkArr[i].sourceAnchors, linkArr[i].targetAnchors);
		
		//给路由添加id、右击菜单
		addConnectionId(linkArr[i].from, linkArr[i].to, linkArr[i].routerId);
		
		//设置连接线双击打开属性编辑窗口事件
		$('#' + linkArr[i].routerId).dblclick(function(event) {
			editProperty($(this).context.id);
		});
		
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

/**
 * 初始化泳道
 * @param {Object} o1
 * @param {Object} o2
 */
function initLane(o1, o2) {
	//添加到画板中
	var textArr = o2.text.split(''), i, tempText = '', a, b, c, d;
	if (o2.nodeType == 'broadwiseLane') {
		for (i = 0; i < textArr.length; i++) {
			tempText += '<span style="display: block;">' + textArr[i] + '</span>';
		}
		a = '50px';
		b = parseInt(o2.nodeHeight) - 3;
		d = getLaneLineHeight(o2.text, o2.nodeHeight);
	} else {
		tempText = '<span>' + o2.text + '</span>';
	}
	c = 'lane-' + uuid();
	$("#Container").append('<div id="' + o2.key + '" class="' + o1.cla + '">' + 
								'<div id="' + c + '" class="laneLabelDivClass" style="width: ' + a + '; height: ' + b + 'px; line-height: ' + d + ';">' + 
						    		tempText + 
						    	'</div>' + 
						   '</div>'
	);
	
	//设置节点位置
	$("#" + o2.key).offset( { top: o2.locTop, left: o2.locLeft } );
	
	//设置节点的属性
	$("#" + o2.key).attr('bgColor-gradient', o2.bgColor);
	
	//设置节点的样式
	$("#" + o2.key).css('height', o2.nodeHeight);
	$("#" + o2.key).css('width', o2.nodeWidth);
	
	//设置右键菜单
	window.ContextMenu.bind("#" + c, laneMenuJson);
	
	//设置节点可拖拽
	$('#'+  o2.key).draggable({
		containment: '#Container',
		handle: '.laneLabelDivClass',
		axis: o2.nodeType == 'broadwiseLane' ? 'y' : 'x',
		//拖拽结束后更新图对象中存储的泳道位置
		stop: function(event) {
			//更新图对象
			updateLaneObjs(event.target.id);
		}
	});
	
	//设置泳道可被缩放
	laneResizable(o2.key);
	
	//记录节点id
	recordNodeId(o2.key);
	
	/**
	 * 阻止事件的传播行为，防止点击节点时触发父节点绑定的click事件，以及在拖动泳道时会出现多选框
	 */
	$(getJquerySelectorPrefix(c)).click(function(event) {
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		event.stopPropagation();
	}).mousemove(function(event) {
		px = '';
		py = '';
	});
	
	//将泳道节点添加到泳道对象中
	var laneObj = {
		text: o2.text,
		key: o2.key,
		nodeType: o2.nodeType,
		locTop: o2.locTop,
		locLeft: o2.locLeft,
		nodeHeight: $('#' + o2.key).css('height'),
		nodeWidth: $('#' + o2.key).css('width'),
		bgColor: o2.bgColor
	};
	LANEOBJS[o2.key] = laneObj;
}

/**
 * 保存流程
 */
var flowDoc;
function getFlowDoc() {
	return this.flowDoc;
}

function save() {
	//检查流程图合法性
	var checkMsg = checkGraph();
	if (checkMsg != '0') {
		layer.msg(checkMsg, { icon: 2 });
		return;
	}
	
	//获取当前流程图对象
	var obj = getCurrentFlowDoc();
	
	//缺省保存属性
	saveAllDefaultNode();
	
	//将流程图对象json数据持久化到数据库中
	var res = saveObj(obj);
	
	if (res.Status == '1') {
		//保存状态为已保存
		$("#saveStatus").css('display', 'none');
		layer.msg(CONFIG.msg.saveSuccess, {
			icon: 1,
			time: 1000
		});
	} else {
		layer.msg(res.msg, {
			icon: 2,
			time: 1000
		});
	}
	
	//注意：这里有返回值会导致火狐浏览器在点击保存后跳转页面
	//return flowDoc;
}

/**
 * 将流程图对象json数据持久化到数据库中
 */
function saveObj(obj) {
	var d = {};
	var p = parent.$('#mainDiv').attr('processid');
	var post_data = {
	    "Processid": p,
	    "WF_Action": "save",
	    "flowJSON": JSON.stringify(obj)
	}
	$.ajax({
	    url: projectName + "rest/ws/p/S018/handleFlowJSON/created",
	    //同步请求
	    async: false,
	    type: 'POST',
	    data: post_data,
	    success: function(data) {
			//调用成功
			d = data;
	    },
	    error: function(data, textStatus, errorThrown) {
	    	//调用失败
	    	d.Status = 0;
	    	d.msg = CONFIG.msg.saveObjErr;
	    }
	});
	
	return d;
}

/**
 * 保存为图片
 */
function save2Photo() {
	//检查当前流程图是否可以保存为图片
	var checkMsg = checkGraphBySave2Photo();
	if (checkMsg != '0') {
		layer.msg(checkMsg, { icon: 2 });
		return;
	}
	
	//计算生成图片的尺寸
	var positionObj = getCanvasSizeByNode();
	//alert('top:' + positionObj.canvasTop + '  left:' + positionObj.canvasLeft);
	//处理svg标签，这里只做对连接线的转换，端点暂不考虑
    var removeArr = [], svgElem = $("#canvasId").find('svg[id]'), i;
    svgElem.each(function(index, node) {
    	//创建canvas标签，设置标签id并将id放入移除数组中，便于生成图片后移除canvas
    	var canvas = document.createElement('canvas');
    	var canvasId = 'canvas-' + uuid();
    	canvas.id = canvasId;
    	removeArr.push(canvasId);
    	
    	//svg标签内容
    	var svg = node.outerHTML.trim();
    	
    	//转换为canvas
    	canvg(canvas, svg);
    	
    	//设置位置
    	if (node.style.position) {
            canvas.style.position += node.style.position;
            canvas.style.left += node.style.left;
            canvas.style.top += node.style.top;
        }
    	$('#Container').append(canvas);
    });
	
	//将流程图转换为canvas，然后再转成base64编码
	html2canvas(document.getElementById('Container'), {
		width: positionObj.canvasLeft,
		height: positionObj.canvasTop,
		//关闭日志
		logging: false
	}).then(function(canvas) {
		//将canvas转成base64编码，然后再转成图片url
		var imgUri =canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		//下载图片
		var alink = document.createElement('a');
		var alinkId = 'alink-' + uuid();
		removeArr.push(alinkId);
		alink.id = alinkId;
		alink.href = imgUri;
		alink.download = '流程设计图_' + uuid() + '.jpg';
		alink.click();
	});
	
	//移除生成的canvas、alink，这里采用异步的方式是因为生成图片需要时间，若在生成图片时执行了清除代码则svg内容不会被转成图片
	setTimeout(function() {
		for (i = 0; i < removeArr.length; i++) {
			$(getJquerySelectorPrefix(removeArr[i])).remove();
		}
	}, 1000);
}

/**
 * 获取当前的流程文档对象
 */
function getCurrentFlowDoc() {
	flowDoc = {};
	var nodeDataArray = [];
	//当前滚动条位置
	var scrollX = $('#canvasId').scrollLeft();
	var scrollY = $('#canvasId').scrollTop();
	//节点
	$.each($('#Container').children('.moveLight'), function(index) {
		var tempObj = {};
		tempObj.text = graph.node($(this).attr('id')).text;
		tempObj.key = $(this).attr('id');
		tempObj.nodeType = graph.node($(this).attr('id')).nodeType;
		tempObj.locTop = $(this).offset().top + scrollY;
		tempObj.locLeft = $(this).offset().left + scrollX;
		tempObj.nodeHeight = $(this).css('height');
		tempObj.nodeWidth = $(this).css('width');
		tempObj.bgColor = $(this).attr('bgColor-gradient');
		nodeDataArray.push(tempObj);
	});
	
	//泳道
	$.each($('#Container').children('.laneNode'), function(index) {
		var tempObj = {};
		tempObj.text = LANEOBJS[$(this).attr('id')].text;
		tempObj.key = $(this).attr('id');
		tempObj.nodeType = LANEOBJS[$(this).attr('id')].nodeType;
		tempObj.locTop = $(this).offset().top + scrollY;
		tempObj.locLeft = $(this).offset().left + scrollX;
		tempObj.nodeHeight = $(this).css('height');
		tempObj.nodeWidth = $(this).css('width');
		tempObj.bgColor = $(this).attr('bgColor-gradient');
		nodeDataArray.push(tempObj);
	});
	flowDoc.nodeDataArray = nodeDataArray;
	
	//连线
	var linkDataArray = [];
	$.each(INSTANCE_JSPLUMB.getAllConnections(), function() {
		var tempObj = {};
		tempObj.from = $(this)[0].sourceId;
		tempObj.to = $(this)[0].targetId;
		tempObj.routerId = graph.edge($(this)[0].sourceId, $(this)[0].targetId).id;
		tempObj.label = getRouterLabel($(this)[0].sourceId, $(this)[0].targetId);
		tempObj.sourceAnchors = graph.edge($(this)[0].sourceId, $(this)[0].targetId).sourceAnchors;
		tempObj.targetAnchors = graph.edge($(this)[0].sourceId, $(this)[0].targetId).targetAnchors;
		linkDataArray.push(tempObj);
	});
	flowDoc.linkDataArray = linkDataArray;
	
	//console.log(JSON.stringify(flowDoc));
	return flowDoc;
}

/**
 * 重做
 */
function clear() {
	layer.confirm(CONFIG.msg.clearConfirm, { icon: 7, title: '提示' }, function(index) {
		//保存状态为未保存
		$("#saveStatus").css('display', '');
		//将当前流程对象放入可撤销数组中
		UNDO_ARR.push(getCurrentFlowDoc());
		
		//删除数据库中的节点和路由数据
		var deleteNodeAndRouterArr = [];
		deleteNodeAndRouterArr = deleteNodeAndRouterArr.concat(graph.nodes());
		deleteNodeAndRouterArr = deleteNodeAndRouterArr.concat(getAllRouterId());
		deleteNodeFromDB(deleteNodeAndRouterArr);
		
		removeAll();
		layer.close(index);
	});
}

/**
 * 移除所有端点，清空画布，重置图对象
 */
function removeAll() {
	$.each($("#Container").children('.moveLight'), function() {
		INSTANCE_JSPLUMB.removeAllEndpoints($(this).attr('id'));
	});
	
	$("#Container").empty();
	
	NODEIDOBJ_INIT();
	initJsPlumbInstance();
	resetGraphObj();
}

/**
 * 展示/隐藏网格
 */
function showGrid() {
	if ($("#canvasId").css('background-image') == 'none') {
		$("#canvasId").css('background-image', 'url(../images/grid.jpeg)');
		$("#showGridId").children(':first-child').attr('class', 'fa fa-eye fa-2x iconClass showItemTxt');
		$("#showGridId").children(':last-child').text('隐藏网格');
	} else {
		$("#canvasId").css('background', 'none');
		$("#canvasId").css('background-color', '#f8f8f8');
		$("#showGridId").children(':first-child').attr('class', 'fa fa-eye-slash fa-2x iconClass showItemTxt');
		$("#showGridId").children(':last-child').text('显示网格');
	}
	
	layer.tips($('#showGridId').children(':last-child').text(), '#showGridId', {
		tips: [3, '#23262e'],
		time: 2000
	});
}

/**
 * 复制节点
 * 1、首先清除剪切板
 * 2、获取被选中的所有节点id，循环加入剪切板，开始节点无法被复制
 */
function copyNode(tempId) {
	MYCLIPBOARD.length = 0;
	var selectedNodeIdArr = getSelectedNodeIdArr();
	var index;
	for (index = 0; index < selectedNodeIdArr.length; index++) {
		if (graph.node(selectedNodeIdArr[index]).nodeType != 'start') {
			MYCLIPBOARD.push(selectedNodeIdArr[index]);
		}
	}
	
	if (tempId != undefined && tempId != '') {
		var v = getRemovePrefixId(tempId);
		if (MYCLIPBOARD.indexOf(v) == -1 && graph.node(v).nodeType != 'start') {
			MYCLIPBOARD.push(v);
		}
	}
}

/**
 * 粘贴
 * 1、粘贴节点
 * 2、粘贴节点间的连线，判断剪切板中两两节点之间是否存在连线，若存在则连接粘贴的新节点之间的连线
 * 3、取消选择
 */
function pasteNode() {
	//保存状态为未保存
	$("#saveStatus").css('display', '');
	//将当前流程对象放入可撤销数组中
	UNDO_ARR.push(getCurrentFlowDoc());
	
	//获取鼠标位置
	var mousePos = getMousePos(event);
	var top = mousePos.y;
	var left = mousePos.x;
	var tempTop = top;
	var tempLeft = left;
	//粘贴生成的新节点的id数组
	var copyNodeIdArr = [];
	
	//粘贴节点
	$.each(MYCLIPBOARD, function(index) {
		var newNodeId = createNewNode(MYCLIPBOARD[index], { 'top': top, 'left': left });
		copyNodeIdArr.push(newNodeId);
		if (index < MYCLIPBOARD.length - 1) {
			top = tempTop - (graph.node(MYCLIPBOARD[0]).locTop - graph.node(MYCLIPBOARD[index + 1]).locTop);
			left = tempLeft - (graph.node(MYCLIPBOARD[0]).locLeft - graph.node(MYCLIPBOARD[index + 1]).locLeft);
		}
	});
	
	//粘贴连线
	var i, j;
	for (i = 0; i < MYCLIPBOARD.length; i++) {
		for (j = i + 1; j < MYCLIPBOARD.length; j++) {
			if (graph.hasEdge(MYCLIPBOARD[i], MYCLIPBOARD[j])) {
				//粘贴的新路由的id
				var connId = getNextNodeId('R');
				//记录id到节点id对象
				recordNodeId(connId);
				connectTwoNode(copyNodeIdArr[i], copyNodeIdArr[j], connId);
				
				//给路由添加id、右击菜单
				addConnectionId(copyNodeIdArr[i], copyNodeIdArr[j], connId);
				
				//设置连接线双击打开属性编辑窗口事件
				$('#' + connId).dblclick(function(event) {
					editProperty($(this).context.id);
				});
			}
		}
	}
	
	//取消选择
	changeToNoSelected();
}

/**
 * 撤销
 */
function undo() {
	if (UNDO_ARR.length > 0) {
		//撤销前的节点路由数组
		var oldNodeArr = graph.nodes();
		var oldRouterArr = getAllRouterId();
		
		//保存状态为未保存
		$("#saveStatus").css('display', '');
		REDO_ARR.push(getCurrentFlowDoc());
		initFlowCharts(UNDO_ARR.pop());
		
		//撤销后的节点路由数组
		var newNodeArr = graph.nodes();
		var newRouterArr = getAllRouterId();
		
		//删除撤销的数据库节点数据
		var deleteNodeArr = getDeleteNodeArr(oldNodeArr, newNodeArr, oldRouterArr, newRouterArr);
		deleteNodeFromDB(deleteNodeArr);
		
		//撤销后保存缺省值
		//saveAllDefaultNode();
	}
}

/**
 * 重做
 */
function redo() {
	if (REDO_ARR.length > 0) {
		//重做前的节点路由数组
		var oldNodeArr = graph.nodes();
		var oldRouterArr = getAllRouterId();
		
		//保存状态为未保存
		$("#saveStatus").css('display', '');
		//将当前流程对象放入可撤销数组中
		UNDO_ARR.push(getCurrentFlowDoc());
		initFlowCharts(REDO_ARR.pop());
		
		//重做后的节点路由数组
		var newNodeArr = graph.nodes();
		var newRouterArr = getAllRouterId();
		
		//删除重做的数据库节点数据
		var deleteNodeArr = getDeleteNodeArr(oldNodeArr, newNodeArr, oldRouterArr, newRouterArr);
		deleteNodeFromDB(deleteNodeArr);
	}
}

/**
 * 删除节点
 * 1、在图对象中移除节点以及关于节点的连线
 * 2、移除节点的所有端点
 * 3、移除节点
 */
function deleteNode(tempId) {
	var selectedNodeIdArr = getSelectedNodeIdArr();
	if (selectedNodeIdArr.length == 0) {
		return;
	}
	
	//保存状态为未保存
	$("#saveStatus").css('display', '');
	//将当前流程对象放入可撤销数组中
	UNDO_ARR.push(getCurrentFlowDoc());
	
	MYCLIPBOARD.length = 0;
	
	//待删除的节点和线id
	var deleteNodeAndRouterIdArr = [];
	for (var i = 0; i < selectedNodeIdArr.length; i++) {
		var deleteRouterIdArr = removeNodeAndEdgesById(selectedNodeIdArr[i]);
		INSTANCE_JSPLUMB.removeAllEndpoints(selectedNodeIdArr[i]);
		//removeNodeId(selectedNodeIdArr[i]);
		$('#' + selectedNodeIdArr[i]).remove();
		
		//添加到待删除数组
		deleteNodeAndRouterIdArr.push(selectedNodeIdArr[i])
		deleteNodeAndRouterIdArr = deleteNodeAndRouterIdArr.concat(deleteRouterIdArr);
	}
	
	if (tempId != undefined) {
		tempId = tempId.substring(1);
		if (graph.hasNode(tempId)) {
			var deleteRouterIdArr = removeNodeAndEdgesById(tempId);
			INSTANCE_JSPLUMB.removeAllEndpoints(tempId);
			//removeNodeId(tempId);
			$('#' + tempId).remove();
			
			//添加到待删除数组
			deleteNodeAndRouterIdArr.push(selectedNodeIdArr[i])
			deleteNodeAndRouterIdArr = deleteNodeAndRouterIdArr.concat(deleteRouterIdArr);
		}
	}
	
	//删除数据库中的节点信息
	deleteNodeFromDB(deleteNodeAndRouterIdArr);
	
	layer.msg(CONFIG.msg.deleteNode, {
		icon: 1,
		time: 1000
	});
}

/**
 * 删除数据库中的节点信息
 */
function deleteNodeFromDB(idArr) {
	var processId = parent.$('#mainDiv').attr('processid'), i;
	for (i = 0; i < idArr.length; i++) {
		var url = projectName + "rule?wf_num=R_S002_B011&Action=DeleteNode&Processid=" + processId + "&Nodeid=" + getRemovePrefixId(idArr[i]);
		var conn = Ext.lib.Ajax.getConnectionObject().conn;
		conn.open("post", url, false);
		conn.send();
	}
}

/**
 * 为节点注册事件
 */
function registerNodeEvent(tempId) {
	var selector;
	if (tempId == undefined) {
		selector = '.moveLight';
	} else {
		selector = '#' + tempId;
	}
	
	/**
	 * 当鼠标移动到节点上时将发光属性保存到临时的属性temp-box-shadow中
	 * 然后改变节点的发光样式，显示可拖拽区域
	 * 
	 * 当鼠标移出节点时将节点的发光样式还原为临时保存的属性temp-box-shadow，隐藏可拖拽区域
	 */
	$(selector).mouseover(function() {
		// 当节点选中标识为false，也就是未被选中时
		if (!graph.node($(this).attr('id')).isSelected) {
			$(this).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
		}
	}).mouseout(function() {
		// 当节点选中标识为false，也就是未被选中时
		if (!graph.node($(this).attr('id')).isSelected) {
			$(this).css('box-shadow', NODE_NO_SELECTED_BOX_SHADOW);
		}
		
		layer.close(layer.tips());
	});
	
	/**
	 * 单击选中事件
	 */
	$(selector).mousedown(function(event) {
		//兼容浏览器写法
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		
		//当鼠标按钮不为左键时终止函数的执行，0是左键，1是滚轮键，2是右键
		//if (event.button != 0) return;
		
		$(this).css('box-shadow', '0 0 35px green');
		
		//当没有多选时将其他被选中的节点改为未选中
		if (!SELECTED_MULTIPLE_FLAG) {
			changeToNoSelected($(this).attr('id'));
		}
	}).mouseup(function(event) {
		//显示节点全名
		if (!SELECTED_MULTIPLE_FLAG && !ALLOW_MULTIPLE_SELECTED_FLAG) {
			layer.tips(graph.node($(this).attr('id')).text, getJquerySelectorPrefix($(this).attr('id')), {
				tips: [3, '#23262e'],
				time: 2000
			});
		}
		
		//兼容浏览器写法
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		
		//当鼠标按钮不为左键时终止函数的执行，0是左键，1是滚轮键，2是右键
		//if (event.button != 0) return;
		
		$(this).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
		clearAllTimer();
		
		//当允许多选时
		if (ALLOW_MULTIPLE_SELECTED_FLAG) {
			selectedNode($(this).attr('id'));
		}
		
		//当没有多选时
		if (!SELECTED_MULTIPLE_FLAG) {
			SELECTED_NODE_LIST[0] = $(this).attr('id');
			INSTANCE_JSPLUMB.addToDragSelection($(this).attr('id'));
			graph.node($(this).attr('id')).isSelected = true;
		}
	});
	
	/**
	 * 阻止事件的传播行为，防止点击节点时触发父节点绑定的click事件
	 */
	$(selector).click(function(event) {
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		event.stopPropagation();
	});
}

/**
 * 动画显示路由路径
 * @param {String} id 节点id
 * @param {String} type 显示路径类型
 */
function showConnectionRoute(id, type) {
	id = getRemovePrefixId(id);
	var noRouteFlag = true;
	var conns, message;
	switch (type) {
		case 'front':
			conns = INSTANCE_JSPLUMB.getConnections( { target: id } );
			message = CONFIG.msg.noFrontRoute;
			break;
		case 'behind':
			conns = INSTANCE_JSPLUMB.getConnections( { source: id } );
			message = CONFIG.msg.noBehindRoute;
			break;
	}
	$.each(conns, function() {
		noRouteFlag = false;
		var o = $(this)[0];
		var timerName = uuid();
		ALL_TIMER[timerName] = setTimeout(function() {
			connectionAnimateOne(o);
		}, 10);
	});
	//当无后继路径时用layer的tips层进行提示
	if (noRouteFlag) {
		layer.tips(message, '#' + id, {
			tips: [4, '#23262e']
		});
	}
}
function connectionAnimateOne(o) {
	o.addClass('connectionAnimateClass');
	var timerName = uuid();
	ALL_TIMER[timerName] = setTimeout(function() {
		connectionAnimateTwo(o);
	}, 200);
}
function connectionAnimateTwo(o) {
	o.removeClass('connectionAnimateClass');
	var timerName = uuid();
	ALL_TIMER[timerName] = setTimeout(function() {
		connectionAnimateOne(o);
	}, 500);
}

/**
 * 清除所有的定时器
 */
function clearAllTimer() {
	// 1、点击画布时清除所有的定时器
	for(timerName in ALL_TIMER) {
		clearTimeout(ALL_TIMER[timerName]);
	}
	
	ALL_TIMER = {};
	
	// 2、移除所有连接的 connectionAnimateClass 样式
	$.each(INSTANCE_JSPLUMB.getAllConnections('*'), function() {
		$(this)[0].removeClass('connectionAnimateClass');
	});
}

/**
 * 除了 id 之外的节点，将节点变为非选中状态，若不传参数则表示将所有的节点变为非选中状态
 * @param {String} id
 */
function changeToNoSelected(id) {
	var selector;
	
	//清除所有jsplumb中的拖拽列表
	INSTANCE_JSPLUMB.clearDragSelection();
	
	//清空被选中节点列表
	SELECTED_NODE_LIST = [];
	
	if (id == undefined) {
		selector = '.moveLight';
	} else {
		selector = '.moveLight:not(#' + id + ')';
	}
	
	// 将节点变为非选中状态
	$.each($(selector), function() {
		$(this).css('box-shadow', NODE_NO_SELECTED_BOX_SHADOW);
		graph.node($(this).attr('id')).isSelected = false;
	});
}

/**
 * 全选
 */
function selectedAll() {
	$.each($('.moveLight'), function(index) {
		//将所有节点的样式改为选中的样式
		$(this).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
		//清除所有的定时器
		clearAllTimer();
		//将所有的节点选中状态改为选中
		graph.node($(this).attr('id')).isSelected = true;
		//添加到 INSTANCE_JSPLUMB 被选中列表中
		INSTANCE_JSPLUMB.addToDragSelection($(this).attr('id'));
		//多选标识改为true
		SELECTED_MULTIPLE_FLAG = true;
	});
	
	//添加到被选中节点列表中，全选采用的是图对象中的被选中的节点 id 列表
	getSelectedNodeIdArr2SelectedNodeList();
}

/**
 * 选中节点
 * @param {String} id 节点id
 */
function selectedNode(id) {
	//清除所有的定时器
	clearAllTimer();
	
	if (SELECTED_NODE_LIST.indexOf(id) == -1) {
		//将节点的样式改为选中的样式
		$(getJquerySelectorPrefix(id)).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
		//将节点选中状态改为选中
		graph.node(id).isSelected = true;
		//添加到 INSTANCE_JSPLUMB 被选中列表中
		INSTANCE_JSPLUMB.addToDragSelection(id);
		//添加到被选中节点列表中
		SELECTED_NODE_LIST.push(id);
	}
	
	//多选标识改为true
	SELECTED_MULTIPLE_FLAG = true;
}

/**
 * 不选中节点
 * @param {String} id 节点id
 */
function noSelectedNode(id) {
	if (SELECTED_NODE_LIST.indexOf(id) != -1) {
		//将节点的样式改为非选中的样式
		$(getJquerySelectorPrefix(id)).css('box-shadow', NODE_NO_SELECTED_BOX_SHADOW);
		//将节点选中状态改为选中
		graph.node(id).isSelected = false;
		//从INSTANCE_JSPLUMB被选中列表中移除
		INSTANCE_JSPLUMB.removeFromDragSelection(id);
		//从被选中节点列表中移除
		deleteDataFromArr(SELECTED_NODE_LIST, id);
	}
}

/**
 * 删除连接线
 * @param {String} connId
 */
function deleteConnection(connId) {
	layer.confirm(CONFIG.msg.deleteConn, { icon: 7, title: '提示' }, function(index) {
		//保存状态为未保存
		$("#saveStatus").css('display', '');
		//将当前流程对象放入可撤销数组中
		UNDO_ARR.push(getCurrentFlowDoc());
		
		//清除定时器，这里清除定时器的目的是防止显示后继路径动画时删除动画的连接会报错
		clearAllTimer();
		
		//移除端点以及线段
		var sourceId = $(connId).attr('sourceId');
		var targetId = $(connId).attr('targetId');
		var e = graph.edge(sourceId, targetId);
		if (e.sourceEndPointId != undefined) {
			INSTANCE_JSPLUMB.deleteEndpoint(e.sourceEndPointId);
			INSTANCE_JSPLUMB.deleteEndpoint(e.targetEndPointId);
		} else {
			//移除线段
			INSTANCE_JSPLUMB.deleteConnection(INSTANCE_JSPLUMB.getConnections({
				source: sourceId,
				target: targetId
			})[0]);
		}
		
		//删除数据库中路由线的数据
		var deleteRouter = [];
		deleteRouter.push(getRemovePrefixId(connId));
		deleteNodeFromDB(deleteRouter);
		
		//移除图对象中的线段
		graph.removeEdge(sourceId, targetId);
		
		//移除连接线id记录
		//removeNodeId(getRemovePrefixId(connId));
		
		//关闭提示窗口
		layer.close(index);
	});
}

/**
 * 鼠标工具
 */
function mouseTool() {
	var nodeArr = graph.nodes();
	
	//切换显示
	$('#connectionToolsBtn').css('color', '#444444');
	$('#mouseToolsBtn').css('color', 'blue');
	//修改鼠标样式
	$('#Container').css('cursor', 'default');
	//鼠标工具可以使用多选框
	var $events = $._data($('#Container')[0], 'events');
	if (!$events || !$events['mousedown']) {
		$('#Container').bind('mousedown', function() {
			//在画布中按下鼠标获取鼠标位置
			px = event.pageX;
			py = event.pageY;
			isClear = true;
		});
	}
	
	$.each(nodeArr, function(index) {
		ableDraggable(nodeArr[index]);
		//修改鼠标样式
		$('#' + nodeArr[index]).css('cursor', 'move');
		INSTANCE_JSPLUMB.unmakeSource(nodeArr[index]);
		INSTANCE_JSPLUMB.unmakeTarget(nodeArr[index]);
	});
}

/**
 * 连线工具
 */
function connectionTool() {
	var nodeArr = graph.nodes();
	
	//切换显示
	$('#mouseToolsBtn').css('color', '#444444');
	$('#connectionToolsBtn').css('color', 'blue');
	//修改鼠标样式
	$('#Container').css('cursor', 'crosshair');
	//连线工具无法使用多选框
	var $events = $._data($('#Container')[0], 'events');
	if ($events && $events['mousedown']) {
		$('#Container').unbind('mousedown');
	}
	
	$.each(nodeArr, function(index) {
		unableDraggable(nodeArr[index]);
		//修改鼠标样式
		$('#' + nodeArr[index]).css('cursor', 'crosshair');
		var n = graph.node(nodeArr[index]);
		var sourceAnchors = chooseAnchorsByType(n.nodeType, 'Source');
		var targetAnchors = chooseAnchorsByType(n.nodeType, 'Target');
		INSTANCE_JSPLUMB.makeSource(nodeArr[index], {
            filter: "a",
            filterExclude: true,
            maxConnections: -1,
            endpoint: [ "Dot", { radius: 7 } ],
            anchor: sourceAnchors
        }, common);
        INSTANCE_JSPLUMB.makeTarget(nodeArr[index], {
            filter: "a",
            filterExclude: true,
            maxConnections: -1,
            endpoint: [ "Dot", { radius: 7 } ],
            anchor: targetAnchors
        }, common);
	});
}

/**
 * 左对齐
 * @param {Array} selectedNodeIdArr 被选中的节点id数组
 */
function leftAlign(selectedNodeIdArr) {
	//初始值，对齐第一个选中的节点
	var topCount = parseInt($('#' + selectedNodeIdArr[0]).css('top'));
	var leftCount = parseInt($('#' + selectedNodeIdArr[0]).css('left'));
	
	//只对齐被选中的节点
	for (var i = 1; i < selectedNodeIdArr.length; i++) {
		//下一个节点的 top 是上一个节点的 top 加上上一个节点的 height 加上垂直间距
		topCount = topCount + parseInt($('#' + selectedNodeIdArr[i - 1]).css('height')) + CONFIG.alignParam.verticalDistance;
		//下一个节点的 left 是第一个节点的 left
		//leftCount = leftCount;
		//动画效果移动节点到 topCount、leftCount 的位置，动画持续时间为 500ms
		INSTANCE_JSPLUMB.animate(selectedNodeIdArr[i], { top: topCount, left: leftCount }, { duration: CONFIG.alignParam.alignDuration } );
	}
}

/**
 * 垂直居中
 * @param {Array} selectedNodeIdArr 被选中的节点id数组
 */
function verticalCenter(selectedNodeIdArr) {
	//初始值，对齐第一个选中的节点
	var topCount = parseInt($('#' + selectedNodeIdArr[0]).css('top'));
	var leftCount = parseInt($('#' + selectedNodeIdArr[0]).css('left'));
	var leftTemp = leftCount;
	
	//只对齐被选中的节点
	for (var i = 1; i < selectedNodeIdArr.length; i++) {
		//下一个节点的 top 是上一个节点的 top 加上上一个节点的 height 加上垂直间距
		topCount = topCount + parseInt($('#' + selectedNodeIdArr[i - 1]).css('height')) + CONFIG.alignParam.verticalDistance;
		//下一个节点的 left 是第一个节点的 width 减去下一个节点的 width 的一半加上第一个节点的left
		leftCount = leftTemp + (parseInt($('#' + selectedNodeIdArr[0]).css('width')) - parseInt($('#' + selectedNodeIdArr[i]).css('width'))) / 2;
		//动画效果移动节点到 topCount、leftCount 的位置，动画持续时间为 500ms
		INSTANCE_JSPLUMB.animate(selectedNodeIdArr[i], { top: topCount, left: leftCount }, { duration: CONFIG.alignParam.alignDuration } );
	}
}

/**
 * 右对齐
 * @param {Array} selectedNodeIdArr 被选中的节点id数组
 */
function rightAlign(selectedNodeIdArr) {
	//初始值，对齐第一个选中的节点
	var topCount = parseInt($('#' + selectedNodeIdArr[0]).css('top'));
	var leftCount = parseInt($('#' + selectedNodeIdArr[0]).css('left'));
	var leftCountTemp = leftCount;
	
	//只对齐被选中的节点
	for (var i = 1; i < selectedNodeIdArr.length; i++) {
		//下一个节点的 top 是上一个节点的 top 加上上一个节点的 height 加上垂直间距
		topCount = topCount + parseInt($('#' + selectedNodeIdArr[i - 1]).css('height')) + CONFIG.alignParam.verticalDistance;
		//下一个节点的 left 是第一个节点的 left 加上第一个节点的 width 减去下一个节点的 width
		leftCount = leftCountTemp + (parseInt($('#' + selectedNodeIdArr[0]).css('width')) - parseInt($('#' + selectedNodeIdArr[i]).css('width')));
		//动画效果移动节点到 topCount、leftCount 的位置，动画持续时间为 500ms
		INSTANCE_JSPLUMB.animate(selectedNodeIdArr[i], { top: topCount, left: leftCount }, { duration: CONFIG.alignParam.alignDuration } );
	}
}

/**
 * 上对齐
 * @param {Array} selectedNodeIdArr 被选中的节点id数组
 */
function upAlign(selectedNodeIdArr) {
	//初始值，对齐第一个选中的节点
	var topCount = parseInt($('#' + selectedNodeIdArr[0]).css('top'));
	var leftCount = parseInt($('#' + selectedNodeIdArr[0]).css('left'));
	
	//只对齐被选中的节点
	for (var i = 1; i < selectedNodeIdArr.length; i++) {
		//下一个节点的 top 是第一个节点的 top
		//topCount = topCount;
		//下一个节点的 left 是上一个节点的 left 加上一个节点的 width 加上水平间距
		leftCount = leftCount + parseInt($('#' + selectedNodeIdArr[i - 1]).css('width')) + CONFIG.alignParam.levelDistance;
		//动画效果移动节点到 topCount、leftCount 的位置，动画持续时间为 500ms
		INSTANCE_JSPLUMB.animate(selectedNodeIdArr[i], { top: topCount, left: leftCount }, { duration: CONFIG.alignParam.alignDuration } );
	}
}

/**
 * 水平居中
 * @param {Array} selectedNodeIdArr 被选中的节点id数组
 */
function levelAlign(selectedNodeIdArr) {
	//初始值，对齐第一个选中的节点
	var topCount = parseInt($('#' + selectedNodeIdArr[0]).css('top'));
	var topCountTemp = topCount;
	var leftCount = parseInt($('#' + selectedNodeIdArr[0]).css('left'));
	
	//只对齐被选中的节点
	for (var i = 1; i < selectedNodeIdArr.length; i++) {
		//下一个节点的 top 是第一个节点的 height 减去下一个节点的 height 的一半加上第一个节点的top
		topCount = topCountTemp + (parseInt($('#' + selectedNodeIdArr[0]).css('height')) - parseInt($('#' + selectedNodeIdArr[i]).css('height'))) / 2;
		//下一个节点的 left 是上一个节点的 left 加上上一个节点的 width 加上水平间距
		leftCount = leftCount + parseInt($('#' + selectedNodeIdArr[i - 1]).css('width')) + CONFIG.alignParam.levelDistance;
		//动画效果移动节点到 topCount、leftCount 的位置，动画持续时间为 500ms
		INSTANCE_JSPLUMB.animate(selectedNodeIdArr[i], { top: topCount, left: leftCount }, { duration: CONFIG.alignParam.alignDuration } );
	}
}

/**
 * 下对齐
 * @param {Array} selectedNodeIdArr 被选中的节点id数组
 */
function downAlign(selectedNodeIdArr) {
	//初始值，对齐第一个选中的节点
	var topCount = parseInt($('#' + selectedNodeIdArr[0]).css('top'));
	var topCountTemp = topCount;
	var leftCount = parseInt($('#' + selectedNodeIdArr[0]).css('left'));
	
	//只对齐被选中的节点
	for (var i = 1; i < selectedNodeIdArr.length; i++) {
		//下一个节点的 top 是第一个节点的 top 加上第一个节点的 height 减去下一个节点的 height
		topCount = topCountTemp + (parseInt($('#' + selectedNodeIdArr[0]).css('height')) - parseInt($('#' + selectedNodeIdArr[i]).css('height')));
		//下一个节点的 left 是上一个节点的 left 加上一个节点的 width 加上水平间距
		leftCount = leftCount + parseInt($('#' + selectedNodeIdArr[i - 1]).css('width')) + CONFIG.alignParam.levelDistance;
		//动画效果移动节点到 topCount、leftCount 的位置，动画持续时间为 500ms
		INSTANCE_JSPLUMB.animate(selectedNodeIdArr[i], { top: topCount, left: leftCount }, { duration: CONFIG.alignParam.alignDuration } );
	}
}

/**
 * 微移
 * @param {String} moveType 移动类型
 */
function smallMove(moveType) {
	//保存状态为未保存
	$("#saveStatus").css('display', '');
	
	var t, l, movePX = CONFIG.defaultConfig.smallMovePX;
	switch (moveType) {
		case 'up':
			t = -movePX;
			l = 0;
			break;
		case 'down':
			t = movePX;
			l = 0;
			break;
		case 'left':
			t = 0;
			l = -movePX;
			break;
		case 'right':
			t = 0;
			l = movePX;
			break;
	}
	
	//获取被选中的节点id列表
	var selectedArr = getSelectedNodeIdArr(), i;
	//移动每一个被选中的元素
	for (i = 0; i < selectedArr.length; i++) {
		var newTop = $(getJquerySelectorPrefix(selectedArr[i])).offset().top + t;
		var newLeft = $(getJquerySelectorPrefix(selectedArr[i])).offset().left + l;
		$(getJquerySelectorPrefix(selectedArr[i])).offset({ top: newTop, left: newLeft });
		
		//更新图对象
		graph.node(selectedArr[i]).locTop = newTop;
		graph.node(selectedArr[i]).locLeft = newLeft;
	}
	
	//重绘
	repaintAll();
}

/**
 * 退出流程设计器，具有提示当前流程图是否已保存的功能
 */
function closeFrame() {
	var saveStatus = $('#saveStatus').css('display');
	if (saveStatus == 'block') {
		layer.confirm(CONFIG.msg.closeFrame, { icon: 7, title: '提示' }, function(index) {
			layer.close(index);
			parent.window.close();
		});
	} else {
		parent.window.close();
	}
}

/**
 * 缺省保存
 */
function saveAllDefaultNode() {
	var sendDataArr = [];
	var processId = parent.$('#mainDiv').attr('processid');
	var s = projectName + 'rule?wf_num=R_S002_B011&Action=SaveAllDefaultNode&Processid=' + processId + '&Nodeid=';
	
	//拼接请求数据
	var nodeArr = graph.nodes();
	$.each(nodeArr, function(index) {
		var nodeId = nodeArr[index];
		var nodeType = graph.node(nodeArr[index]).nodeType;
		if (nodeType == 'start') {
			var d = s.concat(nodeId).concat('&NodeType=').concat('StartNode');
			sendDataArr.push(d);
		} else if (nodeType == 'end') {
			var d = s.concat(nodeId).concat('&NodeType=').concat('EndNode');
			sendDataArr.push(d);
		}
	});
	var edgeArr = graph.edges();
	$.each(edgeArr, function(index) {
		var d = s.concat(graph.edge(edgeArr[index].v, edgeArr[index].w).id).concat('&NodeType=Router').concat('&StartNodeid=').concat(edgeArr[index].v).concat('&EndNodeid=').concat(edgeArr[index].w);
		sendDataArr.push(d);
	});
	
	//发送数据
	$.each(sendDataArr, function(index) {
		var conn = Ext.lib.Ajax.getConnectionObject().conn;
		//console.log('发送请求：' + sendDataArr[index]);
		conn.open('post', sendDataArr[index], false);
		conn.send();
		if (conn.status == '200') {
			//console.log('缺省属性保存成功!');
			//ShowErrorInfo("缺省属性保存成功!");
		} else {
			//console.log('缺省属性保存失败!');
			//ShowErrorInfo("缺省属性保存失败!");
		}
	});
}

/**
 * 设置打开属性编辑子窗口的相关参数
 * @param {String} a 节点id
 * @param {String} b 类型
 */
function SetProperty(a, b) {
	var c = "";
	var d = parent.$('#mainDiv').attr('processid');
	var e = screen.availWidth;
	var f = screen.availHeight;
	var g = "960";
	var h = "530";
	var i = (e / 2 - 0) - g / 2;
	var j = (f / 2 - 0) - h / 2;
	if(b == "Activity") {
		c = "userTask"
	} else if(b == "AutoActivity") {
		c = "businessRuleTask"
	} else if(b == "Edge") {
		c = "Gateway"
	} else if(b == "EndNode") {
		c = "endEvent"
	} else if(b == "StartNode") {
		c = "startEvent"
	} else if(b == "Router") {
		c = "sequenceFlow";
		c += "&SourceNode=" + $('#' + a).attr('sourceid') + "&TargetNode=" + $('#' + a).attr('targetid');
	} else if(b == "Process") {
		c = "Process"
	} else if(b == "Event") {
		c = "Event"
	} else if(b == "SubProcess") {
		c = "subProcess"
	} else if(b == "OutProcess") {
		c = "outProcess"
	}
	var k = "";
	if(b == "Process") {
		k = "Process"
	} else {
		k = a;
	}
	var l = projectName + "rule?wf_num=R_S002_B002&Processid=" + d + "&Nodeid=" + k + "&ExtNodeType=" + c + "&WF_Appid=" + top.GetUrlArg("WF_Appid");
	var m = 'dialogWidth:780px;dialogHeight:500px;dialogLeft:' + i + ';dialogTop:' + j + ';directories:no; localtion:no; menubar:no; status=no; toolbar=no;scrollbars:no;Resizeable=no;help:0;';
	OpenUrl(l);
}

/**
 * 更新画布中节点的值
 * @param {String} nodeId 要更新的节点id
 * @param {String} text 节点的文本信息
 */
function SetPropertyVal(nodeId, text) {
	//保存状态为未保存
	$("#saveStatus").css('display', '');
	//将当前流程对象放入可撤销数组中
	UNDO_ARR.push(getCurrentFlowDoc());
	
	text = text.trim();
	var prefix = nodeId.substring(0, 1);
	if (prefix != 'R') {
		//更新图对象
		graph.node(getRemovePrefixId(nodeId)).text = text;
		graph.node(getRemovePrefixId(nodeId)).alreadySetName = true;
		
		//更新节点属性，若文本信息过长，则显示为省略形式
		if (text.length > 5) {
			text = text.substring(0, 5) + '...';
		}
		$(getJquerySelectorPrefix(nodeId)).children(':first-child').text(text);
	} else {
		//更新路由信息
		setRouterLabel($(getJquerySelectorPrefix(nodeId)).attr('sourceid'), $(getJquerySelectorPrefix(nodeId)).attr('targetid'), text);
	}
}

/**
 * 打开属性编辑子窗口
 * @param {String} a url
 * @param {String} b
 * @param {String} c
 */
function OpenUrl(a, b, c) {
	var d = screen.availWidth;
	var e = screen.availHeight;
	if(!b) b = 24;
	if(!c) c = 80;
	var f = d - b;
	var g = e - c;
	var h = (d / 2 - 0) - f / 2 - 5;
	var i = (e / 2 - 0) - g / 2 - 25;
	var d = screen.availWidth;
	var e = screen.availHeight;
	var f = "850";
	var g = "500";
	var h = (d / 2 - 0) - f / 2;
	var i = (e / 2 - 0) - g / 2;
	return window.open(a, '', 'Width=' + f + 'px,Height=' + g + 'px,Left=' + h + ',Top=' + i + ',location=no,menubar=no,status=yes,resizable=yes,scrollbars=auto,resezie=no')
}
