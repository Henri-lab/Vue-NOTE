import { effect } from './11_option_dirty';
import watchProxy from './13_watch_Proxy';
//watch：第一个参数可以为getter函数，也可以为watch1那样观测一个Proxy数据；
//在 getter 函数内部，⽤户可以指定该 watch 依赖哪些响应式数据，只有当这些数据变化时，才会触发回调函数执⾏
export default function watch(source: Object | Function, cb: Function) {
  if (typeof source === 'object') watchProxy(source, cb);
  else {
    const getter = () => source;
    const options = { lazy: false, schedular: (fn?: Function) => cb() };
    effect(getter, options);
  }
}
