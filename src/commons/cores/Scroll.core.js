import { DEFAULT_CONFIG, evtType, TOUCH_EVENT, EVENT_TYPE } from '../constants';
import ScrollBase from './Scroll.base';
import eventUtil from '../utils/eventUtil';
import preventDefaultException from '../utils/preventDefaultException';

export default class ScrollCore extends ScrollBase {
    defaultOptions = DEFAULT_CONFIG;

    constructor (el, options) {
        super(el, options);
        const _that = this;
        _that.setDefaultOptions(options);
    }

    /**
     * 准备滑动
     * @param {Event} evt 事件对象
     */
    _start (evt) {
        const _that = this;
        const _options = _that.defaultOptions;
        const _type = evtType[evt && evt.type];
        const _button = eventUtil.getButton(evt);
        if (_type !== TOUCH_EVENT &&
            _button !== '0') {
            return;
        }
        if (!_that.enabled || 
                (_that.initiated && _that.initiated !== _type)) {
            return;
        }
        _that.initiated = _type;
        _that._preventEvent(evt);

        const _point = evt.touches ? evt.touches[0] : evt;
        _that.pointX = _point.pageX;
        _that.pointY = _point.pageY;
        _that.startX = _that.x;
        _that.startY = _that.y;
        _that.absStartX = _that.x;
        _that.absStartY = _that.y;
        _that.movingDirectionX = 0;
        _that.movingDirectionY = 0;
        _that.directionX = 0;
        _that.directionY = 0;
        
        _that.$emit(EVENT_TYPE.BEFORE_SCROLL_START, {
            x: _that.x,
            y: _that.y
        });
    }

    /**
     * 滑动
     * @param {*} evt 事件对象
     */
    _move (evt) {
        const _that = this;
        const _type = evtType[evt.type];
        if (!_that.enabled || _that.initiated !== _type) {
            return;
        }
        _that._preventEvent(evt);
        
        let _point = evt.touches ? evt.touches[0] : evt;
        let _deltaX = _point.pageX - _that.pointX;
        let _deltaY = _point.pageY - _that.pointY;
        _that.pointX = _point.pageX;
        _that.pointY = _point.pageY;
    }

    /**
     * 阻止事件默认行为/冒泡
     * @param {Event} evt 事件对象
     */
    _preventEvent (evt) {
        const _that = this;
        const _options = _that.defaultOptions;
        if (_options.preventDefault && 
            !preventDefaultException(eventUtil.getTarget(evt), _options.preventDefaultException)) {
            eventUtil.preventDefault(evt);
        }
        if (_options.stopPropagation) {
            eventUtil.stopPropagation(evt);
        }
    }
}
