import eventUtil from '../utils/eventUtil';
import preventDefaultException from '../utils/preventDefaultException';

/**
 * 阻止事件默认行为/冒泡
 * @param {Event} evt 事件对象
 * @param {Object} options 可选参数
 * @param {Boolean} options.preventDefault 是否阻止事件的默认行为
 * @param {Object} options.preventDefaultException 这些不允许阻止事件默认行为
 */
export default function preventEvent (evt, options) {
    options = options || {};
    if (options.preventDefault &&
        !preventDefaultException(eventUtil.getTarget(evt), options.preventDefaultException)) {
        eventUtil.preventDefault(evt);
    }
    if (options.stopPropagation) {
        eventUtil.stopPropagation(evt);
    }
}
