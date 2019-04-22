/**
 * 同步调用fn方法
 * @param {Object|Function} dataFn 调用的方法或默认值
 * @param {Object|Array} params 调用方法的参数
 * @param {Object} context 执行上下文
 * @returns {Object} 返回调用方法的结果
 */
export default function callFn (dataFn, params, context) {
    let _res = dataFn;
    if (!(params instanceof Array)) {
        params = [params];
    }

    if (dataFn instanceof Function) {
        _res = dataFn.apply(context, params);
    }
    return _res;
}
