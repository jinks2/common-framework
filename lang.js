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
    fix = fix ? fix : 2;
    var str = new Array(fix + 1).join('-');
    //如果是汉子编码，默认用'--'取代
    return target.replace(/[^\x00-\xff]/g, str);
  };
  
  /**
   * 字符串截断处理
   * @param {String} 目标字符串
   * @param [Number] 限定长度，默认30
   * @param [String] 添加符号，默认三个点
   * @return {String} 处理结果
   */
  function truncate(target, length, trubcation) {
    length = length || 30;
    trubcation = trubcation === void 0 ? '...' : trubcation;
    return target.length <= length ? String(target) :
      target.slice(0, length) + trubcation; 
  };

  /**
   * 驼峰格式
   * @param {String}
   * @return {String} 转化后的结果
   */
  function camelize(target) {
    if(target.indexOf('-') < 0 && target.indexOf('_') < 0) {
      return target; //提前判断，提高getStyle等的效率
    }
    //允许开头使用符号
    return target.replace(/[-_][^-_]/g, function (match) {
      return match.charAt(1).toUpperCase();
    });
  };

  /**
   * 下划线格式
   * @param {String}
   * @return {String}
   */
  function underscored(target) {
     return target.replace(/([a-z\d])([A-Z])/g, '$1_$2')
       .replace(/\-/g,'_').toLowerCase();
  };
  
  /**
   * 连字符格式
   * @param{String}
   * @return {String}
   */
  function dasherize(target) {
    return target.replace(/([a-z\d])([A-Z])/g,'$1-$2')
      .replace(/\_/g,'-').toLowerCase();
  };
  
  /**
   * 首字母大写
   * @param {String}
   * @return {String}
   */
  function capitalize(target) {
    return target.charAt(0).toUpperCase() + target.substring(1).toLowerCase();
  };
  /**
   * 移除html标签
   * @param {String}
   * @return {String}
   */
  function stripTags(target) {
    //匹配格式<..>,但在对<script>标签时会遗留里面的脚本
    return String(target || '').replace(/<[^>]+>/g,'');
  };

  /**
   * 移除script标签; 此方法应该在stripTags方法之前调用
   * @param {String}
   * @return {String}
   */
  function stripScripts(target) {
    return String(target || '').replace(/<script[^>]*>([\S\s]*?)<\/script>/img,'')
  };

  /**
   * html转义
   * @param {String}
   * @return {String}
   */
  function escapeHTML(target) {
    return target.replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  /**
   * html反转义
   * @param {String}
   * @return {String}
   */
  function unescapeHTML(target) {
    return target.replace(/&amp;/g,'&').replace(/&lt;/g,'<')
      .replace(/&gt/g,'>;').replace(/&quot;/g,'"')
      .replace(/&#39;/g,"'");
  }
  //$.String的原生方法加扩充方法
  $.String('charAt,charCodeAt');

  //$.String的新构建方法
  $.String({
    byteLen: byteLen,
    truncate: truncate,
    camelize: camelize,
    underscored: underscored,
    dasherize: dasherize,
    capitalize: capitalize,
    stripTags: stripTags,
    stripScripts: stripScripts,
    escapeHTML: escapeHTML,
    unescapeHTML: unescapeHTML
  })
  return $;
});
