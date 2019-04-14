import prefixStyle from './utils/prefixStyle';
import isTouch from './utils/isTouch';
/**
 * 默认配置参数
 */
export const DEFAULT_CONFIG = {
    scrollX: true, // 是否开启水平滚动条
    scrollY: true, // 是否开启垂直滚动条
    bindToWrapper: false, // 是否将move/up事件绑定在滚动内容
    disableMouse: isTouch, // 是否disabled mouse事件
    disableTouch: !isTouch, // 是否disable touch事件
    preventDefault: true, // 是否允许阻止事件默认行为
    preventDefaultException: { // 这些不允许阻止事件默认行为
        tagName: /^(INPUT|TEXTAREA|BUTTON)$/
    },
    stopPropagation: true, // 是否阻止事件冒泡
};

/**
 * 事件类型
 */
export const EVENT_TYPE = {
    REFRESH: 'refresh', // refresh事件类型
    BEFORE_SCROLL_START: 'beforeScrollStart', // 在滚动条滑动之前
};

/**
 * 样式
 */
export const styleName = {
    transitionEnd: prefixStyle('transitionEnd')
};

/**
 * touch事件
 */
export const TOUCH_EVENT = 0;
/**
 * mouse事件
 */
export const MOUSE_EVENT = 1;

/**
 * 事件类型
 */
export const evtType = {
    touchstart: TOUCH_EVENT,
    touchmove: TOUCH_EVENT,
    touchcancel: TOUCH_EVENT,
    touchend: TOUCH_EVENT,

    mousedown: MOUSE_EVENT,
    mousemove: MOUSE_EVENT,
    mousecancel: MOUSE_EVENT,
    mouseup: MOUSE_EVENT
}
