import Scroll from './cores/Scroll';

/**
 * 工厂方法
 * @param {HTMLElement|String} el dom元素
 * @param {Object} options 可选参数
 * @returns {Scroll} 返回scroll对象
 */
export default function scrollFactory (el, options) {
    return new Scroll(el, options);
}
