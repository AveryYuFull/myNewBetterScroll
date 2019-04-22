import DefaultOptions from '../../utils/DefaultOptions';
import { EVENT_TYPE, SCROLLBAR_DIRECTION, DEFAULT_CONFIG, styleName } from '../../constants';
import setStyle from '../../utils/setStyle';
import setTransition from '../../helpers/setTransition';

/**
 * indicator的最小长度
 */
const INDICATOR_MIN_LEN = 8;

export class Indicator extends DefaultOptions {
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
    el = null;
    /**
     * indicator元素
     */
    indicator = null;
    /**
     * indicator的大小
     */
    indicatorSize = 0;
    /**
     * 滚动比率
     */
    sizeRatio = 0;
    /**
     * 最大滑动距离
     */
    maxPos = 0;
    /**
     * scrollbar位置
     */
    pos = 0;

    /**
     * 构造方法
     * @param {HTMLElement} el scrollbar元素dom节点
     * @param {Scroll} scroller Scroll对象
     * @param {String} direction indicator方向
     * @param {Object} options 可选参数
     * @param {Boolean} options.fade 是否显示scrollbar
     * @param {Boolean} options.interative 是否监听dom事件
     */
    constructor (el, scroller, direction, options) {
        super(options);

        const _that = this;
        _that.setDefaultOptions(options);

        _that.scroller = scroller;
        _that.el = el;
        if (el) {
            _that.indicator = el.children && el.children[0];
        }
        _that.direction = direction;

        _that._init();
    }

    /**
     * 初始化
     */
    _init () {
        const _that = this;
        const _scroller = _that.scroller;
        const _opts = _that.defaultOptions;
        _that._watchVisible();
        _scroller.$on(EVENT_TYPE.REFRESH, () => {
            let _isShow = false;
            if (_that._shouldShow()) {
                _isShow = true;
                setTransition(_that.indicator);
                _that._calculate();
                _that._updatePos();
            }
            setStyle(_that.el, 'display', _isShow ? 'block' : 'none');
        });

        const _scrollbar = _opts.scrollbar;
        const _fade = _scrollbar.fade;
        _that.visible = !_fade;
        if (_fade) {
            _scroller.$on(EVENT_TYPE.BEFORE_SCROLL_START, () => {
                _that._fade(true, true);
            });
            _scroller.$on(EVENT_TYPE.SCROLL_START, () => {
                _that._fade(true);
            });
            _scroller.$on(EVENT_TYPE.SCROLL_END, () => {
                _that._fade(false);
            });
        }

        _scroller.$on(EVENT_TYPE.UPDATE_TRANSITION, (evt) => {
            const { time = 0, easing = null } = evt || {};
            setTransition(_that.indicator, time, easing);
        });

        _scroller.$on(EVENT_TYPE.SCROLL, () => {
            _that._updatePos();
        });
    }

    /**
     * 隐藏／显示scrollbar
     * @param {Boolean} visible 是否显示／隐藏scrollbar
     * @param {Boolean} hold 是否当以前是隐藏的时候还是保留隐藏状态
     */
    _fade (visible, hold) {
        const _that = this;
        if (!_that.visible && hold) {
            return;
        }

        setTransition(_that.el, visible ? 250 : 500);
        _that.visible = visible;
    }

    /**
     * 计算scrollbar
     */
    _calculate () {
        const _that = this;
        const _dir = _that.direction;
        const _el = _that.el;
        const _scroller = _that.scroller;
        if (_dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
            _calculate(_el.offsetWidth, _scroller && _scroller.scrollerWidth, 'width', _scroller.maxScrollX);
        } else if (_dir === SCROLLBAR_DIRECTION.VERTICAL) {
            _calculate(_el.offsetHeight, _scroller && _scroller.scrollerHeight, 'height', _scroller.maxScrollY);
        }

        /**
         * 计算scrollbar的高度／ratio
         * @param {Number} scrollbarSize scrollbar的大小
         * @param {Number} scrollerSize scroller的滚动区域大小
         * @param {String} prop 设置style的属性
         * @param {Number} maxScroll 最大可以滑动距离
         */
        function _calculate (scrollbarSize, scrollerSize, prop, maxScroll) {
            let _indicatorSize = Math.floor((scrollbarSize * scrollbarSize) / (scrollerSize || scrollbarSize || 1));
            _indicatorSize = Math.max(_indicatorSize, INDICATOR_MIN_LEN);
            _that.indicatorSize = _indicatorSize;
            if (prop) {
                setStyle(_that.indicator, prop, `${_indicatorSize}px`);
            }
            _that.maxPos = scrollbarSize - _indicatorSize;
            _that.sizeRatio = _that.maxPos / maxScroll;
        }
    }

