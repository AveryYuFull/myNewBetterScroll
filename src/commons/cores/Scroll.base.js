import { DEFAULT_CONFIG, EVENT_TYPE, styleName } from '../constants';
import DefaultOptions from '../utils/DefaultOptions';
import getRect from '../utils/getRect';
import getStyle from '../utils/getStyle';
import { initEventListener } from '../utils/eventUtil';
import isTouch from '../utils/isTouch';

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

    constructor (el, options) {
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
        _that._initElem(el);
        _that._refresh();
    }

    /**
     * 初始化获取滚动元素和滚动区域的包裹元素
     * @param {HTMLElement|String} el 包裹的元素
     */
    _initElem (el) {
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
            return;
        }
    }

    /**
     * 添加/取消事件
     */
    _initDomEvent (flag) {
        const _that = this;
        const _options = _that.defaultOptions;
        const _target = _options.bindToWrapper ? _that.wrapper : window;
        initEventListener(window, ['orientationchange', 'resize'], _that, flag);

        if (!_options.disableMouse) {
            initEventListener(_that.wrapper, 'mousedown', _that, flag);
            initEventListener(_target, ['mousemove', 'mousecancel', 'mouseup'], _that, flag);
        }
        if (!_options.disableTouch && isTouch()) {
            initEventListener(_that.wrapper, 'touchstart', _that. flag);
            initEventListener(_target, ['touchmove', 'touchcancel', 'touchend'], _that, flag);
        }
        initEventListener(_that.scroller, styleName.transitionEnd, _that, flag);
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
}
