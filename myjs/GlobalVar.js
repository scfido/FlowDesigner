window.px = "";
window.py = "";

/**
 * 配置对象
 */
var CONFIG;
function getConfig() {
	return this.CONFIG;
}

/**
 * jsPlumb实例对象
 */
var INSTANCE_JSPLUMB;

/**
 * 图对象
 */
var graph = new graphlib.Graph();
function getGraph() {
	return this.graph;
}

/**
 * 泳道对象
 */
var LANEOBJS = {};
function getLANEOBJS() {
	return this.LANEOBJS;
}

/**
 * 节点id对象
 */
var NODEIDOBJ;
function NODEIDOBJ_INIT() {
	this.NODEIDOBJ = {
		'T': [], //人工节点、自动节点
		'E': [], //开始、结束、事件节点
		'G': [], //网关节点
		'S': [], //子流程节点
		'R': [], //路由线
		'L': []  //泳道
	};
}

/**
 * 所有的定时器对象
 * 目的是为了清除所有的定时器对象时比较方便
 */
var ALL_TIMER = {};

/**
 * 剪切板
 * 实质上是一个数组，存储的是被复制的节点id
 */
var MYCLIPBOARD = [];

/**
 * 节点是否允许缩放标志
 */
var NODE_RESIZABLE_FLAG;

/**
 * 被选中的节点列表
 */
var SELECTED_NODE_LIST = [];

/**
 * 允许多选标识
 * 目的是按住ctrl键时可以点击节点进行多选操作，当按住ctrl时改为true，此时单击节点可以进行多选，松开ctrl后改为false无法多选
 */
var ALLOW_MULTIPLE_SELECTED_FLAG = false;

/**
 * 多选标识
 * 目的的防止节点多选拖拽移动后会触发mouseup事件导致取消多选状态，这个标识在多选节点后会改为true
 */
var SELECTED_MULTIPLE_FLAG = false;

/**
 * 节点被选中的 box-shadow 样式
 */
var NODE_SELECTED_BOX_SHADOW;

/**
 * 节点未被选中的 box-shadow 样式
 */
var NODE_NO_SELECTED_BOX_SHADOW;

/**
 * 撤销数组
 */
var UNDO_ARR = [];
function getUNDO_ARR() {
	return this.UNDO_ARR;
}

/**
 * 重做数组
 */
var REDO_ARR = [];

/**
 * 连线信息数组
 */
var CONN_INFO_ARR = [];

var isClear;
