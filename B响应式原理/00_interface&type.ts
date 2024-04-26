// ❤:effectFn设计为身上既有需要invoke的fn，也有record'哪个data依赖自己'的deps:Array<Set<Function>>，还有控制trigger行为的options

interface EffectFn {
  fn: Function;
  deps?: Array<Set<EffectFn>>;
  options?: {
    lazy?: boolean;
    schedular?: Function;
  };
}

type Bucket = WeakMap<Object, Map<string, Set<EffectFn>>>;

interface EffectFnOptions {
  lazy?: boolean;
  schedular?: Function;
}

interface WatchOptions {
  immediate?: boolean;
  deep?: boolean;
  flush?: string;
}

export { EffectFn, Bucket, EffectFnOptions, WatchOptions };
