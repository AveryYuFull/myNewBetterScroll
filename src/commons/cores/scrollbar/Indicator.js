import DefaultOptions from "../../utils/DefaultOptions";
import { DEFAULT_CONFIG, EVENT_TYPE } from "../../constants";

export default class Indicator extends DefaultOptions {
    defaultOptions = DEFAULT_CONFIG;

    /**
     * 方向(horizontal/vertical)
     */
    direction = null;

    /**
     * scroller对象
     */
    scroller = null;

    /**
     * scrollbar元素
     */
    scrollbar = null;
    /**
     * indicator对象
     */
    el = null;

    /**
     * 构造方法
     * @param {HTMLElement} scrollbar scrollbar元素dom节点
     * @param {Scroll} scroller Scroll对象
     * @param {String} direction indicator方向
     * @param {Object} options 可选参数
     */
    constructor (scrollbar, scroller, direction, options) {
        super(options);

        const _that = this;
        _that.setDefaultOptions(options);

        _that.scrollbar = scrollbar;
        if (scrollbar) {
            _that.el = scrollbar.children && scrollbar.children[0];
        }
        _that.direction = direction;
        _that._init();
    }

    /**
     * 初始化
     */
    _init () {
        const _that = this;
        _that.scroller.$on(EVENT_TYPE.REFRESH, () => {
        });
    }
}