/**
 * 获取动量
 * @param {Number} curPos 当前位置
 * @param {Number} startPos 上一次最近的开始位置
 * @param {Number} time 上一次开始位置到当前位置所用的时间
 * @param {Number} lowMargin 最小可以滑动的距离
 * @param {Number} upMargin 最大可以滑动的距离
 * @param {Number} wrapSize 包裹元素的大小
 * @param {Object} options 可选参数
 * @param {Number} options.deceleration 减速度
 * @param {Number} options.swipeTime momentum动画时间
 * @param {Number} options.swipeBounceTime momentum动画回弹时间
 * @returns {Object} 返回新的位置和时间
 */
export default function momentum (curPos, startPos, time, lowMargin, upMargin, wrapSize, options) {
    if (!time) {
        return;
    }

    options = options || {};
    curPos = curPos || 0;
    startPos = startPos || 0;
    let _distance = curPos - startPos;
    let _speed = Math.abs(_distance) / time;
    const { deceleration = 0.0015, swipeTime = 2500, swipeBounceTime = 500 } = options;
    let _dest = curPos + (_speed / deceleration) * (_distance < 0 ? -1 : 1);
    let _rate = 15;
    let _duration = swipeTime;
    if (_dest < lowMargin) {
        _dest = wrapSize
            ? Math.max(lowMargin - wrapSize / 4, lowMargin - wrapSize / _rate * _speed)
            : lowMargin;
        _duration = swipeBounceTime;
    } else if (_dest > upMargin) {
        _dest = wrapSize
            ? Math.min(upMargin + wrapSize / 4, upMargin + wrapSize / _rate * _speed)
            : upMargin;
        _duration = swipeBounceTime;
    }
    return {
        destination: _dest,
        duration: _duration
    };
}
