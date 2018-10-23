/**
 * 初始化jsPlumb实例对象
 */
function initJsPlumbInstance() {
	INSTANCE_JSPLUMB = null;
	INSTANCE_JSPLUMB = jsPlumb.getInstance({
		PaintStyle: {
			strokeStyle: '#2a2929',
			stroke: '#2a2929',
			strokeWidth: 4,
			//fill: 'pink',
			fillStyle: '#1e8151',
			radius: 5
		},
		HoverPaintStyle: {
			stroke: 'blue'
		}
	});
   
    /**
	 * 连接建立之前的检查。当出现自连接的情况后，要将链接断开，若正常连接，判断连接路径是否重复。将连线添加到图对象中
	 */
	INSTANCE_JSPLUMB.bind('beforeDrop', function(info) {
		if(info.sourceId !== info.targetId) {
			if (graph.hasEdge(info.sourceId, info.targetId)) {
				layer.tips(CONFIG.msg.repeatRouter, getJquerySelectorPrefix(info.sourceId), {
					tips: [2, '#23262e'],
					time: 1000
				});
				return false;
			}
			
			UNDO_ARR.push(getCurrentFlowDoc());
			//保存状态为未保存
			$("#saveStatus").css('display', '');
			var connId = getNextNodeId('R');
			//记录id到节点id对象
			recordNodeId(connId);
			var o = {};
			o.s = info.sourceId;
			o.t = info.targetId;
			o.c = connId;
			CONN_INFO_ARR.push(o);
			
			//连线的锚点信息
			var sourceAnchors = CONFIG.anchors.sourceAnchors;
			sourceAnchors = sourceAnchors.length > 0 ? sourceAnchors : CONFIG.anchors.defaultAnchors;
			var targetAnchors = CONFIG.anchors.targetAnchors;
			targetAnchors = targetAnchors.length > 0 ? targetAnchors : CONFIG.anchors.defaultAnchors;
			
			if (info.sourceId.substring(0, 1) == 'G') {
				sourceAnchors = [
					[0, 1, 0, 1],
					[0.7, 0.3, 1, 0],
					[0, -0.4, 0, 0],
					[-0.6, 0.3, 0, 0]
				];
			}
			if (info.targetId.substring(0, 1) == 'G') {
				targetAnchors = [
					[0, 1, 0, 1],
					[0.7, 0.3, 1, 0],
					[0, -0.4, 0, 0],
					[-0.6, 0.3, 0, 0]
				];
			}
			
			graph.setEdge(info.sourceId, info.targetId, {
				id: connId,
				sourceAnchors: sourceAnchors,
				targetAnchors: targetAnchors
			});
			
			return true;
		} else {
			return false;
		}
	});
	
	/**
	 * 连接建立时给连接线添加id、右击菜单、连线双击打开属性编辑事件
	 */
	INSTANCE_JSPLUMB.bind('connection', function(a, b) {
		var obj = CONN_INFO_ARR.shift();
		if (obj != undefined) {
			//给连接线添加id、右击菜单
			a.connection.canvas.id = obj.c;
			$('#' + obj.c).attr('sourceId', obj.s);
			$('#' + obj.c).attr('targetId', obj.t);
			window.ContextMenu.bind("#" + obj.c, connectionMenuJson);
			
			//给连接线添加双击事件
			$('#' + obj.c).dblclick(function(event) {
				editProperty(obj.c);
			});
		}
	});

	//一般来说拖动创建的链接，可以再次拖动，让链接断开。如果不想触发这种行为，可以设置如下
	INSTANCE_JSPLUMB.importDefaults({
		ConnectionsDetachable: CONFIG.conn.isDetachable
	});
}

/**
 * 重绘流程图
 */
function repaintAll() {
	INSTANCE_JSPLUMB.repaintEverything();
}

/**
 * 根据id获取类型添加端点
 * @param {String} id
 */
function addEndPointById(id, anchors) {
	var nodeType = graph.node(id).nodeType;
	var endPointId = id + '-' + uuid();
	INSTANCE_JSPLUMB.addEndpoint(id, {
		uuid: endPointId,
		anchors: anchors
	}, common);
	
	return endPointId;
}

