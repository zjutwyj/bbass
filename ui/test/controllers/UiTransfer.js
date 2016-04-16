/**
 * @description 模块功能说明
 * @class UiTransfer
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiTransfer', ['template/ui_transfer', 'Transfer'], function(require, exports, module) {
  var UiTransfer, template, Transfer;

  template = require('template/ui_transfer');
  Transfer = require('Transfer');

  UiTransfer = BaseView.extend({
    initialize: function() {
      this._initialize({
        template: template
      });
    },
    afterRender: function() {
      app.addRegion('transfer', Transfer, {
        el: this.$('.transfer-normal'),
        text: 'name',
        value: 'id',
        source: [
          { name: 'aaa', id: '1' },
          { name: 'bbb', id: '2' },
          { name: 'ccc', id: '3' },
          { name: 'ddd', id: '4' },
          { name: 'eee', id: '5' },
          { name: 'fff', id: '6' },
          { name: 'ggg', id: '7' },
          { name: 'hhh', id: '8' },
          { name: 'iii', id: '9' },
          { name: 'jjj', id: '10' },
          { name: 'kkk', id: '11' },
          { name: 'lll', id: '12' },
          { name: 'mmm', id: '13' },
          { name: 'nnn', id: '14' },
          { name: 'ooo', id: '15' },
          { name: 'ppp', id: '16' },
          { name: 'qqq', id: '17' },
          { name: 'rrr', id: '18' }
        ],
        fields: ['id'],
        target: [
          { name: 'ccc', id: '3' },
          { name: 'ddd', id: '4' }
        ],
        onChange: this._bind(function(list) {
          console.log(JSON.stringify(list));
        })
      });
    }
  });

  module.exports = UiTransfer;
});
