/**
 * 获取动量
 * @param {Number} curPos 当前位置
 * @param {Number} startPos 上一次最近的开始位置
 * @param {Number} time 上一次开始位置到当前位置所用的时间
 * @param {Number} lowMargin 最小可以滑动的距离
 * @param {Number} upMargin 最大可以滑动的距离
 * @param {Object} options 可选参数
 * @param {Number} options.deceleration 减速度
 * @param {Number} options.swipeTime momentum动画时间
 * @param {Number} options.swipeBounceTime momentum动画回弹时间
 */
export default function momentum (curPos, startPos, time, lowMargin, upMargin, options) {
    let _distance = Math.abs(curPos - startPos);
    let _speed = _distance / time;
}
