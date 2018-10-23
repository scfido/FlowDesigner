/**
 * layui模块
 */
layui.use('element', function() {
	var element = layui.element;
});

/**
 * 新手引导
 */
function helpDoc() {
	var index = layer.open({
		type: 2,
		title: '帮助文档',
		content: '../helpDoc/docs.html',
		area: ['700px', '500px'],
		maxmin: true
	});
	layer.full(index);
}

/**
 * 快捷键手册
 */
function shortcutKey() {
	layer.open({
		type: 1,
		title: "快捷键手册",
		area: ['950px', '730px'],
		shadeClose: true,
		shift: 2,
		skin: 'layui-layer-rim',
		closeBtn: 2,
		content:'<div class="layui-form">' + 
				 	'<table class="layui-table">' + 
				    	'<colgroup>' + 
						    '<col width="100">' + 
						    '<col width="100">' + 
						    '<col width="300">' + 
				    	'</colgroup>' + 
					    '<thead>' + 
					    	'<tr>' + 
						        '<th>快捷键</th>' + 
						        '<th>名称</th>' + 
						        '<th>作用</th>' + 
					    	'</tr>' + 
					    '</thead>' + 
					    '<tbody>' + 
					    	'<tr>' + 
						        '<td>Delete</td>' + 
						        '<td>删除节点</td>' + 
						        '<td>删除选中的节点，注意节点处于选中状态时才会被删除</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl</td>' + 
						        '<td>多选模式</td>' + 
						        '<td>按住Ctrl键切换为多选模式，点击节点进行多选，松开表示取消多选模式</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + S</td>' + 
						        '<td>保存流程</td>' + 
						        '<td>保存当前流程图</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + P</td>' + 
						        '<td>保存为图片</td>' + 
						        '<td>保存当前流程图为图片格式</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + Z</td>' + 
						        '<td>撤销</td>' + 
						        '<td>回退到上一个步骤</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + Y</td>' + 
						        '<td>重做</td>' + 
						        '<td>前进到后一个步骤</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + D</td>' + 
						        '<td>重新绘制</td>' + 
						        '<td>将当前的画板清空</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + Q</td>' + 
						        '<td>显示/隐藏网格</td>' + 
						        '<td>若显示，则隐藏。若隐藏，则显示</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + A</td>' + 
						        '<td>全选</td>' + 
						        '<td>全选图中的节点</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Ctrl + F</td>' + 
						        '<td>设置</td>' + 
						        '<td>打开设置窗口</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Alt + Q</td>' + 
						        '<td>鼠标工具</td>' + 
						        '<td>切换为鼠标工具，可以移动当前画布中的节点</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>Alt + R</td>' + 
						        '<td>连线工具</td>' + 
						        '<td>切换为连线工具，可以连接当前画布中的节点</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>↑</td>' + 
						        '<td>上</td>' + 
						        '<td>向上微移选中的节点</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>↓</td>' + 
						        '<td>下</td>' + 
						        '<td>向下微移选中的节点</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>←</td>' + 
						        '<td>左</td>' + 
						        '<td>向左微移选中的节点</td>' + 
					    	'</tr>' + 
					    	'<tr>' + 
						        '<td>→</td>' + 
						        '<td>右</td>' + 
						        '<td>向右微移选中的节点</td>' + 
					    	'</tr>' + 
					    '</tbody>' + 
					'</table>' + 
				'</div>'
	});
}

var eleId;

function getEleId() {
	return this.eleId;
}

/**
 * 测试子页面
 */
function test() {
	var pwd = prompt('请输入密码：');
	if (pwd == CONFIG.defaultConfig.testPwd) {
		layer.open({
			type: 2,
			title: "测试",
			area: ['950px', '700px'],
			shadeClose: true,
			shift: 4,
			closeBtn: 2,
			content: ['test.html'],
			end: function() {
	
			}
		});
	} else if (pwd.trim() != '') {
		layer.alert('密码错误');
	}
}

/**
 * 编辑节点属性
 */
function editNodeAttribute(tempId) {
	eleId = tempId;
	layer.open({
		type: 2,
		title: "属性编辑",
		area: ['950px', '700px'],
		shadeClose: true,
		shift: 4,
		skin: 'layui-layer-rim',
		closeBtn: 2,
		content: ['EditNodeAttribute.html'],
		end: function() {
			//更新图对象
			updateGraphNode(eleId);
		}
	});
}

/**
 * 设置节点样式
 * @param {String} tempId 节点id
 */
function setNodeStyle(tempId) {
	eleId = tempId;
	layer.open({
		type: 2,
		title: "节点样式",
		area: ['600px', '400px'],
		shadeClose: true,
		shift: 4,
		skin: 'layui-layer-rim',
		closeBtn: 2,
		content: ['SetNodeStyle.html'],
		end: function() {
			//更新图对象
			updateGraphNode(eleId);
		}
	});
}

/**
 * 编辑路由属性
 * @param {String} connId 路由id
 */
function connectionAttr(connId) {
	eleId = connId;
	layer.open({
		type: 2,
		title: "属性编辑",
		area: ['600px', '400px'],
		shadeClose: true,
		shift: 4,
		skin: 'layui-layer-rim',
		closeBtn: 2,
		content: ['EditRouterAttribute.html'],
		end: function() {
			
		}
	});
}

/**
 * 编辑泳道属性
 * @param {String} tempId
 */
function laneAttr(tempId) {
	eleId = tempId;
	layer.open({
		type: 2,
		title: "泳道属性编辑",
		area: ['950px', '700px'],
		shadeClose: true,
		shift: 4,
		skin: 'layui-layer-rim',
		closeBtn: 2,
		content: ['EditLaneAttribute.html'],
		end: function() {
			
		}
	});
}

/**
 * 设置
 */
function setting() {
	//防止用户无限快捷键打开设置窗口
	layer.closeAll();
	layer.open({
		type: 2,
		title: "设置",
		area: ['500px', '420px'],
		shadeClose: true,
		shift: 1,
		skin: 'layui-layer-rim',
		closeBtn: 2,
		content: ['Setting.html'],
		end: function() {
			common.connector[0] = CONFIG.conn.connectionType;
		}
	});
}
