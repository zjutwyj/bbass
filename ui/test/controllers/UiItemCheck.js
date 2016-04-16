/**
 * @description 模块功能说明
 * @class ModuleName
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiItemCheck', ['template/ui_item_check', 'ItemCheck', 'UiData'], function(require, exports, module) {
  var UiItemCheck, template, ItemCheck, UiData;

  template = require('template/ui_item_check');
  ItemCheck = require('ItemCheck');
  UiData = require('UiData');

  UiItemCheck = BaseView.extend({
    initialize: function() {
      this._initialize({
        template: template,
        modelBind: true
      });
    },
    afterRender: function() {
      this._region('itemCheckNormal', ItemCheck, {
        el: this.$('#ui-item-check-normal'),
        tpl: '<span>{{text}}</span>',
        cur: 'value_2',
        target: '#model-item_check_normal',
        path: 'value',
        items: UiData.item_check,
        onChange: Est.proxy(function(item) {
          if (this._view('itemCheckNormal')) {
            this.handleResult(this._view('itemCheckNormal')._getCheckedItems());
          }
        }, this),
        compare: function(item) { // 自定义比较器
          if (item.value === 'value_b') {
            return true;
          } else {
            return false;
          }
        },
        mouseEnter: function(model) {}
      });

      this._region('itemCheckBtn', ItemCheck, {
        el: this.$('#ui-item-check-btn'),
        tpl: '<span>{{text}}</span>',
        cur: 'value_2',
        target: '#model-item_check_btn',
        path: 'value',
        theme: 'ui-item-check-btn',
        items: UiData.item_check,
        onChange: Est.proxy(function(item) {
          if (this._view('itemCheckBtn')) {
            this.handleResult(this._view('itemCheckBtn')._getCheckedItems());
          }
        }, this)
      });
      this._region('itemCheckRadio', ItemCheck, {
        el: this.$('#ui-item-check-radio'),
        tpl: '<span>{{text}}</span>',
        cur: 'value_2',
        target: '#model-item_check_radio',
        path: 'value',
        theme: 'ui-item-check-radio',
        items: UiData.item_check,
        onChange: Est.proxy(function(item) {
          if (this._view('itemCheckRadio')) {
            this.handleResult(this._view('itemCheckRadio')._getCheckedItems());
          }
        }, this)
      });
      this._region('itemCheckAppend', ItemCheck, {
        el: this.$('#ui-item-check-append'),
        tpl: '<span>{{text}}</span>',
        cur: 'value_2',
        target: '#model-item_check_append',
        path: 'value',
        checkAppend: true,
        checkToggle: true,
        items: UiData.item_check,
        onChange: Est.proxy(function(item) {
          if (this._view('itemCheckAppend')) {
            this.handleResult(this._view('itemCheckAppend')._getCheckedItems());
          }
        }, this)
      });
      this._region('itemCheckCheckbox', ItemCheck, {
        el: this.$('#ui-item-check-checkbox'),
        target: '#model-item_check_checkbox',
        path: 'value',
        theme: 'ui-item-check-checkbox',
        checkAppend: true,
        checkToggle: true,
        items: UiData.item_check,
        onChange: Est.proxy(function(item) {
          if (this._view('itemCheckCheckbox')) {
            this.handleResult(this._view('itemCheckCheckbox')._getCheckedItems());
          }
        }, this)
      });
    },
    onWatch: function() {
      this._watch(['item_check_normal', '#model-item_check_btn', '#model-item_check_radio',
        '#model-item_check_append', '#model-item_check_checkbox'
      ], '', function(name) {
        if (name === 'item_check_normal') {
          this._view('itemCheckNormal').setValue(this._get('item_check_normal'));
        } else if (name === 'item_check_btn') {
          this._view('itemCheckBtn').setValue(this._get('item_check_btn'));
        } else if (name === 'item_check_radio') {
          this._view('itemCheckRadio').setValue(this._get('item_check_radio'));
        } else if (name === 'item_check_append') {
          this._view('itemCheckAppend').setValue(this._get('item_check_append'));
        } else if (name === 'item_check_checkbox') {
          this._view('itemCheckCheckbox').setValue(this._get('item_check_checkbox'));
        }
      });
      this._watch(['itemCheckResult'], '.ui-item-check-result');
    },
    handleResult: function(list) {
      var result = '';
      Est.each(list, function(item) {
        var _item = Est.cloneDeep(item.attributes);
        delete _item._options;
        result += ('<div>' + JSON.stringify(_item) + '</div>');
      });
      this.model.set('itemCheckResult', result);
    }
  });

  module.exports = UiItemCheck;
});
