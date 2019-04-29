import DefaultOptions from '../../utils/DefaultOptions';
import { EVENT_TYPE, DEFAULT_CONFIG } from '../../constants';

class PullupLoad extends DefaultOptions {
    defaultOptions = DEFAULT_CONFIG;

    /**
     * Scroll对象
     */
    scroller = null;
    /**
     * 标识是不是当前已经处在监听滚动条上拉加载功能
     */
    locked = false;

    constructor (scroller, options) {
        super(options);

        const _that = this;
        _that.setDefaultOptions(options);
        if (!scroller) {
            return;
        }
        _that.scroller = scroller;
        _that._addPullUp();
    }

    /**
     * 初始化上拉加载
     * @param {Object} options 配置参数
     * @param {Number} options.threshold 下拉加载阀值
     */
    _addPullUp (options) {
        const _that = this;
        if (_that.locked) {
            return;
        }

        _that.locked = true;
        _that.scroller.$on(EVENT_TYPE.SCROLL, _that._doCheck.bind(_that, options));
    }

    /**
     * 移除上拉加载功能
     */
    _removePullUp () {
        const _that = this;
        const _scroller = _that.scroller;
        _scroller.$off(EVENT_TYPE.SCROLL, _that._doCheck);
    }

    /**
     * 检查下拉加载位置
     * @param {Object} evt 滚动条位置信息
     * @param {Object} options 可选参数
     */
    _doCheck (evt, options) {
        console.log(evt, options);
        if (!evt) {
            return;
        }
        const _that = this;
        const _opts = _that.getOptions(options);
        let { threshold = 0 } = _opts.pullupLoad;
        const _scroller = _that.scroller;
        const _y = evt.y;
        if (_y <= _scroller.maxScrollY + threshold) {
            _scroller.$once(EVENT_TYPE.SCROLL_END, () => {
                _that.locked = false;
            });
            _that.$emit(EVENT_TYPE.PULLING_UP);
            _that._removePullUp();
        }
    }

    /**
     * 完成上拉加载
     */
    finishPullUp () {
        const _that = this;
        if (_that.locked) {
            _that.$on(EVENT_TYPE.SCROLL_END, () => {
                _that._addPullUp();
            });
        } else {
            _that._addPullUp();
        }
    }

    /**
     * 打开上拉加载功能
     * @param {Object} options 配置
     */
    openPullUp (options) {
        this._addPullUp(options);
    }

    /**
     * 关闭上拉加载功能
     */
    closePullUp () {
        const _that = this;
        if (!_that.locked) {
            return;
        }
        _that.locked = false;
        _that._removePullUp();
    }
}

/**
 * 上拉加载的工厂方法
 * @param {Scroll} scroller 滚动条对象
 * @param {Object} options 可选参数
 * @returns {PullupLoad} 返回PullUpLoad对象
 */
export default function pullupLoadFactory (scroller, options) {
    return new PullupLoad(scroller, options);
}
