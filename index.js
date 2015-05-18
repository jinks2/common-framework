;(function (global, DOC) {
var $$ = global.$; //保存已有同名变量
var W3C = DOC.dispatchEvent; //IE9开始支持
var html = DOC.documentElement;
var noop = function() {}; //一个空函数
var moduleClass = "frame" + (new Date - 0);

/**
 * 字符输出类型
 * @param {All}
 * @return {String}: 输出类型的字符串
 */
function ToString(o) {
  return Object.prototype.toString.call(o);
};

/**
 * 对象扩展
 * @param {Object}: target, 如果有两个及以上参数就好source
 * @param [Object]: source
 * @param [Boolean]: 判断是否覆盖同名属性
 * @return {Object}: 返回扩展后的对象
 */
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
 * @param {ArrayLike}, 
 * @param [Number]: start
 * @param [Number]: end
 * @return {Array}: 返回数组化之后的数组
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
 * @return {Boolean}: 返回判断数组判断
 */
function isArray(o) {
  if(ToString(o) === '[object Array]') return true;
  return false;
};

/**
 * 判断类数组: 只让节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象通过
 * @param {ArrayLike}
 * @return {Boolean}: 返回类数组判断
 */
function isArrayLike(o) {
  if(o && typeof o === 'object') {
    var len = o.length, str = ToString.call(o);
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
 * 类型判断
 * @param {All}
 * @param [String]: 比较的类型字符串
 * @return {String/Boolean}: 有比较的话返回判断结果，否则返回类型字符串
 */
 var Types = {
    '[object HTMLDocument]': 'Document',
    '[object HTMLCollection]': 'NodeList',
    '[object NodeList]': 'NodeList',
    '[object StaticNodeList]': 'NodeList', //IE
    '[object CSSRuleList]': 'CSSRuleList',
    '[object StyleSheetList]': 'StyleSheetList',
    '[object DOMWindow]': 'Window',
    '[object global]': 'Window',
    'null': 'Null',
    'NaN': 'NaN',
    'undefined': 'Undefined'
};

function type(o, str) {
  var result = Types[(o == null || o !== o) ? o : ToString(o)] || o.nodeName;
  if(result == void 0) {
    //兼容旧版本与处理个别情况
    //IE8以下，window == document ->true, document == window -> false
    if(o == o.document && o.document != o) {
      result = 'Window';
    } else if(o.nodeType === 9) {
      result = 'Document';
    } else if(o.callee) {
      result = 'Arguments';
    } else {
      result = ToString(o).slice(8, -1);
    }
  }
  if(str) {
    return str === result;
  }
  return result;
};

/**
 * 事件判定
 * @param {Node|Document|window}: 触发对象
 * @param {String}: 事件类型
 * @param {Function}: 回调
 * @param [Boolean]: 捕获判断，默认false冒泡
 * @return {Function}: 回调
 */
var bind = W3C ? function (ele, type, fn, phase) {
  ele.addEventListener(type, fn, !!phase); //phase默认false处理
  return fn;
} : function (ele, type, fn) {
  ele.attachEvent('on' + type, fn);
  return fn;
};

/**
 * 卸载绑定
 * @param {Node|Document|window}: 触发对象
 * @param {String}: 事件类型
 * @param [Function]: 回调
 * @param [Boolean]: 捕获判断，默认false冒泡
 */
 var unbind = W3C ? function (ele, type, fn, phase) {
   ele.removeEventListener(type, fn || noop, !!phase);
 } : function(ele, type, fn) {
   ele.detachEvent && elem.detachEvent('on' + type, fn || noop);
 };

//==========domReady机制==========
var readyList = [],readyFn, readyState = W3C ? 'DOMContentLoaded' : 'readystatechange';
//添加函数保障DOM树建立完成之后调用
function ready(fn) {
  readyList ? readyList.push(fn) : fn();
};
//依次调用readyList;
function fireReady() {
  for (var i = 0, fn; fn = readyList[i++];) {
    fn(); 
  }
  readyList = null;
  fireReady = noop; //避免IE下可能的两次调用
};
//兼容旧版IE, 判断DOM树是否建完
function doScrollCheck() {
  try {
    html.doScroll('left');
    fireReady();
  } catch(e) {
    setTimeout(doScrollCheck);
  }
};
//FireFox 3.6之前不存在readyState
if(!DOC.readyState) {
  var readyState = DOC.readyState = DOC.body ? 'complete' : 'loading';
}
if(DOC.readyState === 'complete') {
  fireReady();
} else {
  //绑定loaded事件
  bind(DOC, readyState, readyFn = function () {
    if(W3C || DOC.readyState === 'interactive' || DOC.readyState === 'complete') {
      fireReady();
    }
  });
  if(html.doScroll) { 
    try { //如果跨域会报错，那证明存在两个窗口
      if (global.eval === parent.eval) doScrollCheck();
    } catch (e) {
      doScrollCheck()
    }
  }
}

//==========加载系统==========
function getCurrentScript(base) {
  var stack;
  try{
    a.b.c();
  } catch(e) {//safari的错误对象只有line,sourceId,sourceURL
    stack = e.stack; //获取或设置作为包含堆栈跟踪帧的字符串的错误堆栈;包含地址
    if(!stack && window.opera) {
      //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
      stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
    }
  }
  if(stack) {
    stack = stack.split(/getCurrentScript\s*[@|()]/g).pop();//获取要处理的主要部分
    stack = stack.split(/\n/).shift().replace(/[)]/, "");//去掉换行符及可能的')'
    return stack.replace(/(:\d+)?:\d+$/i, ""); //去掉行号与或许存在的出错字符起始位置
  }
  //动态加载时节点都插入head中，所有只在head标签中查找
  var nodes = (base ? document : head).getElementsByTagName('script');
  for(var i = nodes.length, node; node = nodes[--i]) {
    if((base || node.className === moduleClass) && node.readyState === 'interactive') {
      return node.className = node.src;
    }
  }
};



/*
var _frame = global.frame;
function noConfict(deep) {
  if(deep && global.frame) {
    global.frame = _frame;
  }
  return frame;
}

*/

global.$ = {};

mix($, {
  mix: mix,
  slice: slice,
  isArray: isArray,
  isArrayLike: isArrayLike,
  type: type,
  bind: bind,
  unbind: unbind,
  ready: ready

});

}(window, window.document));
