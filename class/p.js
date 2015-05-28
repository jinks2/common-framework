//修改自 https://github.com/jayferd/pjs

var P = (function () {
  //对象判断
  var isObject = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  //函数判断
  var isFunction = function(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
  };
  
  //自有属性判断
  var hasOwn = function(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  //
  function BareConstructor () {};

  return function P(_superclass, definition) {
    //如果只传一个参数
    if(definition === undefined) {
      definition = _superclass;
      _superclass = Object;
    };

    //要返回的子类，definition中的init为用户构造器
    function C(){
      var self = new Bare;
      if(isFunction(self.init))
      	self.init.apply(self, arguments);
      return self;
    };

    //这个构造器是为了让C不用new就能返回实例
    function Bare() {

    };

    C.Bare = Bare;
    //为了防止改动子类影响到父类，我们讲父类的原型赋给一个中介者
    //然后再改动这个中介者的实例作为子类的原型
    var _super = BareConstructor.prototype = _superclass.prototype;
    var proto = Bare.prototype = C.prototype = new BareConstructor;

    //然后C与Bare都共享一个原型
    //最后修正子类的构造器指向自身
    proto.constructor = C;

    //类方法mixin,将def对象里面的属性与方法赋到原型里面
    C.mixin = function(def) {
      Bare.prototype = C.prototype = P(C, def).prototype;
      return C;
    };
    
    //definition最后到这里才作用
    C.open = function(def) {
      var extensions = {};
      if(isFunction(def)) {
        extensions = def.call(C, proto, _super, C, _superclass);
      } else if(isObject(def)) {
      	extensions = def;
      }
      if(isObject(extensions)) {
      	for(var ext in extensions) {
      	  if(hasOwn(extensions, ext)) {
      	  	proto[ext] = extensions[ext];
      	  }
      	}
      }
      if(!isFunction(proto.init)) {
      	proto.init = _superclass;
      }
    };

    C.open(definition);
    return C;
  };

}());


//example
//创建一个基本类
var Animal = P(function(proto, superProto) {
  //构造函数
  proto.init = function(name) {
    this.name = name;
  };
  //原型方法
  proto.move = function(meters) {
    console.log(this.name + ' moved ' + meters);
  };
});

var a = new Animal('aaa');
var b = Animal('bbb');

a.move(2);
b.move(3);

//根据基本类(父类)创建一个子类
var Snake = P(Animal, function(snake, animal) {
  snake.init = function(name, eyes) {
    animal.init.apply(this, arguments);
    this.eyes = 2;
  };
  snake.move = function() {
  	console.log('Slithering..');
  	animal.move.call(this, 5);  //调用父类同名的方法
  };
});
var s = new Snake('snake', 1);
s.move();
console.log(s.name);
console.log(s.eyes);

//私有属性
var Cobra = P(Snake, function(cobra) {
  var age = 1;
  cobra.glow = function() {
    return age++;
  };
});

var c = new Cobra('cobra');
console.log(c.glow());
console.log(c.glow());






