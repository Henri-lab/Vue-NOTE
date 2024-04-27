import { effect } from './11_option_dirty';
import { readTraverse } from './13_watch_Proxy';
import { WatchOptions } from './00_interface&type';
import proxyCreater from './00_proxyCreater';
// Race problems竞态问题
// 场景：多个异步操作返回的数据的竞争;
// Solution:mark 'expired' propValue of 'cb' to the effectFn;

export default function watch(
  source: Object | Function,
  cb: Function = (
    newValue?: any,
    oldValue?: any,
    onInvalidate?: Function
  ) => {},
  options: WatchOptions = { immediate: false }
) {
  let getter: Function;
  if (typeof source === 'object') {
    getter = () => readTraverse(source);
  } else {
    getter = () => source;
  }

  let newValue: any = undefined;
  let oldValue: any = undefined;
  // cleanup ⽤来存储user注册的expired callback
  let cleanup: Function | undefined = undefined;
  // NEW!
  // user用来注册expired callback的onInValidate
  function onInvalidate(fn: Function) {
    cleanup = fn;
  }

  const job = () => {
    newValue = eFnRegister();
    // NEW!
    if (cleanup) cleanup();
    cb(newValue, oldValue, onInvalidate); // -------------------------------invoke 'job/cb'时，同时将创建的newV/oldV/onvalidate传递出去;(☞ﾟヮﾟ)☞

    oldValue = newValue;
  };

  const eFnRegister = effect(getter, {
    lazy: true,
    schedular: (fn?: Function) => {
      if (options.flush === 'post') {
        const p = Promise.resolve();
        p.then(() => job());
      } else job();
    },
  });

  if (options.immediate) job();
  else oldValue = eFnRegister();
}

// testo
let finalDate: any = undefined;
const obj = proxyCreater({ prop: 0, name: 'test' });
async function request(_newV: any, _oldV: any, onInvalidate: Function) {
  // expired controls behavior of the 'cb';
  // each 'request cb' has own expired;
  let expired = false;

  const setExpired = () => (expired = true);
  onInvalidate(setExpired); //-----------------------------------------------使得'cb'内部可以传入'setExpired';☜(ﾟヮﾟ☜)

  const res = await fetch('--url');

  if (!expired) finalDate = res;
}

watch(obj, request);
obj.prop++;
setTimeout(() => obj.prop++, 100);

// As shown in the code snippet above, we changed the value of `obj.prop` twice.
// The first change was immediate, triggering the execution of the watch callback function.
// Since we call `onInvalidate` within the callback, it registers an invalidation callback and then sends request A.
// Suppose request A takes 1,000 milliseconds to return a result, but at 200 milliseconds, we change the value of `obj.prop` again, which triggers the watch callback function once more.
// An important point to note is that, in our implementation, we always check whether an invalidation callback exists before executing the watch callback function.
// If it does, the invalidation callback is executed first.
// Because we registered an invalidation callback when the watch callback was executed for the first time,
// before the second execution, the previously registered invalidation callback is executed,
// causing the `expired` variable in the closure of the first watch callback to become `true`, indicating that the effect has expired.
// This means that when request A finally returns, its result is discarded, thus preventing the outdated effect from causing issues.
