/**
 * @description HandlebarsHelper模板引擎帮助类
 * @class HandlebarsHelper - 标签库
 * @author yongjin on 2014/11/11
 */

/**
 * 比较(新版将弃用)
 * @method [判断] - compare
 * @author wyj 2014-03-27
 * @example
 *      {{#compare ../page '!==' this}}danaiPageNum{{else}}active{{/compare}}
 */
Handlebars.registerHelper('compare', function(v1, operator, v2, options) {
  if (arguments.length < 3)
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
  try {
    switch (operator.toString()) {
      case '==':
        return (v1 == v2) ? options.fn(this) :
          options.inverse(this);
      case '!=':
        return (v1 != v2) ? options.fn(this) :
          options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) :
          options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) :
          options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) :
          options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) :
          options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) :
          options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) :
          options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) :
          options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) :
          options.inverse(this);
      case 'indexOf':
        return (v1.indexOf(v2) > -1) ? options.fn(this) :
          options.inverse(this);
      default:
        return options.inverse(this);
    }
  } catch (e) {
    console.log('Errow: hbs.compare v1=' + v1 + ';v2=' + v2 + e);
  }
});


/**
 * 分页
 * @method [分页] - pagination
 * @author wyj 2014-03-27
 * @example
 *        {{#pagination page totalPage}}
 <li class="bui-bar-item bui-button-number bui-inline-block {{#compare ../page this operator='!=='}}danaiPageNum
 {{else}}active{{/compare}}" data-page="{{this}}" aria-disabled="false" id="{{this}}" aria-pressed="false">
 <a href="javascript:;">{{this}}</a></li>
 {{/pagination}}
 */
Handlebars.registerHelper('pagination', function(page, totalPage, sum, block) {
  var accum = '',
    block = block,
    sum = sum;
  if (arguments.length === 3) {
    block = sum;
    sum = 9;
  }
  var pages = Est.getPaginationNumber(page, totalPage, sum);
  for (var i = 0, len = pages.length; i < len; i++) {
    accum += block.fn(pages[i]);
  }
  return accum;
});

/**
 * 根据path获取值
 * @method get
 * @author wyj 15.2.1
 * @example
 *      Handlebars.helpers["get"].apply(this, date)
 */
Handlebars.registerHelper('get', function(path, options) {
  if (typeof path !== 'undefined' && Est.typeOf(path) === 'string') {
    var list = path.split('.');
    if (list[0] in this) {
      if (list.length > 1) {
        if (Est.typeOf(this[list[0]]) !== 'object') {
          this[list[0]] = JSON.parse(this[list[0]]);
        }
        return Est.getValue(this, path);
      } else {
        return this[list[0]];
      }
    }
  } else {
    return path;
  }
});


/**
 * 时间格式化
 * @method [时间] - dateFormat
 * @author wyj 2014-03-27
 * @example
 *      {{dateFormat $.detail_news.add_time $.lan.news.format}}
 */
Handlebars.registerHelper('dateFormat', function(date, fmt, options) {
  return Est.dateFormat(date, fmt);
});

/**
 * 判断字符串是否包含
 * @method [判断] - contains
 * @author wyj 14.11.17
 * @example
 *      {{#contains ../element this}}checked="checked"{{/contains}}
 */
Handlebars.registerHelper('contains', function(target, thisVal, options) {
  if (Est.isEmpty(target)) return;
  return Est.contains(target, thisVal) ? options.fn(this) : options.inverse(this);
});

/**
 * 两数相加
 * @method [运算] - plus
 * @author wyj 2014-03-27
 * @example
 *      {{plus 1 2}} => 3
 */
Handlebars.registerHelper('plus', function(num1, num2, opts) {
  return parseInt(num1, 10) + parseInt(num2, 10);
});
/**
 * 两数相减
 * @method [运算] - minus
 * @author wyj 2014-03-27
 * @example
 *        {{minus 10 5}} => 5
 */
Handlebars.registerHelper('minus', function(num1, num2, opts) {
  return (parseInt(num1, 10) - parseInt(num2, 10)) + '';
});

/**
 * 字符串截取
 * @method [字符串] - cutByte
 * @author wyj 2014-03-27
 * @example
 *      {{cutByte name 5 end='...'}}
 */
Handlebars.registerHelper('cutByte', function(str, len, options) {
  return Est.cutByte(str, len, options.hash.end || '...');
});

/**
 * 复杂条件(新版将弃用)
 * @method [判断] - xif
 * @author wyj 14.12.31
 * @example
 *       return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
 *
 */
Handlebars.registerHelper("x", function(expression, options) {
  var fn = function() {},
    result;
  try {
    fn = Function.apply(this, ['window', 'return ' + expression + ';']);
  } catch (e) {
    console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
  }
  try {
    result = fn.bind(this)(window);
  } catch (e) {
    console.warn('[warning] {{x ' + expression + '}} runtime error', e);
  }
  return result;
});

