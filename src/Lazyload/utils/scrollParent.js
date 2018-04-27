/* eslint-disable no-continue */
export default (node) => {
  if (!node) {
    return document.documentElement;
  }

  const overflowRegex = /(scroll|auto)/;
  let parent = node;

  while (parent) {
    // 没有父节点，直接返回根元素 || document
    if (!parent.parentNode) {
      return node.ownerDocument || document.documentElement;
    }

    // 有父节点 =>
    const style = window.getComputedStyle(parent);
    const { position, overflow } = style;
    const overflowX = style['overflow-x'];
    const overflowY = style['overflow-y'];

    if (position === 'static' && node.style.position === 'absolute') {
      parent = parent.parentNode;
      continue;
    }

    // 判断只要父元素里有 overflow 样式，就是有滚动
    if (overflowRegex.test(overflow) ||
      overflowRegex.test(overflowX) ||
      overflowRegex.test(overflowY)) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return node.ownerDocument || node.documentElement || document.documentElement;
};
