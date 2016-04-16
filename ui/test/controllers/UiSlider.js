/**
 * @description 模块功能说明
 * @class UiSlider
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiSlider', ['template/ui_slider', 'Slider'], function(require, exports, module) {
  var UiSlider, template, Slider;

  template = require('template/ui_slider');
  Slider = require('Slider');

  UiSlider = BaseView.extend({
    initialize: function() {
      this._initialize({
        modelBind: true,
        template: template
      });
    },
    init: function() {
      this._setDefault('value', '10');
    },
    handleSlider: function(){
      app.getView('sliderNormal').setValue(this._getValue('value'));
    },
    afterRender: function() {
      app.addRegion('sliderNormal', Slider, {
        el: this.$('.normal'),
        start: [10],
        step: 1,
        onUpdate: Est.proxy(function(values, handle) {
          this._setValue('value', parseInt(values[0]));
        }, this),
        onChange: Est.proxy(function(values, handle) {
          this._setValue('value', parseInt(values[0]));
        }, this)
      });
    }
  });

  module.exports = UiSlider;
});
