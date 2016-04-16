/**
 * @description 模块功能说明
 * @class UiTextEditor
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiTextEditor', ['template/ui_text_editor', 'TextEditor'], function(require, exports, module) {
  var UiTextEditor, template, TextEditor;

  template = require('template/ui_text_editor');
  TextEditor = require('TextEditor');

  UiTextEditor = BaseView.extend({
    initialize: function() {
      this._initialize({
        template: template
      });
    },
    afterRender: function() {
      app.addRegion('textEditor', TextEditor, {
        el: this.$('.text-editor-wrap'),
        data: {
          text: 'ssss'
        }
      });
    }
  });

  module.exports = UiTextEditor;
});