/**
 * xif条件表达式(新版将弃用)
 * @method [判断] - xif
 * @author wyj 15.2.2
 * @example
 *    {{#xif "this.orderStatus != 'completed' && this.orderStatus != 'invalid' && this.paymentStatus == 'unpaid' &&
              this.shippingStatus == 'unshipped'"}}disabled{{/xif}}
 */
Handlebars.registerHelper("xif", function(expression, options) {
  return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});

/**
 * if判断
 * @method If
 * @param  {[type]} expression [description]
 * @param  {[type]} options)   {             return Est.compile(expression, this) ? options.fn(this) : options.inverse(this);} [description]
 * @return {[type]}            [description]
 */
Handlebars.registerHelper('If', function(expression, options) {
  return Est.compile('{{' + expression.replace(/_quote_/img, "'") + '}}', this) === 'true' ? options.fn(this) : options.inverse(this);
});

/**
 * 返回整数
 * @method [数字] - parseInt
 * @author wxw 2014-12-16
 * @example
 *      {{parseInt 01}}
 */
Handlebars.registerHelper('parseInt', function(result, options) {
  return parseInt(result, 10);
});

/**
 * 缩略ID值
 * @method id2
 * @author wyj
 */
Handlebars.registerHelper('id2', function(id) {
  return id == null ? "" : id.replace(/^[^1-9]+/, "")
});

/**
 * 返回全局常量
 * @method [常量] - CONST
 * @author wyj 14.12.17
 * @example
 *        {{CONST 'HOST'}}
 */
Handlebars.registerHelper('CONST', function(name, options) {
  return Est.getValue(CONST, name);
});
/**
 * 图片尺寸 （返回不带图片域名的地址）
 * @method [图片] - picUrl
 * @author wyj 2014-03-31
 * @example
 *      <img src="{{CONST 'PIC_URL'}}/{{picUrl picPath 6}}" width="52" height="52">
 */
Handlebars.registerHelper('picUrl', function(src, number, opts) {
  var url = src;
  if (arguments.length < 3) return src || CONST.PIC_NONE;
  if (src == null || src.length == 0) return CONST.PIC_NONE;
  if (number > 10) {
    url = url + '!' + number
  } else {
    var url2 = url.substring(url.lastIndexOf(".") + 1, url.length);
    url = url.substring(0, url.lastIndexOf(".")) + "_" + number + "." + url2;
  }

  return url ? url : '';
});
Handlebars.registerHelper('_picUrl', function(src, number, opts) {
  return CONST.PIC_URL + '/' + Handlebars.helpers['picUrl'].apply(this, [src, number, opts]);
});

/**
 * 返回图片地址常量（返回添加图片域名的图片地址, 推荐使用）
 * @method [常量] - PIC
 * @author wyj 14.12.17
 * @example
 *        {{PIC pic}}   ==> http://img.jihui88.com/upload/a/a1/picture/2015/12/20/pic.jpg?v=2015-12-20_12:30
 *        {{PIC pic 5}} ==> http://img.jihui88.com/upload/a/a1/picture/2015/12/20/pic_5.jpg?v=2015-12-20_12:30
 */
Handlebars.registerHelper('PIC', function(name, number, options) {
  var version = '';
  var options = options;
  var def = CONST.PIC_NONE;
  if (arguments.length < 3) {
    options = number;
  }
  if (options && options.hash.default) {
    def = options.hash.default;
  }
  if (name) {
    version += (name.indexOf('?') > -1 ? ('&v=' + Est.hash(CONST.APP_VERSION)) :
      '?v=' + Est.hash(CONST.APP_VERSION));
    if (Est.startsWidth(name, 'CONST')) {
      name = Handlebars.helpers['CONST'].apply(this, [name.replace('CONST.', ''), options]);
    }
  }
  if (!name || !/[^\s]+\.(?:jpe?g|gif|png|bmp)/i.test(name)) return CONST.DOMAIN + def + version;
  if (Est.startsWidth(name, 'http') && name.indexOf('upload') > -1) {
    name = name.substring(name.indexOf('upload'), name.length);
  }
  if (Est.startsWidth(name, 'upload')) {
    return arguments.length < 3 ? CONST.PIC_URL + '/' + name + version :
      Handlebars.helpers['_picUrl'].apply(this, [name, number, options]) + version;
  }

  return Est.startsWidth(name, 'http') ? name + version : CONST.DOMAIN + name + version;
});

/**
 * 判断是否为空
 * @method [判断] - isEmpty
 * @author wyj 14.12.27
 * @example
 *      {{#isEmpty image}}<img src='...'></img>{{/isEmpty}}
 */
