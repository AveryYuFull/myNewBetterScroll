let _domStyle = document.createElement('object').style;

const _prefix = (function () {
    let _res = '';
    let _transform = {
        'webkit': 'WebkitTransform',
        'Moz': 'MozTransform',
        'O': 'OTransform',
        'ms': 'msTransform',
        'standard': 'transform'
    };
    for (let key in _transform) {
        const _val = _transform[key];
        if (_transform.hasOwnProperty(key) &&
            typeof _domStyle[_val] !== 'undefined') {
            _res = key;
            break;
        }
    }
    return _res;
})();

/**
 * 过滤样式
 * @param {String} style 需要过滤的样式
 * @returns {String} 返回过滤后的样式
 */
export default function prefixStyle (style) {
    let _res = style;
    if (_prefix && style) {
        if (_prefix === 'standard') {
            if (style === 'transitionEnd') {
                _res = 'transitionend';
            }
        } else {
            _res = _prefix + style.charAt(0).toUpperCase() + style.substring(1);
        }
    }
    return _res;
}
