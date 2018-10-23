/**
 * 生成uuid
 */
function uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for(var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid.replace(/-/g, '');
}

/**
 * 十六进制颜色转 Rgba 颜色
 * @param {String} hexColor 十六进制颜色
 * @param {int} alpha 透明度，不传则默认为 1
 */
function changeHexColorToRgba(hexColor, alpha) {
	var hex = '#f0f0f0';
	var reg = /^\#[a-fA-f0-9]{6}$/;
	if(reg.test(hex)) {
		var rgbColor = 'rgb('
		for(var i = 1; i < hexColor.length; i += 2) {
			var str = hexColor[i] + hexColor[i + 1];
			if(i < 5) {
				rgbColor += parseInt(str, 16) + ', ';
			} else {
				if(alpha == undefined) {
					rgbColor += parseInt(str, 16) + ')';
				} else {
					rgbColor += parseInt(str, 16) + ', ' + alpha + ')';
				}
			}

		}
	}
	return rgbColor;
}

/**
 * 十六进制颜色转 Rgba 颜色，兼容IE
 * @param {String} hexColor 十六进制颜色
 * @param {int} alpha 透明度，不传则默认为 1
 */
function changeHexColorToRgba4IE(hexColor, alpha) {
	var hex = '#f0f0f0';
	var reg = /^\#[a-fA-f0-9]{6}$/;
	if(reg.test(hex)) {
		var rgbColor = 'rgba('
		for(var i = 1; i < hexColor.length; i += 2) {
			var str = hexColor[i] + hexColor[i + 1];
			if(i < 5) {
				rgbColor += parseInt(str, 16) + ', ';
			} else {
				if(alpha == undefined) {
					rgbColor += parseInt(str, 16) + ')';
				} else {
					rgbColor += parseInt(str, 16) + ', ' + alpha + ')';
				}
			}

		}
	}
	return rgbColor;
}

/**
 * 从rgb字符串获取颜色数组
 * @param {String} rgbColor rgb字符串
 */
function getRgbaArrFromStr(rgbColor) {
	var rgbArr = [];
	var index = rgbColor.indexOf('(');
	if (index != -1) {
		rgbColor = rgbColor.substring(index + 1, rgbColor.length - 1);
		var arr = rgbColor.split(','), i;
		for (i = 0; i < arr.length; i++) {
			rgbArr.push(arr[i].trim());
		}
	}
	return rgbArr;
}

/**
 * Rgb 颜色转十六进制颜色
 * @param {String} rgbColor Rgb颜色
 */
function changeRgbColorToHex(rgbColor) {
	var reg = /^rgb\((\s*[1-2]?[0-9]?[0-9]{1}\,)(\s*[1-2]?[0-9]?[0-9]{1}\,)(\s*[1-2]?[0-9]?[0-9]{1})\)$/;

	if(reg.test(rgbColor)) {
		var matches = reg.exec(rgbColor);
		var hexColor = '#';
		for(var i = 1; i <= 3; i++) {
			if(parseInt(matches[i]) < 16) {
				hexColor += '0' + parseInt(matches[i]).toString(16)
			} else {
				hexColor += parseInt(matches[i]).toString(16);
			}
		}
	}
	return hexColor;
}

/**
 * 从十六进制颜色中获取节点背景
 * @param {String} hexColor
 */
function getNodeBgFromHexColor(hexColor) {
	var c1 = changeHexColorToRgba(hexColor, 0.9);
	var c2 = changeHexColorToRgba(hexColor, 0.8);
	var nodeBg = 'linear-gradient(to right, ' + c1 + ', ' + c2 + ', ' + c1 + ')';
	return nodeBg;
}

/**
 * 从十六进制颜色中获取节点背景，兼容IE
 * @param {String} hexColor
 */
function getNodeBgFromHexColor4IE(hexColor) {
	var c1 = changeHexColorToRgba4IE(hexColor, 0.9);
	var nodeBg = '-ms-linear-gradient(' + c1 + ', ' + c1 + ')';
	return nodeBg;
}

/**
 * 获取完整的jquery选择器
 * @param {String} id
 */
