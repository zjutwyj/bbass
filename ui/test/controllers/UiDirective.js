'use-strict';
/**
 * @description 模块功能说明
 * @class UiVue
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiDirective', ['Tab'], function (require, exports, module) {
  var UiDirective, template,Tab;

  Tab = require('Tab');
  template = `<div class="theme-black">
  <input type="button" value="change" bb-click="changeValue"/>
  <div class="sort-type left" bb-select="{viewId: 'getViewId',cur: 'args.sortType', items: 'xxxItems',onChange: 'change1'}"></div>
  <div class="radio-type left" bb-radio="{viewId: 'getViewId1',cur: 'args.radioType', items: 'xxxItems',onChange: 'change2'}"></div>
  <br>
  <br>
  <br>
  <input id="model-normal" type="text" class="text clear" value="" style="margin-bottom:5px;">
  <div bb-date="{viewId: 'getViewId',cur: 'args.date',target:'#model-normal',label:'开始时间'}"></div><input type="button" value="ClearDate">
  <span bb-click="formatDate">设置成时间2013-01-01</span>
  <br>
  <br>
  <br>
  <input id="fileUpload" type="button" style="height:30px;" value="打开图片上传对话框" bb-image="{cur:'serverPath',onChange: 'change3'}"/>
  <br>
  <img src="{{PIC serverPath 120}}">
  </div>`;


  UiDirective = BaseView.extend({
    initialize: function () {
      this._super({
        template: template
      });
    },
    init() {
      return {
        'args.sortType': 'a',
        'args.radioType': 'b',
        'args.date': '2016-05-09',
        'serverPath': '',
        'xxxItems' : [
          {text: 'aaa', value: 'a'},
          {text: 'bbb', value: 'b'}
        ],
        'radioItems' : [
          {text: 'aaa', value: 'a'},
          {text: 'bbb', value: 'b'}
        ]
      };
    },
    formatDate(){
      this._set('args.date', '2013-01-01');
    },
    changeValue(){
      this._set('args.sortType', this._get('args.sortType') === 'a'?'b': 'a');
      this._set('args.radioType', this._get('args.radioType') === 'a'?'b': 'a');
    },
    getViewId(){
      return this.cid + 'selectType';
    },
    getViewId1(){
      return this.cid + 'selectType1';
    },
    change1(item, init, a, b){
      console.log(item);
    },
    change2(item, init, a, b){
      console.log(item);
    },
    change3(result){
      this._set(object.cur, result[0].serverPath);
    },
    afterRender: function () {

    }
  });

  module.exports = UiDirective;
});
