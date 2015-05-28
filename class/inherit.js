 //一个基本的原型继承
 
 function inherit(init, Parent, proto) {
   var extend = function(target, source) {
     for(var prop in source)
       target[prop] = source[prop]
     return target;
   };
   function Son() {
     Parent.apply(this, arguments);
     init.apply(this, arguments);
   };

   Son.prototype = Object.create(Parent.prototype);
   Son.prototype.constructor = Son;
   Son.prototype.toString = Parent.prototype.toString; //iE Bug
   Son.prototype.valueOf = Parent.prototype.valueOf; //iE Bug

   extend(Son.prototype, proto);  //添加子类特有的原型成员
   extend(Son, Parent);
   return Son;
 };

 //examples
 function Parent(name, age) {
   this.name = name;
   this.icon = 'Parent';
 };
 Parent.a = 'Parent.a';
 Parent.prototype.a = 'a';

 function init(name, age) {
   this.age = age;
   this.icon = 'init';
 };

 var Son = inherit(init, Parent, {c:'c'});
 var son = new Son('jinks',24);
 console.log(son);
