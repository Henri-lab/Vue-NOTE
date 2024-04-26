import { effect } from './11_option_dirty';
import { readTraverse } from './13_watchproxy';
import { WatchOptions } from './00_interface&type';

// 关于新添watch配置options.immediate的judgement来使得watch的回调可以立即执行，而无需等待观测对象变化;
// Solution:把 scheduler 调度函数封装为⼀个通⽤函数，分别在初始化和变更时执⾏它;

// 关于新添watch配置options.flush的judgement来自定义watch的回调timing;
// --flush 选项控制 watch 的执行时机。有三种可能的值：
// --------pre: 在组件更新之前触发（DEFAULT）x
// --------post: 在组件更新之后触发 √
// --------sync: 同步触发 x

export default function watch(
  source: Object | Function,
  cb: Function,
  options: WatchOptions = { immediate: false }
) {
  let getter: Function;
  if (typeof source === 'object') {
    getter = () => readTraverse(source);
  } else {
    getter = () => source;
  }

  let newValue = undefined;
  let oldValue = undefined;

  //NEW!
  const job = () => {
    newValue = eFnRegister();
    cb(newValue, oldValue);
    oldValue = newValue;
  };

  //setValue后执行
  const eFnRegister = effect(getter, {
    lazy: true,
    schedular: (fn: Function) => {
      //NEW!
      if (options.flush === 'post') {
        // Promise.resolve() 创建了一个立即解决的 Promise;这在async中常用于将代码添加到事件cycle的Microtask Queue中，以确保在当前任务即watch内部logic完成后执行
        const p = Promise.resolve();
        p.then(() => job());
      } else job();
    },
  });

  //immediate 为 true:⽴即invoke 'job'，从⽽invoke 'cb'
  //owing to 'cb' here 不是 观测值变化而invoke+ enRegister还没有invoke： 传入回调cd的oldValue is the undefined
  if (options.immediate) job();
  else oldValue = eFnRegister();
}
