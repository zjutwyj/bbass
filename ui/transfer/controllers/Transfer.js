'use strict';
/**
 * @description 模块功能说明
 * @class Transfer
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('Transfer', ['Sortable'], function(require, exports, module) {
  var Transfer, template, leftModel, leftCollection, leftItem, leftList, rightModel, rightCollection, rightItem, rightList, Sortable;

  template = '<div class="ui-transfer-wrap clearfix"> <div class="ui-transfer-left"> </div> <div class="ui-transfer-arrow iconfont icon-arrow-right"></div> <div class="ui-transfer-right"> </div> </div> ';
  Sortable = require('Sortable');

  leftModel = BaseModel.extend({
    baseId: 'transferId'
  });

  leftCollection = BaseCollection.extend({
    model: leftModel
  });

  leftItem = BaseItem.extend({
    events: {
      'click .strControl': 'transferRight'
    },
    tagName: 'li',
    className: 'ui-transfer-left-li',
    transferRight: function(e) {
      e.stopImmediatePropagation();
      app.getView(this._options.viewId).transferRight(this.model.toJSON());
      this.model.destroy();
    }
  });

  leftList = BaseList.extend({
    initialize: function() {
      this._initialize({
        model: leftModel,
        item: leftItem,
        collection: leftCollection,
        render: '.ui-transfer-left-ul',
        template: '<ul class="ui-transfer-left-ul"><div class="strControl">{{name}}</div></ul>'
      });
    },
    transferRight: function(model) {
      this._options.onChange.call(this, model);
    }
  });

  rightModel = BaseModel.extend({
    baseId: 'transferId'
  });

  rightCollection = BaseCollection.extend({
    model: rightModel
  });

  rightItem = BaseItem.extend({
    events: {
      'click .icon-up': '_moveUp',
      'click .icon-down': '_moveDown',
      'click .icon-x': 'transferLeft'
    },
    tagName: 'li',
    className: 'ui-transfer-right-li',
    transferLeft: function(e) {
      e.stopImmediatePropagation();
      app.getView(this._options.viewId).transferLeft(this.model.toJSON());
      this.model.destroy();
    }
  });

  rightList = BaseList.extend({
    initialize: function() {
      this._initialize({
        model: rightModel,
        collection: rightCollection,
        item: rightItem,
        render: '.ui-transfer-right-ul',
        template: '<ul class="ui-transfer-right-ul"><div class="rbody"><div class="strControl">{{name}}</div><div class="rUp iconfont icon-up"></div><div class="rDown iconfont icon-down"></div><div class="rClose iconfont icon-x"></div></div></ul> '
      });
    },
    transferLeft: function(model) {
      this._options.onChange.call(this, model);
    },
    afterRender: function() {
      this.sortable = Sortable.create(this.$('.ui-transfer-right-ul').get(0), {
        animation: 150,
        handle: '.ui-transfer-right-li',
        draggable: ".ui-transfer-right-li",
        onStart: function(evt) {},
        onEnd: this._bind(function(evt) {
          this._insertOrder(evt.oldIndex, evt.newIndex, function() {});
          this._options.onChange.call(this);
        })
      });
    },
    destroy: function() {
      if (this.sortable) this.sortable.destroy();
      this.sortable = null;
    }
  });

  Transfer = BaseView.extend({
    initialize: function() {
      this._initialize({
        template: template
      });
    },
    init: function() {
      this._options.text = this._options.text || 'text';
      this._options.value = this._options.value || 'value';
      this._options.fields = this._options.fields || ['text', 'value'];
    },
    beforeRender: function() {
      this.source = [];
      Est.each(this._options.source, function(model, index) {
        model['name'] = model[this._options.text];
        if (Est.findIndex(this._options.target, function(item) {
            return item[this._options.value] === model[this._options.value];
          }, this) === -1) {
          this.source.push(model);
        }
      }, this);
      this._options.source = this.source;
      Est.each(this._options.target, function(model) {
        model['name'] = model[this._options.text]
      }, this);
    },
    afterRender: function() {
      app.addRegion(this._options.viewId + 'leftList', leftList, {
        el: this.$('.ui-transfer-left'),
        items: this._options.source,
        onChange: this._bind(function(model) {
          app.getView(this._options.viewId + 'rightList')._push(new rightModel(model));
          this.onChange.call(this);
        })
      });
      app.addRegion(this._options.viewId + 'rightList', rightList, {
        el: this.$('.ui-transfer-right'),
        items: this._options.target,
        onChange: this._bind(function(model) {
          if (model) app.getView(this._options.viewId + 'leftList')._push(new leftModel(model));
          this.onChange.call(this);
        })
      });
    },
    onChange: function() {
      if (this._options.onChange)
        this._options.onChange.call(this, app.getView(this._options.viewId + 'rightList')._getItems({ fields: this._options.fields }));
    },
    destroy: function() {

    }
  });

  module.exports = Transfer;
});