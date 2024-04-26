//dispatcher/scheduler实现 '类似于在 Vue.js 中连续多次修改响应式数据但只会触发⼀次更新' 的功能；
function schedular(jobFn: Function) {
  // 添加queue
  jobQueue.add(jobFn);
  // fresh
  flushJob();
}

const jobQueue: Set<Function> = new Set();
const p = Promise.resolve();
// @flag:是否正在刷新队列
let flag = false;
//功能：⽆论调⽤多少次 flushJob 函数，在⼀个周期(queueCycle)内都只会执⾏⼀次;
//--思路：invoke flushJob时，如果/执行队列正在执行/则/返回/，如果/队列执行全部结束/则/再次执行/;
function flushJob() {
  if (flag) return;
  flag = true;
  p.then(() => {
    jobQueue.forEach((job) => job());
  }).finally(() => (flag = false));
}

// 场景示例：
{
  // =============未启用调度器========================
  // const data = { foo: 1 }
  // const obj = new Proxy(data, { /* ... */ })
  // effect(() => {
  //     console.log(obj.foo+';)
  // })
  // obj.foo++
  // obj.foo++
  // -------------------------------------------------
  // # 1; 2; 3;
  // =============启用调度器==========================
  // const data = { foo: 1 }
  // const obj = new Proxy(data, { /* ... */ })
  // effect(() => {console.log(obj.foo+';)} ,schedular(effectFn.fn) )
  // obj.foo++
  // obj.foo++
  //  -------------------------------------------------
  //  # 1; 3;
}
//------------------------------------------------------------------------------------------------------------------------
// The effect of this code snippet is that executing the obj.foo increment operation twice consecutively will trigger the scheduler function twice, in a synchronous manner.
// This means the same side - effect function is added to jobQueue twice via jobQueue.add(fn), but due to the de - duplication capability of the Set data structure, jobQueue will contain only one entry—the current side - effect function.
// --note:jobQueue 内关于obj.foo的effectFn时第二次自增所触发的，由于set去重覆盖掉了第一次触发的，即使是两个一样的effectFn;
// Similarly, flushJob will also execute twice synchronously and consecutively, but because of the isFlushing flag, it actually runs only once during an event loop, that is, once in the microtask queue.
// --When the microtask queue starts executing, it traverses jobQueue and runs the stored side - effect functions.Since jobQueue contains only one side - effect function, it executes just once, and by then, the value of obj.foo has already become 3.
// --This way, the expected output is achieved.
