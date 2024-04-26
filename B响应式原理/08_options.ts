// 可调度，指的是当 trigger 动作触发副作⽤函数重新执⾏时，有能⼒决定副作⽤函数执⾏的时机、次数以及⽅式。
//

import { EffectFn, Bucket } from './00_interface&type';
import cleanup from './05_cleanup';

let activeEffect: EffectFn | undefined = undefined;
let effectStack: Array<EffectFn> = [];

function effect(fn: Function, options = {}) {
  let eFn: EffectFn = {
    fn,
    deps: [],
    options: options,
  };
  const eFnRegister = () => {
    cleanup(eFn);
    // metaphor：
    // ^登记
    activeEffect = eFn;
    // ^入场
    effectStack.push(eFn);
    // ^showTimeF
    fn();
    // ^离场
    effectStack.pop();
    // ^下一位
    activeEffect = effectStack[effectStack.length - 1];
  };
  eFnRegister();
}

// test:用于控制effectFn执行时机的options

function func() {
  console.log('i will be late!');
}
function schedular(fn:Function) {
  setTimeout(fn,1000);
}
effect(func, { schedular });

//改进trigger能够执行options of effectFn
let bucket: Bucket;
function trigger(target: object, key: string) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effectFns: Set<EffectFn> | undefined = depsMap.get(key);
  if (effectFns) {
    const effectToRun: Set<EffectFn> = new Set();
    effectFns &&
      effectFns.forEach(
        (effectFn) => effectFn !== activeEffect && effectToRun.add(effectFn)
      );
    effectToRun.forEach((effectFn) => {
      if (effectFn.options && effectFn.options.schedular)
        effectFn.options.schedular(effectFn.fn);
      else effectFn.fn();
    });
  }
}

export { trigger };
