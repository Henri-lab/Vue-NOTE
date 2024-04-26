import { EffectFn, Bucket } from './00_interface&type';

// bind the fileds and the effect

// newBucket is Map of Maps of Sets!---(@imgs/effectWhere.png)
// WeakMap 经常⽤于存储那些只有当 key 所引⽤的对象存在时（没有被回收）才有价值的信息

const newBucket: Bucket = new WeakMap();
let activeEffect: EffectFn | undefined = undefined;

const data = { text: 'oi!' };
const proxy = new Proxy(data, {
  get(target: Object, key: string) {
    //不会invoke与其peoperty无关的effect
    if (activeEffect) {
      //dead&live;
      //level 1
      let depsMap = newBucket.get(target);
      if (!depsMap) {
        depsMap = new Map();
        newBucket.set(target, depsMap);
      }
      //level 2
      let deps = depsMap.get(key);
      if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
      }
      //
      deps.add(activeEffect);
      //
      return target[key];
    }

    return target[key];
    // return;
  },
  set(target: Object, key: string, value) {
    target[key] = value;
    const depsMap = newBucket.get(target);
    if (depsMap) {
      const deps = depsMap.get(key);
      if (deps) {
        deps.forEach((effectFn: EffectFn) => {
          effectFn.fn(); //renderer
        });
      }
      return true;
    }
    //?
    return false;
  },
});

//abstract customGET/SET 内部的实现
function track(target: object, key: string) {
  if (!activeEffect) return;
  let depsMap = newBucket.get(target);
  if (!depsMap) {
    depsMap = new Map();
    newBucket.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  deps.add(activeEffect);
  return target[key];
}
function trigger(target: object, key: string) {
  const depsMap = newBucket.get(target);
  if (depsMap) {
    const deps = depsMap.get(key);
    if (deps) {
      deps.forEach((effectFn: EffectFn) => {
        effectFn.fn();
      });
    }
    return true;
  }
}

export { newBucket };
