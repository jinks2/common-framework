
//====================
//主模块系统(包括加载模块)
//====================
;(function (global, DOC) {
  global.$ = {};
  var $$ = global.$; //保存已有同名变量
  var W3C = DOC.dispatchEvent; //IE9开始支持
  var html = DOC.documentElement;
  var head = DOC.head || DOC.getElementsByTagName('head')[0];
  var NsKey = DOC.URL.replace(rmakeid, ""); //长命名空间（字符串）
  var NsVal = global[NsKey]; //长命名空间（mass对象）
  var moduleClass = "frame" + (new Date - 0);
  var hasOwn = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;
  var basePath;
  var rword = /[^, ]+/g;//切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
  var rmakeid = /(#.+|\W)/g; //用于处理掉href中的hash与所有特殊符号，生成长命名空间
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
  var noop = function() {}; //一个空函数
  var loadings = []; //正在加载中的模块列表
  //储存需要绑定ID与factory对应关系的模块
  var factorys = []; //标准浏览器下，先parse的script节点会先onload

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
    return toStr.call(o) === '[object Array]';
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
   */
  function isFunction(fn) {
    return toStr.call(fn) === '[object Function]'; 
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
      if(!hasOwn.call(settings, prop)) {
        continue;
      }
      var val = settings[prop];
      //这个熟悉是方法的话就执行它，否则就添加
      if(typeof kernel.plugin[prop] === 'function') {
        kernel.plugin[prop](val);
      } else {
        kernel[prop] = val;
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

  /**
   * 打印信息
   * @param {All} 用于打印的信息，会转化为字符串
   * @param [boolean] 是否打印到页面, 默认false
   * @param {Number} 过滤显示日志
     0 EMERGENCY 致命错误,框架崩溃
     1 ALERT 需要立即采取措施进行修复
     2 CRITICAL 危急错误
     3 ERROR 异常
     4 WARNING 警告
     5 NOTICE 通知用户已经进行到方法
     6 INFO 更一般化的通知
     7 DEBUG 调试消息
     9 config.lvel默认值
   * @preturn {String}
   */
  function log(str, page, level) {
     for(var i = 1, show = true; i < arguments.length; i++) {
       var tmp = arguments[i];
       if(typeof tmp === 'number') {
         show = (level = tmp) <= $.config.level; //默认状态9
       } else if(tmp === true) {
         page = true;
       }
     }
     if(show) {
       if(page === true) {
         var div = DOC.createElement('pre');
         div.className = 'frame_sys_log';
         div.innerHTML = str + ''; //确保为字符串
         DOC.body.appendChild(div);
       } else if(window.opera) {
         opera.postError(str);
       } else if(global.console && console.log) {
         console.log(str);
       }
     }
     return str;
  };
  /**
   * 将内部对象放到window上，可重名，实现多库共存
   * @param {String} name
   * @return {frame}
   */
  function exports(name) {
    global.$ = $$; //多库共存
    name = name || $.config.nick;
    $.config.nick = name;
    global[NsKey] = NsVal;
    return global[name] = this;
  };

  //==========框架初始化==========
  mix($, {
    html: html,
    rword: rword,
    mix: mix,
    slice: slice,
    isArray: isArray,
    isArrayLike: isArrayLike,
    isFunction: isFunction,
    type: type,
    bind: bind,
    unbind: unbind,
    ready: ready,
    config: kernel,
    error: error,
    log: log,
    exports: exports

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
  var rdeuce = /\/\w+\/\.\./;
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
      stack = stack.split(/[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
      stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, "");//去掉换行符及可能的'('
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
  function loadJSCSS(url, parent, ret, shim) {
    var ret = ret, shim = shim;
    //特别处理标示符frame|ready
    if(/^(frame|ready)$/.test(url)) {
      return url;
    }
    //如果config已经配置别名
    if($.config.alias[url]) {
      ret = $.config.alias[url];
      if(typeof ret === 'object') {
        shim = ret;
        //那么ret就取config中配置的src
        ret = ret.src;
      }
    } else {
      if(/^(\w+):.*/.test(url)) {//绝对路径
        ret = url;
      } else {
        parent = parent.slice(0, parent.lastIndexOf('/'));
        var tmp = url.charAt(0); 
        if(tmp !== '.' && tmp !== '/') {//根路径
          ret = basePath + url;
        } else if(url.slice(0, 2) === './') {//当前路径
          ret = parent + url.slice(1);
        } else if(tmp === '/') {//当前路径
          ret = parent + url;
        } else if(url.slice(0, 2) === '..') {//上级路径
          ret = parent + '/' + url;
          //处理路径如：../x/../x
          while(rdeuce.test(ret)) {
            ret = ret.replace(rdeuce, '');
          }
        } else {
          $.error('不符合模块标示规则:' + url);
        }
      }
    }
    var src = ret.replace(/[?#].*/, ''), ext;
    if(/\.(css|js)/.test(src)) {
      ext = RegExp.$1;
    }
    //默认为js文件
    if(!ext) {
      src += '.js';
      ext = 'js';
    }
    if(ext === 'js') {
      //如果之前没有加载过
      if(!modules[src]) {
        modules[src] = {
          id: src,
          parent: parent,
          exports: {}
        };
        //shim机制
        if (shim) {
          require(shim.deps || '', function () {
            loadJS(src, function () {
              modules[src].state = 2;
              modules[src].exports = typeof shim.exports === 'function' ?
                shim.exports() : window[shim.exports];
              checkDeps();
            })
          });
        } else {
          loadJS(src);
        }
      }
      return src;
    } else {
      loadCSS(src);
    }
  };

  function loadJS(url, callback) {
    var node = DOC.createElement('script');
    node.className = moduleClass;
    node[W3C ? 'onload' : 'onreadystatechange'] = function() {
      if(W3C || /loaded|complete/i.test(node.readystatechange)) {
         //factorys里面装着define方法的工厂函数
        factory = factorys.pop();
         //
        factory && factory.delay(node.scr);
        callback && callback();
        checkFail(node, false, !W3C) && $.log('已加载成功 ' + url, 7);
      }
    }
    node.onerror = function() {
      checkFail(node, true);
    }
    node.src = url;
    head.insertBefore(node, head.firstChild);
    $.log("正准备加载 " + node.src, 7);
  };
  //通过link节点加载模块需要的CSS文件
  function loadCSS(url) {
    var id = url.replace(rmakeid, '');
    if(!DOC.getElementById(id)) {
      var node = DOC.createElement('link');
      node.rel = 'stylesheet';
      node.href = url;
      node.id = id;
      head.insertBefore(node, head.firstChild);
    }
  };
  //主要用于开发调试
  function checkFail(node, onError, IEhack) {
    var id = node.src; //检查是否是死链
    node.onload = node.onreadystatechange = node.onerror = null;
    if(onError || (IEhack && !modules[id].state)) {
      setTimeout(function() {
        head.removeChild(node);
      });
      $.log('加载' + id + '失败' + onError + ' ' + (!modules[id].state), 7);
    } else {
      return true;
    }
  };
  //检测依赖安装情况，在用户加载模块之前及script.onload后各执行一次
  //如果模块没有任何依赖或state都为2，调用fireFactory
  function checkDeps() {
    loop: for(var i = loadings.length, id; id = loadings[--i];) {
      var obj = modules[id], deps = obj.deps;
      for(var prop in deps) {
        if(hasOwn.call(deps, prop) && modules[prop].state !== 2) {
          continue loop;
        }
      }
      //如果deps是空对象或者模块的状态都是2
      if(obj.state !== 2) {
        loadings.splice(i, 1);
        fireFactory(obj.id, obj.args, obj.factory);
        checkDeps();
      }
    }
  };
  //检测是否存在循环依赖
  function checkCycle(deps, nick) {
    for(var id in deps) {
      if (deps[id] === true && modules[id].state !== 2 && (id === nick || checkCycle(modules[id].deps, nick))) {
          return true;
      }
    }
  };

  /**
   * 请求模块
   * @param {String | Array} 模块列表:允许绝对/相对路径或文件名
   * @param {Function} 模块工厂
   * @param [String] 父路径
   * @return {api}
   */
  window.require = $.require = function(list, factory, parent) {
    //检测依赖是否都为2，保存依赖模块返回值
    var deps = {}, args = [],
    //需安装的模块数,已安装的模块数
        dn = 0, cn = 0, 
        id = parent || 'callback' + setTimeout(1),
        //如果没有设置parent,默认就是当前路径
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
  require.config = kernel;

  /**
   * 定义模块
   * @param {String} 模块id
   * @param {Array} 依赖列表
   * @param {Function} 模块工厂
   * @api public
   */
  window.define = $.define = function(id, deps, factory) {
    var args = $.slice(arguments);
    if(typeof id === 'string') {
      var _id = args.shift();
    }
    //用于文件合并，在标准浏览器中跳过补丁
    if(typeof args[0] === 'boolean') {
      if(args[0]) return;
      args.shift();
    }
    //没有依赖列表自动补充空数组
    if(typeof args[0] === 'function') {
      args.unshift([]);
    }
    //上线合并后能直接得到模块ID,否则寻找当前正在解析中的script节点的src作为模块ID
    //现在除了safari外，都能直接通过getCurrentScript得到当前执行的script节点，
    //safari可通过onload+delay闭包组合解决
    id = modules[id] && modules[id].state >= 1 ? _id : getCurrentScript();
    if(!modules[name] && _id) {
      modules[name] = {
        id: name,
        factory: factory,
        state: 1
      }
    }
    factory = args[1];
    factory.id = _id; //用于调试
    factory.delay = function(id) {
      args.push(id);
      var isCycle = true;
      //依赖循环判断
      try {
        isCycle = checkCycle(modules[id].deps, id);
      } catch(e) {

      }
      if(isCycle) {
        $.error(id + '模块与之前的某些模块存在依赖循环')
      }
      delete factory.delay; //释放内存
      require.apply(null, args); //0,1,2 -> 1,2,0
    };
    if(id) {
      factory.delay(id, args);
    } else {
      factorys.push(factory);
    }
  };
  $.define.amd = modules;

  /**
   * 执行factory
   * @param {String} 模块id
   * @param {Array} 依赖列表
   * @param {Function} 模块工厂
   * @api private
   */
  function fireFactory(id, deps, factory) {
    for(var i = 0, array = [], d; d = deps[i++];) {
      array.push(modules[d].exports);
    }
    var module = Object(modules[id]),
        ret = factory.apply(global, array);
    module.state = 2;
    if(ret !== void 0) {
      modules[id].exports = ret;
    }
    return ret;
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