/**
 * 根据类型选择锚点
 * @param {String} type
 */
function chooseAnchorsByType(type, sor) {
	var anchors;
	switch (type) {
		case 'gateWay':
			anchors = [
				[0, 1, 0, 1],
				[0.7, 0.3, 1, 0],
				[0, -0.4, 0, 0],
				[-0.6, 0.3, 0, 0]
			]
			break;
		default:
			/**
			 * 锚点，可选值
			 * Top(TopCenter)、TopRight、Right(RightMiddle)、BottomRight、Bottom(BottomCenter)、BottomLeft、Left(LeftMiddle)、TopLeft、Center
			 */
			if (sor != undefined) {
				if (sor == 'Source') {
					var sourceArr = CONFIG.anchors.sourceAnchors;
					if (sourceArr.length > 0) {
						anchors = sourceArr;
					} else {
						anchors = CONFIG.anchors.defaultAnchors;
					}
				} else if (sor == 'Target') {
					var targetArr = CONFIG.anchors.targetAnchors;
					if (targetArr.length > 0) {
						anchors = targetArr;
					} else {
						anchors = CONFIG.anchors.defaultAnchors;
					}
				} else {
					anchors = CONFIG.anchors.defaultAnchors;
				}
			} else {
				anchors = CONFIG.anchors.defaultAnchors;
			}
			break;
	}
	return anchors;
}

/**
 * 给连接线添加id、右击菜单，该方法在异步调用时不稳定，慎用！
 * @param {String} sourceId 源节点id
 * @param {String} targetId 目标节点id
 * @param {String} connId 连接线id
 */
function addConnectionId(sourceId, targetId, connId) {
	$.each($('svg.jtk-connector'), function() {
		if ($(this).attr('id') == undefined) {
			$(this).attr('id', connId);
			$(this).attr('sourceId', sourceId);
			$(this).attr('targetId', targetId);
			window.ContextMenu.bind("#" + $(this).attr('id'), connectionMenuJson);
		}
	});
}

/**
 * 获取路由文本信息
 * @param {String} sourceId 源节点id
 * @param {String} targetId 目标节点id
 */
function getRouterLabel(sourceId, targetId) {
	var routerLabel = INSTANCE_JSPLUMB.getConnections({
		source: getRemovePrefixId(sourceId),
		target: getRemovePrefixId(targetId)
	})[0].getLabel();
	if (routerLabel == null || routerLabel == undefined) return '';
	return routerLabel;
}

/**
 * 设置路由文本信息
 * @param {String} sourceId 源节点id
 * @param {String} targetId 目标节点id
 * @param {String} label 要设置的文本值
 */
function setRouterLabel(sourceId, targetId, label) {
	if (label == null || label == undefined || label == '') {
		label = '';
		INSTANCE_JSPLUMB.getConnections({
			source: getRemovePrefixId(sourceId),
			target: getRemovePrefixId(targetId)
		})[0].removeAllOverlays();
		
		return;
	}
	INSTANCE_JSPLUMB.getConnections({
		source: getRemovePrefixId(sourceId),
		target: getRemovePrefixId(targetId)
	})[0].setLabel({
		label: label, 
		cssClass: 'labelClass'
	});
}

/**
 * 设置节点可拖拽
 * @param {String} nodeId 节点id
 */
function setNodeDraggable(nodeId) {
	var scrollX;
	var scrollY;
	INSTANCE_JSPLUMB.draggable(nodeId, {
		filter:".enableDraggable",
		containment: 'parent',
		//grid: [10, 10],
		//拖拽前记录当前的流程文档对象
		start: function() {
			UNDO_ARR.push(getCurrentFlowDoc());
		},
		//拖拽过程中实时更新节点位置
		drag: function(event) {
			//当前滚动条位置
			scrollX = $('#canvasId').scrollLeft();
			scrollY = $('#canvasId').scrollTop();
			if (!SELECTED_MULTIPLE_FLAG) {
				layer.tips('X: ' + parseInt($('#' + event.el.id).offset().left - 251 + scrollX) + '  Y: ' + parseInt($('#' + event.el.id).offset().top - 61 + scrollY), getJquerySelectorPrefix(event.el.id), {
					tips: [1, '#23262e'],
					time: 2000
				});
			}
		},
		//拖拽结束后更新图对象中存储的节点位置
		stop: function(event) {
			//更新图对象
			var id = event.el.id;
			updateGraphNode(id);
			var x = $('#' + id).offset().left + scrollX;
			var y = $('#' + id).offset().top + scrollY;
			var node = graph.node(id);
			node.locLeft = x;
			node.locTop = y;
		}
	});
}

