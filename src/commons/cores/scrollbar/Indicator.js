/* eslint-disable */
import DefaultOptions from '../../utils/DefaultOptions';
import { EVENT_TYPE, SCROLLBAR_DIRECTION, DEFAULT_CONFIG,
    styleName, evtType, TOUCH_EVENT } from '../../constants';
import setStyle from '../../utils/setStyle';
import setTransition from '../../helpers/setTransition';
import eventUtil from '../../utils/eventUtil';
import isTouch from '../../utils/isTouch';
import preventEvent from '../../helpers/preventEvent';

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
    size = 0;
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

        const _scrollbar = _opts.scrollbar;
        const _fade = _scrollbar.fade;
        _that.visible = !_fade;

        if (_scrollbar.interactive) {
            _that._initDomEvent(true);
        }
    }

    /**
     * 设置动画时长和动画规则
     * @param {Number} time 动画时长
     * @param {Function} easing 动画规则
     */
    setTransition (time, easing) {
        const _that = this;
        time = time || 0;
        easing = easing || null;
        setTransition(_that.indicator, time, easing);
    }

    /**
     * 刷新
     */
    refresh () {
        const _that = this;
        let _isShow = false;
        if (_that._shouldShow()) {
            _isShow = true;
            setTransition(_that.indicator);
            _that._calculate();
            _that.updatePos();
        }
        setStyle(_that.el, 'display', _isShow ? 'block' : 'none');
    }

    /**
     * 销毁
     */
    destroy () {
        const _that = this;
        const _el = _that.el;
        const _parentNode = _el && _el.parentNode;
        _that._initDomEvent(false);
        if (_parentNode) {
            _parentNode.removeChild(_el);
        }
    }

    /**
     * 初始化dom事件
     * @param {Boolean} flag 当flag为true，则注册事件，当flag为false，则取消事件
     */
    _initDomEvent (flag) {
        const _that = this;
        const _opts = _that.defaultOptions;
        if (!_opts.disableMouse) {
            eventUtil.initEventListener(_that.indicator, 'mousedown', _that, flag);
            eventUtil.initEventListener(window, ['mousemove', 'mousecancel', 'mouseup'], _that, flag);
        }
        if (!_opts.disableTouch && isTouch) {
            eventUtil.initEventListener(_that.indicator, 'touchstart', _that, flag);
            eventUtil.initEventListener(window, ['touchmove', 'touchcancel', 'touchend'], _that, flag);
        }
    }

    /**
     * 事件处理程序
     * @param {Event} evt 事件对象
     */
    handleEvent (evt) {
        const _that = this;
        const _type = evt && evt.type;
        switch (_type) {
            case 'mousedown':
            case 'touchstart':
                _that._start(evt);
                break;
            case 'mousemove':
            case 'touchmove':
                _that._move(evt);
                break;
            case 'mousecancel':
            case 'touchcancel':
            case 'mouseup':
            case 'touchend':
                _that._end(evt);
                break;
        }
    }

    /**
     * 准备滑动前
     * @param {Event} evt 事件对象
     */
    _start (evt) {
        const _that = this;
        const _evtType = evtType[evt.type || ''];
        if (_evtType !== TOUCH_EVENT) {
            const _button = eventUtil.getButton(evt);
            if (_button !== '0') {
                return;
            }
        }
        const _scroller = _that.scroller;
        const _opts = _that.defaultOptions;
        if (_scroller.destroyed || !_scroller.enabled ||
            (_that.initiated && _that.initiated !== _evtType)) {
            return;
        }
        _that.initiated = _evtType;

        preventEvent(evt, _opts);
        _that.moved = false;
        _that.point = _that._getPoint(evt);
        _scroller.$emit(EVENT_TYPE.BEFORE_SCROLL_START, {
            x: _scroller.x,
            y: _scroller.y
        });
    }

    /**
     * 滚动条滑动
     * @param {Event} evt 事件对象
     */
    _move (evt) {
        const _that = this;
        const _evtType = evtType[evt && evt.type];
        const _scroller = _that.scroller;
        if (_scroller.destroyed || !_scroller.enabled ||
            (_that.initiated !== _evtType)) {
            return;
        }
        const _opts = _that.defaultOptions;
        const _dir = _that.direction;
        preventEvent(evt, _opts);
        if (!_that.moved) {
            _scroller.$emit(EVENT_TYPE.SCROLL_START, {
                x: _scroller.x,
                y: _scroller.y
            });
        }
        const _point = evt.touches ? evt.touches[0] : evt;

        let _delta;
        if (_dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
            _delta = _point.pageX - _that.point;
        } else if (_dir === SCROLLBAR_DIRECTION.VERTICAL) {
            _delta = _point.pageY - _that.point;
        }
        _that.point = _that._getPoint(evt);
        if (_delta) {
            _that._setPos(_that.pos + _delta);
        }
    }

    /**
     * 滑动结束
     * @param {Event} evt 事件对象
     */
    _end (evt) {
        const _that = this;
        const _evtType = evtType[evt && evt.type];
        const _scroller = _that.scroller;
        if (_scroller.destroyed || !_scroller.enabled ||
            (_that.initiated !== _evtType)) {
            return;
        }
        _that.initiated = false;
        _that.$emit(EVENT_TYPE.SCROLL_END, {
            x: _scroller.x,
            y: _scroller.y
        });
    }

    /**
     * 获取当前位置
     * @param {Event} evt 事件对象
     * @returns {Number} 返回当前的位置信息
     */
    _getPoint (evt) {
        const _that = this;
        let _res;
        const _dir = _that.direction;
        const _point = evt.touches ? evt.touches[0] : evt;
        if (_dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
            _res = _point.pageX;
        } else if (_dir === SCROLLBAR_DIRECTION.VERTICAL) {
            _res = _point.pageY;
        }
        return _res;
    }

    /**
     * 设置位置
     * @param {Number} pos 新的位置
     */
    _setPos (pos) {
        const _that = this;
        const _scroller = _that.scroller;
        const _dir = _that.direction;
        if (pos < 0) {
            pos = 0;
        } else if (pos > _that.maxPos) {
            pos = _that.maxPos;
        }
        const _pos = pos / _that.sizeRatio;
        let _newX = _scroller.x;
        let _newY = _scroller.y;
        if (_dir === SCROLLBAR_DIRECTION.HORIZONTAL) {
            _newX = _pos;
        } else if (_dir === SCROLLBAR_DIRECTION.VERTICAL) {
            _newY = _pos;
        }
        _scroller._scrollTo(_newX, _newY);
    }

    /**
     * 隐藏／显示scrollbar
     * @param {Boolean} visible 是否显示／隐藏scrollbar
     * @param {Boolean} hold 是否当以前是隐藏的时候还是保留隐藏状态
     */
    fade (visible, hold) {
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
            let _size = Math.floor((scrollbarSize * scrollbarSize) / (scrollerSize || scrollbarSize || 1));
            _size = Math.max(_size, INDICATOR_MIN_LEN);
            _that.size = _size;
            if (prop) {
                setStyle(_that.indicator, prop, `${_size}px`);
            }
            _that.maxPos = scrollbarSize - _size;
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
    updatePos () {
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
            let _size = _that.size;
            let _maxPos = _that.maxPos || 0;
            if (pos < 0) {
                _size = Math.max(_size + pos * 3, INDICATOR_MIN_LEN);
                pos = 0;
            } else if (pos > _maxPos) {
                _size = Math.max(_size - (pos - _maxPos) * 3, INDICATOR_MIN_LEN);
                pos = _maxPos + _that.size - _size;
            }
            setStyle(_that.indicator, prop, `${_size}px`);
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
