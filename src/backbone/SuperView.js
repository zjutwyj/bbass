/**
 * @description 所有BaseXxx模块的超类， 子类继承超类的一切方法
 * @class SuperView - 所有BaseXxx模块的超类
 * @author yongjin<zjut_wyj@163.com> 2015/1/24
 */

var SuperView = Backbone.View.extend({
  /**
   * 传递options进来
   *
   * @method [private] - constructor
   * @private
   * @param options
   * @author wyj 14.12.16
   */
  constructor: function(options) {
    this.options = options || {};
    this._re_dup = {};
    this._re_selector = {};
    if (this.init && Est.typeOf(this.init) !== 'function') {
      this._initialize(this.init);
    }
    Backbone.View.apply(this, arguments);
  },
  /**
   * 初始化
   * @method [初始化] - initialize
   * @private
   * @return {[type]} [description]
   */
  initialize: function() {
    this._initialize();
  },
  /**
   * 销毁系统绑定的事件及其它
   * @method [销毁] - _destroy
   * @return {[type]} [description]
   */
  _destroy: function() {
    this._re_dup = null;
  },
  /**
   * 调用父类方法
   * @method [构造] - _super
   * @return {[type]} [description]
   */
  _super: function(type, args) {
    if (Est.typeOf(type) === 'object') {
      this._initialize(type);
    } else {
      switch (type) {
        case 'data':
          return app.getView(this._options.viewId).model.toJSON();
        case 'view':
          return app.getView(this._options.viewId);
        case 'model':
          return app.getView(this._options.viewId).model;
        default:
          if (this[type]) this[type](args);
          return this;
      }
    }
  },
  /**
   * 获取视图
   * @method [视图] - _view
   * @param  {[type]} viewId [description]
   * @return {[type]}        [description]
   */
  _view: function(viewId) {
    return app.getView(viewId);
  },
  /**
   * 添加视图区域
   * @method [视图] - _region
   * @param  {[type]} name     [description]
   * @param  {[type]} instance [description]
   * @param  {[type]} options  [description]
   * @return {[type]}          [description]
   */
  _region: function(name, instance, options) {
    app.addRegion(name, instance, options);
  },
  /**
   * 继承
   * @method [继承] - _extend
   * @private
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  _extend: function(options) {
    Est.extend(this.options, options);
  },
  /**
   * 导航
   *
   * @method [导航] - _navigate ( 导航 )
   * @param name
   * @author wyj 15.1.13
   */
  _navigate: function(name, options) {
    options = options || true;
    Backbone.history.navigate(name, options);
  },
  /**
   * 静态对话框， 当你需要显示某个组件的视图但不是以iframe形式打开时
   * 对话框参数将作为模块里的options参数
   *
   * @method [对话框] - _dialog ( 静态对话框 )
   * @param options
   * @author wyj 15.1.22
   * @example
   *        // 获取对话框
   *          app.getDialog('moduleId || id');
   *          this._dialog({
   *                moduleId: 'SeoDetail', // 模块ID
   *                title: 'Seo修改', // 对话框标题
   *                id: this.model.get('id'), // 初始化模块时传入的ID， 如productId
   *                width: 600, // 对话框宽度
   *                height: 250, // 对话框高度
   *                skin: 'form-horizontal', // className
   *                hideSaveBtn: false, // 是否隐藏保存按钮， 默认为false
   *                autoClose: true, // 提交后按确定按钮  自动关闭对话框
   *                quickClose: true, // 点击空白处关闭对话框
   *                button: [ // 自定义按钮
   *                  {
   *                    value: '保存',
   *                    callback: function () {
   *                    this.title('正在提交..');
   *                    $("#SeoDetail" + " #submit").click(); // 弹出的对话ID选择符为id (注：当不存在id时，为moduleId值)
   *                    app.getView('SeoDetail'); // 视图为moduleId
   *                    return false; // 去掉此行将直接关闭对话框
   *                  }}
   *                ],
   *                onShow: function(){ // 对话框弹出后调用   [注意，当调用show方法时， 对话框会重新渲染模块视图，若想只渲染一次， 可以在这里返回false]
   *                    return true;
   *                },
   *                onClose: function(){
   *                    this._reload(); // 列表刷新
   *                    this.collection.push(Est.cloneDeep(app.getModels())); // 向列表末尾添加数据, 注意必须要深复制
   *                    this.model.set(app.getModels().pop()); // 修改模型类
   *                }
   *            }, this);
   */
  _dialog: function(options, context) {
    var ctx = context || this;
    var viewId = options.viewId ? options.viewId :
      Est.typeOf(options.id) === 'string' ? options.id : options.moduleId;
    if (Est.typeOf(viewId) === 'function') viewId = Est.nextUid('dialog_view');
    var comm = {
      width: 'auto',
      title: null,
      cover: false,
      autofocus: false,
      hideOkBtn: true,
      hideCloseBtn: true,
      button: [],
      quickClose: options.cover ? false :
        (Est.typeOf(options.autofocus) === 'boolean' ? options.quickClose : false),
      skin: 'dialog_min'
    }

    if (options.moduleId && app.getStatus(options.moduleId)) {
      comm = Est.extend(comm, app.getStatus(options.moduleId));
    }
    options = Est.extend(comm, options);

    options = Est.extend(options, {
      el: '#base_item_dialog' + viewId,
      content: options.content || '<div id="' + viewId + '"></div>',
      viewId: viewId,
      onshow: function() {
        try {
          var result = options.onShow && options.onShow.call(this, options);
          if (typeof result !== 'undefined' && !result)
            return;
          if (Est.typeOf(options.moduleId) === 'function') {
            options.id = options.id || options.viewId;
            app.addPanel(options.id, {
              el: '#' + options.id,
              template: '<div id="base_item_dialog' + options.id + '" class="region ' + options.id + '"></div>'
            }).addView(options.id, new options.moduleId(options));
          } else if (Est.typeOf(options.moduleId) === 'string') {
            seajs.use([options.moduleId], function(instance) {
              try {
                if (!instance) {
                  console.error(options.moduleId + ' is not defined');
                }
                app.addPanel(options.viewId, {
                  el: '#' + options.viewId,
                  template: '<div id="base_item_dialog' + options.viewId + '" class="region"></div>'
                }).addView(options.viewId, new instance(options));
              } catch (e) {
                console.error(e);
              }
            });
          }
        } catch (e) {
          console.log(e);
        }
      },
      onclose: function() {
        if (app.getPanel(options.viewId)) app.removePanel(options.viewId);
        if (options.onClose) options.onClose.call(ctx, options);
        app.getDialogs().pop();
      }
    });
    BaseUtils.dialog(options);
  },
  /**
   * 单个模型字段绑定
   * @method [绑定] - _singeBind
   * @param selector
   * @param model
   * @author wyj 15.7.20
   * @example
   * @private
   * @author wyj 15.7.20
   * @example
   *    this._singleBind('#model-name', this.model);
   */
  _singleBind: function(parent, selector, model, changeFn) {
    var _self = this;

    $(selector, parent || this.$el).each(function() {

      var bbModels = [];
      var bbModel = $(this).attr('bb-model');
      var bindType = $(this).attr('data-bind-type') || 'change';

      if (!Est.isEmpty(bbModel)) {
        bbModels = bbModel.split(':');
        bindType = bbModels.length > 1 ? bbModels[1] : 'change';
      }
      $(this).off(bindType).on(bindType, function(e) {
        var val, pass, modelId, name, bbMod;

        if (e.keyCode === 37 || e.keyCode === 39 ||
          e.keyCode === 38 || e.keyCode === 40) {
          return false;
        }
        modelId = $(this).attr('id');
        bbMod = $(this).attr('bb-model');
        if (!Est.isEmpty(bbMod)) bbMod = bbMod.split(':')[0];

        if (bbMod || (modelId && modelId.indexOf('model') !== -1)) {
          switch (this.type) {
            case 'radio':
              val = $(this).is(":checked") ? $(this).val() : pass = true;
              break;
            case 'checkbox':
              val = $(this).is(':checked') ? (Est.isEmpty($(this).attr('true-value')) ? true : $(this).attr('true-value')) :
                (Est.isEmpty($(this).attr('false-value')) ? false : $(this).attr('false-value'));
              break;
            default:
              val = $(this).val();
              break;
          }
          if (!pass) {
            name = bbMod || modelId.replace(/^model\d?-(.+)$/g, "$1");
            _self._set(name, val);
            if (changeFn) changeFn.call(_self, name);
            //TODO 新版将移除update回调
            if (_self.update) _self.update.call(_self, name);
          }
        }
      });
    });
  },
  /**
   * 视图到模型类的绑定
   *
   * @method [绑定] - _modelBind
   * @private
   * @author wyj 14.12.25
   * @example
   *        this._modelBind();
   */
  _modelBind: function(parent, selector, changeFn) {
    var _self = this;
    if (selector) this._singleBind(parent, selector, this.model, changeFn);
    else this.$("input, textarea, select").each(function() {
      _self._singleBind(null, $(this), _self.model, changeFn);
    });
  },
  /**
   * 获取模板
   * @method _getCompileTemp
   * @param  {string} attrName   属性名称
   * @param  {jquery} node       作用元素
   * @param  {string} selector   选择符
   * @param  {string} ngAttrName 属性名称(针对IE浏览器)
   * @return {Handlebar}         模板
   */
  _getCompileTemp: function(attrName, node, selector, ngAttrName) {
    var hbsStr = null;
    switch (attrName) {
      case 'html':
        return Handlebars.compile(node.html());
      case 'checked':
        return Handlebars.compile('checked:{{#if ' + /bb-checked=\"(.*?)\"\s?/img.exec(selector)[1] + '}}true{{else}}false{{/if}}');
      default:
        hbsStr = node.attr(ngAttrName);
        if (!hbsStr && node.is('textarea')) hbsStr = node.html();
        return Handlebars.compile(hbsStr);
    }
  },
  /**
   * 元素替换
   * @method [替换] - _replaceNode
   * @param  {string} attrName   属性名称
   * @param  {jquery} node       元素
   * @param  {string} result     模板结果字符串
   * @param  {string} selector   选择符
   * @param  {string} ngAttrName 属性名称(针对IE)
   */
  _replaceNode: function(attrName, node, result, selector, ngAttrName) {
    switch (attrName) {
      case 'value':
        node.val(result);
        break;
      case 'html':
        node.html(result);
        break;
      case 'checked':
        //node.prop('checked', this._get(/bb-checked=\"(.*?)\"\s?/img.exec(selector)[1]));
        if (this._get(/bb-checked=\"(.*?)\"\s?/img.exec(selector)[1])) {
          node.attr('checked', true);
          node.prop('checked', true);
        } else {
          node.attr('checked', false);
          node.prop('checked', false);
        }
        break;
      default:
        node.attr(ngAttrName, result);
    }
  },
  /**
   * 执行替换操作
   * @method _handleReplace
   * @param  {object} item       缓存的替换对象集
   * @param  {object} model      模型类
   * @param  {string} selector   选择符
   * @param  {string} attrName   属性名称
   * @param  {string} ngAttrName 属性名称(针对IE)
   */
  _handleReplace: function(item, model, selector, attrName, ngAttrName) {
    var _result = item.compile(model.attributes);
    // 比对数据，若无改变则返回
    if (item.result === _result) {
      return;
    }
    // 缓存node
    if (!item.node) {
      item.node = this.$(selector).eq(item.index);
      console.log('node cache');
    }
    // 赋值
    this._replaceNode(attrName, item.node, _result, selector, ngAttrName);
    // 缓存结果
    item.result = _result;
  },
  /**
   * 获取属性列表
   * @method _getAttrList
   * @param  {object} item 缓存的模板对象
   * @return {array}       属性列表
   */
  _getAttrList: function(item) {
    var tempList = [],
      list = [],
      t_list = [];

    if (item.indexOf(']:') > -1) {
      tempList = item.split(']:');
      list = Est.map(tempList, function(_item, index) {
        if (!(index === tempList.length - 1)) {
          return _item + ']';
        } else {
          return _item;
        }
      });
      t_list = list[1].split(':');
      if (t_list.length > 1) {
        list.pop();
        list = list.concat(t_list);
      }
    } else {
      list = item.split(':');
    }
    return list;
  },
  /**
   * [bb-watch="signContent.icon:class:html,signContent.iconType:style"]:class:html,signContent.iconType:style,[bb-watch="signContent.icon:src,signContent.iconType:style"]:src
   * @param  {[type]} selector [description]
   * @return {[type]}          [description]
   */
  _getSelectorSplit: function(selector) {
    var hash = Est.hash(selector);
    //if (hash in this._re_selector) return this._re_selector[hash];
    var list = selector.split(',');
    var list2 = [];
    var temp = '';

    if (selector.indexOf('[bb-watch=') > -1) {
      Est.each(list, function(item) {
        if (item.indexOf('[bb-') > -1 && item.indexOf(']') === -1) {
          temp = item;
        } else if (item.indexOf(']') > -1 && item.indexOf('[bb-') === -1) {
          temp += (',' + item);
          list2.push(temp);
        } else if (!Est.isEmpty(item)) {
          list2.push(item);
        }
      });
    } else {
      list2 = list;
    }

    this._re_selector[hash] = list2;
    return list2;
  },
  /**
   * 视图重新渲染
   *
   * @method [渲染] - _viewReplace
   * @param selector
   * @param model
   * @author wyj 15.7.21
   * @example
   *      this._viewReplace('#model-name', this.model);
   */
  _viewReplace: function(selector, model, cbs, name) {
    try {
      Est.each(this._getSelectorSplit(selector), this._bind(function(item) {
        var list = [],
          _$template = '',
          _result = '',
          _hash = '',
          node = '',
          ngAttrName = '',
          attrName = '';

        if (!Est.isEmpty(item)) {
          _hash = Est.hash(item);

          // 获取属性列表
          list = this._getAttrList(item);

          if (list.length > 1) {
            for (var i = 1; i < list.length; i++) {
              _hash = Est.hash(list[0] + list[i]);
              attrName = list[i];
              if (Est.msie()) {
                ngAttrName = 'ng-' + list[i];
                if (!this._re_dup[_hash])
                  _$template = this._options.template.replace(new RegExp('\\s' + attrName + '=', "img"), ' ' + ngAttrName + '=');
              } else {
                ngAttrName = attrName;
                _$template = this.$template;
              }
              // 缓存模板
              if (!this._re_dup[_hash]) {

                this._re_dup[_hash] = [];
                node = $(_$template).find(list[0]);

                $.each(node, $.proxy(function(index, node) {
                  this._re_dup[_hash].push({
                    compile: this._getCompileTemp(attrName, $(node), list[0], ngAttrName),
                    hash: _hash + '' + index,
                    index: index
                  });
                  console.log(attrName + list[0]);
                }, this));
              }
              Est.each(this._re_dup[_hash], function(item) {
                this._handleReplace(item, model, list[0], attrName, ngAttrName);
              }, this);
            }

          } else {
            if (Est.msie()) {
              if (!this['h_temp_' + _hash])
                _$template = this.$template.replace(new RegExp('\\sstyle=', "img"), ' ng-style=');
              //console.log(item);
              this['h_temp_' + _hash] = this['h_temp_' + _hash] ||
                Handlebars.compile($(_$template).find(item).wrapAll('<div>').parent().html().replace(/ng-style/img, 'style'));
            } else {
              this['h_temp_' + _hash] = this['h_temp_' + _hash] ||
                Handlebars.compile($(this.$template).find(item).wrapAll('<div>').parent().html());
            }
            _result = this['h_temp_' + _hash](model.attributes);
            if (this['h_temp_r_' + _hash] === _result) {
              return;
            }
            this.$(item).replaceWith(_result);
            this['h_temp_r_' + _hash] = _result;
          }
        }
      }));
      if (cbs) {
        Est.each(cbs, function(cb) {
          cb.call(this, name);
        }, this);
      }
    } catch (e) {
      console.log(e + 'selector:' + selector);
    }
  },
  /**
   * 双向绑定
   * @method [绑定] - _watch
   * @param name
   * @param selector
   * @param callback
   * @author wyj 15.7.20
   * @example
   *      <input id="model-link" data-bind-type="keyup" type="text"  value="{{link}}"> // data-bind-type="keydown" 绑定方式，默认为change
   *      this._watch(['#model-name', '#model-color'], '#model-name,.model-name', function(){
   *
   *      });
   */
  _watch: function(name, selector, callback) {
    var _self = this,
      triggerName,
      cb_hash = null,
      temp_obj = {},
      list = [];

    if (Est.typeOf(name) === 'array') list = name;
    else list.push(name);

    this.cbMap = this.cbMap || {};
    this.watchFields = this.watchFields || {};

    Est.each(list, function(item) {
      var modelId = item.replace(/^#?model\d?-(.+)$/g, "$1");

      if (callback) {
        this.cbMap[modelId] = this.cbMap[modelId] || [];
        if (Est.typeOf(callback) === 'string') {
          cb_hash = Est.hash(modelId + callback);
          if (!(cb_hash in this.cbMap)) {
            this.cbMap[cb_hash] = true;
            this.cbMap[modelId].push(this[callback]);
          }
        } else {
          this.cbMap[modelId].push(callback);
        }
      }
      if (modelId in this.watchFields) {
        Est.each(this._getSelectorSplit(selector), function(item) {
          if (this.watchFields[modelId].indexOf(item) === -1) {
            this.watchFields[modelId] = this.watchFields[modelId] + ',' + item;
          }
        }, this);
      } else {
        this.watchFields[modelId] = selector;
      }

      selector = this.watchFields[modelId];
      triggerName = _self.cid + modelId;
      //if (!_self._options.modelBind || item.indexOf('model-') > -1) _self._modelBind(item);
      if (triggerName in temp_obj) return;

      Est.off(temp_obj[triggerName] = triggerName).on(triggerName, function(triggerName, name) {
        _self._viewReplace(selector, _self.model, _self.cbMap[modelId], modelId);
        if (_self.update) _self.update.call(_self, modelId);
      });

      _self.model.off('change:' + (temp_obj[modelId] = modelId.split('.')[0]))
        .on('change:' + temp_obj[modelId],
          function() {
            _self._viewReplace(selector, _self.model, _self.cbMap[modelId], modelId);
            if (_self.update) _self.update.call(_self, modelId);
          });
    }, this);
  },
  /**
   * 绑定模型类
   * @method [绑定] - _watchBind
   */
  _watchBind: function(template) {
    var list = [],
      models = [];

    this.cbMap = {};
    this.watchFields = {};

    if (Est.typeOf(template) === 'string') {
      models = template.match(new RegExp('(bb-watch=\\"(.+?)\"(\\s*)|bb-change=\\"(.+?)\"(\\s*)|bb-model=\\"(.+?)\"(\\s*))(bb-render=\\"(.+?)\\"\\s*)?(bb-change=\\"(.+?)\\"\\s*)?', 'img'));
      Est.each(models, this._bind(function(item) {
        var watch = '',
          model = '',
          change = '',
          w_list = [],
          watch_render = {},
          w_render = '',
          render = '';

        watch = /bb-watch=\"(.*?)\"\s?/img.exec(item) || '';
        render = /bb-render=\"(.*?)\"\s?/img.exec(item) || '';
        change = /bb-change=\"(.*?)\"\s?/img.exec(item) || '';
        model = /bb-model=\"(.*?)\"\s?/img.exec(item) || '';
        if (Est.isEmpty(watch) && Est.isEmpty(model)) return;

        if (watch.length > 1) {
          if (watch[1].indexOf(':') > -1) {
            watch_render = this._getWatchRender(watch, render);
            watch = watch_render.watch;
            render = watch_render.render;
          } else {
            w_list = watch[1].split(':');
            w_render = '[bb-watch="' + watch[1] + '"]' + watch[1].substring(watch[1].indexOf(':'), watch[1].length);
            if (w_list.length > 1) {
              if (render.length < 1) {
                render = ['', w_render];
              } else {
                render[1] += (',' + w_render);
              }
            }
            watch[1] = w_list[0];
          }
        }
        list.push({
          watch: watch.length > 1 ? watch[1] : model[1].split(':')[0],
          render: render.length > 1 ? render[1] : '',
          change: change.length > 1 ? change[1] : null
        });
      }));
    }
    Est.each(list, this._bind(function(item) {
      this._watch(item.watch.split(','), item.render, Est.isEmpty(item.change) ? null : item.change);
    }));
    if (this.onWatch) this.onWatch.call(this, arguments);
  },
  /**
   * bb-watch="args.color:style,args.color1:html"
   * @method _getWatchRender
   * @param  {[type]} watch  [description]
   * @param  {[type]} render [description]
   * @return {[type]}        [description]
   */
  _getWatchRender: function(watch, render) {
    var _watch = '';
    var _render = '';
    var _watchs = watch[1].split(',');

    Est.each(_watchs, function(item) {
      var w_list = [];

      w_list = item.split(':');
      _render += ((Est.isEmpty(_render) ? '' : ',') + '[bb-watch="' + watch[1] + '"]' + item.substring(item.indexOf(':'), item.length));
      _watch += ((Est.isEmpty(_watch) ? '' : ',') + w_list[0]);
    });

    watch[1] = _watch;
    if (render.length < 1) {
      render = ['', _render];
    } else {
      render[1] += (',' + _render);
    }

    return {
      watch: watch,
      render: render
    };
  },
  /**
   * 绑定模型类与事件
   * @method [绑定] - _bbBind
   * @param  {[type]} template [description]
   * @param  {[type]} parent   [description]
   * @return {[type]}          [description]
   */
  _bbBind: function(template, parent) {
    var matchs = [],
      patt,
      hash,
      map = {},
      result;
    this.bbList = [];

    if (Est.typeOf(template) === 'string') {
      patt = new RegExp('\\bbb-([\\w\\.]+)=\\"([\\w\\.:]+?)\\"\\s?', 'img');
      while ((result = patt.exec(template)) !== null) {
        this.bbList.push({
          name: result[1],
          value: result[2]
        });
      }
      Est.each(this.bbList, this._bind(function(item) {
        hash = Est.hash(item.name + item.value);
        if (hash in map) return;
        map[hash] = item;
        switch (item.name) {
          case 'watch':
            break;
          case 'render':
            break;
          case 'change':
            break;
          case 'show':
            console.log('name:' + item.name + ';value:' + item.value);
            break;
          case 'model':
            this._modelBind(parent, '[bb-model="' + item.value + '"]');
            this._watch([item.value.split(':')[0]], '[bb-model="' + item.value + '"]:value');
            break;
          case 'checked':
            this._watch([item.value], '[bb-checked="' + item.value + '"]:checked');
            this.$('[bb-checked="' + item.value + '"]').prop('checked', this._getValue(item.value));
            break;
          default:
            if (this[item.value]) parent.find('[bb-' + item.name + '="' + item.value + '"]').off(item.name).on(item.name, this._bind(this[item.value]));
        }
      }));
    }
  },
  /**
   * 字段序列化成字符串
   *
   * @method [模型] - _stringifyJSON ( 字段序列化成字符串 )
   * @param array
   * @author wyj 15.1.29
   * @example
   *      this._stringify(['invite', 'message']);
   */
  _stringifyJSON: function(array) {
    var keys, result;
    if (!JSON.stringify) alert(CONST.LANG.JSON_TIP);
    Est.each(array, function(item) {
      keys = item.split('.');
      if (keys.length > 1) {
        result = Est.getValue(this.model.attributes, item);
        Est.setValue(this.model.attributes, item, JSON.stringify(result));
      } else {
        Est.setValue(this.model.attributes, item, JSON.stringify(this.model.get(item)));
      }
    }, this);
  },
  /**
   * 反序列化字符串
   *
   * @method [模型] - _parseJSON ( 反序列化字符串 )
   * @param array
   */
  _parseJSON: function(array) {
    var keys, result;
    var parse = JSON.parse || $.parseJSON;
    if (!parse) alert(CONST.LANG.JSON_TIP);

    Est.each(array, function(item) {
      keys = item.split('.');
      if (keys.length > 1) {
        result = Est.getValue(this.model.attributes, item);
        if (Est.typeOf(result) === 'string') {
          Est.setValue(this.model.attributes, item, parse(result));
        }
      } else {
        if (Est.typeOf(this.model.get(item)) === 'string') {
          if (!Est.isEmpty(this._get(item))) this.model.set(item, parse(this.model.get(item)));
        }
      }
    }, this);
  },
  /**
   * 设置参数
   *
   * @method [参数] - _setOption ( 设置参数 )
   * @param obj
   * @return {BaseList}
   * @author wyj 14.12.12
   * @example
   *      app.getView('categoryList')._setOption({
   *          sortField: 'orderList'
   *      })._moveUp(this.model);
   */
  _setOption: function(obj) {
    Est.extend(this._options, obj);
    return this;
  },
  /**
   * 回车事件
   *
   * @method [private] - _initEnterEvent
   * @private
   * @author wyj 14.12.10
   */
  _initEnterEvent: function(options) {
    if (options.speed > 1 && options.enter) {
      this.$('input').keyup($.proxy(function(e) {
        if (e.keyCode === CONST.ENTER_KEY) {
          this.$(options.enter).click();
        }
      }, this));
    }
  },
  /**
   * 获取配置参数
   *
   * @method [参数] - _getOption ( 获取配置参数 )
   * @param name
   * @return {*}
   * @author wyj 15.1.29
   */
  _getOption: function(name) {
    return this._options[name];
  },
  /**
   * 获取模板字符串
   * @method _getTpl
   * @return {[type]} [description]
   */
  _getTpl: function() {
    return '<div>' + this._options.template + '</div>';
  },
  /**
   * 获取model值
   *
   * @method [模型] - _getValue ( 获取model值 )
   * @param path
   * @author wyj 15.1.30
   * @example
   *      this._getValue('tip.name');
   */
  _getValue: function(path) {
    return Est.getValue(this.model.attributes, path);
  },
  /**
   * 获取模型类的值
   * @method [模型] - _get
   * @param  {string} path [description]
   * @return {*}      [description]
   */
  _get: function(path) {
    return this._getValue.call(this, path);
  },
  /**
   * 获取model值,如果不存在，则设初始值
   *
   * @method [模型] - _getDefault ( 获取model值 )
   * @param path
   * @author wyj 15.1.30
   * @example
   *      this._getDefault('tip.name', 'd');
   */
  _getDefault: function(path, value) {
    this._setDefault(path, value);
    return Est.getValue(this.model.attributes, path);
  },
  /**
   * 设置初始值
   *
   * @method [模型] - _setDefault ( 设置初始值 )
   * @param path
   * @author wyj 15.1.30
   * @example
   *      this._setDefault('tip.name', 'd');
   */
  _setDefault: function(path, value) {
    var result = Est.getValue(this.model.attributes, path);
    if (Est.typeOf(result) === 'undefined' || Est.typeOf(result) === 'null')
      Est.setValue(this.model.attributes, path, value);
  },
  /**
   * 模型类初始化
   * @method [模型] - _initDefault
   * @return {[type]} [description]
   */
  _initDefault: function() {
    if (this.init && Est.typeOf(this.init) === 'function') {
      this.__def_vals_ = this.init.call(this) || {};
      Est.each(this.__def_vals_, this._bind(function(value, key) {
        this._setDefault(key, value);
      }));
    }
  },
  /**
   * 重置表单
   *
   * @method [表单] - _reset ( 重置表单 )
   * @author wyj 14.11.18
   */
  _reset: function(data) {
    this.model.attributes = {};
    data = Est.extend(Est.extend(this.model.defaults || {}, this.__def_vals_), data);
    this._set(this._getPath(data));
  },
  /**
   * 获取对象路径
   * @return {[type]} [description]
   */
  _getPath: function(data, pre) {
    var paths = [];
    var temp = data;
    if (!pre) { pre = ''; }

    while (Est.keys(temp).length > 0) {
      data = temp;
      Est.each(data, function(value, key) {
        if (Est.typeOf(value) === 'object') {
          Est.each(value, function(v, k) {
            temp[key + '.' + k] = v;
          });
        } else {
          paths.push({
            path: key,
            value: value
          });
        }
        delete temp[key];
      });
    }
    Est.each(paths, this._bind(function(item) {
      temp[pre + item.path] = item.value;
    }));

    return temp;
  },
  /**
   * 设置model值
   *
   * @method [模型] - _setValue ( 设置model值 )
   * @param path
   * @param val
   * @author wyj 15.1.30
   * @example
   *      this._setValue('tip.name', 'aaa');
   */
  _setValue: function(path, val) {
    // just for trigger
    if (!Est.equal(Est.getValue(this.model.attributes, path), val)) {
      Est.setValue(this.model.attributes, path, val);
      Est.trigger(this.cid + path, path);
      this._m_change_ = true;
    }
  },
  /**
   * 赋值模型类
   * @method [模型] - _set
   * @param {string/object} path [description]
   * @param {string/object} val  [description]
   */
  _set: function(path, val) {
    this._m_change_ = false;
    if (Est.typeOf(path) === 'object') this._baseSetValues(path);
    else this._setValue(path, val);
    if (this._m_change_ && this.options.onUpdate)
      this.options.onUpdate.call(this, this.model.toJSON());
  },
  /**
   * 批量赋值
   * @method [模型] - _baseSetValues
   * @param  {object} keyVals [description]
   * @return {*}         [description]
   */
  _baseSetValues: function(keyVals) {
    Est.each(keyVals, this._bind(function(value, key) {
      this._setValue(key, value);
    }));
  },
  /**
   * 基础设置模型类属性值
   * @method [模型] - _baseSetAttr
   * @param  {[type]} path [description]
   * @param  {[type]} val  [description]
   * @return {[type]}      [description]
   */
  _baseSetAttr: function(path, val) {
    if (Est.typeOf(path) === 'string') Est.setValue(this.model.attributes, path, val);
    else Est.each(path, this._bind(function(value, key) { Est.setValue(this.model.attributes, key, value); }));
  },
  /**
   * 设置多个model值, 如果当前视图参数设置里有onChange事件，则调用之
   *
   * @method [模型] - _setValues ( 新版将移除 )
   * @param {[type]} keyVals [description]
   * @example
   *       this._setValues({
   *         'args.styles.name.display': 'block'
   *       });
   */
  _setValues: function(keyVals) {
    this._baseSetValues(keyVals);
    if (this._options.onChange) this._options.onChange.call(this, keyVals);
  },

  /**
   * 设置多个model attributes值， 此方法将不触发模型类改变事件
   *
   * @method [模型] - _setAttr
   * @param {[type]} keyVals [description]
   */
  _setAttr: function(path, val) {
    this._baseSetAttr(path, val);
  },
  /**
   * 设置多个model attributes值， 此方法将不触发模型类改变事件
   * 如果当前视图参数设置里有onChange事件，则调用之
   *
   * @method [模型] - _setAttrValues ( 新版将移除 )
   * @param {[type]} keyVals [description]
   */
  _setAttributes: function(path, val) {
    this._baseSetAttr(path, val);
    if (this._options.onChange) this._options.onChange.call(this, path);
  },

  /**
   * 获取BaseList列表长度
   * @method [列表] - _getLength
   * @return {[type]} [description]
   */
  _getLength: function() {
    return this.collection.models.length;
  },
  /**
   * 获取点击事件源对象
   * @method [事件] - _getTarget
   * @param e
   * @return {*|jQuery|HTMLElement}
   *  @example
   *      this._getTarget(e);
   */
  _getTarget: function(e) {
    return e.target ? $(e.target) : $(e.currentTarget);
  },
  /**
   * 获取绑定事件源对象
   * @method [事件] - _getEventTarget
   * @param e
   * @return {*|jQuery|HTMLElement}
   *  @example
   *      this._getEventTarget(e);
   */
  _getEventTarget: function(e) {
    return e.currentTarget ? $(e.currentTarget) : $(e.target);
  },
  /**
   * 单次执行
   * @method [事件] - _one
   * @param callback
   * @author wyj 15.6.14
   * @example
   *      this._one(['AwardList'], function (AwardList) {
   *          app.addPanel('main', {
   *          el: '#Award',
   *          template: '<div class="leaflet-award"></div>'
   *      }).addView('awardList', new AwardList({
   *          el: '.leaflet-award',
   *          viewId: 'awardList'
   *      }));
   *  });
   */
  _one: function(name, callback) {
    try {
      var _name, isArray = Est.typeOf(name) === 'array';
      var _nameList = [];
      var _one = null;

      _name = isArray ? name.join('_') : name;
      _one = '_one_' + _name;
      this[_one] = Est.typeOf(this[_one]) === 'undefined' ? true : false;

      if (this[_one]) {
        if (isArray) {
          Est.each(name, function(item) {
            _nameList.push(item.replace(/^(.+)-(\d+)?$/g, "$1"));
          });
          this._require(_nameList, callback);
        } else if (callback) {
          callback.call(this);
        }
      }
    } catch (e) {
      debug('SuperView._one ' + JSON.stringify(name) + e, { type: 'error' }); //debug__
    }
  },
  /**
   * 异步加载
   * @method [加载] - _require
   * @param dependent
   * @param callback
   * @author wyj 15.6.14
   * @example
   *        this._require(['Module'], function(Module){
   *            new Module();
   *        });
   */
  _require: function(dependent, callback) {
    seajs.use(dependent, Est.proxy(callback, this));
  },
  /**
   * 延迟执行
   * @method [加载] - _delay
   *
   * @param time
   * @author wyj 15.12.3
   * @example
   *  this._delay(function(){}, 5000);
   */
  _delay: function(fn, time) {
    setTimeout(Est.proxy(function() {
      setTimeout(Est.proxy(function() {
        if (fn) fn.call(this);
      }, this), time);
    }, this), 0);
  },
  /**
   * 代理
   * @method [事件] - _bind
   * @param  {Function} fn [description]
   * @return {[type]}      [description]
   */
  _bind: function(fn) {
    return Est.proxy(fn, this);
  },
  /**
   * title提示
   * @method [提示] - _initToolTip ( title提示 )
   * @author wyj 15.9.5
   * @example
   *      <div class="tool-tip" title="提示内容">content</div>
   *      this._initToolTip();
   */
  _initToolTip: function($parent, className) {
    var _className = className || '.tool-tip';
    var $tip = $parent ? $(_className, $parent) : this.$(_className);

    $tip.hover(function(e) {
      var title = $(this).attr('data-title') || $(this).attr('title');
      var offset = $(this).attr('data-offset') || 0;
      if (Est.isEmpty(title)) return;

      BaseUtils.dialog({
        id: Est.hash(title || 'error:446'),
        title: null,
        width: 'auto',
        offset: parseInt(offset, 10),
        skin: 'tool-tip-dialog',
        align: $(this).attr('data-align') || 'top',
        content: '<div style="padding: 5px 6px;;font-size: 12px;">' + title + '</div>',
        hideCloseBtn: true,
        autofocus: false,
        target: $(this).get(0)
      });
      if (!app.getData('toolTipList')) app.addData('toolTipList', []);
      app.getData('toolTipList').push(Est.hash(title));

      $(window).one('click', Est.proxy(function() {
        Est.each(app.getData('toolTipList'), function(item) {
          if (app.getDialog(item)) app.getDialog(item).close();
        });
        app.addData('toolTipList', []);

      }, this));
    }, function() {
      try {
        app.getDialog(Est.hash($(this).attr('data-title') || $(this).attr('title'))).close();
      } catch (e) {}
    });
  },
  /**
   * 关闭对话框
   * @method _close
   */
  _close: function() {
    if (app.getDialog(this.viewId)) app.getDialog(this.viewId).close().remove();
  },
  /**
   * service服务
   * @method _service
   * @return {[type]} [description]
   */
  _service: function(type, options) {
    return Service[type](options);
  },
  _empty: function() {},
  render: function() {
    this._render();
  }
});
