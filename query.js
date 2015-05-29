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

  $.mix({
    isXML: isXML
  });

  var Query = $.query = function() {

  };
  return Query;
});
