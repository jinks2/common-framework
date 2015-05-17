;(function () {
var W3C = window.dispatchEvent; //IE9开始支持

/**
 * 对象扩展
 * @param {object}
 * @return {object}
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
 * @param {ArrayLike} nodes 要处理的类数组对象
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
 * @param {all}
 * @return {boolean}
 */
function isArray(o) {
  if(Object.prototype.toString.call(o) === '[object Array]') return true;
  return false;
}

mix($, {
  mix: mix,
  slice: slice,
  isArray: isArray
});


}());
