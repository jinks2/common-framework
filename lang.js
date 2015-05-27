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

  //==========构建工具方法==========
  'String,Array,Number,Object'.replace($.rword, function(type) {
    $[type] = function(pack) {
      //判断传入的事字符还是对象
      var isNative = typeof pack === 'string';
      //获取方法名
      var funcs = isNative ? pack.match($.rword) : Object.keys(pack);
      funcs.forEach(function(method) {
        $[type][method] = isNative ? function(obj) {
          //obj为调用的对象,$.slice(arguments, 1)为参数
          return obj[method].apply(obj, $.slice(arguments, 1));
        } : pack[method];
      })
    }
  });

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
  
  //扩展字符串原型;对于旧浏览器，字符串没有太多需要修复
  methods(String.prototype, {
    contains: contains,
    startsWith: startsWith,
    endsWith: endsWith,
    repeat: repeat
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

  /**
   * 正则转义
   * @param {String}
   * @return {String}
   */
  function escapeRegExp(target) {
    return target.replace(/([-.*?^${}()|[\]\/\]])/g,'\\$1');
  };

  /**
   * 字符串填充
   * @param {String} 
   * @param {Number} 填充后的字符串长度
   * @param [String|Number] 填充的字符数值/数值，默认0
   * @param [Boolean] 填充的方向，默认左边
   * @param [Number] 填充后的进制，默认十进制
   * @return {String}
   */
  function pad(target, n, filling, right, radix) {
    var str = target.toString(radix || 10);
    filling = filling || '0';
    while (str.length < n) {
      if(!right) {
        str = filling + str
      } else {
        str += filling;
      }
    }
    return str
  };

  /**
   * format模版
   * @param {String} 要处理的字符串
   * @param {String|Object} 分别为数字占位符和对象占位符的形式
   * @return {String}
   * @example: format('#{0),#(1)','param1','param2')
   *           formar('#{name},#{age}',{name:'name',age:0})
   */
  function format(str, obj) {
    var arr = $.slice(arguments, 1);
    //正则获取#{index}|#{param};
    //如果前面有\\，表示注释，保留不处理
    return str.replace(/\\?\#{([^{}]+)\}/gm, function(match, name) {
      //注意这里第一个\是转义用的
      if(match.charAt(0) == '\\') return match.slice(1);
      var index = Number(name);
      if(index >= 0) return arr[index];
      if(obj && obj[name] !== void 0) return obj[name];
      return '';
    });
  };

  /**
   * 空格处理: 旧版IE没有trim方法的补充
   * @param {String}
   * @return {String}
   */
  function trim(target) {
    return target.replace(/^\s\s*/g,'').replace(/\s\s*$/g,'');
  };

  //$.String的原生方法＋扩充方法
  $.String('charAt,charCodeAt,concat,indexOf,lastIndexOf,localeCompare,match,' + 'contains,endsWith,startsWith,repeat,' 
    + 'replace,search,slice,split,substring,toLowerCase,toUpperCase,trim,toJSON');

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
    unescapeHTML: unescapeHTML,
    escapeRegExp: escapeRegExp,
    pad: pad,
    format: format,
    trim: trim
  })


 /**
  * 修补index
  * @param {String} 要查找的字符
  * @param [Number] 开始查找的位置，默认为开头
  * @return {Number} 查找到的位置或－1
  */
 function indexOf(item, index) {
   var len = this.length, i = ~~index;
   if(i < 0) i += len;
   for(;i < len; i++) {
     if(this[i] === item)
       return i;
   }
   return -1;
 };

 /**
  * 修补lastIndexOf
  * @param {String} 要查找的字符
  * @param [Number] 开始查找的位置，默认为结尾
  * @return {Number} 查找到的位置或－1
  */
 function lastIndexOf(item, index) {
   var len = this.length, i = index == null ? len - 1 : index;
   if(i < 0) i = Math.max(0, n + i);
   for(; i >= 0; i--) {
     if(this[i] === item)
       return i;
   }
   return -1;
 };

 /**
  * 数组的标准化修补方法; 注意数字中的空数组是会过滤的
  * @param {String} 初始化的变量
  * @param {String} 要置换的函数体部分
  * @param {String} 返回结果部分
  * @return {Function}
  * @参考：http://www.w3cfuns.com/blog-5465813-5405446.html
  */
 function iterator(vars, body, ret) {
   var fun = 'for(var ' + vars + 'i=0,n = this.length;i < n;i++){' 
   //fn为回调函数，scope为作用域
   + body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))') + '}' + ret
   //参数和函数体
   return Function('fn,scope', fun);
 }

 /**
  * 数组reduce修补方法
  * @param {Function} 回调函数
  * @param [All] 可选第一个参数
  * @param [Object|this] 作用域
  * @return {All}
  */
 function reduce(fn, lastResult, scope) {
   if(this.length === 0)return lastResult;
   var i = lastResult !== undefined ? 0 : 1;
   var result = lastResult !== undefined ? lastResult : this[0];
   for(var len = this.length; i < len; i++) {
     result = fn.call(scope, result, this[i], i, this);
   }
   return result;
 };

 /**
  * 数组reduceRight修补方法
  * @param {Function} 回调函数
  * @param [All] 可选第一个参数
  * @param [Object|this] 作用域
  * @return {All}
  */
 function reduceRight(fn, lastResult, scope) {
   var arr = this.contat().reverse();
   return arr.reduce(fn, lastResult, scope);
 };
 
 //修复旧浏览器，扩展数组原型;
 methods(Array.prototype, {
    indexOf: indexOf,
    lastIndexOf: lastIndexOf,
    forEach: iterator('','_',''),
    filter: iterator('r=[],j=0,','if(_)r[j++]=this[i]','return r'),
    map: iterator('r=[],','r[i]=_','return r'),
    some: iterator('','if(_)return true','return false'),
    every: iterator('','if(!_) return false','return true'),
    reduce: reduce,
    reduceRight: reduceRight
 });

 /**
  * 数组包含判断
  * @param {Array}
  * @param {All} 要判断的值
  * @return {Boolean} 判断的布尔值
  */
 function contains(target, item) {
   return target.indexOf(item) > -1;
 };
 
 /**
  * 移除指定位置
  * @param {Array} 
  * @param {Number} 指定位置
  * @return {Boolean}
  */
 function removeAt(target, index) {
   return !!target.splice(index, 1).length;
 };
 
 /**
  * 移除制定项
  * @param {Array}
  * @param {All}
  * @param [Number] 开始的位置
  * @return {Boolean}
  */
 function remove(target, item, start) {
   var index = target.indexOf(item, start);
   if(~index)
     return removeAt(target, index);
   return false;
 };

 /**
  * 数组无序重排; 若不想影响原数组，可以先拷贝一份出来操作.
  * @param {Array}
  * @return {Array}
  * @参考: http://bost.ocks.org/mike/shuffle/
  */
 function shuffle(target) {
   var rand ,tmp ,len = target.length;
   for(; len > 0; ) {
     rand = parseInt(Math.random() * len),
     //从后向前
     tmp = target[--len],
     target[len] = target[rand],
     target[rand] = tmp
   }
   return target;
 };

 /**
  * 取随机项
  * @param {Array}
  * @return {All}
  */
 function random(target) {
   return target[Math.floor(Math.random() * target.length)];
 }

 /**
  * 数组平坦化处理
  * @param {Array}
  * @return {Array} 处理后的一维数组
  */
 function flatten(target) {
   var result = [];
   target.forEach(function(item) {
     if(Array.isArray(item)) {
       result = result.concat(flatten(item));
     } else {
       result.push(item);
     }
   })
   return result;
 };

 /**
  * 数组去重: 算法类似冒泡排序，注意这是个浅去重
  * @param {Array}
  * @return {Array} 去重后的新数组
  */
 function unique(target) {
   var result = [],len = target.length, i ,j;
   loop: for(i = 0 ;i < len; i++) {
     for(j = i + 1; j < len; j++) {
       if(target[j] === target[i])
        continue loop;
     }
     result.push(target[i]);
   }
   return result;
 };
 
 /**
  * 过滤数组中的null与undefined;包括空值
  * @param {Array}
  * @param {Array}
  */
 function compact(target) {
   return target.filter(function(item) {
     return item != null;
   })
 };

 /**
  * 对象数组取特定属性值
  * @param {Array}
  * @param {String} 属性名
  * @return {Array} 由属性值组成的数组
  */
 function pluck(target, name) {
   var result = [], prop;
   target.forEach(function(item) {
     if(typeof item != 'object') return;
     prop = item[name];
     if(prop !== null)
       result.push(prop);
   });
   return result;
 };

 /**
  * 数组特定条件分组
  * @param {Array}
  * @param {Function|String} 回调的用于分组一般数组; 数组分组对象数组
  * @return {Object} 返回分组后的对象
  */
 function groupBy(target, val) {
   var result = {};
   var iterator = $.isFunction(val) ? val : function(obj) {
     return obj[val];
   };
   target.forEach(function(item, index) {
     var key = iterator(item, index);
     (result[key] || (result[key] = [])).push(item);
   })
   return result;
 };

 /**
  * 对象数组根据指定条件对选中的属性值排序
  * @param {Array}
  * @paran {Function} 用于筛选对象属性
  * @param [null|Object]
  * @return {Array} 筛选的属性值组成的数组
  */
 function sortBy(target, fn, scope) {
   var arr = target.map(function(item, index) {
     return {
       el: item,
       re: fn.call(scope, item, index)
     }
   }).sort(function(left, right) {
     var a = left.re, b = right.re;
     return a < b ? -1 : a > b ? 1 : 0;
   });
   return pluck(arr,'el');
 };

 /**
  * 取并集
  * @param {Array}
  * @param {Array}
  * @return {Array}
  */
 function union(target, array) {
   return unique(target.concat(array))
 };

 /**
  * 取交集
  * @param {Array}
  * @param {Array}
  * @return {Array}
  */
 function intersect(target, array) {
   return target.filter(function(item) {
     return ~array.indexOf(item);
   })
 };
 
 /**
  * 取补集
  * @param {Array}
  * @param {Array}
  * @return {Array}
  */
 function diff(target, array) {
   var i, j, len = array.length;
   //由于对target使用splice,所有length是个变值
   for(i = 0; i < target.length; i++) {
     for(j = 0; j < len; j++) {
       if(target[i] === array[j]) {
         target.splice(i,1);
         i --;
         break;
       }
     }
   }
   return target;
 };

 /**
  * 返回数组中的最小值
  * @param {Array} 数字数组
  * @return {Number}
  */
 function min(target) {
   return Math.min.apply(null, target);
 };

 /**
  * 返回数组中的最大值
  * @param {Array} 数字数组
  * @return {Number}
  */
 function max(target) {
   return Math.max.apply(null, target);
 };

 //修补IE6，7下unshift不返回数组长度问题
 if([].unshift(1) !== 1) {
   var _unshift = Array.prototype.unshift;
   Array.prototype.unshift = function() {
     _unshift.apply(this, arguments);
     return this.length;
   }
 }

 //修补IE6，7，8下splice在一个参数时默认第二参数为0，其他浏览器则为数组长度
 if([1,2,3].splice(1).length == 0) {//IE6，7，8下一个元素也没有删除
   var _splice = Array.prototype.splice;
   Array.prototype.splice = function(a) {
     if(arguments.length == 1) {
       return _splice.call(this, a, this.length);
     } else {
       return _splice.apply(this, arguments);
     }
   }
 };

 //$.Array的原生方法
 $.Array('concat,join,pop,push,shift,unshift.slice,splice,sort,reverse,' 
   + 'indexOf,lastIndexOf,every,some,filter,reduce,reduceRight');
 //$.Array的新构建方法
 $.Array({
   contains: contains,
   removeAt: removeAt,
   remove: remove,
   shuffle: shuffle,
   random: random,
   flatten: flatten,
   unique: unique,
   compact: compact,
   pluck: pluck,
   groupBy: groupBy,
   sortBy: sortBy,
   union: union,
   intersect: intersect,
   diff: diff,
   min: min,
   max: max
 });

  return $;
});
