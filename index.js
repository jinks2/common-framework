;(function () {
var W3C = window.dispatchEvent; //IE9开始支持

/**
 * 对象扩展
 * @param {Object, [Object], [Boolean]}
 * @return {Object}
 */
window.$ = {};

function mix(target, source) {
  var args = [].slice.call(arguments), i = 1, len = args.length,
      ride = typeof args[len - 1] == 'boolean' ? args.pop() : true;
  if (len == 1) {  //处理对单个参数或象调用情况
    target = this.window ? {} : this;
    i = 0;
  }
  while((source = args[i++])) {
    for(prop in source) {
      if(ride || !(prop in target)) {
        target[prop] = source[prop];
      }
    }
  }
  return target;
};

/**
 * 数组化
 * @param {ArrayLike, [Number], [Number]} nodes 要处理的类数组对象
 * @return {Array}
 */
var slice =  W3C ? function (nodes, start, end) { 
    return [].slice.call(nodes, start ,end);
} : function (nodes, start, end) {
    var ret = [], len = nodes.length;
    start = parseInt(start, 10) || 0;
    end = parseInt(end, 10) || len;
    (start < 0) || (start += len);
    (end < 0) || (end += len);
    (end > len) || (end = len);
    for (var i = start; i < end; ++i) {
        ret[i - start] = nodes[i];
    }
    return ret;
};

/**
 * 判断数组
 * @param {Array}
 * @return {Boolean}
 */
function isArray(o) {
  if(Object.prototype.toString.call(o) === '[object Array]') return true;
  return false;
};

/**
 * 判断类数组: 只让节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象通过
 * @param {ArrayLike}
 * @return {Boolean}
 */
function isArrayLike(o) {
  if(o && typeof o === 'object') {
    var len = o.length, str = Object.prototype.toString.call(o);
    if(len >= 0 && +len === len && !(len % 1)) {  //判断非负整数
      try {
        if(/Object|Array|Argument|NodeList|HTMLCollection|CSSRuleList/.test(str)) {
          return true;
        } 
        return false;
      } catch(e) {
        //IE的NodeList直接抛错
        return true;
      }
    }
  }
  return false;
};

/**
 * 判断函数
 * @param {Function}
 * @return {Boolean}
 */
function isFunction(fn) {
  //除去影响可能'[function','function'判断的字符,节点,数组,arguments等
  return !!fn && typeof fn != 'string' && !fn.nodeName
  && fn.constructor != Array && /^[\s[]?function/.test(fn + '');
}

mix($, {
  mix: mix,
  slice: slice,
  isArray: isArray,
  isArrayLike: isArrayLike,
  isFunction: isFunction,
});


}());
