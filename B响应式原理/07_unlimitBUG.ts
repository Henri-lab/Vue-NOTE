// 引起bug的某个场景：effect(() => {obj.prop++})
// '读写一体'will cause 无限递归
// Solution：overwrite Trigger===>如果 trigger 触发执⾏的副作⽤函数与当前正在执⾏的副作⽤函数相同，则不触发执⾏

import { Bucket, EffectFn } from './00_interface&type';
let bucket: Bucket;
let activeEffect: EffectFn | undefined = undefined;
function trigger(target: Object, key: string) {
  const depsMap = bucket.get(target) ? bucket.get(target) : undefined;
  if (!depsMap) return;
  const deps: Set<EffectFn> | undefined = depsMap.get(key);
  if (!deps) return;
  if (deps) {
    const effectToRun: Set<EffectFn> = new Set();
    deps &&
      deps.forEach(
        (effectFn) => effectFn !== activeEffect && effectToRun.add(effectFn)
      );
    effectToRun.forEach((effectFn) => {
      effectFn.fn();
    });
  }
}
