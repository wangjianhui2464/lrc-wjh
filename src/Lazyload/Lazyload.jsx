/* eslint-disable react/no-find-dom-node,react/no-unused-prop-types */
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { on, off } from './utils/event';
import scrollParent from './utils/scrollParent';
import debounce from './utils/debounce';
import throttle from './utils/throttle';

// 获取元素宽高初始值
const defaultBoundingClientRect = {
  top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0,
};
const LISTEN_FLAG = 'data-lazyload-listened';
// 绑定了监听事件的元素集合
const listeners = [];
// 只执行一次的元素集合
let pending = [];

// 为了提升事件绑定函数的执行性能，提前获取 passive 属性的值。
// 详细解释： https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// 判断浏览器是否支持 passive 属性
let passiveEventSupported = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    // eslint-disable-next-line getter-return
    get() {
      passiveEventSupported = true;
    },
  });
  window.addEventListener('test', null, opts);
} catch (e) {
// eslint-disable-next-line no-trailing-spaces
}

// 如果浏览器支持 passive 设置 eventListener options -> passiveEvent
const passiveEvent = passiveEventSupported ? { capture: false, passive: true } : false;


/**
 * 检查 `component` 在 `parent` 中是否可见
 * @param  {React} component React component
 * @param  {node} parent    component's scroll parent
 * @return {boolean}
 */
const checkOverflowVisible = function checkOverflowVisible(component, parent) {
  const node = ReactDom.findDOMNode(component);

  /*
   * 计算父元素宽高
   * 知识点：getBoundingClientRect() https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
   */
  let parentTop;
  let parentHeight;

  try {
    ({ top: parentTop, height: parentHeight } = parent.getBoundingClientRect());
  } catch (e) {
    ({ top: parentTop, height: parentHeight } = defaultBoundingClientRect);
  }
  // 窗口可视高度
  const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

  // 判断父元素顶边是否 “大于零”
  // 大于零: 父元素顶边超出了可视窗口；小于零：父元素顶边在可视窗口之内
  const intersectionTop = Math.max(parentTop, 0);
  // 计算父元素底边是否 “小于可视窗口底边”
  // 小于：父元素底边在可视窗口之内；大于：父元素底边在可视窗口之外
  const intersectionBottom = Math.min(windowInnerHeight, parentTop + parentHeight);

  // 父元素处于可视窗口区域的高度
  const intersectionHeight = intersectionBottom - intersectionTop;

  /*
   * 计算当前组件的宽高
   * 知识点：getBoundingClientRect() https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
   */
  let top;
  let height;

  try {
    ({ top, height } = node.getBoundingClientRect());
  } catch (e) {
    ({ top, height } = defaultBoundingClientRect);
  }
  // 当前组件顶边距（父元素在可视区域最顶点）的距离
  const offsetTop = top - intersectionTop;
  // 如果有设置偏移量，将偏移量加上。 此处兼容 number | [number, number] 两种形式
  const offsets = Array.isArray(component.props.offset) ?
    component.props.offset :
    [component.props.offset, component.props.offset];

  return (offsetTop - offsets[0] <= intersectionHeight) &&
    (offsetTop + height + offsets[1] >= 0);
};

/**
 * 检查 `component` 是否在 `document` 中可见
 * @param  {React} component React component
 * @return {boolean}
 */
const checkNormalVisible = function checkNormalVisible(component) {
  const node = ReactDom.findDOMNode(component);

  // If this element is hidden by css rules somehow, it's definitely invisible
  if (!(node.offsetWidth || node.offsetHeight || node.getClientRects().length)) return false;

  let top;
  let elementHeight;

  try {
    ({ top, height: elementHeight } = node.getBoundingClientRect());
  } catch (e) {
    ({ top, height: elementHeight } = defaultBoundingClientRect);
  }

  const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;

  const offsets = Array.isArray(component.props.offset) ?
    component.props.offset :
    [component.props.offset, component.props.offset]; // Be compatible with previous API

  return (top - offsets[0] <= windowInnerHeight) &&
    (top + elementHeight + offsets[1] >= 0);
};


/**
 * 检测元素在窗口中是否可见，如果是，则将 `visible` 状态设置为true。
 * 如果 `once` 为 true, 在 checkVisible 后移除监听
 *
 * @param  {LazyLoad} component   React 响应滚动和调整大小的组件
 */
const checkVisible = function checkVisible(component) {
  const currentComponent = component;
  const node = ReactDom.findDOMNode(currentComponent);
  if (!node) {
    return;
  }

  const parent = scrollParent(node);

  const isOverflow = currentComponent.props.overflow &&
    parent !== node.ownerDocument &&
    parent !== document &&
    parent !== document.documentElement;
  const visible = isOverflow ?
    checkOverflowVisible(currentComponent, parent) :
    checkNormalVisible(currentComponent);
  if (visible) {
    // 如果之前可见，不再渲染
    if (!currentComponent.visible) {
      if (currentComponent.props.once) {
        pending.push(currentComponent);
      }

      currentComponent.visible = true;
      currentComponent.forceUpdate();
    }
  } else if (!(currentComponent.props.once && currentComponent.visible)) {
    currentComponent.visible = false;
    if (currentComponent.props.unmountIfInvisible) {
      currentComponent.forceUpdate();
    }
  }
};

