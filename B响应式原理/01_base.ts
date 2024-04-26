// 核心:
// object.property=?--------->set()
// document.body.innerText=object.property---------->get()
// proxy代理重写set/get

// ⼀个响应系统的⼯作流程如下：
// -当读取操作发⽣时，将副作⽤函数收集到“桶”中；
// -当设置操作发⽣时，从“桶”中取出副作⽤函数并执⾏。

const bucket: Set<Function> = new Set();
const data = { text: 'oi!' };
const effect = () => {
  document.body.innerText = data.text;
};
// --给data响应性
// --get的同时已经拥有响应性的条件了，只需在set后进行invoke...
// --invoke get函数是响应性的基础
const proxy = new Proxy(data, {
  get(target, key) {
    bucket.add(effect);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    bucket.forEach((fn) => fn()); //update view
    return true;
  },
});
