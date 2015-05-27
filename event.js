define('event',['frame'], function ($) {
  var facade = $.event = {
    special: {

    }
  };
  var eventHooks = facade.special;
  
  /**
   * 检查浏览器对事件是否支持
   * @param {String} 要检测的事件名称；注意没有on
   * @param [Element] 要判断事件的节点，默认为整个文档
   * @return {Boolean}
   */
  $.eventSupport = function(evenName, el) {
  	//此方法只能检测元素节点对某种事件的支持，并且只能检测一般性的事件
  	//对于像表单事件，需要传入input元素进行检测
    el = el || $.html;
    evenName = 'on' + evenName;
    var ret = evenName in el;
    if(el.setAttribute && !ret) {
      el.setAttribute(evenName, '');
      ret = typeof el[evenName] === 'function';
      el.removeAttribute(evenName)
    }
    el = null;
    return ret;
  };

  //为FF判断mousewheel事件
  try{
    //FF需要用DOMMouseScroll事件模拟mousewheel事件
    document.createEvent('MouseScrollEvents');
    eventHooks.mousewheel = {
      bindType: "DOMMouseScroll",
      delegateType: "DOMMouseScroll"
    };
    //如果FF支持了话就删除
    if ($.eventSupport("mousewheel"))
      delete eventHooks.mousewheel;      
  } catch(e) {

  }
  return $;
});
