### 组件生命周期及初始配置参数说明
```js
var Module = BaseView.extend({

  // 组件初始化
  initialize: fucntion  (){
    this._initialize({

      // 通用部分
      template: template, // 字符串模板
      modelBind: true,    // 主要用于表单改变时及时更新到模型类中，默认为change改变， 若想及时更新可以使用  data-bind-type="keyup" 表示按下键盘时触发(推荐使用bb-model="name:keyup")
      toolTip: true, // 是否显示title提示框   html代码： <div class="tool-tip" title="提示内容">内容</div>
      enter: '#submit' // 执行回车后的按钮点击的元素选择符
      data: {} // 传递给模型类的数据

      // 统一部分
      onChange: fucntion(){},
      setValue: function(val){},
      onUpdate: function(){},

      // BaseList 部分
      model: ProductModel, // 模型类,
      collection:  ProductCollection,// 集合,
      item: ProductItem, // 单视图
      render: '.product-list', 插入列表的容器选择符, 若为空则默认插入到$el中
      items: [], // 数据不是以url的形式获取时 (可选), items可为function形式传递;
      append: false, // 是否是追加内容， 默认为替换
      checkAppend: false, // 鼠标点击checkbox， checkbox是否追加  需在BaseItem事件中添加 'click .toggle': '_check',
      checkToggle: true,// 是否选中切换
      pagination: true/selector, // 是否显示分页 view视图中相应加入<div id="pagination-container"></div>; pagination可为元素选择符
      page: parseInt(Est.cookie('orderList_page')) || 1, //设置起始页 所有的分页数据都会保存到cookie中， 以viewId + '_page'格式存储， 注意cookie取的是字符串， 要转化成int
      pageSize: parseInt(Est.cookie('orderList_pageSize')) || 16, // 设置每页显示个数
      max: 5, // 限制显示个数
      sortField: 'sort', // 上移下移字段名称， 默认为sort
      itemId: 'Category_00000000000123', // 当需要根据某个ID查找列表时， 启用此参数， 方便
      filter: [ {key: 'name', value: this.searchKey }] // 过滤结果
      cache: true, // 数据缓存到内存中
      session: true, // 数据缓存到浏览器中，下次打开浏览器，请求的数据直接从浏览器缓存中读取
      // 以下为树型列表时 需要的参数
      subRender: '.node-tree', // 下级分类的容器选择符
      collapse: '.node-collapse' 展开/收缩元素选择符
      parentId: 'belongId', // 分类 的父类ID
      categoryId: 'categoryId', // 分类 的当前ID
      rootId: 'isroot', // 一级分类字段名称
      rootValue: '00' // 一级分类字段值  可为数组[null, 'Syscode_']   数组里的选项可为方法， 返回true与false
      extend: true // false收缩 true为展开

      // BaseItem 部分
      filter: function(model){}, // 过滤模型类

      // BaseDetail 部分
      id: ctx.model.get('id'), // 当不是以dialog形式打开的时候， 需要传递ID值
      page: ctx._getPage() // 点击返回按钮且需要定位到第几页时， 传入page值，
      hideSaveBtn: true, // 保存成功后的弹出提示框中是否隐藏保存按钮
      hideOkBtn: true, // 保存成功后的弹出提示框中是否隐藏确定按钮
      autoHide: true, // 保存成功后是否自动隐藏提示对话框
      form: '#form:#submit', // 表单提交配置,#form为提交作用域，#submit为提交按钮

    );
  },
  // 组件模型类初始化
  init: function(){
    this._setDefault('args.name', 'a');   // 初始化数据
    return {                              // 也可以这样初始化
      "args.name": 'a'
    };
  },
  // 数据监听(推荐写到html页面中，详见下面的绑定规则)
  onWatch: fucntion(){
    this._watch(['args.name'], '.result:style', function(name){
      console.log('改变的字段为：' + name);
    });
  },

  // 数据载入前(主要用于BaseList组件中)
  beforeLoad: function(){},

  // 数据载入后
  afterLoad: function(){},

  // 组件渲染前
  beforeRender: fucntion(){},

  // 组件渲染后
  afterRender: function(){},

  // 模型类改变回调
  update: function(){},

  // 模型类保存前(主要用于BaseDetail组件中)
  beforeSave: function(){},

  // 模型类保存后
  afterSave: fucntion(),

  // 组件销毁时
  destory: function(){}

});
```
### 组件ID
this.viewId // 指定ID， 可以用app.getView(this.viewId)获取
this.cid // 唯一标识符， 由系统生成

