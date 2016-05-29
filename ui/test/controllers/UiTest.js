/**
 * @description 模块功能说明
 * @class ModuleName
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiTest', ['template/ui_test', 'Tab'], function(require, exports, module) {
  var UiTest, template, Tab;

  template = require('template/ui_test');
  Tab = require('Tab');

  UiTest = BaseView.extend({
    initialize: function() {
      this._initialize({
        template: template,
        afterRender: this.afterRender
      });
    },
    afterRender: function() {
      var items = [
        { text: 'directive', moduleId: 'UiDirective', oneRender: false },
        { text: 'bbass+vue', moduleId: 'UiVue', oneRender: false },
        { text: 'TodoMvc', moduleId: 'UiTodoMvc', oneRender: false },
        { text: 'Diff测试', moduleId: 'UiDiff', oneRender: false },
        { text: '分页列表', moduleId: 'UiList', oneRender: false },
        { text: '更多列表', moduleId: 'UiListMore', oneRender: false },
        { text: '树型列表', moduleId: 'UiListTree', oneRender: false },
        { text: '树型组件', moduleId: 'UiTree', oneRender: false },
        { text: '对话框组件', moduleId: 'UiDialog', oneRender: false },
        { text: '下拉框', moduleId: 'UiDropDown', oneRender: false },
        { text: '下拉菜单', moduleId: 'UiSelect', oneRender: false },
        { text: '单选多选', moduleId: 'UiItemCheck', oneRender: false },
        { text: '滑块组件', moduleId: 'UiSlider', oneRender: false },
        { text: '选项切换', moduleId: 'UiTab', oneRender: false },
        { text: '时间选择器', moduleId: 'UiDatePicker', oneRender: false },
        { text: '颜色选择器', moduleId: 'UiColorPicker', oneRender: false },
        { text: '上传图片', moduleId: 'UiPhotoPicker', oneRender: false },
        { text: '编辑器', moduleId: 'UiTextEditor', oneRender: false },
        { text: '穿梭框', moduleId: 'UiTransfer', oneRender: false }
      ];
      app.addRegion('testNav', Tab, {
        tpl: '<a href="javascript:;" class="tool-tip" data-title="{{text}}">{{text}}</a>', // 模版
        el: this.$('#test-nav'), // 插入点
        cur: 'UiDirective', // 显示当前项内容
        theme: 'tab-ul-line', // 样式：目前有tab-ul-normal,tab-ul-text,tab-ul-btn,tab-ul-line
        path: 'moduleId', // 作用域字段
        toolTip: true,
        items: items
      });
      window.$footer = window.$footer || $('#mobile-foot');
      window.$footer.hide();
      //this.jasmine();
    },
    jasmine: function() {
      describe('BaseApp', function() {
        beforeEach(function() {
          this.Test = BaseView.extend({
            initialize: function() {
              this._initialize({
                template: '<div style="display:block;">test</div>'
              });
            },
            getInfo: function() {
              return 'success';
            }
          });
        });

        it("region", function() {
          app.addRegion('Test', this.Test, {
            el: '#mobile-foot'
          });
          expect('success').toEqual(app.getView('Test').getInfo());
          expect(1).toEqual($('[data-view=Test]').size());
          expect('Test').toEqual(app.getCurrentView());
        });

        it('panel', function() {
          app.removePanel('Test');
          expect(0).toEqual($('[data-view=Test]').size());
        });

        it('dialog', function() {
          app.addDialog('dialog', 'Test');
          expect('dialog').toEqual(app.getDialog('Test'));
          expect('dialog').toEqual(app.getCurrentDialog());
          app.emptyDialog();
          expect(undefined).toEqual(app.getDialog('Test'));
          expect(null).toEqual(app.getCurrentDialog());
          expect(0).toEqual(app.getDialogs().length);
        });

        it('session', function() {
          app.addSession('aaa', 'bbb');
          expect(app.getSession('aaa')).toBe('bbb');
        });

        it('status', function() {
          app.addStatus('status1', 'aaa');
          app.addStatus('status2', 'bbb');
          expect(app.getStatus('status1')).toBe('aaa');
        });

        it('option', function() {
          app.addOption('optinos', { name: 'aaa' });
          expect(app.getOption('optinos')).not.toBe({ name: 'aaa' });
        });

        it('cache', function() {
          app.addCache('productList', { success: true, data: { name: 'aaa', value: 'bbb' } });
          expect(app.getCache('productList')).toEqual({ success: true, data: { name: 'aaa', value: 'bbb' } });
          app.removeCache('productList');
          expect(app.getCache('productList')).toBeUndefined();
        });

        it('cookie', function() {
          app.addCookie('productList', [{ name: 'name', value: 'value' }]);
          expect(app.getCookies('productList')).toEqual(['headNav_page', 'headNav_pageSize', 'testNav_page', 'testNav_pageSize', 'productList']);
        });
      });

      describe('BaseModel', function() {
        beforeEach(function() {
          this.BaseModel = BaseModel.extend({
            baseId: 'productId',
            baseUrl: '/rest/api',
            defaults: Est.extend({}, BaseModel.prototype.defaults)
          });
        });

      });


      describe('BaseCollection', function() {
        beforeEach(function() {
          this.BaseCollection = BaseCollection.extend({
            url: '/api/rest/product/list'
          });
        });

      });

      describe('BaseItem', function() {
        beforeEach(function() {
          this.BaseItem = BaseItem.extend({
            tabName: 'div',
            className: 'div-inner'
          });
        });

      });


      describe('BaseList', function() {
        beforeEach(function() {
          this.BaseList = BaseList.extend({
            initialize: function() {
              this._initialize({
                model: this.BaseModel,
                collection: this.BaseCollection,
                item: this.BaseItem
              });
            }
          });
        });

      });

      describe('BaseView', function() {
        beforeEach(function() {
          this.BaseView = BaseView.extend({
            afterRender: function() {

            }
          });
        });

      });
      describe('BaseDetail', function() {
        beforeEach(function() {
          this.BaseDetail = BaseDetail.extend({
            afterRender: function() {

            }
          });
        });

      });
    }
  });



  module.exports = UiTest;
});
