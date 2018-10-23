/**
 * 关闭窗口
 */
function closeLayerFrame() {
	//获取窗口索引
    var index = parent.layer.getFrameIndex(window.name);
    //关闭弹出的子页面窗口
    parent.layer.close(index);
}
