import { EffectFn, Bucket } from './00_interface&type';
import cleanup from './05_cleanup';
//分支切换可能导致遗留effectFn；遗留的effectFn将lead to unneccessary update
//场景：document.body.innerText = obj.ok ? obj.text : 'not' 要求其ok无论T、F,修改obj.text都不updateView
//----- tip：（overwrite proxy的get）effectFn读什么Proxy数据，这个数据的依赖集合就add上了；===>ok只要T过，text都将具备响应性forever！

//Solution：记录每个effectFn的依赖deps，方便每次副作⽤函数执⾏前，将其从相关联的依赖集合中移除
//@effectFnDeps:依赖自身数组deps[]存储依赖集合Set的effectFunction

// 要重新设计副作⽤函数
let activeEffect: EffectFn | undefined = undefined;

// register EffectFunction
function effect(fn: Function): void {
  const eFn: EffectFn = {
    fn,
    deps: [],
  };
  const eFnRegister = () => {
    cleanup(eFn);
    activeEffect = eFn;
    fn();
  };
  eFnRegister();
}

//为effectFnWithDeps设计新track，trigger;
let bucket: Bucket;
export function track(target: Object, key: string) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
  // effect函数记录依赖（collect deps）
  // purpose:在每次副作⽤函数执⾏时，根据 effectFn.deps 获取所有相关联的依赖集合，进⽽将副作⽤函数从依赖集合中移除
  activeEffect && activeEffect.deps && activeEffect.deps.push(deps);
}
function trigger(target: Object, key: string) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effectsFns: Set<EffectFn> | undefined = depsMap[key];
  // 解决死循环~:将-deps中的effectFn- 从一个Set转移另一个Set；
  if (effectsFns) {
    const effectsToRun: Set<EffectFn> = new Set();
    effectsFns.forEach((effectFn) => {
      effectsToRun.add(effectFn);
    });
    effectsToRun.forEach((effectFn) => effectFn.fn());
  }
}

//♥：1.在响应式系统中，副作用函数（effect function）是一个包含逻辑的函数。
//   2.当这个函数运行并读取响应式数据时，得益Proxy，会invoke自定义get，令它与该数据(property)建立依赖关系(deps.add())。---->bucket.get(target).get(key).add(activeEffect)
//   3.当数据发生变化时，invoke自定义set，令其重新find并invoke这个effectFn，确保数据与视图保持同步。
//   4.effctFn会有一个'小本本'deps记录其出现在哪个数据依赖set中---->activeEffect.deps.push(deps);
// ----（deps;其实名字起的不是很好，和属性数据的依赖集合冲突了，but为了和教材契合度高一些...）

// tip:一个方面，是对响应性数据来说，他的依赖集合中有哪些effectFn；另一方面，对于一个effectFn，其被哪些响应性数据所依赖；
