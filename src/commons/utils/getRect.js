/**
 * 获取元素的相对位置
 * @param {HTMLElement} el dom元素
 * @returns {Object} 返回相对位置
 */
export default function getRect (el) {
    let _res = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };
    if (!el) {
        return _res;
    }

    if (el instanceof window.SVGElement) { // 因为svg元素没有offset属性
        const _rect = el.getBoundingClientRect();
        _res = {
            left: _rect.left,
            top: _rect.top,
            width: _rect.width,
            height: _rect.height
        }
    } else {
        _res = {
            left: el.offsetLeft,
            top: el.offsetTop,
            width: el.offsetWidth,
            height: el.offsetHeight
        };
    }
    return _res;
}
