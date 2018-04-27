/**
 * 函数防抖
 * @param func 实际执行的函数
 * @param wait 延迟时长， 单位毫秒（ms）
 * @param immediate 是否立即执行
 * @returns {function} debounced 返回一个函数
 */
export default function debounce(func, wait, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;

  const later = function later() {
    const last = +(new Date()) - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = null;
          args = null;
        }
      }
    }
  };

  function debounced(...arg) {
    context = this;
    args = arg;
    timestamp = +(new Date());

    const callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    if (callNow) {
      result = func.apply(context, args);
      context = null;
      args = null;
    }

    return result;
  }

  return debounced;
}
