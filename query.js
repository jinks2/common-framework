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

  $.mix({
    isXML: isXML,
    contains: contains,
    comparePosition: comparePosition
  });

  var Query = $.query = function() {

  };
  return Query;
});
