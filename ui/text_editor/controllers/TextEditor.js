/**
 * @description 模块功能说明
 * @class TextEditor
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('TextEditor', ['Ueditor'], function(require, exports, module) {
  var TextEditor, Ueditor;

  Ueditor = require('Ueditor');

  TextEditor = BaseView.extend({
    initialize: function() {
      this._initialize({
        template: '<div id="{{editId}}"></div>'
      });
    },
    beforeRender: function() {
      this.model.set('editId', 'text-editor-cont' + new Date().getTime());
      if (!app.getData('textEditorIds')) app.addData('textEditorIds', []);
    },
    afterRender: function() {
      var ctx = this;
      var startActionList = [];
      var editorId = this.model.get('editId');
      window.UEDITOR_CONFIG.toolbars = [CONST.UEDITOR_MIN];

      if (this.model.get('type') === 'organize') {
        window.UEDITOR_CONFIG.toolbars = [CONST.UEDITOR_MIN
          .concat(["|", "insertdesigntitle", "insertdesignmobile", "insertdesignname"])
        ];
      }
      try {
        Est.each(app.getData('textEditorIds'), function(id) {
          UE.getEditor(id).destroy();
        });
      } catch (e) {}
      app.addData('textEditorIds', []);
      app.getData('textEditorIds').push(editorId);
      var editor = UE.getEditor(editorId);
      editor.addListener('ready', function() {
        editor.blur();

        if (!Est.isEmpty(ctx.model.get('text'))) {
          startActionList = [
            { type: 'text', content: ctx.model.get('text') }
          ];
          editor.setContent(ctx.model.get('text'));
          editor.execCommand('selectall');
        }
        if (ctx._options.height) {
          editor.setHeight(ctx._options.height);
        } else {
          editor.setHeight(200);
        }
        UE.getEditor(editorId).addListener('fontplus', function() {
          var fontSize = parseFloat(UE.getEditor(editorId).queryCommandValue('fontsize'));
          UE.getEditor(editorId).execCommand('fontsize', (fontSize + 1) + 'px');
        });
        UE.getEditor(editorId).addListener('fontminus', function() {
          var fontSize = parseFloat(UE.getEditor(editorId).queryCommandValue('fontsize'));
          if (fontSize <= 10) return;
          UE.getEditor(editorId).execCommand('fontsize', (fontSize - 1) + 'px');
        });
        UE.getEditor(editorId).addListener('lineheightplus', function() {
          var lineHeight = parseFloat(UE.getEditor(editorId).queryCommandValue('lineheight'));
          if (lineHeight > 5) lineHeight = 1;
          UE.getEditor(editorId).execCommand('lineheight', lineHeight + 0.25);
        });
        UE.getEditor(editorId).addListener('lineheightminus', function() {
          var lineHeight = parseFloat(UE.getEditor(editorId).queryCommandValue('lineheight'));
          if (lineHeight > 5) lineHeight = 1;
          if (lineHeight <= 0.25) return;
          UE.getEditor(editorId).execCommand('lineheight', lineHeight - 0.25);
        });
        if (ctx.model.get('type') === 'organize') {
          UE.getEditor(editorId).addListener('insertdesigntitle', function() {
            UE.getEditor(editorId).execCommand('insertHtml', "#{组织名称}");
          });
          UE.getEditor(editorId).addListener('insertdesignmobile', function() {
            UE.getEditor(editorId).execCommand('insertHtml', "#{手机号码}");
          });
          UE.getEditor(editorId).addListener('insertdesignname', function() {
            UE.getEditor(editorId).execCommand('insertHtml', "#{个人姓名}");
          });
        }
        if (!window.eduiToolTip) {
          window.eduiToolTip = $('<div class="edui-tooltip" unselectable="on" onmousedown="return false" style="z-index: 1000; display: none; top: 22px; left: -11.5px;"><div class="edui-tooltip-arrow" unselectable="on" onmousedown="return false"></div><div class="edui-tooltip-inner" unselectable="on" onmousedown="return false">字体颜色</div></div>');
          $('body').append(window.eduiToolTip);
        }
        ctx._initToolTip(ctx.$el, '.edui-default');
      });
      UE.getEditor(editorId).addListener('contentChange', Est.throttle(function() {
        ctx._options.onChange && ctx._options.onChange.call(ctx, UE.getEditor(editorId).getContent());
      }, 20, 100000000, this));

      function myEditor_paste(o, html) {
        try {
          /* html.html = html.html.replace(/<\/?[^>]*>/g, '');
           html.html = html.html.replace(/[ | ]*\n/g, '');
           html.html = html.html.replace(/&nbsp;/ig, '');*/

        } catch (e) {
          debug('Error:91 at TextEditor:' + e);
        }

        /*

         var re = new RegExp("font-size:\\s*(\\d*(?:\\.\\d*)?)(px|em);", "img");
         var result = "",
         str = '';

         while (result = re.exec(html.html)) {
         str = result[0];
         html.html = html.html.replace(str, 'font-size:1em;');
         }
         */

      }
    },
    setValue: function(text){
        UE.getEditor(this.model.get('editId')).setContent(text);
    },
    destroy: function(){

    }
  });

  module.exports = TextEditor;
});
