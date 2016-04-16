/**
 * @description UiListMore
 * @class UiListMore
 * @author yongjin<zjut_wyj@163.com> 2015/12/29
 */
define('UiListMore', ['template/ui_list_more', 'Tab', 'UiData'], function(require, exports, module) {
  var UiListMore, template, Tab, model, collection, item, UiData;

  template = require('template/ui_list_more');
  UiData = require('UiData');
  Tab = require('Tab');

  model = BaseModel.extend({
    defaults: Est.extend({

    }, BaseModel.prototype.defaults),
    baseId: 'wcdId',
    baseUrl: CONST.API + '/wcd/detail'
  });

  collection = BaseCollection.extend({
    model: model
  });

  item = BaseItem.extend({
    tagName: 'li',
    className: 'tab-box-shadow animation-zoom',
    events: {
      'click .delete': '_del',
      'mouseenter .image': 'hideQrCode',
      'mouseenter .erweima': 'showQrCode',
      'mouseout .erweima': 'hideQrCode',
      'click .copy': 'copyWcd',
      'click .send': 'sendWcd',

      'click .message': 'message',
      'click .data': 'data'
    },
    initialize: function() {
      this._initialize({
        toolTip: true,
        beforeRender: this.beforeRender
      });
    },
    beforeRender: function(model) {
      if (model.get('mviews') == undefined) model.set('mviews', '0');
      this.model.attributes.sharepic = this.model.attributes.sharepic == undefined ? 'http://wcd.jihui88.com/leaflet/images/nopic.png' : this.model.attributes.sharepic;
    },
    showQrCode: function() {
      this.showQr = true;
      if (!this.$qrCode) {
        this.img = 'http://wcd.jihui88.com/rest/comm/qrbar/create?w=250&text=http://www.jihui88.com/wcd/html/' + this.model.get('wcdId') + '.html?v=40';
        this.$qrCode = $('<div class="qr-code" style="display:none;"></div>');
        this.$qrImg = $('<img style="width: 100%;" src="' + this.img + '"/>');
        this.$('.image').append(this.$qrCode.append(this.$qrImg));
        var img = new Image();
        img.src = this.img;
        img.onload = Est.proxy(function() {
          this.showQr && this.$qrCode.fadeIn('fast');
        }, this);
      } else {
        this.$qrCode.fadeIn('fast');
      }
    },
    hideQrCode: function(e) {
      this.showQr = false;
      this.$qrCode && this.$qrCode.hide();
    },
    copyWcd: function() {
      var ctx = this;
      $.ajax({
        url: CONST.API + '/wcd/copy/' + this.model.get('wcdId'),
        type: 'post',
        async: false,
        success: function(response) {
          ctx._navigate('#/design_center/' + response.attributes.id);
        }
      });
    },
    sendWcd: function() {
      var ctx = this;
      BaseUtils.confirm({
        title: '请输入对方帐号',
        content: '<input id="username-input" type="text" style="width: 151px; height: 32px; line-height: 32px; border: 1px solid #dfdfdf; color: #676767; text-indent: 5px;"/>',
        async: false,
        success: function() {
          $.ajax({
            url: CONST.API + '/wcd/send/' + ctx.model.get('wcdId') + '?username=' + $('#username-input').val(),
            type: 'post',
            async: false,
            success: function(response) {
              if (!response.success) {
                BaseUtils.tip(response.msg, {});
                return;
              }
              app.removeCache();
              BaseUtils.tip('转送成功', {});
              app.getView(ctx._options.viewId)._reload();
            }
          });
        }
      });
    },
    message: function() {
      this._require(['CustomerMessage'], function(CustomerMessage) {
        app.addRegion('main', CustomerMessage, {
          el: '#leaflet-main',
          data: {
            id: this.model.get('id'),
            views: this.model.get('views'),
            name: this.model.get('seoTitle')
          }
        });
      });
    },
    data: function() {
      this._require(['DataCenter'], function(DataCenter) {
        app.addRegion('main', DataCenter, {
          el: '#leaflet-main',
          data: {
            id: this.model.get('id'),
            name: this.model.get('seoTitle')
          }
        });
      });
    }
  });

  UiListMore = BaseList.extend({
    events: {
      'focus .wdm_input': 'searchFocus',
      'blur .wdm_input': 'searchBlur',
      'click .wrap-load-more': 'loadMore',
      'click .search-submit': 'search'
    },
    initialize: function() {
      this._initialize({
        model: model,
        collection: collection,
        item: item,
        pageSize: 5,
        modelBind: true,
        append: true,
        render: '.case-list',
        template: template,
        pagination: true,
        items: Est.cloneDeep(UiData.list_more)
      });
    },
    afterRender: function() {
      this.$('.no-result').hide();
      if (this.collection.paginationModel.get('totalPage') === 0 ||
        this.collection.paginationModel.get('page') === this.collection.paginationModel.get('totalPage')) {
        this.$('.wrap-load-more').hide();
      } else {
        this.$('.wrap-load-more').show();
      }
    },
    searchFocus: function(e) {
      this.$('.wdm_search').animate({ "width": '190' }, 300);
      this._getEventTarget(e).width(140);
    },
    searchBlur: function(e) {
      this.$('.wdm_search').animate({ "width": '150' }, 300);
      this._getEventTarget(e).width(120);
    },
    loadMore: function() {
      this.collection.paginationModel.set('page', this.collection.paginationModel.get('page') + 1);
      this._load();
    },
    search: function() {
      this.collection.paginationModel.set('name', this.model.get('searchkey'));
      this.collection.paginationModel.set('page', 1);
      this._reload();
    }
  });

  module.exports = UiListMore;
});
