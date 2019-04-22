import setStyle from '../utils/setStyle';
import { styleName } from '../constants';

/**
 * 设置动画参数
 * @param {HTMLElement} el dom元素节点
 * @param {Number} time 动画时长
 * @param {String|Function} easing 动画规则
 */
export default function setTransition (el, time, easing) {
    if (!el) {
        return;
    }

    setStyle(el, styleName.transitionDuration, `${time || 0}ms`);
    setStyle(el, styleName.transitionTimingFunction, easing);
}
