import { effect } from './11_option_dirty';

// 实现一个watchProxy函数：能读取到某个Proxy对象上的任意属性，并且当任意属性发⽣变化时都能够触发回调函数cb执⾏

// 观察Proxy数据；
export default function watchProxy(source: Object, cb: Function) {
  const readFn = () => readTraverse(source);
  const options = { lazy: false, schedular: (fn: Function) => cb() };
  effect(readFn, options);
}

//by recursion
export const readTraverse = (props: any, readed = new Set()) => {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做;否则加入'已读Set'
  if (typeof props !== 'object' || !props || readed.has(props)) return;
  readed.add(props);
  //读取的数据是object
  for (const key of props) {
    readTraverse(props[key], readed);
  }
  return props;
};