Handlebars.registerHelper('isEmpty', function(value, options) {
  return Est.isEmpty(value) ? options.fn(this) :
    options.inverse(this);
});

/**
 * 编译url
 * @method [url] - encodeUrl
 * @author wyj 15.2.1
 * @example
 *      {{encodeUrl url}}
 */
Handlebars.registerHelper('encodeUrl', function(val, options) {
  return encodeURIComponent(val);
});

/**
 * 解析JSON字符串
 * @method [JSON] - json
 * @example
 *      {{json 'invite.title'}}
 */
Handlebars.registerHelper('json', function(path, options) {
  return Handlebars.helpers["get"].call(this, path);
});
/**
 * 打版本号
 * @method [版本] - version
 * @example
 *      http://www.jihui88.com?v={{version}}
 */
Handlebars.registerHelper('version', function(type, options) {
  switch (type) {
    case 'time':
      return new Date().getTime();
      break;
    case 'hash':
      return Est.hash(new Date().getTime());
      break;
    default:
      return Est.hash(new Date().getTime());
  }
});

/**
 * 移除script标签
 * @method [标签] - stripScripts
 * @author wyj 15.5.12
 * @example
 *    {{stripScripts '<scripts></scripts>'}}
 */
Handlebars.registerHelper('stripScripts', function(str, options) {
  return Est.stripScripts(str);
});

/**
 * 替换
 * @method [字符串] - replace
 * @author wyj 15.5.12
 * @example
 *    {{replace module.type '\d*$' ''}}
 */
Handlebars.registerHelper('replace', function(val1, reg, val2, options) {
  if (Est.isEmpty(val1)) {
    return val1
  }
  return val1.replace(new RegExp(reg, 'img'), val2);
});

/**
 * 默认值
 * @method [字符串] - default
 * @author wyj 15.5.12
 * @example
 *    {{default module.type 'aa'}}
 */
Handlebars.registerHelper('default', function(val1, val2, options) {
  return Est.isEmpty(val1) ? val2 : val1;
});

/**
 * 映射
 * @method [字符串] - keyMap
 * @author wyj 15.5.12
 * @example
 *    {{keyMap module.type 'aa'}}
 */
Handlebars.registerHelper('keyMap', function(val1, val2, options) {
  if (!val1 || !val2) return '';
  return val2[val1];
});

/**
 * 管道过滤
 *
 * @method [字符串] - pipe
 * @author wyj 15.5.12
 * @example
 *    {{pipe 'Math.floor(age);age+1;plus(age, 1);plus(age, age);'}}
 */
Handlebars.registerHelper('pipe', function(expression) {
  var result,
    preName = null,
    preType = 'string',
    bracketRe = /\(([^:\$]*)\)/img,
    obj = Est.cloneDeep(this),
    list = expression.split(';');

  Est.each(list, function(pipe, index) {
    pipe = Est.trim(pipe);
    if (Est.isEmpty(pipe)) return;
    var dollars = [];
    var key = null;
    var helper = '';
    var brackets = pipe.match(bracketRe);
    if (brackets) {
      Est.each(brackets[0].split(','), function(item) {
        var name = Est.trim(item.split('.')[0].replace(/[\(|\)]/img, ''));
        if (!key) {
          key = name;
          if (index === 0) preType = Est.typeOf(Est.getValue(obj, key));
        }
        if (name.indexOf('\'') > -1) {
          dollars.push(name.replace(/'/img, ''));
        } else if (/^[\d\.]+$/img.test(name)) {
          dollars.push(parseFloat(name));
        } else {
          dollars.push(Est.getValue(obj, name));
        }
      }, this);
    }

    helper = Est.trim(pipe.replace(/\(.*\)/g, ''));
    if (Handlebars.helpers[helper]) {
      result = Handlebars.helpers[helper].apply(obj, dollars);
    } else if (app.getFilter(helper)) {
      result = app.getFilter(helper).apply(obj, dollars);
    } else {
      result = Est.compile('{{' + pipe + '}}', obj);
      if (result.indexOf('NaN') > -1) {
        result = result.replace(/NaN/img, '');
      }
      if (result.indexOf('undefined') > -1) {
        result = result.replace(/undefined/img, '');
      }
      if (result.indexOf('null') > -1) {
        result = result.replace(/null/img, '');
      }
    }

    if (Est.isEmpty(key)) {
      key = preName;
    } else {
      preName = key;
    }
    switch (preType) {
      case 'string':
        result = String(result);
        break;
      case 'number':
        if (/^[\d.]*$/.test(result)) {
          result = Number(result);
        }
        break;
      case 'boolean':
        result = Boolean(result);
        break;
      default:
        result = String(result);
    }
    obj[key] = result;

  }, this);

  return result;
});
