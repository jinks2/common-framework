//====================
//选择器模块
//====================
define('query', ['frame'], function($) {
  var global = this, DOC = global.document;

  /**
   * 判断是否是XML文档
   * @param {Element} 传入任意一个文档节点
   * @return {Boolean}
   */
  function isXML(el) {
    var doc = el.ownerDocument || el;
    return doc.createElement('p').nodeName === 'P';
  };

  /**
   * 判断节点是否包含
   * @param {Element} 主节点
   * @param {Element} 要判断的节点
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
   * @param {Element}
   * @param {Element}
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
    var result = [], arr = [], uniqueResult = {}, sortOrder
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
    if(sourceIndex) { //IE, opera; 和上面处理之后
      sortOrder = function(a, b) {
        return a - b;
      }

      for(i = 0; i < len; i++) {
        node = nodes[i];
        index = (node.sourceIndex || node.getAttribute('sourceIndex')) + 1e8;
        if(!uniqueResult[index]) { //去重
          (arr[ri++] = new Number(index))._ = node;
          uniqueResult[index] = 1; //!1 -> false
        }
      }
      arr.sort(sortOrder); //排序
      while(ri)
        result[--ri] = arr[ri]._;
      return result;
    } else {
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
  
  $.mix({
    isXML: isXML,
    contains: contains,
    comparePosition: comparePosition,
    unique: unique
  });

  var Query = $.query = function() {

  };
  return Query;
});
