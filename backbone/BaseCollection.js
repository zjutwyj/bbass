/**
 * @description 基础集合类
 *
 * - url: CONST.API + '/product/list', // 如果是function形式构建的时候，记得带上page 与pageSize; // 可选
 * - batchDel: CONST.API + '/product/batch/del', // 可选
 * - model: ProductModel,
 * - initialize: function(){this._initialize();} // 可选
 *
 * @class BaseCollection 集合类
 * @author yongjin<zjut_wyj@163.com> 2014/11/6
 */

var PaginationModel = Backbone.Model.extend({
  defaults: {
    page: 1,
    pageSize: 16,
    count: 0
  },
  initialize: function() {}
});

var BaseCollection = Backbone.Collection.extend({
  //localStorage: new Backbone.LocalStorage('base-collection'),
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
    Backbone.Collection.apply(this, [null, arguments]);
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
          if (app.getView(this.options.viewId)) {
            return app.getView(this.options.viewId).model.toJSON();
          } else {
            return this.options.data;
          }
          break;
        case 'model':
          if (app.getView(this.options.viewId)) {
            return app.getView(this.options.viewId).model;
          } else {
            var model = this.model;
            return new model(this.options.data);
          }
          break;
        case 'view':
          return app.getView(this.options.viewId);
        default:
          if (app.getView(this.options.viewId)[type]) app.getView(this.options.viewId)[type](args);
          return this;
      }
    }
  },
  /**
   * 初始化
   *
   * @method [初始化] - _initialize ( 初始化 )
   * @author wyj 14.11.16
   * @example
   initialize: function () {
                this._initialize();
              }
   */
  _initialize: function() {
    this._baseUrl = this.url;
    this.__params = this.__params || {};
    if (!this.paginationModel) {
      this.paginationModel = new PaginationModel({
        page: this.options.page || 1,
        pageSize: this.options.pageSize || 16
      });
    }
  },
  initialize: function() {
    this._initialize();
  },
  /**
   * 处理url 与 分页
   *
   * @method [private] - _parse (  )
   * @private
   * @param resp
   * @param xhr
   * @return {attributes.data|*}
   * @author wyj 14.11.16
   */
  parse: function(resp, xhr) {
    var ctx = this;
    if (Est.isEmpty(resp)) {
      return [];
    }
    if (!resp.success && resp.msg) {
      if (resp.msgType === "notLogin" && !Est.isEmpty(this.url)) {
        Est.trigger('checkLogin');
      } else{
        BaseUtils.tip(resp.msg, { zIndex: 5000 });
      }
    }
    this._parsePagination(resp);
    this._parseUrl(this.paginationModel);
    //TODO this.options.pagination 防止被其它无分页的列表覆盖
    if (this.options.pagination && this.paginationModel) {
      this._paginationRender();
    }
    return resp.attributes.data;
  },
  /**
   * 处理url地址， 加上分页参数
   *
   * @method [private] - _parseUrl (  )
   * @private
   * @param model
   * @author wyj 14.11.16
   */
  _parseUrl: function(model) {
    var page = 1,
      pageSize = 16;
    if (model && model.get('pageSize')) {
      pageSize = model.get('pageSize');
      page = model.get('page');
    }
    if (this.options.subRender) {
      page = 1;
      pageSize = 9000;
    }
    if (typeof this.url !== 'function') {
      var end = '';
      if (!Est.isEmpty(this._itemId)) end = '/' + this._itemId;
      this.url = this._baseUrl + end + '?page=' + page + '&pageSize=' + pageSize + this._getParams();
    }
  },
  /**
   * 设置请求参数
   * @method _setParam
   *
   * @param {[type]} name  [description]
   * @param {[type]} value [description]
   */
  _setParam: function(name, value) {
    this.__params[name] = value;
  },
  /**
   * 拼装请求参数
   * @method _getParams
   *
   * @return {[type]} [description]
   */
  _getParams: function() {
    var result = '';
    Est.each(this.__params, function(val, key) {
      result += ('&' + key + '=' + val);
    }, this);
    return result;
  },
  /**
   * 设置分页模型类
   *
   * @method [private] - _parsePagination
   * @private
   * @param resp
   * @author wyj 14.11.16
   */
  _parsePagination: function(resp) {
    resp.attributes = resp.attributes || {
      page: 1,
      per_page: 10,
      count: 10
    };
    if (this.paginationModel) {
      this.paginationModel.set('page', resp.attributes.page || 1);
      this.paginationModel.set('pageSize', resp.attributes.per_page || 16);
      this.paginationModel.set('count', resp.attributes.count || 1);
    }
  },
  /**
   * 渲染分页
   *
   * @method [private] - _paginationRender
   * @private
   * @author wyj 14.11.16
   */
  _paginationRender: function() {
    seajs.use(['Pagination'], Est.proxy(function(Pagination) {
      if (!Pagination) return;
      if (!this.pagination) {
        var $el = $(this.options.el);
        var isStr = Est.typeOf(this.options.pagination) === 'string';
        var _$el = $(!isStr ? "#pagination-container" :
          this.options.pagination, $el.size() > 0 ? $el : $('body'));
        if (isStr) {
          this.paginationModel.set('numLength', parseInt(_$el.attr('data-numLength') || 7, 10));
        }
        this.pagination = new Pagination({
          el: _$el,
          model: this.paginationModel
        });
      } else {
        this.pagination.render();
      }
    }, this));
  },
  /**
   * 加载列表
   *
   * @method [集合] - _load ( 加载列表 )
   * @param instance 实例对象
   * @param context 上下文
   * @param model 模型类
   * @return {ln.promise} 返回promise
   * @author wyj 14.11.15
   * @example
   *      if (this.collection.url){
   *             this.collection._load(this.collection, this, model)
   *                 .then(function(result){
   *                     resolve(result);
   *                 });
   *         }
   */
  _load: function(instance, context, model) {
    this._parseUrl(model);
    return instance.fetch({
      success: function() {
        if (!context.options.diff) context._empty();
      },
      cacheData: this.options.cache,
      session: this.options.session
    });
  },
  /**
   * 设置itemId
   *
   * @method [分类] - _setItemId ( 设置itemId )
   * @param itemId
   * @author wyj 14.12.16
   * @example
   *        this._setItemId('Category00000000000000000032');
   */
  _setItemId: function(itemId) {
    this._itemId = itemId;
  },
  /**
   * 设置列表
   * @method _set
   * @param {[type]} list [description]
   */
  _set: function(list) {
    return this._super('view')._setModels(list);
  },
  /**
   * 清空列表
   *
   * @method [集合] - _empty ( 清空列表 )
   * @author wyj 14.11.15
   */
  _empty: function() {
    if (this.collection) {
      var len = this.collection.length;
      while (len > -1) {
        this.collection.remove(this.collection[len]);
        len--;
      }
      Est.trigger(this._super('view').cid + 'models')
    }
  }
});
