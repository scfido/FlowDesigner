var demoData = {
	"nodeDataArray": [
		{
			"text": "开始",
			"key": "E00001",
			"nodeType": "start",
			"locTop": 539,
			"locLeft": 507,
			"nodeHeight": "60px",
			"nodeWidth": "60px",
			"bgColor": "#78dc6b"
		},
		{
			"text": "填写申请单",
			"key": "T00001",
			"nodeType": "comm",
			"locTop": 538.97998046875,
			"locLeft": 743,
			"nodeHeight": "60px",
			"nodeWidth": "100px",
			"bgColor": "#6babdc"
		},
		{
			"text": "财务部审批",
			"key": "T00002",
			"nodeType": "comm",
			"locTop": 378.97998046875,
			"locLeft": 743,
			"nodeHeight": "60px",
			"nodeWidth": "100px",
			"bgColor": "#6babdc"
		},
		{
			"text": "总经理审批",
			"key": "T00003",
			"nodeType": "comm",
			"locTop": 219,
			"locLeft": 743,
			"nodeHeight": "60px",
			"nodeWidth": "100px",
			"bgColor": "#6babdc"
		},
		{
			"text": "发放资金",
			"key": "T00004",
			"nodeType": "comm",
			"locTop": 387,
			"locLeft": 974,
			"nodeHeight": "60px",
			"nodeWidth": "100px",
			"bgColor": "#6babdc"
		},
		{
			"text": "确认资金",
			"key": "T00005",
			"nodeType": "comm",
			"locTop": 547,
			"locLeft": 974,
			"nodeHeight": "60px",
			"nodeWidth": "100px",
			"bgColor": "#6babdc"
		},
		{
			"text": "结束",
			"key": "E00002",
			"nodeType": "end",
			"locTop": 219,
			"locLeft": 1271,
			"nodeHeight": "60px",
			"nodeWidth": "60px",
			"bgColor": "#dc6b6b"
		},
		{
			"text": "结束",
			"key": "E00003",
			"nodeType": "end",
			"locTop": 547,
			"locLeft": 1280,
			"nodeHeight": "60px",
			"nodeWidth": "60px",
			"bgColor": "#dc6b6b"
		}
	],
	"linkDataArray": [
		{
			"from": "E00001",
			"to": "T00001",
			"routerId": "R00001",
			"label": "",
			"sourceAnchors": [ "Bottom", "Right", "Top", "Left" ],
			"targetAnchors": [ "Bottom", "Right", "Top", "Left"]
		},
		{
			"from": "T00001",
			"to": "T00002",
			"routerId": "R00002",
			"label": "",
			"sourceAnchors": [ "Bottom", "Right", "Top", "Left" ],
			"targetAnchors": [ "Bottom", "Right", "Top", "Left" ]
		},
		{
			"from": "T00002",
			"to": "T00003",
			"routerId": "R00003",
			"label": "",
			"sourceAnchors": [ "Bottom", "Right", "Top", "Left" ],
			"targetAnchors": [ "Bottom", "Right", "Top", "Left" ]
		},
		{
			"from": "T00003",
			"to": "E00002",
			"routerId": "R00004",
			"label": "不同意",
			"sourceAnchors": [ "Bottom", "Right", "Top", "Left" ],
			"targetAnchors": [ "Bottom", "Right", "Top", "Left" ]
		},
		{
			"from": "T00003",
			"to": "T00004",
			"routerId": "R00005",
			"label": "同意",
			"sourceAnchors": [ "Bottom", "Right", "Top", "Left" ],
			"targetAnchors": [ "Bottom", "Right", "Top", "Left" ]
		},
		{
			"from": "T00004",
			"to": "T00005",
			"routerId": "R00006",
			"label": "",
			"sourceAnchors": [ "Bottom", "Right", "Top", "Left" ],
			"targetAnchors": [ "Bottom", "Right", "Top", "Left" ]
		},
		{
			"from": "T00005",
			"to": "E00003",
			"routerId": "R00007",
			"label": "",
			"sourceAnchors": [ "Bottom", "Right", "Top", "Left" ],
			"targetAnchors": [ "Bottom", "Right", "Top", "Left" ]
		},
		{
			"from": "T00003",
			"to": "T00002",
			"routerId": "R00008",
			"label": "回退",
			"sourceAnchors": [ "Left" ],
			"targetAnchors": [ "Left" ]
		}
	]
};

/**
 * jsPlumb模块
 */