### 组件重渲染
```js
app.addRegion('imagePickerConfig', ImagePickerConfig, {
  el: '.image-picker-config',
  data: this.model.toJSON(),      // 将当前视图的模型类传入ImagePickerConfig中
  diff: true,                     // 开启diff算法， 默认是重新渲染
  onChange: this._bind(this._set) // 组件模型类改变回调
});
```
### 数据绑定
<div class=".bind" bb-watch="args.name" bb-render=".bind:style" bb-change="handleChange" style="display: {{#compare args.name '===' 'show'}}block;{{else}}none;{{/compare}}"></div>

bb-watch:  监听的字段， 多个字段以逗号隔开(当只要渲染当前元素时， 可以使用bb-watch="args.name:style"简写，但不能但不能在两个地方使用同一个表达式)
bb-render: 需要重新渲染的元素，后面带:style(样式) :class(属性) :html(内容) :value(表单)若不带则整个dom替换掉
           当同一个元素带多个属性时，可简写为.bind:style:html:class
bb-change: 事件函数(其中参数为改变的字段名称)

### 表单元素双向绑定
<input bb-model="name:keyup" type="text" class="text" value="{{name}}" />
bb-model: 模型类字段  后面的:keyup表示按下某个键弹起时触发，默认为:change

### 事件绑定
<input bb-click="handleAdd" type="button" value="添加表单" class="abutton faiButton faiButton-hover" />
bb-click: 事件类型，支持jquery所有的事件

### 系统自带事件
// BaseItem
bb-click="_moveUp": 上移
bb-click="_moveDown": 下移
bb-click="_del": 删除
bb-click="_check": 选中与未选中切换

// BaseList
bb-click="_reload": 列表刷新
bb-click="_empty": 清空列表
bb-click="_checkAll": 全选中
bb-click="_clearChecked": 全不选中  当参数为true时， 忽略diff

// BaseDetail
bb-click="_reset": 初始化表单
bb-click="_save": 保存表单(当需要实时保存且不需要提示“保存成功”时使用)

### 系统自带属性
bb-checked="checked": 是否选中
bb-checked="checked_all": 是否全部选中

### 组件通用方法
this._super(type); // 引用父类，当参数type为view时返回上级视图 model时返回上级模型类，data上级模型类数据
this._view('viewId');// 获取视图
this._region('name', ProductList, {}); // 添加视图区域
this._navigate('#/home', true); // 导航
this._dialog({}); // 模块对话框
this._watch('color', '.render:style', function(fieldName){}); // 数据监听
this._stringifyJSON(['args', 'laymodList']); // 序列化成字符串
this._parseJSON(['args', 'laymodList']); // 反序列化
this._setOption('itemId', '111'); // 设置组件参数
this._getOption('itemId');// 获取组件参数
this._getTpl(); // 获取模板字符串
this._getTarget(e); // 获取鼠标点击时的那个元素
this._getEventTarget(e); // 获取添加事件的那个元素
this._one(['ProductList'], function(ProductList){}); // 只执行单次，当第一个参数为数组时，则为require这个模块
this._require(['ProductList'], function(ProductList){}); // 请求模块
this._delay(function(){}, 5000); // 延迟执行
this._bind(function(){}); // 绑定上下文
this._initToolTip(parentNode, className); // 添加提示

### 操作模型类
```js
// 重置模型类
this._reset();
this._reset({name: 'aaa'}); // 重置模型类并设置name为aaa

// 设置模型类值
this._set('args.color', '#999');
this._set({
  "color": '#999',
  "args.color": '#999'
});

// 获取模型类值
this._get('args.color'); ==> #999

// 设置模型类值，不触发change事件
this._setAttr('args.color', '#999'); //
this._setAttr({
  "color": '#999',
  "args.color": '#999'
});

this._setDefault('args.color', '#999'); // 设置默认值 #999
this._getDefault('args.color', '#999'); // 获取args.color值，若不存在则初始化为#999并返回
```
### 列表操作
```js
this._push(model, dx); // model可为object对象或new model()对象， dx为插入的索引值，不填默认插入到尾部
this._getLength(); // 获取列表长度
this._insertOrder(evt.oldIndex, evt.newIndex, function(list) {}); 插序排序
this._getItems(); // 获取全部列表
this._getItem(index); // 获取第index项
this._getCheckedItems(isPluck); // 获取选中的列表项 isPluck为true时自动转化为model.toJSON()对象
this._getCheckboxIds(); // 获取选中项的ids数组
this._batch({  // 批量操作
    url: ctx.collection.batchDel,
    tip: '删除成功'
});
this._batchDel({
    url: CONST.API + '/message/batch/del',
    field: 'id'
});
this._search({
   filter: [
   {key: 'name', value: this.searchKey },
   {key: 'prodtype', value: this.searchProdtype} ,
   {key: 'category', value: this.searchCategory},
   {key: 'loginView', value: this.searchLoginView},
   {key: 'ads', value: this.searchAds}
   ],
   onBeforeAdd: function(item){
      // 自定义过滤， 即通过上面的filter后还需要经过这一层过滤
      // 若通过返回true
      return item.attributes[obj.key].indexOf(obj.value) !== -1;
}});
```
### BaseItem操作
this._getPage(); //获取当前列表第几页

