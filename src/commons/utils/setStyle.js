/**
 * 设置元素的样式属性
 * @param {HTMLElement} el dom元素
 * @param {String} key 样式属性
 * @param {String} value 属性值
 */
export default function setStyle (el, key, value) {
    if (!(el instanceof HTMLElement) ||
        !key) {
        return;
    }
    el.style[key] = value;
}