function getJquerySelectorPrefix(id) {
	if (id.indexOf('#') != 0) {
		id = '#' + id;
	}
	return id;
}

/**
 * 获取移除了前缀的id
 * @param {String} id
 */
function getRemovePrefixId(id) {
	if (id.indexOf('#') == 0) {
		id = id.substring(1);
	}
	return id;
}

/**
 * 获取鼠标位置(相对于浏览器窗口)
 * @param {Object} event
 */
function getMousePos(event) {
	var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
	return {
		'x': event.pageX,
		'y': event.pageY
	};
}

/**
 * 记录节点id
 * @param {String} nodeId 节点id
 */
function recordNodeId(nodeId) {
	var prefix = nodeId.substring(0, 1);
	var v = parseInt(nodeId.substring(1));
	NODEIDOBJ[prefix].push(v);
	NODEIDOBJ[prefix].sort(function(a, b) {
		return a - b;
	});
}

/**
 * 从记录中移除节点id
 * @param {String} nodeId
 */
function removeNodeId(nodeId) {
	var prefix = nodeId.substring(0, 1);
	var index = parseInt(nodeId.substring(1));
	var arr = NODEIDOBJ[prefix], i;
	for (i = index - 1; i < arr.length - 1; i++) {
		arr[i] = arr[i + 1];
	}
	NODEIDOBJ[prefix].pop();
}

/**
 * 获取下一个id
 * @param {String} prefix 前缀
 */
function getNextNodeId(prefix) {
	var arr = NODEIDOBJ[prefix], i;
	for (i = 1; i <= arr.length; i++) {
		if (i != NODEIDOBJ[prefix][i - 1]) {
			var nextId = prefix + addLeftZero(i);
			return nextId;
		}
	}
	var nextId = prefix + addLeftZero(i);
	return nextId;
}

/**
 * 左补零
 * @param {Object} i
 */
function addLeftZero(i) {
	var numStr = i.toString();
	var c = numStr.length - 5;
	var r = '';
	while (c < 0) {
		r += '0';
		c++;
	}
	r += numStr;
	return r;
}

/**
 * 根据div的高度算出字行距实现竖排字自动排版
 * @param {String} text 文字字符串
 * @param {int} height div高度
 */
function getLaneLineHeight(text, height) {
	var textArr = text.split(''), i = textArr.length, h = parseInt(height);
	return h / (i * 15);
}

/**
 * 得到撤销后需要删除的节点数组
 * @param {Array} oldNodeArr
 * @param {Array} newNodeArr
 * @param {Array} oldRouterArr
 * @param {Array} newRouterArr
 */
function getDeleteNodeArr(oldNodeArr, newNodeArr, oldRouterArr, newRouterArr) {
	var i, j, res = [];
	for (i = 0; i < oldNodeArr.length; i++) {
		for (j = 0; j < newNodeArr.length; j++) {
			if (oldNodeArr[i] == newNodeArr[j]) break;
			
			if (j == newNodeArr.length - 1) {
				res.push(oldNodeArr[i]);
			}
		}
	}
	
	for (i = 0; i < oldRouterArr.length; i++) {
		for (j = 0; j < newRouterArr.length; j++) {
			if (oldRouterArr[i] == newRouterArr[i]) break;
			
			if (j == newRouterArr.length - 1) {
				res.push(oldRouterArr[i]);
			}
		}
	}
	
	return res;
}

/**
 * 删除数组中的元素
 * @param {Array} arr 数组
 * @param {Object} data 要删除的元素
 */
function deleteDataFromArr(arr, data) {
	var index = arr.indexOf(data), i;
	if (index != -1) {
		for (i = index; i < arr.length - 1; i++) {
			arr[i] = arr[i + 1];
		}
		arr.pop();
	}
}

/**
 * 判断是否为IE浏览器
 */
function isIE() {
	if (!!window.ActiveXObject || "ActiveXObject" in window){
		return true;
	} else {
		return false;
	}
}

function getProjectName() {
	var projectName = '';
	var pathName = window.location.pathname;
	var i = pathName.indexOf('/', 1);
	if (i != -1) {
		projectName = pathName.substring(0, i + 1);
	}
	return projectName;
}
