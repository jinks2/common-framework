;(function (global, DOC) {
global.$ = {};
var $$ = global.$; //保存已有同名变量
var W3C = DOC.dispatchEvent; //IE9开始支持
var html = DOC.documentElement;
var noop = function() {}; //一个空函数
var moduleClass = "frame" + (new Date - 0);
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var basePath;
var rword = /[^, ]+/g;//切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
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
  if(toStr.call(o) === '[object Array]') return true;
  return false;
};

/**
 * 判断类数组: 只让节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象通过
 * @param {ArrayLike}
 * @return {Boolean}: 返回类数组判断
 */
function isArrayLike(o) {
  if(o && typeof o === 'object') {
    var len = o.length, str = toStr.call(o);
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
function type(o, str) {
  var result = Types[(o == null || o !== o) ? o : toStr.call(o)] || o.nodeName;
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
      result = toStr.call(o).slice(8, -1);
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

/**
 * 配置框架
 * @param {Object} 配置对象
 * @return {frame}
 */
function kernel(settings) {
  for (var prop in settings) {
    if(!hasOwn.call(settings, p)) {
      continue;
    }
    var val = settings[p];
    //这个熟悉是方法的话就执行它，否则就添加
    if(typeof kernel.plugin[p] === 'function') {
      kernel.plugin[p](val);
    } else {
      kernel[p] = val;
    }
  }
  return this;
};

/**
 * 抛出错误
 * @param {String} 自定义一个错误
 * @param {Error} 具体的错误对象构造器
 */
function error(str, e) {
  throw new (e || Error)(str);
};

//==========框架初始化==========
mix($, {
  html: html,
  rword: rword,
  mix: mix,
  slice: slice,
  isArray: isArray,
  isArrayLike: isArrayLike,
  type: type,
  bind: bind,
  unbind: unbind,
  ready: ready,
  config: kernel,
  error: error

});

(function() {
  var cur = getCurrentScript(true);
  if (!cur) {//处理window safari的Error没有stack的问题
      cur = $.slice(document.scripts).pop().src;
  }
  //去掉版本号或时间戳
  var url = cur.replace(/[?#].*/,'');
  //插件方法
  kernel.plugin = {};
  //require 的别名机制
  kernel.alias = {};
  //获取基本路径
  basePath = kernel.base = url.slice(0, url.lastIndexOf('/') + 1);
  var scripts = DOC.getElementsByTagName('script');
  for (var i = 0, el; el = scripts[i++];) {
    if(el.src === cur) {
      kernel.nick = el.getAttribute('nick') || '$';
      break;
    }
  }
  //状态
  kernel.level = 9;
}());

//别名方法
kernel.plugin['alias'] = function (val) {
  var maps = kernel.alias;
  for (var prop in val) {
    if(hasOwn.call(val, prop)) {
      var prevValue = maps[prop];
      var currValue = val[prop];
      if(prevValue) {
        $.error('注意' + prop + '出现重写');
      }
      maps[prop] = currValue;
    }
  }
};
//Types类型扩充
"Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList".replace(rword, function(name) {
    Types["[object " + name + "]"] = name;
});


//==========加载系统==========
var loadings = []; //正在加载中的模块列表

//Object(modules[id]).state拥有如下值 
// undefined  没有定义
// 1(send)    已经发出请求
// 2(loading) 已经被执行但还没有执行完成，在这个阶段define方法会被执行
// 3(loaded)  执行完毕，通过onload/onreadystatechange回调判定，在这个阶段checkDeps方法会执行
// 4(execute)  其依赖也执行完毕, 值放到exports对象上，在这个阶段fireFactory方法会执行
var modules = $.modules = {
  ready: {
    exports: $
  },
  frame: {
    state: 2,
    exports: $
  }
}
//获得当前script脚本路径
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
  for(var i = nodes.length, node; node = nodes[--i];) {
    if((base || node.className === moduleClass) && node.readyState === 'interactive') {
      return node.className = node.src;
    }
  }
};
//转换ID为URL,再调用
function loadJSCSS() {

};
//检测依赖安装情况
function checkDeps() {

};

/**
 * 请求模块
 * @param {String | Array} 模块列表
 * @param {Function} 模块工厂
 * @param [String] 父路径
 * @return {api}
 */
window.require = $.reuqire = function(list, factory, parent) {
  //检测依赖是否都为2，保存依赖模块返回值
  var deps = {}, args = [],
  //需安装的模块数,已安装的模块数
      dn = 0, cn = 0, 
      id = parent || 'callback' + setTimeout(1),
      parent = parent || basePath;
  String(list).replace(rword, function (el) {
    //获取完整url
    var url = loadJSCSS(el, parent);
    if(url) {
      dn++;
      //如果模块已经安装
      if(modules[url] && modules[url].state === 2) {
        cn++;
      }
      //如果依赖检测中还没有，则加入
      if(!deps[url]) {
        args.push(url);
        deps[url] = true;
      }
    }
  });
  //创建一个对象用于记录模块加载情况和其他信息
  modules[id] = {
    id: id,
    factory: factory,
    deps: deps,
    args: args,
    state: 1
  };
  //如果需要安装的等于已经安装好的安装到框架中
  if(dn === cn) {
    fireFactory(id, args, factory);
  } else {
    //否则放到检测队列中，等待checkDeps处理
    loadings.unshift(id);
  }
  checkDeps();
};
//
function fireFactory(id, dps, factory) {

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


}(window, window.document));
