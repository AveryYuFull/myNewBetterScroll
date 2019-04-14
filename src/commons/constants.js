import prefixStyle from './utils/prefixStyle';

/**
 * 默认配置参数
 */
export const DEFAULT_CONFIG = {
    scrollX: true, // 是否开启水平滚动条
    scrollY: true, // 是否开启垂直滚动条
    bindToWrapper: false // 是否将move/up事件绑定在滚动内容
};

/**
 * 事件类型
 */
export const EVENT_TYPE = {
    REFRESH: 'refresh' // refresh事件类型
}

/**
 * 样式
 */
export const styleName = {
    transitionEnd: prefixStyle('transitionEnd')
}
