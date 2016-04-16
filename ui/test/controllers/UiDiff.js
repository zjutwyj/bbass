/**
 * @description 模块功能说明
 * @class UiDiff
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiDiff', ['template/ui_diff'], function(require, exports, module) {
  var UiDiff, template, jasmine;

  template = require('template/ui_diff');

  UiDiff = BaseView.extend({
    initialize: function() {
      this._initialize({
        template: template
      });
    },
    init: function() {
      return {
        'color': '#999',
        'args.color': '#999',
        'color1': '#999',
        'args.color1': '#999',
        'tab': '00'
      };
    },
    submit1: function() {
      this._set({ "color": '#999', "args.color": '#999' });
      console.log(this._get('args.color'));
    },
    submit2: function() {
      this._set({ 'color': '#ff5241', 'args.color': '#ff5241' });
    },
    submit3: function() {
      this._set({ 'color1': '#999', 'args.color1': '#999' });
    },
    submit4: function() {
      this._set({ 'color1': '#ff5241', 'args.color1': '#ff5241' });
    },
    submit5: function() {
      this._reset({ color: "red", args: { color: "blue", color1: "yellow" }, color1: '#999' });
    },
    tab1: function(){
      this._set('tab', '00');
    },
    tab2: function(){
      this._set('tab', '01');
    },
    handleChange: function(name) {
      console.log(name);
    },
    handleChange1: function(name) {
      console.log('bb-model:change', name);
    }
  });

  module.exports = UiDiff;
});
