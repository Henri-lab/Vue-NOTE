//@trigger:将data(:obj.value)的deps中的efn依次执行
import { trigger } from './08_options';
//@track:将当前激活的efn放入data(:obj.value)的deps
import { track } from './04_leftEffect';

//@proxyCreater:将一个对象封装为一个proxy对象，并overwrite相关的get/set
function proxy(data: Object) {
  return new Proxy(data, {
    get(target: typeof data, key: string) {
      track(target, key);
      return target[key];
    },
    set(
      target: typeof data,
      key: string,
      value: Object | number | string | undefined
    ) {
      target[key] = value;
      trigger(target, key);
      return true;
    },
  });
}

export default function proxyCreater(data: any) {
  return proxy(data) as typeof data;
}

// 👁‍🗨 Proxy 主要用于创建对象的代理，拦截对象的各种操作，确保对象具备响应性；
// 所谓代理，指的是对⼀个对象基本语义的代理。它允许我们拦截并重新定义对⼀个对象的基本操作；
// 它可以用于对象（包括数组、函数、类实例等），但不能用于基本数据类型（如字符串、数字、布尔值等），因为基本数据类型是不可变的，没有属性供拦截；

// Proxy 对象的应用范围
// -对象：Proxy 可用于对象的属性访问、修改等操作；
// -数组：Proxy 可用于拦截数组的各种操作，如访问、修改、遍历等；
// -函数：Proxy 可用于拦截函数的调用和属性访问；
// -类实例：Proxy 可用于拦截类实例的属性访问、方法调用等；

// Proxy 适用于复杂结构
// -响应式系统：Vue 3 使用 Proxy 为对象添加响应性；
// -安全控制：Proxy 可以用于控制对象的访问权限，确保敏感数据安全；
// -调试工具：Proxy 可用于拦截对象操作，帮助调试和日志记录；

// Proxy 的局限性
// -基本数据类型：无法用于基本数据类型；
// -不支持深层代理：Proxy 只代理直接的对象，不能自动代理嵌套对象。为实现深层代理，需要手动处理嵌套结构；
// -性能影响：Proxy 的性能可能比直接操作对象略低，特别是在大量操作的情况下；
