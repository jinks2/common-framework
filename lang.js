define('lang',['frame'], function ($) {
  var global = this, defineProperty = Object.defineProperty,
      IndexOf = String.prototype.indexOf;

  //==========扩展原型系统==========
  function methods(obj, map) {
    for(var prop in map) {
      method(obj, prop, map[prop]);
    }
  }
  //不会重写原型
  function method(obj, prop, val) {
    if(true/*!obj[prop]*/) {
      defineProperty(obj, prop, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: val
      });
    }
  };
  //IE8的Object.defineProperty只对DOM有效
  try{
    defineProperty({}, 'a', {
      get: function() {

      }
    });
    $.supportDefineProperty = true;
  } catch(e) {
    //不支持defineProperty就用基本的方法
    method = function(obj, prop, val) {
      if(obj[prop]) {
        obj[prop] = val;
      }
    }
  };

  /**
   * 字符串包含判断: ES6
   * @param {String} 要判断的字符
   * @param {Number} 开始判读的位置，默认为0
   * @return {Boolean}
   */
  function contains(s, position) {
    //position >> 0,取整数位;同时undefined也会取0
    return IndexOf.call(this, s, position >> 0) !== -1;
  };

  /**
   * 字符串开始字符判断: ES6
   * @param {String} 要判断的字符串
   * @return {Boolean}
   */
  function startsWith(str) {
    return this.indexOf(str) === 0;
  };
  
  /**
   * 字符串结束字符判断: ES6
   * @param {String} 要判断的字符串
   * @return {Boolean}
   */
  function endsWith(str) {
    return this.indexOf(str) === this.length - str.length;
  }

  /**
   * 重复字符串: ES6
   * @param {Number} 重复次数
   * @return {String}
   */
  function repeat(n) {
    var s = this, total = '';
    while (n > 0) {
      //奇数
      if(n % 2 === 1) {
        total += s;
      }
      if(n === 1) break;
      s += s;
      //除2取商
      n = n >> 1;
    }
    return total;
  }

  //扩展字符串原型
  methods(String.prototype, {
    contains: contains,
    startsWith: startsWith,
    endsWith: endsWith,
    repeat: repeat
  });
  
  //==========构建工具方法==========
  'String,Array,Number,Object'.replace($.rword, function(type) {
    $[type] = function(pack) {
      //判断传入的事字符还是对象
      var isNative = typeof pack === 'string';
      //获取方法名
      var methods = isNative ? pack.match($.rword) : Object.keys(pack);
      methods.forEach(function(method) {
        $[type][method] = isNative ? function(obj) {
          //obj为调用的对象,$.slice(arguments, 1)为参数
          return obj[method].apply(obj, $.slice(arguments, 1));
        } : pack[method];
      })
    }
  });
  /**
   * 获取字符串字节长度
   * @param {String} 目标字符串
   * @param [Nunber] 设定的汉子字节数，默认为2
   * @return {Number} 字节长度
   */
  function byteLen(target, fix) {
    fix = fix || 2;
    var str = new Array(fix + 1).join('-');
    //如果是汉子编码，默认用'--'取代
    return target.replace(/[^\x00-\xff]/g, str);
  };
  
  //$.String的原生方法加扩充方法
  $.String('charAt,charCodeAt');
  //$.String的新构建方法
  $.String({
    byteLen: byteLen
  })
  return $;
});
