// activeEffect如果只有一个，无法handle nestEffectFn;其值会由内层effectFn会覆盖外层effectFn,but won't recover；
// lead to：某个数据的依赖明明是外层effectFn，结果依赖set被注入内层effectFn;

// Solution:副作用函数栈effectStack,实现内层覆盖后可以recover；
// 当副作⽤函数发⽣嵌套时，栈底存储的就是外层副作⽤函数，⽽栈顶存储的则是内层副作⽤函数:如此⼀来，响应式数据就只会收集直接读取其值的副作⽤函数作为依赖，从⽽避免发⽣错乱
import { EffectFn } from './00_interface&type';
import cleanup from './05_cleanup';
let activeEffect: EffectFn | undefined = undefined;
let eFn: EffectFn;
const effectStack: Array<EffectFn> = [];

function effect(fn: Function) {
  const eFnRegister = () => {
    cleanup(eFn);
    activeEffect = eFn;
    effectStack.push(eFn);
    fn();
    // 当前副作用执行完毕~
    // recover
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    //
    activeEffect.fn();
  };
  eFnRegister();
}
// ==========================================================================================
// 场景示例：
// old effect function
// effect(function effectFn1() {---------------------------------active：Fn1
//   console.log('effectFn1 执⾏');
//
//   effect(function effectFn2() {-------------------------------active：Fn2
//     console.log('effectFn2 执⾏');
//    temp2 = obj.bar; // 在 effectFn2 中读取 obj.bar 属性 -------active：Fn2
//   });
//
//   temp1 = obj.foo;// 在 effectFn1 中读取 obj.foo 属性 ---------active：Fn2
// });
//
// #
//  'effectFn1 执⾏'
//  'effectFn2 执⾏'
//  'effectFn2 执⾏'

// ===========================================================================================

// promote effect function
// effect(function effectFn1() {---------------------------------active：Fn1
//   console.log('effectFn1 执⾏');
//
//   effect(function effectFn2() {-------------------------------active：Fn2
//     console.log('effectFn2 执⾏');
//    temp2 = obj.bar; // 在 effectFn2 中读取 obj.bar 属性 -------active：Fn2 ; pop ;active=Fn1
//   });
//
//   temp1 = obj.foo;// 在 effectFn1 中读取 obj.foo 属性 ---------active：Fn1
// });
//
// #
//  'effectFn1 执⾏'
//  'effectFn2 执⾏'
//  'effectFn1 执⾏'
