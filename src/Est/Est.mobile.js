/**
 * 工具类库.
 *
 * @description 修改urlParsingNode变量 on 14/7/29
 * @class Est - 工具类库
 * @constructor Est
 */
;
(function() {
  'use strict';
  var root = this;
  /**
   * @description 系统原型方法
   * @method [变量] - slice push toString hasOwnProperty concat
   * @private
   */
  var slice = Array.prototype.slice,
    push = Array.prototype.push,
    toString = Object.prototype.toString,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    concat = Array.prototype.concat;
  /**
   * @description ECMAScript 5 原生方法
   * @method [变量] - nativeIsArray nativeKeys nativeBind
   * @private
   */
  var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = Object.prototype.bind;
  var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\n\
        \u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
  var uid = ['0', '0', '0'];
  var url = window.location.href;
  var urlParsingNode = null;
  /**
   * @description define
   * @method [变量] - moduleMap
   * @private
   */
  var moduleMap = {};
  var fileMap = {};
  var noop = function() {};
  /**
   * @description  定义数组和对象的缓存池
   * @method [变量] - maxPoolSize arrayPool objectPool
   * @private
   */
  var maxPoolSize = 40;
  var arrayPool = [],
    objectPool = [];
  /**
   * @method [变量] - cache
   * @private
   * 缓存对象 */
  var cache = {};
  /**
   * @method [变量] - routes
   * @private
   * url 路由 */
  var routes = {};
  var el = null,
    current = null;

  /**
   * @description 创建Est对象
   * @method [对象] - Est
   * @private
   */
  var Est = function(value) {
    return (value && typeof value == 'object' &&
        typeOf(value) !== 'array' && hasOwnProperty.call(value, '_wrapped')) ? value :
      new Wrapper(value);
  };


  function Wrapper(value, chainAll) {
    this._chain = !!chainAll;
    this._wrapped = value;
  }

  /**
   * @description 用于node.js 导出
   * @method [模块] - exports
   * @private
   */
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Est;
    }
    exports.Est = Est;
  } else {
    root.Est = Est;
  }
  /**
   * @description [1]检测数据类型 [undefined][number][string][function][regexp][array][date][error]
   * @method [对象] - typeOf ( 检测数据类型 )
   * @param {*} target 检测对象
   * @return {*|string}
   * @author wyj on 14/5/24
   * @example
   *      Est.typeOf(Est);
   *      ==> 'object'
   */
  var _type = {
    "undefined": "undefined",
    "number": "number",
    "boolean": "boolean",
    "string": "string",
    "[object Function]": "function",
    "[object RegExp]": "regexp",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object Error]": "error",
    "[object File]": "file",
    "[object Blob]": "blob"
  };

  function typeOf(target) {
    return _type[typeof target] || _type[toString.call(target)] || (target ? "object" : "null");
  }

  Est.typeOf = typeOf;

  function identity(value) {
    return value;
  }
  Est.identity = identity;

  /**
   * @description 返回获取对象属性值的方法
   * @method [对象] - property ( 返回获取对象属性值 )
   * @param {Object} key
   * @return {Function}
   */
  function property(key) {
    return function(object) {
      if (typeOf(object) === 'string') return null;
      return getValue(object, key);
    };
  }

  Est.property = property;

  /**
   * @description 如果object是一个参数对象，返回true
   * @method [对象] - isFunction ( 判断是否是对象 )
   * @param {*} obj 待检测参数
   * @return {boolean}
   * @author wyj on 14/5/22
   * @example
   *      Est.isFunction(alert);
   *      ==> true
   */
  function isFunction(obj) {
    return typeof obj === 'function';
  };

  if (typeof /./ !== 'function') {
    Est.isFunction = isFunction;
  }

  /**
   * @description 用来辨别 给定的对象是否匹配指定键/值属性的列表
   * @method [数组] - matches ( 对象是否匹配指定键/值属性的列表 )
   * @param attrs
   * @return {Function}
   * @author wyj on 14/6/26
   * @example
   */
  function matches(attrs) {
    return function(obj) {
      if (obj == null) return isEmpty(attrs);
      if (obj === attrs) return true;
      for (var key in attrs)
        if (attrs[key] !== obj[key]) return false;
      return true;
    };
  }

  Est.matches = matches;

  var matchCallback = function(value, context, argCount) {
    if (value == null) return identity;
    if (isFunction(value)) return createCallback(value, context, argCount);
    if (typeOf(value) === 'object') return matches(value);
    if (typeOf(value) === 'array') return value;
    return property(value);
  };
  var createCallback = function(func, context, argCount) {
    if (!context) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1:
        return function(value) {
          return func.call(context, value);
        };
      case 2:
        return function(value, other) {
          return func.call(context, value, other);
        };
      case 3:
        return function(value, index, collection) {
          return func.call(context, value, index, collection);
        };
      case 4:
        return function(accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }
    return function() {
      return func.apply(this, arguments);
    };
  };

  /**
   * @description 遍历数据或对象。如果传递了context参数，则把callback绑定到context对象上。
   * 如果list是数组，callback的参数是：(element, index, list, first, last)。
   * 如果list是个JavaScript对象，callback的参数是 (value, key, list, index, first, last))。返回list以方便链式调用。
   * 如果callback 返回false,则中止遍历
   * @method [数组] - each ( 遍历数据或对象 )
   * @param {Array/Object} obj 遍历对象
   * @param {Function} callback 回调函数
   * @param {Object} context 上下文
   * @return {Object}
   * @example
   *     Est.each([1, 2, 3], function(item, index, list, isFirst, isLast){
   *        alert(item);
   *     });
   *     ==> alerts each number in turn...
   *
   *     Est.each({one: 1, two: 2, three: 3}, function(value, key, object, index, isFirst, isLast){
   *        alert(value);
   *     });
   *     ==> alerts each number value in turn...
   */
  function each(obj, callback, context) {
    var i, length, first = false,
      last = false;
    if (obj == null) return obj;
    callback = createCallback(callback, context);
    if (obj.length === +obj.length) {
      for (i = 0, length = obj.length; i < length; i++) {
        first = i === 0 ? true : false;
        last = i === length - 1 ? true : false;
        if (callback(obj[i], i, obj, first, last) === false) break;
      }
    } else {
      var ks = keys(obj);
      for (i = 0, length = ks.length; i < length; i++) {
        first = i === 0 ? true : false;
        last = i === ks.length - 1 ? true : false;
        if (callback(obj[ks[i]], ks[i], obj, i, first, last) === false) break;
      }
    }
    return obj;
  }
  Est.each = Est.forEach = each;
  /**
   * @description 复制source对象中的所有属性覆盖到destination对象上，并且返回 destination 对象.
   * 复制是按顺序的, 所以后面的对象属性会把前面的对象属性覆盖掉(如果有重复).
   * @method [对象] - extend ( 继承 )
   * @param {Object} obj destination对象
   * @return {Object} 返回 destination 对象
   * @author wyj on 14/5/22
   * @example
   *      Est.extend({name: 'moe'}, {age: 50});
   *      ==> {name: 'moe', age: 50}
   */
  function extend(obj) {
    if (typeOf(obj) !== 'object') return obj;
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };
  Est.extend = extend;

  /**
   * @description 返回一个对象里所有的方法名, 而且是已经排序的 — 也就是说, 对象里每个方法(属性值是一个函数)的名称.
   * @method [对象] - functions ( 返回一个对象里所有的方法名 )
   * @param {Object} obj 检测对象
   * @return {Array} 返回包含方法数组
   * @author wyj on 14/5/22
   * @example
   *      Est.functions(Est);
   *      ==> ["trim", "remove", "fromCharCode", "cloneDeep", "clone", "nextUid", "hash" ...
   */
  function functions(obj) {
    var names = [];
    for (var key in obj) {
      if (isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };
  Est.functions = Est.methods = functions;
  /**
   * @description 返回一个封装的对象. 在封装的对象上调用方法会返回封装的对象本身, 直道 value 方法调用为止.
   * @method [对象] - chain ( 返回一个封装的对象 )
   * @param value
   * @return {*}
   * @author wyj on 14/5/22
   * @example
   *      var stooges = [{name: 'curly', age: 25}, {name: 'moe', age: 21}, {name: 'larry', age: 23}];
   *      var youngest = Est.chain(stooges)
   *          .sortBy(function(stooge){ return stooge.age; })
   *          .map(function(stooge){ return stooge.name + ' is ' + stooge.age; })
   *          .first()
   *          .value();
   *      ==> "moe is 21"
   */
  Est.chain = function(value) {
    value = new Wrapper(value);
    value._chain = true;
    return value;
  };

  // ========================================================
  /**
   * 字符串转换成hash值
   * @method [字符串] - hash ( 字符串转换成hash值 )
   * @param str
   * @return {number}
   * @author wyh 15.2.28
   * @example
   *        Est.hash('aaaaa');
   */
  function hash(str) {
    try {
      var hash = 5381,
        i = str.length;
      while (i)
        hash = (hash * 33) ^ str.charCodeAt(--i);
      return hash >>> 0;
    } catch (e) {
      debug('err34' + e);
    }
  }

  Est.hash = hash;



  //=============================================================
  // 新增方法

  /**
   * @description 获取浏览器参数列表
   * @method [浏览器] - getUrlParam ( 获取浏览器参数列表 )
   * @param {String} name 参数名称
   * @param {String} url 指定URL
   * @return {String} 不存在返回NULL
   * @author wyj on 14-04-26
   * @example
   *      var url = 'http://www.jihui88.com/index.html?name=jhon';
   *      Est.getUrlParam('name', url);
   *      ==> 'jhon'
   */
  function getUrlParam(name, url) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    if (typeOf(url) !== 'undefined')
      url = url.substring(indexOf(url, '?'), url.length);
    var path = url || window.location.search;
    var r = path.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  Est.getUrlParam = getUrlParam;
  /**
   * @description 遍历MAP对象
   * @method [数组] - map ( 遍历MAP对象 )
   * @param {Array} obj 目标数组
   * @param callback 回调函数
   * @param context 上下文
   * @return {Array} 返回数组
   * @author wyj on 14/6/23
   * @example
   *      var list = [1, 2, 3];
   *      var result = Est.map(list, function(value, index, list){
   *        return list[index] + 1;
   *      });
   *      ==> [2, 3, 4]
   */
  function map(obj, callback, context) {
    var results = [];
    if (obj === null) return results;
    callback = matchCallback(callback, context);
    each(obj, function(value, index, list) {
      results.push(callback(value, index, list));
    });
    return results;
  }
  Est.map = map;
  //=============================================================

  /**
   * @description 判断是否为空 (空数组， 空对象， 空字符串， 空方法， 空参数, null, undefined) 不包括数字0和1 【注】苹果手机有问题
   * @method [对象] - isEmpty ( 判断是否为空 )
   * @param {Object} value
   * @return {boolean}
   * @author wyj on 14/6/26
   * @example
   *      Est.isEmpty(value);
   *      ==> false
   */
  function isEmpty(value) {
    var result = true;
    if (typeOf(value) === 'number') return false;
    if (!value) return result;
    var className = toString.call(value),
      length = value.length;
    if ((className == '[object Array]' || className == '[object String]' || className == '[object Arguments]') ||
      (className == '[object Object]' && typeof length == 'number' && isFunction(value.splice))) {
      return !length;
    }
    each(value, function() {
      return (result = false);
    });
    return result;
  }

  Est.isEmpty = isEmpty;

  /**
   * @description 表单验证
   * @method [表单] - validation ( 表单验证 )
   * @param  {String} str  待验证字符串 str可为数组 判断所有元素是否都为数字
   * @param  {String} type 验证类型
   * @return {Boolean}      返回true/false
   * @author wyj on 14.9.29
   * @example
   *      var result_n = Est.validation(number, 'number'); // 数字或带小数点数字
   *      var result_e = Est.validation(email, 'email'); // 邮箱
   *      var result_c = Est.validation(cellphone, 'cellphone'); // 手机号码
   *      var result_d = Est.validation(digits, 'digits'); // 纯数字， 不带小数点
   *      var result_u = Est.validation(url, 'url'); // url地址
   */
  function validation(str, type) {
    var pattern, flag = true;
    switch (type) {
      case 'cellphone':
        pattern = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
        break;
      case 'email':
        pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        break;
      case 'url':
        pattern = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
        break;
      case 'number':
        // 可带小数点 如：0.33， 35.325
        pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/; // ^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$ .1 matches 0.1 matches 1.12 matches 123.12 matches 92 matches 092 matches 092.13 matches 0 doesn't match 0.0 doesn't match 0.00 doesn't match 00 doesn't match 1.234 doesn't match -1 doesn't match -1.2 doesn't match
        break;
      case 'digits': //还可带小数点
        pattern = /^\d+$/;
        break;
    }
    if (typeOf(str) === 'array') {
      each(str, function(item) {
        if (!pattern.test(item))
          flag = false;
      });
    } else {
      flag = pattern.test(str);
    }
    return flag;
  }

  Est.validation = validation;
  /**
   * @description 数组中查找符合条件的索引值 比较原始值用indexOf
   * @method [数组] - findIndex ( 数组中查找符合条件的索引值 )
   * @param array
   * @param {Function} callback 回调函数
   * @param {Object} context 上下文
   * @return {number}
   * @author wyj on 14/6/29
   * @example
   *      var list = [{"name":"aa"},{"name":"bb"},{"name":"cc"}, {"name":"bb", address:"zjut"}];
   *      var index = Est.findIndex(list, {name: 'aa'});
   *      ==> 0
   *
   *      var index2 =  Est.findIndex(list, function(item){
   *         return item.name === 'aa';
   *      });
   *      ==> 0
   */
  function findIndex(array, callback, context) {
    var index = -1,
      length = array ? array.length : 0;
    callback = matchCallback(callback, context);
    while (++index < length) {
      if (callback(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  Est.findIndex = findIndex;


  //================================================================
  /**
   * @description 织入模式 - 实用程序函数扩展Est。
   * 传递一个 {name: function}定义的哈希添加到Est对象，以及面向对象封装。
   * @method [模式] - mixin ( 织入模式 )
   * @param obj
   * @param {Boolean} isExtend 是否是Est的扩展
   * @author wyj on 14/5/22
   * @example
   *      Est.mixin({
   *          capitalize: function(string) {
   *              return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
   *          }
   *      });
   *      Est("fabio").capitalize();
   *      ==> "Fabio"
   */
  Est.mixin = function(obj, isExtend) {
    var ctx = Est;
    if (typeOf(isExtend) === 'boolean' && !isExtend) ctx = obj;
    each(functions(obj), function(name) {
      var func = ctx[name] = obj[name];
      ctx.prototype[name] = function() {
        try {
          var args = [];
          if (typeof this._wrapped !== 'undefined')
            args.push(this._wrapped);
        } catch (e) {
          console.error("err35");
        }
        push.apply(args, arguments);
        return result.apply(this, [func.apply(ctx, args), ctx]);
      };
    });
    Wrapper.prototype = ctx.prototype;
    extend(ctx.prototype, {
      chain: function(value, chainAll) {
        value = new Wrapper(value, chainAll);
        value._chain = true;
        return value;
      },
      value: function() {
        return this._wrapped;
      }
    });
  };
  Est.mixin(Est, true);

  /**
   * @description For request.js
   * @method [定义] - define
   * @private
   */
  if (typeof define === 'function' && define.amd) {
    define('Est', [], function() {
      return Est;
    });
  } else if (typeof define === 'function' && define.cmd) {
    // seajs
    define('Est', [], function(require, exports, module) {
      module.exports = Est;
    });
  }
}.call(this));
