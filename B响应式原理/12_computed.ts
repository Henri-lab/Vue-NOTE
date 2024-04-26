// **computed 引起的 nestEffectFn 现象：computed属性change后无法autolly重新render**

// 场景：当我们在另外⼀个 effect 中读取计算属性的值时。
// Solution：在schedular中手动trigger并且在getValue时手动track；

// Essentially, this is a typical case of effect nesting.
// A computed property contains its own effect, and it's lazy, meaning it only executes when the computed property's value is actually read.
// Regarding the computed property's getter function, any reactive data accessed within it will collect only the inner effect as a dependency.
// However, when a computed property is used within another effect, effect nesting occurs.In this case, the outer effect won't collect the reactive data from the inner effect as its dependency.

// @effect(fn,options) will do the following and defaultis 'lazy and no schedular';
{
  // 1.create an 'effectFn';
  // ---effectFn is a customObj includes 'fn'，then add properties like 'deps', 'options',...
  // 2.clean the 'effectsFn' deps;
  // 3.configure the 'effectFn' options;
  // 4.register 'effectFn' as an activeEffect;
  // 5.effect(fn,options) will return a function as the 'effectFnRegister';
  // ---the 'effectFnRegister()' will return the result of the 'fn' invoked
}
import { effect } from './11_option_dirty';
//@trigger:将data(:obj.value)的deps中的efn依次执行
import { trigger } from './08_options';
//@track:将当前激活的efn放入data(:obj.value)的deps
import { track } from './04_leftEffect';
//@proxyCreater:将一个对象封装为一个proxy对象，并overwrite相关的get/set
import proxyCreater from './00_proxyCreater';

// Solution:重新设计schedular和computed：
function computed(getter: Function) {
  let value: Object | number | string | undefined;
  let dirty = true;

  const eFnRegister = effect(getter, {
    lazy: true,
    schedular: (fn: Function) => {
      if (!dirty) {
        dirty = true;
        // 手动update
        trigger(obj, 'value');
      }
    },
  });

  const obj = {
    get value() {
      if (dirty) {
        value = eFnRegister();
        dirty = false;
      }
      // 手动:add 'eFnRegister中注册的eFn' 至obj.value的deps;
      track(obj, 'value');
      return value;
    },
  };

  return obj;
}

// =============================================================================================
let sumDeps = {
  a: 1,
  b: 0,
};

const proxySumDeps = proxyCreater(sumDeps);

effect(function outer() {
  const sumComp = computed(() => proxySumDeps.a + proxySumDeps.b);
  console.log(sumComp.value);
});

// sumComp 即返回的obj不是一个Proxy数据，所以没法auto触发get-track/set-trigger；
// 读取 obj.value之后：1.dirty=false；2.obj.value拥有了依赖eFn；
// 修改 deps.prop之后：1.trigger invokes；2.trigger调用的schedular中调用的trigger invokes；


