import prefixStyle from './utils/prefixStyle';
import isTouch from './utils/isTouch';

/**
 * 派发事件时机类型
 */
// export const PROBE_TYPE = {
//     NORMAL: 0, // 默认
//     DEBOUNCE: 1, // 非实时派发滚动条事件
//     REAL_TIME: 2, // 实时派发滚动条事件
//     MOMENTUM: 3 // 不仅实时派发滚动条事件，而且在momentum动画也派发滚动条事件
// };

/**
 * 默认配置参数
 */
export const DEFAULT_CONFIG = {
    scrollX: false, // 是否开启水平滚动条
    scrollY: true, // 是否开启垂直滚动条
    freeScroll: false, // 是否同时支持水平和垂直滑动
    bindToWrapper: false, // 是否将move/up事件绑定在滚动内容
    disableMouse: isTouch, // 是否disabled mouse事件
    disableTouch: !isTouch, // 是否disable touch事件
    preventDefault: true, // 是否允许阻止事件默认行为
    preventDefaultException: { // 这些不允许阻止事件默认行为
        tagName: /^(INPUT|TEXTAREA|BUTTON)$/
    },
    stopPropagation: true, // 是否阻止事件冒泡
    momentum: true, // 是否开启动量
    momentumLimitTime: 300, // 只有当快速滑动的时间小于momentumLimitTime,才开启momentum动画
    momentumLimitDistance: 15, // 只有当快速滑动的距离大于momentumLimitDistance, 才开启momentum动画
    directionLockThreshold: 5, // 固定方向的阀值
    eventPassthrough: '', // 可选值（horizontal／vertical），如果希望在某个方向上使用原生滚动，就设置这个值
    // probeType: PROBE_TYPE.MOMENTUM, // 派发滚动条事件机制
    bounce: true, // 是否开启回弹
    bounceTime: 800, // 回弹动画时长
    deceleration: 0.0015, // momentum动画的减速度
    swipeTime: 2500, // momentum动画的时长
    swipeBounceTime: 500, // momentum动画的回弹时长
    useTransition: true, // 是否使用css3的transition做动画
    useTransform: true, // 是否使用transform来设置位置
    observeDOM: true, // 是否监听dom的变化
    autoBlur: true, // 是否应该blur
    scrollbar: { // 配置滚动条
        fade: false,
        interactive: true
    },
    pullupLoad: true // 配置用于做上拉加载功能
};

/**
 * 事件类型
 */
export const EVENT_TYPE = {
    REFRESH: 'refresh', // refresh事件类型
    BEFORE_SCROLL_START: 'beforeScrollStart', // 在滚动条滑动之前
    SCROLL_START: 'scrollStart', // 滚动条开始滑动
    SCROLL: 'scroll', // 滚动事件
    TOUCH_END: 'touchEnd', // 鼠标/手指离开
    SCROLL_END: 'scrollEnd', // 滑动结束
    DESTROY: 'destroy', // destroy事件
    UPDATE_TRANSITION: 'updateTransition', // 更新动画时长／动画规则
    PULLING_UP: 'pullingUp' // 上拉加载事件类型
};

/**
 * 样式
 */
export const styleName = {
    transitionEnd: prefixStyle('transitionEnd'),
    transitionDuration: prefixStyle('transitionDuration'),
    transitionTimingFunction: prefixStyle('transitionTimingFunction'),
    transform: prefixStyle('transform')
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
};

/**
 * 锁定滑动方向
 */
export const LOCK_DIRECTION = {
    HORIZONTAL: 'horizontal', // x轴方向滑动
    VERTICAL: 'vertical', // y轴方向滑动
    NO: 'no' // 不锁定方向
};

/**
 * 滑动方向
 */
export const MOVING_DIRECTION = {
    LEFT: 'left', // 水平向左滑动
    RIGHT: 'right', // 水平向右滑动
    TOP: 'top', // 水平向上滑动
    BOTTOM: 'bottom' // 水平向下滑动
};

/**
 * 滚动条方向
 */
export const SCROLLBAR_DIRECTION = {
    HORIZONTAL: 'horizontal', // 水平滚动条
    VERTICAL: 'vertical' // 垂直滚动条
};
