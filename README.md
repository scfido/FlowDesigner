# 基于JsPlumb的流程设计器FlowDesigner

#### 项目介绍
前段时间项目中缺少一个流程设计器模块，于是花了一个来月的时间从技术选型到开发再到功能完善搞了一个流程设计器。由于本人不怎么擅长写前端代码，开发过程中碰到了不少问题，初版的代码写得有点糟糕，不过功能大部分都已经实现。后期有时间再对代码进行重构。

#### 技术选型
为什么选用JsPlumb呢？在项目开始之前我对各类技术进行了调研，主要看了一下jsplumb、joint、Raphael、GoJS、dagre-d3这几个，最后我选择了JsPlumb，因为它开源，使用起来也比较方便，文档也是比较齐全的。d3也非常强大，但是学习成本太高。
其中还用到了一个非常重要的用于描述图形的库GraphlibJS，使用它可以很方便的管理图形，它内部已经实现了关于图论的大部分算法。
JsPlumb官网：https://jsplumbtoolkit.com
JsPlumb GitHub：https://github.com/sporritt/jsplumb/
GraphlibJS GitHub：https://github.com/dagrejs/graphlib

#### 效果展示
● 基本面板
![基本面板](https://images.gitee.com/uploads/images/2018/1111/144004_83e1e492_2066540.png "基本面板")

● 拖拽节点到绘图区连线
![拖拽节点到绘图区连线](https://images.gitee.com/uploads/images/2018/1111/144036_4aead914_2066540.gif "拖拽节点到绘图区连线")

● 水平、垂直对齐
![拖拽节点到绘图区连线](https://images.gitee.com/uploads/images/2018/1111/144055_33f76651_2066540.gif "水平、垂直对齐")

● 显示/隐藏网格
![显示/隐藏网格](https://images.gitee.com/uploads/images/2018/1111/144109_e99085ab_2066540.gif "显示/隐藏网格")

● 单节点、多节点移动
![单节点、多节点移动](https://images.gitee.com/uploads/images/2018/1111/144124_09712730_2066540.gif "单节点、多节点移动")

● 改变节点对齐的排序顺序(按住Ctrl键一个一个单击选中要对齐的节点，单击的顺序就是对齐的排列顺序)
![改变节点对齐的排序顺序](https://images.gitee.com/uploads/images/2018/1111/144141_c9056d5b_2066540.gif "改变节点对齐的排序顺序")

● 撤销与重做
![撤销与重做](https://images.gitee.com/uploads/images/2018/1111/144200_e55450c6_2066540.gif "撤销与重做")

● 清空画布，重新绘制
![清空画布，重新绘制](https://images.gitee.com/uploads/images/2018/1111/144222_52b8b7fd_2066540.gif "清空画布，重新绘制")

● 保存为图片
![保存为图片](https://images.gitee.com/uploads/images/2018/1111/144232_bec20bf4_2066540.gif "保存为图片")

● 修改连线样式
![修改连线样式](https://images.gitee.com/uploads/images/2018/1111/144254_adc106a0_2066540.gif "修改连线样式")

● 调整对齐间距
![调整对齐间距](https://images.gitee.com/uploads/images/2018/1111/144313_695bfcdb_2066540.gif "调整对齐间距")

● 帮助文档和快捷键大全
![帮助文档和快捷键大全](https://images.gitee.com/uploads/images/2018/1111/145134_8fa446ec_2066540.gif "帮助文档和快捷键大全")

● 退出流程设计器友好的未保存提示
![退出流程设计器友好的未保存提示](https://images.gitee.com/uploads/images/2018/1111/144348_6679f691_2066540.gif "退出流程设计器友好的未保存提示")

● 修改节点文本和连接线文本
![修改节点文本和连接线文本](https://images.gitee.com/uploads/images/2018/1111/145151_9c6c1edc_2066540.gif "修改节点文本和连接线文本")

● 保存流程图(会生成一段json数据，后台可以保存这段数据，为了便于调试，生成的json数据可以通过快捷键Ctrl+L打开的测试窗口看到。同时也可以从该窗口载入其他的符合流程图的json数据)
![保存流程图](https://images.gitee.com/uploads/images/2018/1111/144414_a6567dc2_2066540.gif "保存流程图")