import DefaultOptions from '../../utils/DefaultOptions';
import { DEFAULT_CONFIG, SCROLLBAR_DIRECTION } from '../../constants';
import genDom from '../../utils/genDom';

export default class Scrollbar extends DefaultOptions {
    defaultOptions = DEFAULT_CONFIG;

    /**
     * 滚动条对象
     */
    scroller = null;

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
        const _options = _that.defaultOptions;
        const { fade, interactive } = _options.scrollbar;
        const _scroller = _that.scroller;
        if (_scroller.hasScrollX) {
            let _scrollbarX = _that._createScrollbar(SCROLLBAR_DIRECTION.HORIZONTAL);
        }
        if (_scroller.hasScrollY) {
            let _scrollbarY = _that._createScrollbar(SCROLLBAR_DIRECTION.VERTICAL);
        }
    }

    /**
     * 创建滚动条
     * @param {SCROLLBAR_DIRECTION} dir 滚动条方向
     */
    _createScrollbar (dir) {
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