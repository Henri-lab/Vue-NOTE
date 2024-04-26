const data = { text: 'oi!' };
const func = () => {};
// 解决effect function的通用性

// activeEffect作为一个中间人(effect register)，将任何函数甚至匿名函数引入到bucket中
let activeEffect: Function | undefined = undefined;
let bucket: Set<Function> = new Set();

function effect(fn: Function) {
  activeEffect = fn;
  fn(); //༼ つ ◕_◕ ༽つ 这里register后立即执行！~后面会有懒加载的设计~
}
// register an effectFunction
effect(func);
// create a new Proxy
const proxy = new Proxy(data, {
  get(target, key) {
    if (activeEffect) {
      // 引入effectFunction
      bucket.add(activeEffect);
    }
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    bucket.forEach((fn) => fn());
    return true;
  },
});

export { activeEffect };
