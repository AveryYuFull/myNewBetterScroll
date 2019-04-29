import { DEFAULT_CONFIG } from '../constants';
import ScrollCore from './Scroll.core';
import callFn from '../utils/callFn';

export default class Scroll extends ScrollCore {
    defaultOptions = DEFAULT_CONFIG;

    constructor (el, options) {
        super(el, options);
        const _that = this;
        _that.setDefaultOptions(options);
    }

    /**
     * 结束上拉加载
     */
    finishPullup () {
        const _that = this;
        const _pullup = _that.pullupObj;
        if (_pullup) {
            callFn(_pullup.finishPullup);
        }
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
}