var common;
jsPlumb.ready(function() {
	//读取配置
	$.ajax({
	    url: "../config/config.json",
	    //同步请求
	    async: false,
	    type: 'get',
	    success: function(data) {
			CONFIG = data;
	    }
	});
	
	//初始化
	init();
	
	//创建连接时的默认值配置
	common = {
		/**
		 * 设置链接线的形状
		 * Bezier(贝塞尔曲线，默认)、Straight(直线)、Flowchart(流程图线)、StateMachine(状态线)
		 */
		connector: [
			CONFIG.conn.connectionType, 
			{
				gap: CONFIG.conn.connectionGap, 
				cornerRadius: CONFIG.conn.connectionCornerRadius, 
				alwaysRespectStubs: CONFIG.conn.connectionAlwaysRespectStubs
			}
		],

		/**
		 * 给连线添加箭头，写在配置中的名字为 connectorOverlays，写在连接中的名字为 overlays
		 * location 0.5 表示箭头位于中间，location 1 表示箭头设置在连线末端。 一根连线是可以添加多个箭头的。
		 */
		connectorOverlays: [
			['Arrow', { width: CONFIG.arrow.arrowWidth, length: CONFIG.arrow.arrowLength, location: CONFIG.arrow.arrowLocation }]
		],

		/**
		 * 设置端点样式
		 */
		paintStyle: {
			strokeStyle: '#2a2929',
			stroke: '#2a2929',
			strokeWidth: CONFIG.endPonit.endPointStrokeWidth,
			fill: 'pink',
			fillStyle: '#1e8151',
			radius: CONFIG.endPonit.endPointRadius
		},

		/**
		 * 鼠标悬浮在连接线上端点的样式
		 */
		hoverPaintStyle: {
			stroke: CONFIG.endPonit.hoverEndPointStroke,
		}

		/**
		 * 基本连接线样式
		 */
		/*connectorStyle: {
			lineWidth: 200,
			strokeStyle: '#61B7CF',
			stroke: 'black'
			joinstyle: 'round',
			fill: 'pink',
			outlineColor: '',
			outlineWidth: ''
		}*/

		/**
		 * 鼠标悬浮在连接线上的样式
		 */
		/*connectorHoverStyle: {
			lineWidth: 2,
			strokeStyle: 'red',
			outlineWidth: 10,
			outlineColor: ''
		}*/

		//用户在拖动时，自动创建链接。
		//isSource: true,
		//isTarget: true
	}
	
	window.ContextMenu.bind("#canvasId", canvasMenuJson);

	//拖拽
	$(".controler").draggable({
		//透明度
		opacity: CONFIG.defaultStyle.dragOpacity,
		//拖拽模式为克隆
		helper: 'clone',
		//标识
		scope: 'node',
		//设置拖拽时鼠标位于节点中心
		cursorAt: {
			top: 27,
			left: 94
		},
		//拖拽未放置到指定区域时动画还原到原位置
		revert: 'invalid',
		//对齐到网格
		//grid: [10, 10]
		start: function(event, ui) {
			$(getJquerySelectorPrefix(event.target.id)).css('font-weight', 'bolder');
		},
		stop: function(event, ui) {
			$(getJquerySelectorPrefix(event.target.id)).css('font-weight', 'normal');
		}
	});

	//放置
	$("#Container").droppable({
		//标识
		scope: 'node',
		//放置触发函数
		drop: function(event, ui) {
			createNewNode(ui.draggable.context.firstElementChild.id, ui.position);
		}
	});
	
	/**
	 * 为画布注册事件
	 */
	$('#Container').click(function() {
		clearAllTimer();
		if (isClear) {
			changeToNoSelected();
			//全选标识改为 false
			SELECTED_MULTIPLE_FLAG = false;
		}
	}).mousemove(function(event) {
		//未按下鼠标时结束方法
		if (px == '' || py == '') {
			return;
		}
		
		//移动一次获取一次矩形宽高
		var pxx = event.pageX;
		var pyy = event.pageY;
		var h = pyy - py;
		var w = pxx - px;
		var scrollX = $('#canvasId').scrollLeft();
		var scrollY = $('#canvasId').scrollTop();
		
		//创建矩形div，只创建一次
		if ($('#multipleSelectedRectangle').attr('id') == undefined) {
			$('#Container').append('<div id="multipleSelectedRectangle" style="background-color:#31676f;"></div>');
		}
		
		//画出矩形
		if (h < 0 && w >= 0) {
            $("#multipleSelectedRectangle").css({ "height": (-h) + "px", "width": w + "px", "position": "absolute", "left": px + scrollX - 250 + "px", "top": pyy + scrollY - 60 + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        else if (h >= 0 && w < 0) {
            $("#multipleSelectedRectangle").css({ "height": h + "px", "width": (-w) + "px", "position": "absolute", "left": pxx + scrollX - 250 + "px", "top": py + scrollY - 60 + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        else if (h < 0 && w < 0) {
            $("#multipleSelectedRectangle").css({ "height": (-h) + "px", "width": (-w) + "px", "position": "absolute", "left": pxx + scrollX - 250 + "px", "top": pyy + scrollY - 60 + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        else {
            $("#multipleSelectedRectangle").css({ "height": h + "px", "width": w + "px", "position": "absolute", "left": px + scrollX - 250 + "px", "top": py + scrollY - 60 + "px", "opacity": "0.2", "border": "1px dashed #000" });
        }
        if (w < 0) {
            w = 0 - w;
        }
        if (h < 0) {
            h = 0 - h;
        }
        
        //获取矩形四个点的坐标
        var x1 = $("#multipleSelectedRectangle").offset().left;
        var y1 = $("#multipleSelectedRectangle").offset().top;
        var x2 = x1 + w;
        var y2 = y1;
        var x3 = x1 + w;
        var y3 = y1 + h;
        var x4 = x1;
        var y4 = y1 + h;
        
        //取出所有的节点，判断每一个节点是否在多选框中，若在多选框中将其状态改为选中
        var nodeArr = graph.nodes(), i;
        for (i = 0; i < nodeArr.length; i++) {
        	var coordinate = getNodeCoordinate(nodeArr[i]);
        	var flag = false;
        	
        	if ((coordinate.x11 > x1 && coordinate.y11 > y1) && (coordinate.x11 < x2 && coordinate.y11 > y2) && (coordinate.x11 < x3 && coordinate.y11 < y3) && (coordinate.x11 > x4 && coordinate.y11 < y4)) {
                flag = true;
            }
            else if ((coordinate.x22 > x1 && coordinate.y22 > y1) && (coordinate.x22 < x2 && coordinate.y22 > y2) && (coordinate.x22 < x3 && coordinate.y22 < y3) && (coordinate.x22 > x4 && coordinate.y22 < y4)) {
                flag = true;
            }
            else if ((coordinate.x33 > x1 && coordinate.y33 > y1) && (coordinate.x33 < x2 && coordinate.y33 > y2) && (coordinate.x33 < x3 && coordinate.y33 < y3) && (coordinate.x33 > x4 && coordinate.y33 < y4)) {
                flag = true;
            }
            else if ((coordinate.x44 > x1 && coordinate.y44 > y1) && (coordinate.x44 < x2 && coordinate.y44 > y2) && (coordinate.x44 < x3 && coordinate.y44 < y3) && (coordinate.x44 > x4 && coordinate.y44 < y4)) {
                flag = true;
            }
                //反向
            else if ((x1 > coordinate.x11 && y1 > coordinate.y11) && (x1 < coordinate.x22 && y1 > coordinate.y22) && (x1 < coordinate.x33 && y1 < coordinate.y33) && (x1 > coordinate.x44 && y1 < coordinate.y44)) {
                flag = true;
            }
            else if ((x2 > coordinate.x11 && y2 > coordinate.y11) && (x2 < coordinate.x22 && y2 > coordinate.y22) && (x2 < coordinate.x33 && y2 < coordinate.y33) && (x2 > coordinate.x44 && y2 < coordinate.y44)) {
                flag = true;
            }
            else if ((x3 > coordinate.x11 && y3 > coordinate.y11) && (x3 < coordinate.x22 && y3 > coordinate.y22) && (x3 < coordinate.x33 && y3 < coordinate.y33) && (x3 > coordinate.x44 && y3 < coordinate.y44)) {
                flag = true;
            }
            else if ((x4 > coordinate.x11 && y4 > coordinate.y11) && (x4 < coordinate.x22 && y4 > coordinate.y22) && (x4 < coordinate.x33 && y4 < coordinate.y33) && (x4 > coordinate.x44 && y4 < coordinate.y44)) {
                flag = true;
            }
                //中间横
            else if ((x1 > coordinate.x11 && y1< coordinate.y11) && (x2 < coordinate.x22 && y2 < coordinate.y22) && (x3 < coordinate.x33 && y3 > coordinate.y33) && (x4 > coordinate.x44 && y4 > coordinate.y44)) {
                flag = true;
            }
                //中间竖
            else if ((coordinate.x11 > x1 && coordinate.y11 < y1) && (coordinate.x22 < x2 && coordinate.y22 < y2) && (coordinate.x33 < x3 && coordinate.y33 > y3) && (coordinate.x44 > x4 && coordinate.y44 > y4)) {
                flag = true;
            }
        	
        	if (flag) {
        		isClear = false;
        		selectedNode(nodeArr[i]);
        	} else {
        		noSelectedNode(nodeArr[i]);
        	}
        }
        
        if (SELECTED_NODE_LIST.length > 0) {
			SELECTED_NODE_LIST.length = 0;
			getSelectedNodeIdArr2SelectedNodeList();
		}
        
	}).mouseup(function() {
		//松开鼠标初始化，移除多选框
		px = '';
		py = '';
		$("#multipleSelectedRectangle").remove();
	});
	
	/**
	 * 为导航注册事件
	 */
	var tempIndex;
	$('.showItemTxt').mouseover(function(event) {
		tempIndex = layer.tips($(this).next().text(), $(this).parent(), {
			tips: [$(this).attr('type'), '#23262e'],
			time: 60000,
			tipsMore: true
		});
	}).mouseout(function(event) {
		layer.close(tempIndex);
	});
	
	/**
	 * 为dom对象注册键盘监听事件
	 */
	$(document).keydown(function(event) {
		switch (event.which) {
			case CONFIG.keyboardParam.multipleSelectedKey: //ctrl 键
				if (!ALLOW_MULTIPLE_SELECTED_FLAG){
					ALLOW_MULTIPLE_SELECTED_FLAG = true;
				}
				break;
			case CONFIG.keyboardParam.deleteKey: //delete 键
				deleteNode();
				break;
			case CONFIG.keyboardParam.upKey: //上
				event.preventDefault();
				smallMove('up');
				break;
			case CONFIG.keyboardParam.downKey: //下
				event.preventDefault();
				smallMove('down');
				break;
			case CONFIG.keyboardParam.leftKey: //左
				event.preventDefault();
				smallMove('left');
				break;
			case CONFIG.keyboardParam.rightKey: //右
				event.preventDefault();
				smallMove('right');
				break;
		}
		
		//快捷键
		if (event.ctrlKey == true) {
			if (event.which == CONFIG.keyboardParam.undoKey) {
				//撤销ctrl + Z
				undo();
			} else if (event.which == CONFIG.keyboardParam.redoKey) {
				//重做ctrl + Y
				redo();
			} else if (event.which == CONFIG.keyboardParam.selectedAllKey) {
				//全选ctrl + A
				event.preventDefault();//禁用浏览器的全选
				selectedAll();
			} else if (event.which == CONFIG.keyboardParam.saveKey) {
				//保存ctrl + S
				event.preventDefault();
				save();
			} else if (event.which == CONFIG.keyboardParam.save2PhotoKey) {
				//保存为图片ctrl + P
				event.preventDefault();
				save2Photo();
			} else if (event.which == CONFIG.keyboardParam.clearKey) {
				//重新绘制ctrl + D
				event.preventDefault();
				clear();
			} else if (event.which == CONFIG.keyboardParam.showGridKey) {
				//显示、隐藏网格ctrl + Q
				event.preventDefault();
				showGrid();
			} else if (event.which == 82) {
				//禁用浏览器ctrl + R刷新功能
				event.preventDefault();
			} else if (event.which == CONFIG.keyboardParam.settingKey) {
				//打开设置窗口ctrl + F
				event.preventDefault();
				setting();
			} else if (event.which == 67) {
				//复制ctrl + C
				event.preventDefault();
			} else if (event.which == 86) {
				//粘贴ctrl + V
				event.preventDefault();
			} else if (event.which == 76) {
				//直接加载json数据为流程图(测试)ctrl + L
				test();
			}
		}
		
		if (event.altKey == true) {
			if (event.which == CONFIG.keyboardParam.mouseToolKey) {
				//鼠标工具Alt + Q
				event.preventDefault();
				mouseTool();
			} else if (event.which == CONFIG.keyboardParam.connectionToolKey) {
				//连线工具Alt + R
				event.preventDefault();
				connectionTool();
			}
		}
	}).keyup(function(event) {
		switch (event.which) {
			case CONFIG.keyboardParam.multipleSelectedKey: //ctrl 键
				ALLOW_MULTIPLE_SELECTED_FLAG = false;
				break;
		}
	});
	
	/**
	 * 画线工具
	 */
	jsPlumb.on($('#enableDraggableDiv'), 'click', function(e) {
		connectionTool();
	});
	
	/**
	 * 鼠标工具
	 */
	jsPlumb.on($('#unableDraggableDiv'), 'click', function(e) {
		mouseTool();
	});
	
	/**
	 * 初始化流程图
	 */
	initFlowCharts(demoData);
	
	mouseTool();
	
	console.log('init success......');
})