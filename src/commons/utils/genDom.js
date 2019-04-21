// 缓存dom元素
const _cacheDom = {};

/**
 * 创建dom元素
 * @param {String} tagName dom标签的名
 * @param {Object} options 可选参数
 * @returns {HTMLElement} 返回dom元素
 */
export default function genDom (tagName, options) {
    tagName = tagName || 'div';
    let _dom = _cacheDom[tagName] = _cacheDom[tagName] || document.createElement(tagName);
    _dom = _dom.cloneNode();

    options = options || {};
    // 属性配置
    const _attrs = options.attrs || {};
    for (let key in _attrs) {
        if (_attrs.hasOwnProperty(key)) {
            const _attr = _attrs[key];
            _dom.setAttribute(key, _attr);
        }
    }

    // class的配置
    let _clsList = options.classList || [];
    if (!_clsList instanceof Array) {
        _clsList = [_clsList];
    }
    _clsList.forEach((cls) => {
        if (cls) {
            _dom.classList.add(cls);
        }
    });

    // inner文案配置（innerhtml/innertext）
    const _inners = options.inners || {};
    for (let key in _inners) {
        if (_inners.hasOwnProperty(key)) {
            _dom.style[key] = _inners[key];
        }
    }

    return _dom;
}
