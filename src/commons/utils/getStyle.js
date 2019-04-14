/**
 * 获取元素的样式列表或某个样式属性的值
 * @param {HTMLElement} el dom元素
 * @param {String|Undefined} prop 属性key
 * @returns {Array|String} 样式列表或某个样式属性值
 */
export default function getStyle (el, prop) {
    let _res;
    if (!el) {
        return null;
    }

    if (window.getComputedStyle instanceof Function) {
        _res = window.getComputedStyle(el, null);
    } else {
        _res = el.currentStyle;
    }
    if (prop) {
        _res = _res[prop];
    }
    return _res;
}
