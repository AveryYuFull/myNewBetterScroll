/* eslint-disable */
import { DEFAULT_CONFIG, EVENT_TYPE, styleName } from '../constants';
import DefaultOptions from '../utils/DefaultOptions';
import getRect from '../utils/getRect';
import getStyle from '../utils/getStyle';
import eventUtil from '../utils/eventUtil';
import isTouch from '../utils/isTouch';
import scrollbarFactory from './scrollbar/Scrollbar';
import pullUpLoadFactory from './pullUpLoad/PullUpLoad';
export default class ScrollBase extends DefaultOptions {
    defaultOptions = DEFAULT_CONFIG;
    /**
     * 包裹元素
     */
    wrapper = null;
    /**
     * 滚动内容区
     */
    scroller = null;
    /**
     * 是否开启滚动
     */
    enabled = true;
    destroyed = false;
    x = 0;
    y = 0;

    constructor (el, options) {
        super(options);
        const _that = this;
        _that.setDefaultOptions(options);
        _that._init(el);
    }

    /**
     * 初始化
     * @param {HTMLElement|String} el 包裹的元素
     */
    _init (el) {
        const _that = this;
        const _opts = _that.defaultOptions;

        _that._initElem(el);
        _that._watchTransition();
        _that._initDomEvent(true);
        if (_opts.observeDOM) {
            _that._initDOMObserver();
        }
        if (_opts.autoBlur) {
            _that._handleAutoBlur();
        }
        _that._initExtFeatures();
        _that._refresh();
        _that.enable();
    }

    /**
     * 初始化获取滚动元素和滚动区域的包裹元素
     * @param {HTMLElement|String} el 包裹的元素
     */
    _initElem (el) {
        const _that = this;
        if (typeof el === 'string') {
            el = document.querySelector(el);
        }
        if (!el) {
            console.warn('需要传入合法的滚动区域包裹元素');
            return;
        }

        _that.wrapper = el;
        _that.scroller = el.children && el.children[0];
        if (!_that.scroller) {
            console.warn('没有滚动内容');
        }
    }

    /**
     * 添加/取消事件
     * @param {Boolean} flag 添加/取消事件
     */
    _initDomEvent (flag) {
        const _that = this;
        const _options = _that.defaultOptions;
        const _target = _options.bindToWrapper ? _that.wrapper : window;
        eventUtil.initEventListener(window, ['orientationchange', 'resize'], _that, flag);
        if (!_options.disableMouse) {
            eventUtil.initEventListener(_that.wrapper, 'mousedown', _that, flag);
            eventUtil.initEventListener(_target, ['mousemove', 'mousecancel', 'mouseup'], _that, flag);
        }
        if (!_options.disableTouch && isTouch) {
            eventUtil.initEventListener(_that.wrapper, 'touchstart', _that, flag, {passive: false});
            eventUtil.initEventListener(_target, ['touchmove', 'touchcancel', 'touchend'], _that, flag, {passive: false});
        }
        eventUtil.initEventListener(_that.scroller, styleName.transitionEnd, _that, flag);
    }

    /**
     * 事件处理程序
     * @param {Event} evt 事件对象
     */
    handleEvent (evt) {
        const _that = this;
        const _type = (evt && evt.type) || '';
        switch (_type) {
            case 'mousedown':
            case 'touchstart':
                _that._start(evt);
                break;
            case 'mousemove':
            case 'touchmove':
                _that._move(evt);
                break;
            case 'mouseup':
            case 'mousecancel':
            case 'touchend':
            case 'touchcancel':
                _that._end(evt);
                break;
            case styleName.transitionEnd:
                _that._transitionEnd(evt);
                break;
        }
    }

    /**
     * 初始化额外的功能
     */
    _initExtFeatures () {
        const _that = this;
        const _opts = _that.defaultOptions;
        if (_opts.scrollbar) {
            scrollbarFactory(_that, _opts);
        }
        if (_opts.pullUpLoad) {
            pullUpLoadFactory(_that, _opts);
        }
    }

    /**
     * refresh相关数据（比如滚动区的宽高，包裹区的宽高，还有可以滚动的范围）
     */
    _refresh () {
        const _that = this;
        const _options = _that.defaultOptions;
        const _wrapper = _that.wrapper;
        const _scroller = _that.scroller;
        if (!_wrapper || !_scroller) {
            return;
        }

        let _isWrapStatic = getStyle(_wrapper, 'position') === 'static';

        let _wrapperRect = getRect(_wrapper);
        let _scrollerRect = getRect(_scroller);
        _that.wrapperWidth = _wrapperRect.width;
        _that.wrapperHeight = _wrapperRect.height;
        _that.scrollerWidth = _scrollerRect.width;
        _that.scrollerHeight = _scrollerRect.height;

        let _reletiveX = _scroller.left;
        let _reletiveY = _scroller.top;
        if (_isWrapStatic) {
            _reletiveX = _scroller.left - _wrapper.left;
            _reletiveY = _scroller.top - _wrapper.top;
        }

        _that.maxScrollX = _that.wrapperWidth - _that.scrollerWidth;
        _that.maxScrollY = _that.wrapperHeight - _that.scrollerHeight;
        _that.minScrollX = 0;
        _that.minScrollY = 0;
        if (_reletiveX) {
            _that.maxScrollX -= _reletiveX;
            _that.minScrollX = -_reletiveX;
        }
        if (_reletiveY) {
            _that.maxScrollY -= _reletiveY;
            _that.minScrollY = -_reletiveY;
        }

        _that.hasScrollX = _options && _options.scrollX && _that.maxScrollX < _that.minScrollX;
        _that.hasScrollY = _options && _options.scrollY && _that.maxScrollY < _that.minScrollY;
        if (!_that.hasScrollX) {
            _that.scrollerWidth = _that.wrapperWidth;
            _that.maxScrollX = _that.minScrollX = 0;
        }
        if (!_that.hasScrollY) {
            _that.scrollerHeight = _that.wrapperHeight;
            _that.maxScrollY = _that.minScrollY = 0;
        }

        _that.$emit(EVENT_TYPE.REFRESH);
    }

