/**
 * @description 模块功能说明
 * @class UiTodoMvc
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiTodoMvc', ['template/ui_todo_mvc'], function(require, exports, module) {
  var UiTodoMvc, template, model, collection, item;

  template = require('template/ui_todo_mvc');

  model = BaseModel.extend({});

  collection = BaseCollection.extend({});

  item = BaseItem.extend({
    tagName: 'li',
    className: 'todo',
    diff: true, // 取消dx 监视
    onWatch: function() {
      this._watch(['completed'], '', function() {
        this._super('view').remaining();
      });
    }
  });

  UiTodoMvc = BaseList.extend({
    initialize: function() {
      this._super({
        template: template,
        model: model,
        collection: collection,
        item: item,
        render: '.todo-list',
        //items: todoStorage.fetch()
        items: []
      });
    },

    init: function() {
      return {
        'active': '0',
        'remaining': this._options.items.length,
        'visibility': 'all'
      }
    },

    onWatch: function() {
      this._watch(['models'], '', this.remaining);
    },

    checkAll: function() {
      this.collection.each(this._bind(function(model) {
        model._set('completed', this._get('allDone'));
      }));
    },

    changeRoute: function(type) {
      this._set('visibility', type);
      BaseUtils.removeLoading();
    },

    all: function() {
      return this._get('models');
    },

    active: function() {
      return this.collection.filter(function(model) {
        return !model._get('completed');
      });
    },

    completed: function() {
      return this.collection.filter(function(model) {
        return model._get('completed');
      });
    },

    remaining: function() {
      this._set('remaining', this.active().length);
      this._set('allDone', this._get('remaining') === 0);
    },

    removeCompleted: function() {
      this.collection._set(this.active());
    },

    // 添加列表
    addTodo: function(e, name, value) {
      var value = Est.trim(this._get('newTodo'));
      if (!value) {
        return;
      }
      this._push({ 'title': value, 'completed': false });
      this._set('newTodo', '');
    }
  });

  module.exports = UiTodoMvc;
});
