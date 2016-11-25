/**
 * @description 应用程序管理器 - 中介者模式， 用于注册视图、模块、路由、模板等。
 * @class BaseApp - 用户后台
 * @author yongjin<zjut_wyj@163.com> 2014/12/28
 */
var BaseApp = function(options) {
  this.options = options;
  Est.extend(this, options);
  this.initialize.apply(this, arguments);
};
Est.extend(BaseApp.prototype, {
  initialize: function() {
    this.data = { itemActiveList: [], sessionId: '' }; // 全局数据
    this.instance = {}; // 实例对象
    this.modules = {}; // 所有模块
    this.routes = {}; // 路由
    this.templates = {}; // 静态模板
    this.panels = {}; // 面板
    this.dialog = []; // 对话框
    this.dialogs = {}; // 带身份标识的dialog
    this.status = {}; // 状态
    this.cookies = []; // 会话
    this.models = []; // 实体对象
    this.compileTemps = {}; // 编译模版
    this.filters = { navigator: [], form: [] }; // 过滤器
    this.cache = {}; // 缓存
    this.directives = {}; // 指令
  },
  /**
   * 返回当前应用底层使用的是backbone版本
   *
   * @method [版本] - getAppType ( 获取App版本 )
   * @return {string}
   * @author wyj 15.5.20
   */
  getAppType: function() {
    return 'backbone';
  },
  /**
   * 视图添加， 当重新添加时会调用destroy方法
   *
   * @method [视图] - addRegion ( 添加视图[推荐使用] )
   * @param name
   * @param instance
   * @return {*}
   * @example
   *      app.addRegion('productList', ProductList, {
   *        viewId: 'productList',     // 可省略
   *        el: '',
   *        args: args
   *      });
   */
  addRegion: function(name, instance, options) {
    var panel = Est.nextUid('region');

    if (!options.__panelId) {
      options.__panelId = options.el;
    }
    if (options.diff && app.getView(options.viewId || name)) {
      app.getView(options.viewId || name)._extend(options);
      app.getView(options.viewId || name)._reset(options.data);
      return;
    }
    this.addPanel(name, {
      el: options.__panelId,
      template: '<div class="region ' + panel + '"></div>',
      append: options.append
    }, options);
    if (!options.viewId) {
      options.viewId = name;
    }
    if (options.viewId in this.instance) {
      this.removeView(options.viewId);
    }

    return this.addView(options.viewId, new instance(options));
  },
  /**
   * 添加面板
   *
   * @method [面板] - addPanel ( 添加面板 )
   * @param name
   * @param options
   * @return {BaseApp}
   * @example
   *        app.addPanel('product', new Panel());
   *        app.addPanel('product', {
   *          el: '#product-panel',
   *          template: '<div clas="product-panel-inner"></div>'
   *        }).addView('aliPay', new AlipayView({
   *          el: '.product-panel-inner',
   *          viewId: 'alipayView'
   *        }));
   */
  addPanel: function(name, panel, options) {
    var isObject = Est.typeOf(panel.cid) === 'string' ? false : true;
    options = options || {};
    BaseUtils.addLoading();
    if (isObject) {
      this.removePanel(name, panel);
      panel.$template = $(panel.template);
      if (options) options.el = panel.$template;
      panel.$template.addClass('__panel_' + name);
      panel.$template.attr('data-view', options.viewId || name);
      if (!panel.append) $(panel.el).empty();
      $(panel.el).append(panel.$template);
    }
    this.panels[name] = panel;
    return isObject ? this : panel;
  },
  /**
   * 移除面板
   *
   * @method [面板] - removePanel ( 移除面板 )
   * @param name
   * @author wyj 14.12.29
   */
  removePanel: function(name, panel) {
    try {
      var views = [];
      if (!panel) panel = this.panels[name];
      if (panel.el !== 'body') {
        $('.region', $(panel.el)).each(function() {
          views.push($(this).attr('data-view'));
        });
        views.reverse();
        Est.each(views, function(name) {
          app.removeView(name);
        });
      }
      $('.__panel_' + name, $(panel.el)).off().remove();
      delete this.panels[name];
    } catch (e) {
      console.error(e);
    }
  },
  /**
   * 视图添加
   *
   * @method [视图] - addView ( 添加视图 )
   * @param name
   * @param instance
   * @return {*}
   * @example
   *      app.addView('productList', new ProductList());
   */
  addView: function(name, instance) {
    if (name in this.instance) this.removeView(name);
    this.instance[name] = instance;
    this.setCurrentView(name);
    return this.instance[name];
  },
  /**
   * 视图移除， 移除视图绑定的事件及所有itemView的绑定事件,
   * 并移除所有在此视图创建的对话框
   *
   * @method [视图] - removeView ( 移除视图 )
   * @param name
   * @return {BaseApp}
   * @example
   *        app.removeView('productList');
   */
  removeView: function(name) {
    try {
      if (this.getView(name)) {
        if (this.getView(name).destroy) this.getView(name).destroy();
        if (this.getView(name)._destroy) this.getView(name)._destroy()
        if (this.getView(name)._empty) this.getView(name)._empty();
        if (this.getView(name).stopListening) this.getView(name).stopListening();
        if (this.getView(name).$el)this.getView(name).$el.off().remove();
      }
      delete this.instance[name];
    } catch (e) {
      console.log(e);
    }
    return this;
  },

  panel: function(name, panel) {
    return this.addPanel(name, panel);
  },
  /**
   * 显示视图
   *
   * @method [面板] - show ( 显示视图 )
   * @param view
   * @author wyj 14.12.29
   */
  show: function(view) {
    this.addView(this.currentView, view);
  },

  /**
   * 获取面板
   *
   * @method [面板] - getPanel ( 获取面板 )
   * @param name
   * @return {*}
   * @author wyj 14.12.28
   * @example
   *      app.getPanelf('panel');
   */
  getPanel: function(name) {
    return this.panels[name];
  },

  add: function(name, instance) {
    return this.addView(name, instance);
  },

  /**
   * 设置当前视图
   * @method [视图] - setCurrentView ( 设置当前视图 )
   * @param name
   * @example
   *      app.setCurrentView('list', new List());
   */
  setCurrentView: function(name) {
    this.currentView = name;
  },
  /**
   * 获取当前视图
   * @method [视图] - getCurrentView ( 获取当前视图 )
   * @return {*|BaseApp.currentView}
   * @author wyj 15.1.9
   * @example
   *        app.getCurrentView('list');
   */
  getCurrentView: function() {
    return this.currentView;
  },
  /**
   * 获取视图
   *
   * @method [视图] - getView ( 获取视图 )
   * @param name
   * @return {*}
   * @author wyj 14.12.28
   * @example
   *        app.getView('productList');
   */
  getView: function(name) {
    return this.instance[name];
  },
  /**
   * 添加对话框
   *
   * @method [对话框] - addDailog ( 添加对话框 )
   * @param dialog
   * @return {*}
   * @example
   *      app.addDialog(dialog, id);
   */
  addDialog: function(dialog, id) {
    this.dialog.push(dialog);
    if (id) {
      app.addData('_curDialog', id);
      this.dialogs[id] = dialog;
    }
    return dialog;
  },
  /**
   * 获取所有对话框
   * @method [对话框] - getDialogs ( 获取所有对话框 )
   * @return {*}
   * @author wyj 15.1.23
   */
  getDialogs: function() {
    return this.dialog;
  },
  /**
   * 获取指定对话框
   * @method [对话框] - getDialog ( 获取指定对话框 )
   * @author wyj 15.03.20
   *
   */
  getDialog: function(id) {
    if (Est.isEmpty(id)) return this.dialogs;
    return this.dialogs[id];
  },
  /**
   * 获取最后打开的dialog对话框
   * @method [对话框] - getCurrentDialog ( 获取当前对话框 )
   * @return {*}
   * @author wyj 15.10.25
   */
  getCurrentDialog: function() {
    if (app.getData('_curDialog')) {
      return this.dialogs[app.getData('_curDialog')];
    }
    return null;
  },
  /**
   * 清空所有对话框, 当切换页面时移除所有对话框
   *
   * @method [对话框] - emptyDialog ( 清空所有对话框 )
   * @author wyj 14.12.28
   * @example
   *      app.emptyDialog();
   */
  emptyDialog: function() {
    Est.each(this.dialog, function(item) {
      if (item && item.close) {
        item.close().remove();
      }
    });
    this.dialog = [];
    this.dialogs = {};
    app.addData('_curDialog', null);
  },
  /**
   * 添加模型类
   * @method [模型] - addModel ( 添加模型类 )
   * @author wyj 15.1.23
   */
  addModel: function(model) {
    this.models.push(model);
    return model;
  },
  /**
   * 获取所有模型类
   * @method [模型] - getModels ( 获取所有模型类 )
   * @author wyj 15.1.23
   */
  getModels: function() {
    return this.models;
  },

  /**
   * 添加数据
   *
   * @method [数据] - addData ( 添加数据 )
   * @param name
   * @param data
   * @author wyj 14.12.28
   * @example
   *      app.addData('productList', productList);
   */
  addData: function(name, data) {
    this.data[name] = data;
  },
  /**
   * 获取数据
   *
   * @method [数据] - getData ( 获取数据 )
   * @param name
   * @return {*}
   * @author wyj 14.12.28
   * @example
   *        app.getData('productList');
   */
  getData: function(name) {
    return this.data[name];
  },
  /**
   * 添加模块 分拆seajs配置文件，
   * 实现每个模板都有自己的模块配置文件
   *
   * @method [模块] - addModule ( 添加模块 )
   * @param name
   * @param val
   * @author wyj 14.12.28
   * @example
   *        app.addModule('ProductList', '/modules/product/controllers/ProductList.js');
   */
  addModule: function(name, val) {
    this.modules[name] = val;
  },
  /**
   * 获取所有模块
   *
   * @method [模块] - getModules ( 获取所有模块 )
   * @return {*}
   * @author wyj 14.12.28
   * @example
   *
   */
  getModules: function() {
    return this.modules;
  },
  /**
   * 添加路由
   *
   * @method [路由] - addRoute ( 添加路由 )
   * @param name
   * @param fn
   * @author wyj 14.12.28
   * @example
   *      app.addRoute('product', function(){
   *          seajs.use(['ProductList'], function(ProductList){
   *          });
   *      });
   */
  addRoute: function(name, fn) {
    this.routes[name] = fn;
  },
  /**
   * 获取所有路由
   *
   * @method [路由] - getRoutes ( 获取所有路由 )
   * @return {*}
   * @author wyj 14.12.28
   *
   */
  getRoutes: function() {
    return this.routes;
  },
  /**
   * 添加模板, 目前无法解决seajs的实时获取问题
   *
   * @method [模板] - addTemplate ( 添加模板 )
   * @param name
   * @param fn
   * @author wyj 14.12.28
   * @example
   *        app.addTemplate('template/photo_item', function (require, exports, module) {
              module.exports = require('modules/album/views/photo_item.html');
            });
   */
  addTemplate: function(name, fn) {
    this.templates[name] = fn;
  },
  /**
   * 获取所有模板
   *
   * @method [模板] - getTemplates ( 获取所有模板 )
   * @return {*}
   * @author wyj 14.12.28
   * @example
   *        app.getTemplates();
   */
  getTemplates: function() {
    return this.templates;
  },
  /**
   * 添加session会话   登录成功后会添加__USER__ 用户信息会话， 获取：App.getSession('__USER__');
   * 当需要区分用户唯一性时， 在设置前先设置sessionId   app.addData('sessionId', 'Enterprise_0000000000000000032');
   *
   * @method [会话] - addSession ( 添加session会话 )
   * @param name
   * @param value
   * @return {*}
   * @author wyj 15.4.22
   * @example
   *      App.addSession('__USER__', {username: 'ggggfj'});
   */
  addSession: function(name, value, isSession) {
    try {
      var sessionId = Est.typeOf(isSession) === 'undefined' ? '' : isSession ? this.data.sessionId : '';
      localStorage['___JHW_BACKBONE__' + Est.hash(sessionId + name)] = JSON.stringify(value);
    } catch (e) {
      debug('Error9 -> addSession -> ' + e); //debug__
    }
    return value;
  },
  /**
   * 读取session会话
   *
   * @method [会话] - getSession ( 读取session会话 )
   * @param name
   * @return {Object}
   * @example
   *      App.getSession('__USER__'); => {username: 'ggggfj'}
   */
  getSession: function(name, isSession) {
    try {
      var sessionId = Est.typeOf(isSession) === 'undefined' ? '' : isSession ? this.data.sessionId : '';
      return JSON.parse(localStorage['___JHW_BACKBONE__' + Est.hash(sessionId + name)]);
    } catch (e) {
      app.addSession(name, '');
      return '';
    }

  },
  /**
   * 添加编译模板
   * @method [模板] - addCompileTemp ( 添加编译模板 )
   * @param name
   * @param compile
   */
  addCompileTemp: function(name, compile) {
    this.compileTemps[name] = compile;
  },
  /**
   * 获取编译模板
   * @method [模板] - getCompileTemp ( 获取编译模板 )
   * @param name
   * @return {*}
   */
  getCompileTemp: function(name) {
    return this.compileTemps[name];
  },
  /**
   * 添加状态数据
   *
   * @method [状态] - SSaatus ( 添加状态数据 )
   * @param name
   * @param value
   * @author wyj 15.1.7
   */
  addStatus: function(name, value) {
    this.status[name] = value;
  },
  /**
   * 获取状态数据
   *
   * @method [状态] - getStatus ( 获取状态数据 )
   * @param name
   * @param value
   * @author wyj 15.1.7
   */
  getStatus: function(name) {
    return this.status[name];
  },
  /**
   * 获取所有状态数据
   *
   * @method [状态] - getAllStatus ( 获取所有状态数据 )
   * @return {{}|*|BaseApp.status}
   * @author wyj 15.1.9
   */
  getAllStatus: function() {
    return this.status;
  },
  /**
   * 添加参数配置对象
   *
   * @method [配置] - addOption ( 添加配置对象 )
   * @author wyj 15.9.19
   */
  addOption: function(name, value) {
    this.options[name] = value;
  },
  /**
   * 获取参数配置对象
   *
   * @method [配置] - getOption ( 获取配置对象 )
   * @param name
   * @return {*}
   * @author wyj 15.9.19
   */
  getOption: function(name) {
    return Est.cloneDeep(this.options[name]);
  },
  /**
   * 添加过滤器
   *
   * @method [过滤] - addFilter
   * @param {string} name
   * @param {fn} fn
   * @author wyj 15.6.22
   * @example
   *
   */
  addFilter: function(name, fn) {
    if (name === 'navigator') {
      this.filters[name].push(fn);
    } else {
      this.filters[name] = fn;
    }
  },
  /**
   * 获取过滤器
   *
   * @method [过滤] - getFilter
   * @param name
   * @return {*}
   * @author wyj 15.6.22
   * @example
   *      App.getFilter('navigator');
   */
  getFilter: function(name) {
    return this.filters[name];
  },
  /**
   * 获取过滤器
   *
   * @method [过滤] - getFilters
   * @param name
   * @return {*}
   * @author wyj 15.6.22
   * @example
   *      App.getFilters('navigator');
   */
  getFilters: function(name) {
    return this.filters[name];
  },
  /**
   * 获取参数hash值
   *
   * @method [cache] - getParamsHash ( 获取参数hash值 )
   * @param options
   * @author wyj 15.10.25
   */
  getParamsHash: function(options) {
    var params = '',
      cacheId = '';

    for (var key in options) {
      params += options[key];
    }
    cacheId = '_hash' + Est.hash(params);

    return cacheId;
  },
  /**
   * 缓存数据
   * @method [cache] - addCache ( 数据缓存 )
   * @param options
   * @author wyj 15.10.25
   */
  addCache: function(options, result) {
    try {
      var cacheId = '';

      if (!result.success) return;
      cacheId = this.getParamsHash(options);

      if (options.session && result) {
        app.addSession(cacheId, result);
      } else {
        this.cache[cacheId] = result;
      }
    } catch (e) {
      debug('Error12 -> addCache -> ' + e); //debug__
    }
  },
  /**
   * 获取缓存数据
   *
   * @method [cache] - getCache ( 获取缓存数据 )
   * @param options
   * @author wyj 15.10.25
   * @return {*}
   */
  getCache: function(options) {
    var result = null;
    var cacheId = this.getParamsHash(options);
    // localStorage缓存
    if (options.session && !app.getData('versionUpdated')) {
      result = app.getSession(cacheId);
      if (result) {
        return JSON.parse(result);
      }
    } else {
      return this.cache[cacheId];
    }
  },
  /**
   * 清除缓存数据
   *
   * @method [cache] - removeCache ( 清除缓存数据 )
   * @param options
   * @author wyj 15.10.25
   * @example
   *      app.removeCache();
   *      app.removeCache(options);
   */
  removeCache: function(options) {
    var cacheId = null;
    if (options) {
      cacheId = this.getParamsHash(options);
      delete this.cache[cacheId];
      return;
    }
    this.cache = {};
  },
  /**
   * 添加cookie
   *
   * @method [cookie] - addCookie ( 添加cookie )
   * @author wyj 15.1.13
   */
  addCookie: function(name) {
    if (Est.findIndex(this.cookies, name) !== -1) {
      return;
    }
    this.cookies.push(name);
  },
  /**
   * 获取所有保存的cookie
   *
   * @method [cookie] - getCookies ( 获取所有保存的cookie )
   * @return {Array}
   * @author wyj 15.1.13
   */
  getCookies: function() {
    return this.cookies;
  },
  /**
   * 添加指令
   *
   * @method addDirective
   * @param {[type]} name [description]
   * @param {[type]} obj  [description]
   */
  addDirective: function(name, obj) {
    this.directives[name] = obj;
  },
  /**
   * 获取指令

   * @method getDirective
   * @return {[type]} [description]
   */
  getDirective: function(name) {
    return this.directives[name];
  }
});
window.app = window.app || new BaseApp({});
