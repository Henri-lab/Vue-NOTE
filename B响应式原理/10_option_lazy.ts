import { EffectFn } from './00_interface&type';
import cleanup from './05_cleanup';

let activeEffect: EffectFn | undefined = undefined;
let eFn: EffectFn;
let effectStack: Array<EffectFn>;

// default lazy is true!
export default function effect(fn: Function, options = { lazy: true }) {
  let eFn: EffectFn={
    fn:fn,
    deps: [],
    options: options,
  };
  const eFnRegister = () => {
    cleanup(eFn);
    activeEffect = eFn;
    effectStack.push(eFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  // 只有⾮ lazy 的时候，才执⾏
  if (!options.lazy) {
    // NEW!
    eFnRegister();
  }
  // 将副作⽤函数作为返回值返回
  return eFn; // NEW!
}

// test
{
  effect(
    () => {
      console.log('lazy');
    }
    // options:defaultLasy
  );

  effect(
    () => {
      console.log('notLazy');
    },
    // options
    {
      lazy: false,
    }
  );
}
