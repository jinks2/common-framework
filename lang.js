define('lang',['frame'], function ($) {
  var global = this, defineProperty = Object.defineProperty;
  function method(obj, prop, val) {
    if(!obj[name]) {
      defineProperty(obj, prop, {
      	configurable: true,
      	enumerable: false,
      	writable: true,
      	value: val
      });
    }
  };

  function methods(obj, map) {
  	for(var prop in name) {
  	  method(obj, prop, map[prop]);
  	}
  }
  function contains() {

  };
  return $;
});
