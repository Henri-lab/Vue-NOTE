import { effect } from './11_option_dirty';
import { readTraverse } from './13_watch_Proxy';

//如何在回调函数中拿到旧值与新值？--使⽤ lazy 选项!!
// ╰(￣ω￣ｏ)：watch 的本质其实是对 effect 的⼆次封装,利⽤了 effect 以及scheduler: (fn) => cb();
// 注意eFnRegister invoke的timing和value新旧之间的relation;

export default function watchNewOld(source: Object | Function, cb: Function) {
  let getter: Function;
  if (typeof source === 'object') {
    getter = () => readTraverse(source);
  } else {
    getter = () => source;
  }

  let newValue: any= undefined;
  let oldValue: any = undefined;

  const eFnRegister = effect(getter, {
    lazy: true,
    schedular: (fn?: Function) => {
      // 在 (proxy/set/trigger)/scheduler 中重新执⾏副作⽤fn，得到的res是newValue;
      newValue = eFnRegister();
      //给回调func传递新旧value;
      cb(newValue, oldValue);
      //更新oldValue，不然下⼀次会得到oldValue的oldValue;
      oldValue = newValue;
    },
  });
  // here执⾏的副作⽤fn，得到的res是oldValue;
  oldValue = eFnRegister();
}