/**
 * 允许节点被拖拽
 * @param {String} nodeId 节点id
 */
function ableDraggable(nodeId) {
	var flag = INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	if (!flag) {
		INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	}
}

/**
 * 禁止节点被拖拽
 * @param {String} nodeId 节点id
 */
function unableDraggable(nodeId) {
	var flag = INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	if (flag) {
		INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	}
}

/**
 * 设置节点可缩放
 * @param {String} id
 */
function nodeResizable(id) {
	id = getJquerySelectorPrefix(id);
	//设置节点可缩放
	$(id).resizable({
		//设置允许元素调整的最小高度
		minHeight: 50,
		//设置允许元素调整的最小宽度
		minWidth: 100,
		//设置允许元素调整的最大高度
		//maxHeight: 300,
		//设置允许元素调整的最大宽度
		//maxWidth: 600,
		//缩放时保持纵横比
		//aspectRatio: 1/1,
		//缩放时的动画
		animate: true,
		//动画效果种类
		animateEasing: 'easeOutElastic',
		//动画效果持续时间
		animateDuration: 500,
		//缩放时的视觉反馈
		ghost: true,
		//默认隐藏掉可调整大小的手柄，除非鼠标移至元素上
		autoHide: true,
		//缩放结束后需要重新设置节点文字样式、重绘流程图，这个地方需要用到计时器，等动画结束之后重绘。更新图对象
		stop: function(event, ui) {
			var $this = $(this);
			setTimeout(function() {
				$this.css('line-height', $this.css('height'));
				repaintAll();
				//更新图对象
				updateGraphNode($this.attr('id'));
			}, 510);
		}
	});
	
	//设置节点可缩放后样式被改成了 relative，这里需要再次设置为 absolute
	$(id).css('position', 'absolute');
}

/**
 * 
 * @param {String} id 泳道id
 */
function laneResizable(id) {
	id = getJquerySelectorPrefix(id);
	//设置节点可缩放
	$(id).resizable({
		//设置允许元素调整的最小高度
		minHeight: 150,
		//设置允许元素调整的最小宽度
		minWidth: 200,
		//设置允许元素调整的最大高度
		//maxHeight: 300,
		//设置允许元素调整的最大宽度
		//maxWidth: 600,
		//缩放时保持纵横比
		//aspectRatio: 1/1,
		//缩放时的动画
		animate: true,
		//动画效果种类
		animateEasing: 'easeOutElastic',
		//动画效果持续时间
		animateDuration: 300,
		//缩放时的视觉反馈
		ghost: true,
		//默认隐藏掉可调整大小的手柄，除非鼠标移至元素上
		autoHide: true,
		//缩放开始时设置两个值防止缩放过程中出现多选框
		start: function(event, ui) {
			px = '';
			py = '';
		},
		//缩放结束后需要重新设置节点文字样式、重绘流程图，这个地方需要用到计时器，等动画结束之后重绘。更新泳道对象
		stop: function(event, ui) {
			var $this = $(this);
			var thisChildId = $this.children(':first-child')[0].id;
			var thisGraphNode = LANEOBJS[$this.attr('id')];
			setTimeout(function() {
				if (thisGraphNode.nodeType == 'broadwiseLane') {
					$('#' + thisChildId).css('height', parseInt($this.css('height')) - 3);
					$('#' + thisChildId).css('line-height', getLaneLineHeight(thisGraphNode.text, $('#' + thisChildId).css('height')));
				}
				//更新图对象
				updateLaneObjs($this.attr('id'));
			}, 310);
		}
	});
	
	//设置节点可缩放后样式被改成了 relative，这里需要再次设置为 absolute
	$(id).css('position', 'absolute');
}
