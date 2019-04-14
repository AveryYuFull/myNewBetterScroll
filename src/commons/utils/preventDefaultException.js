/**
 * 是否允许阻止事件默认行为
 * @param {Event} target 目标对象
 * @param {Object} options 可选参数
 * @returns {Boolean} 是否允许阻止事件默认行为
 */
export default function preventDefaultException (target, options) {
    let _res = false;
    if (target) {
        options = options || {};
        for (let key in options) {
            if (options.hasOwnProperty(key)) {
                let _regExpr = options[key];
                if (_regExpr && _regExpr.test(target[key])) {
                    _res = true;
                    break;
                }
            }
        }
    }
    return _res;
}
