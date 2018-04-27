/**
 * 函数节流
 * @param fn 要执行的函数
 * @param threshold 执行间隔，单位毫秒（ms）
 * @param scope 调用函数上下文
 * @returns {Function}
 */
export default function throttle(fn, threshold, scope) {
  let last;
  let deferTimer;

  function throttled(...arg) {
    const context = scope || this;

    const now = +new Date();
    const args = arg;
    if (last && now < last + threshold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn.apply(context, args);
      }, threshold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  }

  return throttled;
}
