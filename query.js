//====================
//选择器模块
//====================
define('query', ['frame'], function($) {
  var global = this, DOC = global.document;
  /**
   * 判断是否是XML文档
   * @param {Node} 传入任意一个文档节点
   * @return {Boolean}
   */
  function isXML(el) {
    var doc = el.ownerDocument || el;
    return doc.createElement('p').nodeName !== doc.createElement('P').nodeName;  //xml区分大小写
  };

  /**
   * 判断节点是否包含
   * @param {Node} 主节点
   * @param {Node} 要判断的节点
   * @param [Boolean] 允许直接判断是否相等
   * @return {Boolean}
   */
  function contains(a, b, same) {
    if(a === b)
      return !!same;
    if(!b.parentNode)
      return false;
    if(a.contains) {
      a.contains(b);
    } else if(a.compareDocumentPosition) {
      return !!(a.compareDocumentPosition(b) & 16);
    }
    while((b = b.parentNode))
    if(a === b)
      return true;
    return false;
  };
  
  /**
   * 兼容旧版IE的节点位置判断
   * @param {Node}
   * @param {Node}
   * @return {Number} 结果与compareDocumentPosition返回的结果相同
   */
  function comparePosition(a, b) {
    return a.compareDocumentPosition ? a.compareDocumentPosition(b) : 
      a.contains ? (a != b && a.contains(b) && 16) + 
      (a != b && b.contains(a) && 8) + (a.sourceIndex >= 0 && b.sourceIndex >= 0 ? 
        (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2) : 1) : 0;
  };

  /**
   * 节点排序和去重
   * @param {Array} 数组化之后的节点
   * @return {Array} 节点排序和去重后的数组节点
   */
  function unique(nodes) {
    if(nodes.length < 2)
      return nodes;
    var result = [], arr = [], uniqueResult = {}, sortOrder,
        node = nodes[0], index , i, ri = 0, len = nodes.length,
        sourceIndex = typeof node.sourceIndex === 'number',
        comapre = typeof node.compareDocumentPosition === 'function';
    if(!sourceIndex && !comapre) { //旧版本IE的XML
      var all = (node.ownerDocument || node).getElementsByTagName('*');
      for(var index = 0; node = all[index]; index++) {
        node.setAttribute('sourceIndex', index);
      }
      sourceIndex = true;
    }
    if(sourceIndex) { //IE, opera; 和上面处理之后；使用sourceIndex排序 
      sortOrder = function(a, b) {
        return a - b;
      }
      for(i = 0; i < len; i++) {
        node = nodes[i];
        index = (node.sourceIndex || node.getAttribute('sourceIndex'));
        if(!uniqueResult[index]) { //去重
          (arr[ri++] = new Number(index))._ = node;
          uniqueResult[index] = 1; //!1 -> false
        }
      }
      arr.sort(sortOrder); //排序
      while(ri)
        result[--ri] = arr[ri]._;
      return result;
    } else { //直接用compareDocumentPosition排序
      sortOrder = function(a, b) {
        if(a === b) {
          sortOrder.hasDuplicate = true; //标记，去重
          return 0;
        }
        //实际上都是支持的
        if(!a.compareDocumentPosition || !b.compareDocumentPosition)
          return a.compareDocumentPosition ? -1 : 1;
        return a.compareDocumentPosition(b) & 4 ? -1 : 1; //a在b之前，返回-1;
      }
      nodes.sort(sortOrder); //排序
      if(sortOrder.hasDuplicate) { //去重
        for(i = 1; i < nodes.length; i++) {
          if(nodes[i] === nodes[i - 1])
            nodes.splice(i--, 1);
        }
      }
      sortOrder.hasDuplicate = false; //还原
      return nodes;
    }
  };

//==========选择器系统==========
  var reg_combinator = /^\s*([>+~,\s])\s*(\*|(?:[-\w*]|[^\x00-\xa0]|\\.)*)/,
      reg_quick = /^(^|[#.])((?:[-\w]|[^\x00-\xa0]|\\.)+)$/,
      reg_backslash = /\\/g, 
      reg_comma = /^\s*,\s*/,
      reg_tag = /^((?:[-\w\*]|[^\x00-\xa0]|\\.)+)/, //能使用getElementsByTagName处理的CSS表达式
      trimLeft = /^\s+/,
      trimRight = /\s+$/;

  /**
   * 节点数组化
   * @param {Node} 要处理的节点集合
   * @param [Array] 结果集
   * @param [Boolean] 是否出现并联选择器
   */
  function makeArray(nodes, result, flag_multi) {
    nodes = $.slice(nodes); //注意IE56789无法使用数组方法转换节点集合
    //result ? result.push.apply(result, nodes) : (result = nodes);
    result = result ? result.concat(nodes) : nodes;
    return flag_multi ? unique(result) : result;
  };


  /**
   * 选择器
   * @param {String} CSS表达式
   * @param [Node]   上下文
   * @param [Array]  结果集(内部使用)
   * @param [Array]  上次的结果集(内部使用)
   * @param [Boolean] 是否为XML文档(内部使用)
   * @param [Boolean] 是否出现并联选择器(内部使用)
   * @param [Boolean] 是否出现通配符选择器(内部使用)
   * @return {Array}
   */
  function Query(expr, contexts, result, lastResult, flag_xml, flag_multi, flag_dirty) {
    result = result || [];
    contexts = contexts || DOC;
    var pushResult = makeArray;
    if (!contexts.nodeType) { //区分是单个还是多个构成数组形式，实现对多上下文的支持
      contexts = pushResult(contexts);
      if (!contexts.length) return result
    } else {
      contexts = [contexts];
    }
    //保存到本地作用域,用于切割并联选择器
    var rrelative = reg_combinator,
        rquick = reg_quick,
        rBackslash = reg_backslash,
        rcomma = reg_comma,
        rtag = reg_tag,
        context = contexts[0],
        doc = context.ownerDocument || context,
        flag_all, uniqResult, elems, nodes, tagName, last, ri, uid;
    expr = expr.replace(trimLeft, '').replace(trimRight, ''); //去处两边空格
    flag_xml = flag_xml || isXML(doc);
    console.log(isXML(doc));
    if(flag_xml && expr === 'body' && context.body)  //xml
      return pushResult([context.body], result, flag_multi);
    if(!flag_xml && doc.querySelectorAll) {
      console.log('test');
      context = doc;
      query = ".fix_icarus_sqa " + query; //IE8也要使用类名确保查找范围
    }
    

    return elems;
  };

  $.mix({
    isXML: isXML,
    contains: contains,
    comparePosition: comparePosition,
    unique: unique,
    makeArray: makeArray,
    query: Query
  });

  return Query;
});
