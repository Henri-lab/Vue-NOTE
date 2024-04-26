import { EffectFn } from './00_interface&type';
export default function cleanup(effectFn: EffectFn) {
  if (effectFn.deps) {
    for (let i = 0; i < effectFn.deps.length; i++) {
      const deps = effectFn.deps[i];
      deps.delete(effectFn);
    }
    // clear deps : effectFn.deps = [];
    effectFn.deps.length = 0;
  }
}
