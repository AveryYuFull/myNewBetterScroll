import DefaultOptions from '../../utils/DefaultOptions';
import { DEFAULT_CONFIG, SCROLLBAR_DIRECTION, EVENT_TYPE } from '../../constants';
import genDom from '../../utils/genDom';
import indicatorFactory from './Indicator';
import callFn from '../../utils/callFn';

import './scrollbar.less';

export class Scrollbar extends DefaultOptions {
    defaultOptions = DEFAULT_CONFIG;

    /**
     * 滚动条对象
     */
    scroller = null;

    /**
     * indicator数组
     */
    indicators = [];

    constructor (scroller, options) {
        super(options);
        const _that = this;
        _that.setDefaultOptions(options);

        _that.scroller = scroller;
        _that._init();
    }

    /**
     * 初始化scrollbar
     */
    _init () {
        const _that = this;
        const _opts = _that.defaultOptions;
        const _scroller = _that.scroller;
        if (_opts.scrollX) {
            let _scrollbarX = _that._createScrollbar(SCROLLBAR_DIRECTION.HORIZONTAL);
            _that._insertTo(_scrollbarX);
            _that.indicators.push(indicatorFactory(_scrollbarX, _scroller, SCROLLBAR_DIRECTION.HORIZONTAL, _opts));
        }
        if (_opts.scrollY) {
            let _scrollbarY = _that._createScrollbar(SCROLLBAR_DIRECTION.VERTICAL);
            _that._insertTo(_scrollbarY);
            _that.indicators.push(indicatorFactory(_scrollbarY, _scroller, SCROLLBAR_DIRECTION.VERTICAL, _opts));
        }

        _scroller.$on(EVENT_TYPE.REFRESH, () => {
            _that._each('refresh');
        });

        const _scrollbar = _opts.scrollbar;
        const _fade = _scrollbar.fade;
        if (_fade) {
            _scroller.$on(EVENT_TYPE.BEFORE_SCROLL_START, () => {
                _that._each('fade', [true, true]);
            });
            _scroller.$on(EVENT_TYPE.SCROLL_START, () => {
                _that._each('fade', [true]);
            });
            _scroller.$on(EVENT_TYPE.SCROLL_END, () => {
                _that._each('fade', [false]);
            });
        }

        _scroller.$on(EVENT_TYPE.UPDATE_TRANSITION, (evt) => {
            const { time = 0, easing = null } = evt || {};
            _that._each('setTransition', [time, easing]);
        });

        _scroller.$on(EVENT_TYPE.SCROLL, () => {
            _that._each('updatePos');
        });
        _scroller.$on(EVENT_TYPE.DESTROY, () => {
            _that._each('destroy');
        });
    }

    /**
     * 遍历indicators数组
     * @param {String} fnName 回调方法名
     * @param {Object} params 调用方法参数
     */
    _each (fnName, params) {
        const _that = this;
        const _indicators = _that.indicators || [];
        _indicators.forEach((indicator) => {
            if (indicator) {
                callFn(indicator[fnName], params, indicator);
            }
        });
    }

    /**
     * 插入scrollbar
     * @param {HTMLElement} el scrollbar的dom元素节点
     */
    _insertTo (el) {
        const _that = this;
        const _scroller = _that.scroller;
        const _wrapper = _scroller && _scroller.wrapper;
        if (!el || !_scroller || !_wrapper) {
            return;
        }
        _wrapper.appendChild(el);
    }

    /**
     * 创建滚动条
     * @param {SCROLLBAR_DIRECTION} dir 滚动条方向
     * @returns {HTMLElement} 返回创建的scrollbar的dom元素
     */
    _createScrollbar (dir) {
        let _scrollbarOpts;
        if (dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
            _scrollbarOpts = {
                classList: 'bscroll-horizontal-scrollbar'
            };
        } else if (dir === SCROLLBAR_DIRECTION.VERTICAL) {
            _scrollbarOpts = {
                classList: 'bscroll-vertical-scrollbar'
            };
        }
        let _scrollbar = genDom('div', _scrollbarOpts);
        let _indicator = genDom('div', {
            classList: 'bscroll-indicator'
        });
        if (_scrollbar && _indicator) {
            _scrollbar.appendChild(_indicator);
        }
        return _scrollbar;
    }
}

/**
 * scrollbar的工厂方法
 * @param {Scroll} scroller Scroll实例对象
 * @param {Object} options 可选参数
 * @returns {Scrollbar} 返回Scrollbar对象
 */
export default function scrollbarFactory (scroller, options) {
    return new Scrollbar(scroller, options);
}
