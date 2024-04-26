import { EffectFn, EffectFnOptions } from './00_interface&type';
import cleanup from './05_cleanup';

let activeEffect: EffectFn | undefined = undefined;
let eFn: EffectFn;
let effectStack: Array<EffectFn>;

let reactiveA = 0;
let reactiveB = 1;

// default:lazy and,no schedular;
export function effect(
  fn: Function,
  options: EffectFnOptions = {
    lazy: true,
    schedular: (fn: Function) => {},
  }
) {
  let eFn: EffectFn = {
    fn: fn,
    deps: [],
    options: options,
  };
  const eFnRegister = () => {
    cleanup(eFn);
    activeEffect = eFn;
    effectStack.push(eFn);
    const res = fn(); //NEW! （￣︶￣）↗
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    // 将compute后的res作为返回值返回
    return res; //NEW! （￣︶￣）↗
  };
  // 只有⾮ lazy 的时候，才auto执⾏
  // lazy:一般利用computed在data是dirty状态时进行'手动'执行 ；（￣︶￣）↗
  if (!options.lazy) {
    eFnRegister();
  }
  return eFnRegister;
}

//test
{
  effect(
    // 指定了 lazy 选项，这个effentFn不会auto invoke,需要manipulate
    () => reactiveA + reactiveB,
    // options
    {
      lazy: true,
      schedular: () => {},
    }
  );
}

function computed_bug(getter: Function) {
  //@value 存储计算后的结果并作为缓存
  let value;
  //@dirty ⽤来标识是否需要重新计算值，为 true 则意味着“脏”，需要recomputing
  let dirty = true;

  const eFnRegister = effect(getter, {
    //只有*.value语句时才会执⾏eFn,只set并不立即执行；---☜(ﾟヮﾟ☜)
    lazy: true,
    schedular: (fn: Function) => {
      dirty = true;
    },
  });

  // lazy 在effect（）中起作用，schedular在trigger（）中起作用
  // 在ref_options查看
  const _ = {
    get value() {
      if (dirty) {
        value = eFnRegister(); // （￣︶￣）↗
        dirty = false;
      }
      return value;
    },
  };
  return _;
}

//test
{
  //1
  let obj = { a: 1, b: 0, c: 0 };
  //2---->~recomputing后修改为dirty=false
  //4---->发现dirty=true；start recomputing~
  const sumReactive = computed_bug(() => obj.a + obj.b + obj.c);
  //3---->invoke Proxy.set/trigger/schedular/修改为dirty=true
  obj = { a: 0, b: 1, c: 0 };

  console.log(sumReactive.value);
  // ⬆ invoke computed内部的get-value();
  // ⬆ invoke effectFn of sumReactive
}

// ===============================================================================================
// 补充：
// 访问器属性：访问器属性是通过 get 和 set 方法来定义的属性。
// --这些方法决定了如何获取和设置属性的值，而不是直接从对象中存储和读取数据。
// --你可以将访问器属性理解为在属性访问时自动执行代码的机制。
// note：
// change value==>Proxy.set(...)===>trigger(...)===>schedular(fn)-->here is 'dirty = true';
// ** dirty 虽然在schedular代码块，但是会向外找到在computed代码块的dirty **