/**
 * 默认懒加载处理事件
 */
const lazyLoadHandler = () => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < listeners.length; ++i) {
    const listener = listeners[i];
    checkVisible(listener);
  }
  // 从监听器中移除 `once` 组件
  pending.forEach((component) => {
    const index = listeners.indexOf(component);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  });

  pending = [];
};

// 延迟回调函数类型
let delayType;
// 最终懒加载回调函数
let finalLazyLoadHandler = null;

/**
 * 组件入口
 */
class LazyLoad extends Component {
  constructor(props) {
    super(props);

    // 子组件是否可见
    this.visible = false;
  }

  componentDidMount() {
    // It's unlikely to change delay type on the fly, this is mainly
    // designed for tests
    const isDebounce = this.props.debounce !== undefined && delayType === 'throttle';
    const isNotDebounce = delayType === 'debounce' && this.props.debounce === undefined;
    const needResetFinalLazyLoadHandler = isDebounce || isNotDebounce;

    if (needResetFinalLazyLoadHandler) {
      off(window, 'scroll', finalLazyLoadHandler, passiveEvent);
      off(window, 'resize', finalLazyLoadHandler, passiveEvent);
      finalLazyLoadHandler = null;
    }

    if (!finalLazyLoadHandler) {
      if (this.props.debounce !== undefined) {
        finalLazyLoadHandler = debounce(lazyLoadHandler, typeof this.props.debounce === 'number' ?
          this.props.debounce :
          300);
        delayType = 'debounce';
      } else if (this.props.throttle !== undefined) {
        finalLazyLoadHandler = throttle(lazyLoadHandler, typeof this.props.throttle === 'number' ?
          this.props.throttle :
          300);
        delayType = 'throttle';
      } else {
        finalLazyLoadHandler = lazyLoadHandler;
      }
    }

    // overflow 组件定义 超出滚动
    if (this.props.overflow) {
      // 超出滚动，查找父元素绑定事件
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent && typeof parent.getAttribute === 'function') {
        const listenerCount = 1 + (+parent.getAttribute(LISTEN_FLAG));
        if (listenerCount === 1) {
          parent.addEventListener('scroll', finalLazyLoadHandler, passiveEvent);
        }
        parent.setAttribute(LISTEN_FLAG, listenerCount);
      }
    } else if (listeners.length === 0 || needResetFinalLazyLoadHandler) {
      const { scroll, resize } = this.props;

      if (scroll) {
        on(window, 'scroll', finalLazyLoadHandler, passiveEvent);
      }

      if (resize) {
        on(window, 'resize', finalLazyLoadHandler, passiveEvent);
      }
    }

    listeners.push(this);
    checkVisible(this);
  }

  shouldComponentUpdate() {
    return this.visible;
  }

  componentWillUnmount() {
    if (this.props.overflow) {
      const parent = scrollParent(ReactDom.findDOMNode(this));
      if (parent && typeof parent.getAttribute === 'function') {
        const listenerCount = (+parent.getAttribute(LISTEN_FLAG)) - 1;
        if (listenerCount === 0) {
          parent.removeEventListener('scroll', finalLazyLoadHandler, passiveEvent);
          parent.removeAttribute(LISTEN_FLAG);
        } else {
          parent.setAttribute(LISTEN_FLAG, listenerCount);
        }
      }
    }

    const index = listeners.indexOf(this);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      off(window, 'resize', finalLazyLoadHandler, passiveEvent);
      off(window, 'scroll', finalLazyLoadHandler, passiveEvent);
    }
  }

  render() {
    if (this.visible) {
      return this.props.children;
    } else if (this.props.placeholder) {
      return this.props.placeholder;
    }
    return <div style={{ height: this.props.height }} className="lazyload-placeholder" />;
  }
}

LazyLoad.propTypes = {
  once: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  offset: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  overflow: PropTypes.bool,
  resize: PropTypes.bool,
  scroll: PropTypes.bool,
  children: PropTypes.node,
  throttle: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  debounce: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  placeholder: PropTypes.node,
  unmountIfInvisible: PropTypes.bool,
};

LazyLoad.defaultProps = {
  once: false,
  height: 0,
  offset: 0,
  overflow: false,
  resize: false,
  scroll: true,
  throttle: 300,
  debounce: 300,
  placeholder: null,
  unmountIfInvisible: false,
  children: PropTypes.element,
};

export default LazyLoad;
export { lazyLoadHandler as forceCheck };