    /**
     * 设置scrollbar的新的位置
     * @param {Number} pos scrollbar的位置
     */
    _translate (pos) {
        const _that = this;
        const _opts = _that.defaultOptions;
        const _dir = _that.direction;
        if (_that.pos === pos) {
            return;
        }

        if (_opts.useTransform) {
            let _value;
            if (_dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
                _value = `translate3d(${pos}px, 0, 0)`;
            } else if (_dir === SCROLLBAR_DIRECTION.VERTICAL) {
                _value = `translate3d(0, ${pos}px, 0)`;
            }
            _value && setStyle(_that.indicator, styleName.transform, _value);
        } else {
            let _prop;
            if (_dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
                _prop = 'left';
            } else if (_dir === SCROLLBAR_DIRECTION.VERTICAL) {
                _prop = 'top';
            }
            _prop && setStyle(_that.indicator, _prop, `${pos}px`);
        }
        _that.pos = pos;
    }

    /**
     * 更新位置
     */
    _updatePos () {
        const _that = this;
        const _dir = _that.direction;
        const _scroller = _that.scroller;
        let _pos = _that.pos;
        if (_dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
            _pos = _updatePos(_scroller.x * _that.sizeRatio, 'width');
        } else if (_dir === SCROLLBAR_DIRECTION.VERTICAL) {
            _pos = _updatePos(_scroller.y * _that.sizeRatio, 'height');
        }

        _that._translate(_pos);

        /**
         * 更新位置
         * @param {Number} pos scrollbar的位置信息
         * @param {String} prop 属性的值
         * @returns {Number} 返回过滤好的位置信息
         */
        function _updatePos (pos, prop) {
            let _indicatorSize = _that.indicatorSize;
            let _maxPos = _that.maxPos || 0;
            if (pos < 0) {
                _indicatorSize = Math.max(_indicatorSize + pos * 3, INDICATOR_MIN_LEN);
                pos = 0;
            } else if (pos > _maxPos) {
                _indicatorSize = Math.max(_indicatorSize - (pos - _maxPos) * 3, INDICATOR_MIN_LEN);
                pos = _maxPos + _that.indicatorSize - _indicatorSize;
            }
            setStyle(_that.indicator, prop, `${_indicatorSize}px`);
            return pos;
        }
    }

    /**
     * 监听scrollbar的visible属性
     */
    _watchVisible () {
        const _that = this;
        if (typeof Object.defineProperty !== 'undefined') {
            let _visible = true;
            Object.defineProperty(_that, 'visible', {
                /**
                 * 获取当前的visible属性
                 * @returns {Boolean} 返回当前的scrollbar显示状态
                 */
                get () {
                    return _visible;
                },
                /**
                 * 设置当前scrollbar的显示状态
                 * @param {Boolean} nowVal 当前scrollbar的显示／隐藏值
                 */
                set (nowVal) {
                    _visible = nowVal;
                    setStyle(_that.el, 'opacity', _visible ? 1 : 0);
                }
            });
        }
    }

    /**
     * 是否应该显示scrollbar
     * @returns {Boolean} 返回显示scrollbar的标识
     */
    _shouldShow () {
        const _that = this;
        const _dir = _that.direction;
        const _scroller = _that.scroller;
        return (_dir === SCROLLBAR_DIRECTION.HORIZONTAL && _scroller.hasScrollX) ||
            (_dir === SCROLLBAR_DIRECTION.VERTICAL && _scroller.hasScrollY);
    }
}

/**
 * indicator的工厂方法
 * @param {HTMLElement} el scrollbar元素dom节点
 * @param {Scroll} scroller Scroll对象
 * @param {String} direction indicator方向
 * @param {Object} options 可选参数
 * @param {Boolean} options.fade 是否显示scrollbar
 * @param {Boolean} options.interative 是否监听dom事件
 * @returns {Indicator} 返回Indicator对象
 */
export default function indicatorFactory (el, scroller, direction, options) {
    return new Indicator(el, scroller, direction, options);
}
