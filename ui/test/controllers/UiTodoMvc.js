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
        this._super('view').handleChange('item');
      });
    },

    editTodo: function() {
      this.beforeEditCache = this._get('title');
      this.$el.addClass('editing');
      this.$('.edit').focus();
    },

    doneEdit: function() {
      if (Est.isEmpty(this._get('title'))) {
        this._remove(this._get('dx'));
      }
      this.$el.removeClass('editing');
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
        items: [{title: 'aaa'},{title: 'bbb'}]
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
      this._watch(['models'], '', this.handleChange);
    },

    checkAll: function() {
      if (this._get('checkType') === 'item') {
        return;
      }
      this.collection.each(this._bind(function(model) {
        model._set('completed', this._get('allDone'));
      }));
    },

    changeRoute: function(type) {
      this._set('visibility', type);
      this._setDefault('originList', this._getItems());
      this.collection._set(this._get('originList'));
      this.collection._set(this[type]());
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

    handleChange: function(type) {
      this._set('remaining', this.active().length);
      this._set('checkType', type);
      this._set('allDone', this._get('remaining') === 0);
      this._delay(function() { this._set('checkType', 'all'); }, 50);
    },

    removeCompleted: function() {
      this.collection._set(this.active());
    },

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
