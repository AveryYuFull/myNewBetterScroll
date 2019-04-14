/**
 * 是否支持touch事件
 * @returns {Boolean}
 */
export default function isTouch () {
    let _res = false;
    const _ua = navigator && navigator.userAgent.toLowerCase();
    if ('ontouchstart' in window || /wechatdevtools/.test(_ua)) {
        _res = true;
    }
    return _res;
}