### ui库
http://sj.jihui88.com/mobile/index.html#/ui

### component库
http://sj.jihui88.com/mobile/index.html#/component

### 工具类库
详见doc文档

### 模板指令
{{#compare ../page '!==' this}}danaiPageNum{{else}}active{{/compare}}  // 比较
{{#contains ../element this}}checked="checked"{{/contains}} //是否包含
{{#xif "this.orderStatus != 'completed' && this.orderStatus != 'invalid'"}}disabled{{/xif}} // 判断
{{#isEmpty image}}<img src='...'/>{{/isEmpty}} // 判断是否为空

{{get 'args.color'}} // 取值
{{dateFormat addTime 'yyyy-MM-dd mm:hh:ss'}} // 日期格式化
{{plus 1 2}} => 3 // 相加
{{minus 10 5}} => 5 // 相减
{{cutByte name 5 end='...'}} // 字符串截取
{{parseInt 01}} // 转化为数字
{{CONST 'HOST'}} // 获取常量值
{{PIC pic}} // 获取图片地址   {{PIC pic 120}} // 获取宽度为120图片，目前只能取120与640两种尺寸大小的图片
{{encodeUrl url}} // 编码地址
{{json 'invite.title'}} // parse json对象
{{version}} // 获取版本号
{{stripScripts '<scripts></scripts>'}} //去除script标签
{{replace module.type '\d*$' ''}} // 替换
{{default module.type 'aa'}} // 取默认值
{{keyMap module.type 'aa'}} // key value 映射

### BaseService数据请求服务(具体使用详见/app/scripts/service/Service.js)
```js
new BaseService().factory({
    url: '', // 请求地址
    data: {},// 表单参数

    session: true, // 永久记录，除非软件版本号更新
    cache: true // 暂时缓存， 浏览器刷新后需重新请求

    select: true, // 是否构建下拉框
    tree: true, // 是否构建树
    extend: true, // 是否全部展开
    defaults： false, // 是否添加默认选项
    defaultValue: '/', // 默认为 /

    // 如果tree为true时， 表示需要构建树， 则需补充以下字段
    rootKey: 'isroot', // 构建树时的父级字段名称
    rootValue: '01', // 父级字段值
    categoryId: 'categoryId', //分类 Id
    belongId: 'belongId', // 父类ID
    childTag: 'cates', // 子集字段名称
    sortBy: 'sort', // 根据某个字段排序

    // 如果select为true时 ，表示需要构建下拉框， 则下面的text与value必填
    text: 'name', // 下拉框名称
    value: 'categoryId', // 下拉框值
}).done(function(result){
    console.dir(result);
});
```
### 第三方插件
对话框(artDialog_v6) : http://aui.github.io/artDialog/doc/index.html [dialog-plus]
代码编辑器(codemirror) : http://codemirror.net/ [CodeMirror]
滚动条(isroll) : http://iscrolljs.com/ [IScroll]
单元测试(jasmine) : http://jasmine.github.io/ [jasmine]
元素选择器(jquery) : https://jquery.com/
百度地图(BMap): http://lbsyun.baidu.com/index.php?title=uri/api/web [BMap]
滚动样式(skrollr) : https://github.com/Prinzhorn/skrollr [Skrollr]
拖动条(slider) : http://refreshless.com/nouislider/ [Slider]
拖动排序(sortable) : https://github.com/RubaXa/Sortable     [Sortable]
图片切换(swiper) : http://idangero.us/swiper/get-started [Swiper]
百度编辑器(ueditor) : http://ueditor.baidu.com/website/ [Ueditor]
图片上传(fileupload) : https://blueimp.github.io/jQuery-File-Upload/ [FileUpload]
移动端元素选择器(zepto): http://www.zeptojs.cn/