 function extend(target, source) {
   for(var prop in source)
     target[prop] = source[prop]
   return target;
 };

 function inherit(init, Parent, proto) {
   function Son() {
     Parent.apply(this, arguments);
     init.apply(this, arguments);
   }
   Son.prototype = Object.create(Parent.prototype);
   Son.prototype.constructor = Son;
   Son.prototype.toString = Parent.prototype.toString; //iE Bug
   Son.prototype.valueOf = Parent.prototype.valueOf; //iE Bug
   extend(Son.prototype, proto);  //添加子类特有的原型成员
   extend(Son, Parent);
   return Son;
 };

 //examples
 function Parent(args) {
   this.name = args.name;
   this.icon = 'Parent';
 };
 Parent.a = 'a';
 Parent.prototype.a = 'a';

 function init(args) {
   this.age = args.age;
   this.icon = 'init';
 };

 var Son = inherit(init, Parent, {c:'c'});
 var son = new Son({name:'son',age:23});
