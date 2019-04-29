/**
 * 下拉加载状态
 */
export const STATE_TYPE = {
    'READY': '0', // 准备状态
    'LOADING': '1', // 加载状态
    'SUCCESS': '2', // 加载成功
    'NO_MORE': '3' // 没有更多
};

/**
 * 事件类型
 */
export const EVENT_TYPE = {
    UPDATE_STATE: 'update:state' // 更新state事件类型
};

/**
 * 默认加载更多文案
 */
export const DEFAULT_MORE_TEXT = '加载更多';

/**
 * 默认的没有更多数据文案
 */
export const DEFAULT_NO_MORE_TEXT = '没有更多数据';
