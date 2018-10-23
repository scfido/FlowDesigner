/**
 * Create by Arvin.zbs on 2017-3-1 11:51:24 v1.0
 * {
 *		name:"Menu Name", // 菜单名称
 *		id:"menu-id", // 菜单ID，谨慎不可重复
 * 		parent:"父级菜单ID", // 不写表示该项是最外层菜单项
 *		callback: function() { // 给菜单绑定的click回调函数，
 *			alert("查询");
 * 	    }
 * }
 * 注意：菜单数组中的菜单项的顺序必须是最外层在数组最前面，第二层在第一层后面，以此类推，顺序不对将导致菜单无法正常创建
 */
"use strict";
(function(window, doc) {
	window.ContextMenu = window.ContextMenu ? window.ContextMenu : {};
	
	var createMenuItem = function(id, name, callback, selector) {
		// 创建菜单项
		var menuItem = doc.createElement("div");
		menuItem.setAttribute("class", "web-context-menu-item");
		menuItem.setAttribute("id", id);
		// 菜单项中的span，菜单名
		var span = doc.createElement("span");
		span.setAttribute("class", "menu-item-name");
		span.innerText = "O " + name;
		if (callback && typeof callback === 'function') {
			var tempId = selector;
			//兼容FF浏览器
			var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
			span.addEventListener("click", callback.bind(event, tempId), false);
		}
		// 创建小箭头
		var i = doc.createElement("i");
		i.innerText = "▲";
		span.appendChild(i);
		// 创建下一层菜单的容器
		var subContainer = doc.createElement("div");
		subContainer.setAttribute("class", "web-context-menu-items");
		
		menuItem.appendChild(span);
		menuItem.appendChild(subContainer);
		return menuItem;
	};
	
	// 创建菜单项之间的分隔线条
	var createLine = function() {
		var line  = doc.createElement("div");
		line.setAttribute("class", "menu-item-line");
		return line;
	};
	
	/**
	 * 创建菜单
	 */
	var createMenu = function(index, menuArr, selector) {
		// 创建菜单层
		var menu = doc.createElement("div");
		menu.setAttribute("class", "web-context-menu");
		menu.setAttribute("id", "web-context-menu-" + index);
		doc.querySelector("body").appendChild(menu);
		// 创建菜单项容器
		var menuItemsContainer = doc.createElement("div");
		menuItemsContainer.setAttribute("class", "web-context-menu-items");
		menu.appendChild(menuItemsContainer);
		
		// 遍历菜单项
		for (var i = 0; i < menuArr.length; i++) {
			var menuItem = menuArr[i];
			var parent = menuItem.parent;
			// 创建菜单项
			var oneMenu = createMenuItem(menuItem.id, menuItem.name, menuItem.callback, selector);
			if (!parent) {
				menuItemsContainer.appendChild(oneMenu);
				menuItemsContainer.appendChild(createLine());
			} else {
				var parentNode = doc.querySelector("#" + parent + " .web-context-menu-items");
				parentNode.appendChild(oneMenu);
				parentNode.appendChild(createLine());
			}
		}
		// 遍历菜单项去掉没有子菜单的菜单项的小箭头
		var allContainer = menu.querySelectorAll(".web-context-menu-items");
		for (var i = 0; i < allContainer.length; i++) {
			var oneContainer = allContainer[i];
			if (!oneContainer.hasChildNodes()) {
				var iTag = oneContainer.parentElement.querySelector("i")
				iTag.parentElement.removeChild(iTag);
			}
		}
	}
	
	/**
	 * 显示菜单
	 */
	var showMenu = function(event, menu) {
		//兼容FF浏览器
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		menu.style.display = "block";
		var x = event.clientX;
		var y = event.clientY;
		// 调整菜单出现位置，防止菜单溢出浏览器可视区域
		if (y + menu.clientHeight > window.innerHeight) {
			y -= menu.clientHeight;
		}
		if (x + menu.clientWidth > window.innerWidth) {
			x -= menu.clientWidth;
		}
		menu.style.left = x + "px";
		menu.style.top = y + "px";
	};
	
	/**
	 * 绑定菜单
	 * @param {String} selector DOM对象选择器
	 * @param {Array} menuArr 菜单数组
	 */
	ContextMenu.bind = function(selector, menuArr) {
		var obj = doc.querySelector(selector);
		obj.oncontextmenu = function(event) {
			// 浏览器兼容性写法
			var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
			// 阻止事件的传播，防止右击节点时出来的是画布的菜单
			event.stopPropagation();
			
			// 打开时先隐藏所有已经显示的菜单
			var pageMenus = doc.querySelectorAll(".web-context-menu");
			if (pageMenus) {
				for (var i = 0; i < pageMenus.length; i++) {
					pageMenus[i].style.display = "none";
				}
			}
			var index = 0;
			var dataMenuIndex = this.getAttribute("data-menu-index");
			// 获取obj绑定的菜单索引
			if (dataMenuIndex) {
				index = dataMenuIndex;
			} else {
				// else还没有绑定菜单，以当前页面的菜单数量为索引
				var allMenu = doc.querySelectorAll(".web-context-menu");
				if (allMenu && allMenu.length) {
					index = allMenu.length;
				}
				this.setAttribute("data-menu-index", index); // 绑定索引
			}
			
			var menu = doc.querySelector("#web-context-menu-" + index);
			if (!menu || menu.length < 1) {
				createMenu(index, menuArr, selector);
				menu = doc.querySelector("#web-context-menu-" + index);
			}
			showMenu(event, menu);
			doc.addEventListener("click", function(e) {
				menu.style.display = "none";
			});
			return false;
		};
		return false;
	};
	
})(window, document);
