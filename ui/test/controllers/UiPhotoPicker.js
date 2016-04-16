/**
 * @description 模块功能说明
 * @class ModuleName
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiPhotoPicker', ['template/ui_photo_picker'], function(require, exports, module){
  var UiPhotoPicker, template;

  template = require('template/ui_photo_picker');

  UiPhotoPicker = BaseView.extend({
     events: {
        'click #fileUpload': 'openFileDialog'
      },
    initialize: function(){
      this._initialize({
        template: template
      });
    },
    openFileDialog: function(){
      this._dialog({
        moduleId: 'PhotoComponent',
        width: 876,
        cover: true,
        height: 542,
        quickClose: true,
        onChange: Est.proxy(function(result) {
          this._setValue('serverPath', result[0].serverPath);
        }, this)
      });
    }
  });

  module.exports = UiPhotoPicker;
});