    /**
     * 是否开启滚动
     */
    enable () {
        this.enabled = true;
    }

    /**
     * 禁用 better-scroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
     */
    disable () {
        this.enabled = false;
    }

    /**
     * 销毁better-scroll，解除事件
     */
    destroy () {
        const _that = this;
        const _opts = _that.defaultOptions;
        _that.destroyed = true;
        if (_opts.useTransition) {
            _that.isInTransition = false;
            cancelAnimationFrame(_that.probeTimer);
        } else {
            _that.isAnimating = false;
            cancelAnimationFrame(_that.animateTimer);
        }
        _that._initDomEvent(false);
        _that.$emit(EVENT_TYPE.DESTROY);
        _that._events = null;
    }

    /**
     * 过滤bounce
     * @returns {Object} 返回过滤后的值
     */
    _filterBounce () {
        const _that = this;
        const _bounce = _that.defaultOptions.bounce;
        let _res = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };
        if (_bounce) {
            _res = {
                left: typeof _bounce.left === 'undefined' ? true : _bounce.left,
                right: typeof _bounce.right === 'undefined' ? true : _bounce.right,
                top: typeof _bounce.top === 'undefined' ? true : _bounce.top,
                bottom: typeof _bounce.bottom === 'undefined' ? true : _bounce.bottom
            };
        }
        return _res;
    }

    /**
     * 注册监听动画的变量
     */
    _watchTransition () {
        const _that = this;
        if (Object.defineProperty instanceof Function) {
            const _opts = _that.defaultOptions;
            const _scroller = _that.scroller;
            let _isInTransition = false;
            let _key = _opts.useTransition ? 'isInTransition' : 'isAnimating';
            Object.defineProperty(_that, _key, {
                get () {
                    return _isInTransition;
                },
                set (nowVal) {
                    _isInTransition = nowVal;
                    let _domList = _scroller.children.length > 0 ? _scroller.children : [_scroller];
                    let _pointerEvents = _isInTransition ? 'none' : 'auto';
                    for (let i = 0; i < _domList.length; i++) {
                        const _el = _domList[i];
                        _el.style.pointerEvents = _pointerEvents;
                    }
                }
            });
        }
    }

    /**
     * 注册dom变化的监听器
     */
    _initDOMObserver () {
        const _that = this;
        if (typeof MutationObserver !== 'undefined') {
            let _observer = new MutationObserver((mutations) => {
                if (_that._shouldNotRefresh()) {
                    return;
                }
                let _immediateRefresh = false;
                let _defferRefresh = false;
                for (let i = 0; i < mutations.length; i++) {
                    const _mutation = mutations[i];
                    const _type = _mutation.type;
                    if (_type !== 'attributes') {
                        _immediateRefresh = true;
                        break;
                    } else {
                        const _target = _mutation.target;
                        if (_target !== _that.scroller) {
                            _defferRefresh = true;
                            break;
                        }
                    }
                }
                if (_immediateRefresh) {
                    _that._refresh();
                } else if (_defferRefresh) {
                    setTimeout(() => {
                        if (!_that._shouldNotRefresh()) {
                            _that._refresh();
                        }
                    }, 60);
                }
            });
            _observer.observe(_that.scroller, {
                attributes: true,
                childList: true,
                subtree: true
            });
            _that.$on(EVENT_TYPE.DESTROY, () => {
                _observer.disconnect();
            });
        } else {
            _that._checkDOMUpdate();
        }
    }

    /**
     * 监听dom的变化
     */
    _checkDOMUpdate () {
        const _that = this;
        let _scrollRect = getRect(_that.scroller);
        const _oldW = _scrollRect.width;
        const _oldH = _scrollRect.height;

        /**
         * 分步骤监听dom元素的变化
         */
        function _check () {
            if (_that.destroyed) {
                return;
            }
            _scrollRect = getRect(_that.scroller);
            const _newW = _scrollRect.width;
            const _newH = _scrollRect.height;
            if (_newW !== _oldW ||
                _newH !== _oldH) {
                _that._refresh();
            }
            next();
        }

        /**
         * 分步骤监听dom元素的变化
         */
        function next () {
            setTimeout(() => {
                _check();
            }, 1000);
        }

        next();
    }

    /**
     * 是否应该refresh
     * @return {Boolean} 返回是否应该刷新dom
     */
    _shouldNotRefresh () {
        const _that = this;
        let _outOfBoundary = _that.x < _that.maxScrollX || _that.x > _that.maxScrollX ||
            _that.y < _that.maxScrollY || _that.y > _that.minScrollY;
        return _that._isInTransition || _that.isAnimating || _outOfBoundary;
    }

    /**
     * 当在开始滑动时应该自动失去焦点
     */
    _handleAutoBlur () {
        const _that = this;
        _that.$on(EVENT_TYPE.SCROLL_START, () => {
            const _activeElement = document.activeElement;
            if (_activeElement && (_activeElement.tagName === 'INPUT' || _activeElement.tagName === 'TEXTAREA')) {
                _activeElement.blur();
            }
        });
    }
}
