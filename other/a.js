//一个简单的框架

(function() {
  !window.A && (window['A'] = {});

  function $() {
    var elements = [], len = arguments.length;
    for(var i = 0; i < len; i++) {
      var element = arguments[i];
      if(typeof element === 'string') {
          element = document.getElementById(element);
      }
      if(len === 1) {
          return element;
      } else {
          elements.push(element);
      }
    } 
    return elements;   
  };

  //兼容性
  A.isCompatible = function(other) {
    if(other === false || !Array.prototype.push || !Object.hasOwnProperty 
      || !document.createElement || !document.getElementsByTagName) {
      return false;
    }
    return true;
  };
  //元素
  A.$ = $;
  A.getByClass = function(className, tag, parent) {
    parent = parent || document;
    tag = tag || '*';
    if(!(parent = $(parent))) return false;
    var allTags = (tag === '*' && parent.all) ? parent.all : parent.getElementsByTagName(tag);
    var matchingElements = [];
    className = className.replace(/\-/g, '\\-');
    var regex = new RegExp('(^|\\s)' + className + '(\\s|$)');
    var element;
    for(var i = 0, len = allTags.length; i < len; i++) {
      element = allTags[i];
      if(regex.test(element.className)) {
          matchingElements.push(element);
      }
    }
    return matchingElements;
  };
  A.getByTagName = function(tagName, parent) {
    parent = parent || document;
    tagName = tagName || '*';
    if(!(parent = $(parent))) return false;
    var allTags = (tagName === '*' && parent.all) ? parent.all : parent.getElementsByTagName(tagName);
    var matchingElements = [];
    var regex = new RegExp('(^|\\s)' + tagName.toUpperCase() + '(\\s|$)');
    var element;
    for(var i = 0, len = allTags.length; i < len; i++) {
      element = allTags[i];
      if(regex.test(element.tagName)) {
          matchingElements.push(element);
      }
    }
    return matchingElements;
  };
  A.create = function(tag, html) {
    if(!tag) return false;  
    html = html || '';
    var node = document.createElement(tag);
    node.innerHTML = html;
    return node; 
  };
  A.insertAfter = function(changeNode, referenceNode) {
    if(!(changeNode = $(changeNode))) return false;
    if(!(referenceNode = $(referenceNode))) return false;
    return referenceNode.parentNode.insertBefore(changeNode, referenceNode.nextSibling);
  };
  A.removeChild = function(parent) {
    if(!(parent = $(parent))) return false;
    while(parent.firstChild) {
      parent.firstChild.parentNode.removeChild(parent.firstChild);
    }
    return parent;
  };
  A.prependChild = function(parent, newChild) {
    if(!(parent = $(parent))) return false;
    if(!(newChld = $(newChld))) return false;
    if(parent.firstChild) {
      parent.insertBefore(newChild, parent.firstChild);
    } else {
      parent.appendChild(newChild);
    }
    return parent;
  };
  A.toggleDisplay = function(node, value) {
    if(!(node = $(node))) return false;
    var display = node.style.display;
    node.style.display = (display === 'none') ? (value || '') : 'none';
    return true;
  };
  //事件
  A.addEvent = function(node, type, listener) {
    if(!(node = $(node))) return false;
    if(node.addEventListener) {
      node.addEventListener(type, listener, false);
      return true;
    } else if(node.attachEvent) {
      node.attachEvent('on' + type, listener);
      return true;
    }
    return false;
  };
  A.removeEvent = function(node, type, listener) {
    if(!(node = $(node))) return false;
    if(node.removeEventListener) {
      node.removeEventListener(type, listener, false);
      return true;
    } else if(node.attachEvent) {
      node.detachEvent('on' + type, listener);
      return true;
    }
    return false;
  };
  A.stopPropagation = function(event) {
    event = event || window.event;
    if(event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancalBubble = true;
    }
  };
  A.preventDefault = function(event) {
    event = event || window.event;
    if(event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  };
  A.getTarget = function(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;
    if(target.nodeType == this.node.TEXT_NODE) {
      target = node.parentNode;
    }
    return target;
  };
  A.getMouseButton = function(event) {
    event = event || window.event;
    var buttons = {
      'left': false,
      'middle': false,
      'right': false
    };
    if(event.toString && event.toString().indexOf('MouseEvent') != -1) {
      switch(event.button) {
        case 0: buttons.left = true; break;
        case 1: buttons.middle = true; break;
        case 2: buttons.right = true; break;
        default: break;
      }
    } else if(event.button) {
      switch(eventObject.button) {
        case 1: buttons.left = true; break;
        case 2: buttons.right = true; break;
        case 3:
          buttons.left = true;
          buttons.right = true;
          break;
        case 4: buttons.middle = true; break;
        case 5:
          buttons.left = true;
          buttons.middle = true;
          break;
        case 6:
          buttons.middle = true;
          buttons.right = true;
          break;
        case 7:
          buttons.left = true;
          buttons.middle = true;
          buttons.right = true;
          break;
        default: break;
      }
    } else {
      return false;
    }
    return buttons;
  };
  A.getPointerPosition = function(event) {
    event = event || window.event;
    var x = event.pageX || (event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
    var y = event.pageY || (event.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
    return {'X':x, 'Y':y};
  },
  A.getKeyPress = function(event) {
    event = event || window.event;
    var code = event.keyCode;
    var value = String.fromCharCode(code);
    return {'code': code, 'value': value};
  },
  A.addLoadEvent = function(loadEvent, waitForImages) {
    if(!this.isCompatible()) return false;
    if(waitForImages) {
      return this.addEvent(window, 'load', loadEvent);
    }
    var init = function() {
      if(arguments.callee.done) return;
      arguments.callee.done = true;
      loadEvent.apply(document, arguments);
    }    ;
    if(document.addEventListener) {
      document.addEventListener('DOMContentLoaded', init, false);
    }
    //safari
    if(/Webkit/i.test(navigator.userAgent)) {
      var _timer = setInterval(function() {
        if(/loaded|complete/.test(document.readyState)) {
          clearInterval(_timer);
          init();
        }
      }, 10);
    }
    //IE
    /*@cc_on @*/
    /*@if (@_win32)
    document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
    var script = document.getElementById("__ie_onload");
    script.onreadystatechange = function() {
      if (this.readyState == "complete") {
          init();
      }
    };
    /*@end @*/
    return true
  };
  //节点
  A.node = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  }; 
  A.walkElements = function(func, node) {
    var root = node || window.document;
    var nodes = root.getElementsByTagName('*');
    if(!func) return;
    for(var i = 0,len = nodes.length; i < len; i++) {
      func.call(nodes[i]);
    } 
  };
  A.walkTheDom = function(func, node){
    var root = node || window.document;
    if(!func) return;
    func.call(root);
    node = root.firstChild;
    while(node && node) {
      this.walkTheDom(func, node);
      node = node.nextSibling;
    }
  };
  //样式
  A.setStyleById = function(elem, styles) {
    if(!(element = $(elem))) return false;
    for(property in styles) {
      if(!styles.hasOwnProperty(property)) continue;
      if(element.style.setProperty) {
        element.style.setProperty(property, styles[property], null);
      } else {
        element.style[property] = styles[property];
      }
    }  
  };
  A.setStyleByClassName = function(className, styles, tag, parent) {
    tag = tag || '*';
    parent = $(parent) || document;
    var elements = this.getByClass(className, tag, parent);
    for(var i = 0, len = elements.length; i < len; i++) {
      this.setStyleById(elements[i], styles);
    }
    return true;
  };
  A.setStylesByTagName = function(tagName, styles, parent) {
    parent = $(parent) ||document;
    var elements = this.getByTagName(tagName, parent);
    for(var i = 0,len = elements.length; i < len; i++) {
      this.setStyleById(elements[i], styles);
    }
  };
  A.getClassNames = function(element) {
    if(!(element = $(element))) return false;
    return element.className.replace(/\s+/, ' ').split(' ');
  };
  A.hasClassName = function(element, className) {
    if(!(element = $(element))) return false;
    var classes = this.getClassNames(element);
    for(var i = 0,len = classes.length; i < len; i++) {
      if(classes[i] === className) return true;
    }
    return false;
  };
  A.addClassName = function(element, className) {
    if(!(element = $(element))) return false;
    element.className += (element.className ? ' ' : '') + className;
    return true;
  }; 
  A.removeClassName = function(element, className) {
    if(!(element = $(element))) return false;
    var classes = this.getClassNames(element);
    var len = classes.length;
    for(var i = len - 1; i >= 0; i--) {
      if(classes[i] === className) {
        delete(classes[i]);
        classes.length--;
      }
    }
    element.className = classes.join(' ');
    return (len === classes.length ? false : true);
  };  
  A.toggleClassName = function(element, className) {
    this.hasClassName(element, className) ? this.removeClassName(element, className) : this.addClassName(element, className);
  };
  A.getStyleSheets = function(url, media) {
    var sheets = [];
    var styles = document.styleSheets;
    for(var i = 0, len = styles.length; i < len; i++) {
      if(url && styles[i].href.indexOf(url) == -1) continue;
      if(media) {
        media = media.replace(/,\s*/,',');
        var sheetMedia;
        if(styles[i].media.mediaText) {
          sheetMedia = styles[i].media.mediaText.replace(/,\s*/, ',');
          sheetMedia = sheetMedia.replace(/,\s$/,'');
        } else {
          sheetMedia = styles[i].media.replace(/,\s*/,',');
        }
        if(media != sheetMedia) continue;
      }
      sheets.push(styles[i]);
    }
    return sheets;
  };
  A.addStyleSheet = function(url, media) {
    media = media || 'screen';
    var link = document.createElement('LINK');
    document.getElementsByTagName('head')[0].appendChild(link);
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', url);
    link.setAttribute('media', media);
  };
  A.removeStyleSheet = function(url, media) {
    var styles = this.getStyleSheets(url, media);
    for(var i = 0, len = styles.length; i < len; i++) {
      var node = styles[i].ownerNode || style[i].owningElement;
      styles[i].disabled = true;
      node.parentNode.removeChild(node);
    }
  };
  A.editCSSRule = function(selector, styles, url, media) {
    var styleSheets = (typeof url == 'array' ? url : this.getStyleSheets(url, media));
    for(var i = 0, len = styleSheets.length; i < len; i++) {
      var rules = styleSheets[i].cssRules || styleSheets[i].rules;
      if(!rules) continue;
      selector = selector.toUpperCase();
      for(var j = 0, length = rules.length; j < length; j++) {
        if(rules[j].selectorText.toUpperCase() == selector) {
          for(property in styles) {
            if(!styles.hasOwnProperty(property)) continue;
            rules[j].style[property] = styles[property];
          }
        }
      }
    }
  };
  A.addCSSRule = function(selector, styles, index, url, media) {
    var declaration = '';
    for(property in styles) {
      if(!styles.hasOwnProperty(property)) continue;
      declaration += property + ':' + styles[property] + '; ';
    }
    var styleSheets = (typeof url == 'array' ? url : this.getStyleSheets(url, media));
    var newIndex;
    for(var i = 0, len = styleSheets.length; i < len; i++) {
      if(!styleSheets[i].href) {
        newIndex = (index >= 0 ? index : styleSheets[i].cssRules.length);
        styleSheets[i].insertRule(selector + ' { ' + declaration + ' } ', newIndex);
      } else {
        newIndex = (index >= 0 ? index : -1);
        styleSheets[i].addRule(selector, declaration, 1);
      }
    }
  };
  A.getStyleById = function(element, property) {
    if(!(element = $(element)) || ! property) return false;
    var value = element.style[property];
    if(!value) {
      if(document.defaultView && document.defaultView.getComputedStyle) {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css.getPropertyValue(property) : null;
      } else if(element.currentStyle) {
        value = element.currentStyle[property];
      }
    }
    return value == 'auto' ? ''  : value;
  };
  //其他
  A.bind = function(obj, func) {
    return function() {
      func.apply(obj, arguments);
    } 
  };
  A.getBrowserWindowSize = function() {
    var de = document.documentElement;
    return {
      'width' :(window.innerWidth || (de && de.clientWidth) || document.body.clientWidth),
      'height' : (window.innerHeight || (de && de.clientHeight) || document.body.clientHeight)
    }
  };
  A.camelize = function(s) {
    return s.replace(/-(\w)/g, function (strMatch, p1){
      return p1.toUpperCase();
    });
  };
  //日志
  function myLogger(id) {
    id = id || 'ADSLogWindow';
    var logWindow = null;
    var createWindow = function() {
      var browserWindowSize = A.getBrowserWindowSize();
      var top = ((browserWindowSize.height - 200) / 2) || 0;
      var left = ((browserWindowSize.width - 200) / 2) || 0;
      logWindow = document.createElement('UL');
      logWindow.setAttribute('id', id);
      logWindow.style.position = 'absolute';
      logWindow.style.top = top + 'px';
      logWindow.style.left = left + 'px';
      logWindow.style.width = '200px';
      logWindow.style.height = '200px';
      logWindow.style.overflow = 'scroll';
      logWindow.style.padding= '0';
      logWindow.style.margin= '0';
      logWindow.style.border= '1px solid black';
      logWindow.style.backgroundColor= 'white';
      logWindow.style.listStyle= 'none';
      logWindow.style.font= '10px/10px Verdana, Tahoma, Sans';
      document.body.appendChild(logWindow);  
    };
    this.writeRaw = function (message) {
      if(!logWindow) createWindow();
      var li = document.createElement('LI');
      li.style.padding= '2px';
      li.style.border= '0';
      li.style.borderBottom = '1px dotted black';
      li.style.margin= '0';
      li.style.color= '#000';
      li.style.font = '9px/9px Verdana, Tahoma, Sans';
      if(typeof message == 'undefined') {
        li.appendChild(document.createTextNode('Message was undefined'));
      } else if(typeof li.innerHTML != undefined) {
        li.innerHTML = message;
      } else {
        li.appendChild(document.createTextNode(message));
      }
      logWindow.appendChild(li);
      return this;
    };
  }
  myLogger.prototype = {
    write: function(message) {
      if(typeof message == 'string' && message.length==0) {
          return this.writeRaw('ADS.log: null message');
      }
      if (typeof message != 'string') {
      if(message.toString) return this.writeRaw(message.toString());
          else return this.writeRaw(typeof message);
      }
      message = message.replace(/</g,"&lt;").replace(/>/g,"&gt;");
      return this.writeRaw(message);
    },
    header: function(message) {
      message = '<span style="color:white;background-color:black;font-weight:bold;padding:0px 5px;">' + message + '</span>';
      return this.writeRaw(message);
    }
  };
  A.log = new myLogger(); 
})();
