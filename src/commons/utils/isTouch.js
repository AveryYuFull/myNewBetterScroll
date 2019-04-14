/**
 * 是否支持touch事件
 * @returns {Boolean}
 */
const isTouch = (function () {
    let _res = false;
    const _ua = navigator && navigator.userAgent.toLowerCase();
    if ('ontouchstart' in window || /wechatdevtools/.test(_ua)) {
        _res = true;
    }
    return _res;
})();

export default isTouch;
