import { DEFAULT_CONFIG, evtType,
    TOUCH_EVENT, EVENT_TYPE,
    LOCK_DIRECTION, PROBE_TYPE,
    MOVING_DIRECTION} from '../constants';
import ScrollBase from './Scroll.base';
import eventUtil from '../utils/eventUtil';
import getNow from '../utils/getNow';
import { ease } from '../utils/ease';
import momentum from '../utils/momentum';

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
        _that.distX = 0;
        _that.distY = 0;
        _that.directionLocked = 0;
        _that.moved = false;
        _that.startTime = getNow();

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
        const _options = _that.defaultOptions;
        let _point = evt.touches ? evt.touches[0] : evt;
        let _deltaX = _point.pageX - _that.pointX;
        let _deltaY = _point.pageY - _that.pointY;
        _that.pointX = _point.pageX;
        _that.pointY = _point.pageY;

        _that.distX += _deltaX;
        _that.distY += _deltaY;
        const _absDistX = Math.abs(_that.distX);
        const _absDistY = Math.abs(_that.distY);
        const _timestamp = getNow();
        if ((_timestamp - _that.startTime) < _options.momentumLimitTime ||
            (_absDistX < _options.momentumLimitDistance && _absDistY < _options.momentumLimitDistance)) {
            return;
        }

        _that.directionLocked = _that._handleDir();
        const _delta = _that._handleDelta(_deltaX, _deltaY);
        _deltaX = _delta.x;
        _deltaY = _delta.y;
        const _newPos = _that._handleNewPos(_deltaX, _deltaY);
        _that._scrollTo(_newPos.x, _newPos.y);

        if (!_that.moved) {
            _that.moved = true;
            _that.$emit(EVENT_TYPE.SCROLL_START, {
                x: _that.x,
                y: _that.y
            });
        }
        const _probeType = _options.probeType;
        if (_timestamp - _that.startTime > _options.momentumLimitTime) {
            _that.startX = _that.x;
            _that.startY = _that.y;
            _that.startTime = getNow();
            if (_probeType === PROBE_TYPE.DEBOUNCE) {
                _that.$emit(EVENT_TYPE.SCROLL, {
                    x: _that.x,
                    y: _that.y
                });
            }
        }
        if (_probeType === PROBE_TYPE.REAL_TIME) {
            _that.$emit(EVENT_TYPE.SCROLL, {
                x: _that.x,
                y: _that.y
            });
        }
    }
    /**
     * 滑动结束
     * @param {Event} evt 事件对象
     */
    _end (evt) {
        const _that = this;
        const _evtType = evtType[evt.type];
        if (!_that.enabled || _that.initiated !== _evtType) {
            return;
        }
        _that.initiated = false;
        _that.$emit(EVENT_TYPE.TOUCH_END, {
            x: _that.x,
            y: _that.y
        });
        const _options = _that.defaultOptions;
        const _bounceTime = _options.bounceTime;

        if (_that._resetPos(_that.x, _that.y, _bounceTime, ease.bounce)) {
            return;
        }

        let _endTime = getNow();
        const _newX = _that.x;
        const _newY = _that.y;
        const _deltaX = _newX - _that.absStartX;
        const _deltaY = _newY - _that.absStartY;
        _that.directionX = _deltaX < 0 ? MOVING_DIRECTION.LEFT : (_deltaX > 0 ? MOVING_DIRECTION.RIGHT : 0);
        _that.directionY = _deltaY < 0 ? MOVING_DIRECTION.TOP : (_deltaY > 0 ? MOVING_DIRECTION.BOTTOM : 0);
        let _absDistX = Math.abs(_newX - _that.startX);
        let _absDistY = Math.abs(_newY - _that.startY);
        let _time = _endTime - _that.startTime;
        if (_time < _options.momentumLimitTime &&
            (_absDistX > _options.momentumLimitDistance || _absDistY > _options.momentumLimitDistance)) { // 开启动量
            const _dirX = _that.directionX;
            const _dirY = _that.directionY;
            const { left, right, top, bottom } = _that._filterBounce();
            let _wrapWidth = ((_dirX === MOVING_DIRECTION.LEFT && right) || (_dirX === MOVING_DIRECTION.RIGHT && left))
                ? _that.wrapperWidth : 0;
            let _wrapHeight = ((_dirY === MOVING_DIRECTION.TOP && bottom) || (_dirY === MOVING_DIRECTION.BOTTOM && top))
                ? _that.wrapperHeight : 0;
            let _desX = momentum(_newX, _that.startX, _time, _that.maxScrollX, _that.minScrollX, _wrapWidth, _options);
            let _desY = momentum(_newY, _that.startY, _time, _that.maxScrollY, _that.minScrollY, _wrapHeight, _options);
            _newX = (_desX && _desX.destination) || _newX;
            _newY = (_desY && _desY.destination) || _newY;
            _time = Math.max(_desX && _desX.duration, _desY && _desY.duration, _time);
        }
        _that._scrollTo(_newX, _newY, _time);
    }

    /**
     * 固定滚动方向
     * @returns {String} 返回固定的滚动方向
     */
    _handleDir () {
        const _that = this;
        const _options = _that.defaultOptions;
        let _dirLocked = _that.directionLocked;
        if (!_dirLocked && !_options.freeScroll) {
            if (_absDistY - _absDistX >= _options.directionLockThreshold) {
                _dirLocked = LOCK_DIRECTION.VERTICAL;
            } else if (_absDistX - _absDistY > _options.directionLockThreshold) {
                _dirLocked = LOCK_DIRECTION.HORIZONTAL;
            } else {
                _dirLocked = LOCK_DIRECTION.NO;
            }
        }
        return _dirLocked;
    }

    /**
     * 处理delta
     * @param {Number} deltaX 水平方向的delta
     * @param {Number} deltaY 垂直方向的delta
     * @returns {Object} 返回处理后的delta
     */
    _handleDelta (deltaX, deltaY) {
        const _that = this;
        const _options = _that.defaultOptions;
        const _evtPassthrough = _options.eventPassthrough;
        if (_dirLocked === LOCK_DIRECTION.HORIZONTAL) {
            if (_evtPassthrough === LOCK_DIRECTION.HORIZONTAL) {
                _that.initiated = false;
                return;
            }
            deltaY = 0;
        } else if (_dirLocked === LOCK_DIRECTION.VERTICAL) {
            if (_evtPassthrough === LOCK_DIRECTION.VERTICAL) {
                _that.initiated = false;
                return;
            }
            deltaX = 0;
        }

        deltaX = _that.hasScrollX ? deltaX : 0;
        deltaY = _that.hasScrollY ? deltaY : 0;
        return {
            x: deltaX,
            y: deltaY
        };
    }

    /**
     * 处理新的位置
     * @param {Number} deltaX 水平方向的delta
     * @param {Number} deltaY 垂直方向的delta
     * @returns {Object} 返回处理后的新的水平／垂直方向的滚动位置
     */
    _handleNewPos (deltaX, deltaY) {
        let _newX = _that.x + deltaX;
        let _newY = _that.y + deltaY;
        const { left, right, top, bottom } = _that._filterBounce();
        if (_newX > _that.minScrollX || _newX < _that.maxScrollX) {
            if ((_newX > _that.minScrollX && left) ||
                (_newX < _that.maxScrollX && right)) {
                _newX = _that.x + deltaX / 3;
            } else {
                _newX = _newX > _that.minScrollX ? _that.minScrollX : _that.maxScrollX;
            }
        }
        if (_newY > _that.minScrollY || _newY < _that.maxScrollY) {
            if ((_newY > _that.minScrollY && top) ||
                (_newY < _that.maxScrollY && bottom)) {
                _newY = _that.y + deltaY / 3;
            } else {
                _newY = _newY > _that.minScrollY ? _that.minScrollY : _that.maxScrollY;
            }
        }
        return {
            x: _newX,
            y: _newY
        };
    }

    /**
     * 设置滚动条位置
     * @param {Number} x 水平位置
     * @param {Number} y 垂直位置
     * @param {Number} time 动画时间
     * @param {*} easing 动画规则方法
     */
    _scrollTo (x, y, time, easing) {
        const _that = this;
        if (x === _that.x && y === _that.y) {
            return;
        }

        const _opts = _that.defaultOptions;
        if (!time || _opts.useTransition) {

        }
    },
    _setNewPos (x, y) {

    }

    /**
     * 重置滚动条位置
     * @param {Number} x 水平位置
     * @param {Number} y 垂直位置
     * @param {Number} time 动画时间
     * @param {*} easing 动画规则方法
     * @returns {Boolean} 是否重置滚动条位置成功
     */
    _resetPos (x, y, time, easing) {
        const _that = this;
        let _res = false;
        if (!_that.hasScrollX || x > _that.minScrollX) {
            x = _that.minScrollX;
        } else if (x < _that.maxScrollX) {
            x = _that.maxScrollX;
        }
        if (!_that.hasScrollY || y > _that.minScrollY) {
            y = _that.minScrollX;
        } else if (y < _that.maxScrollY) {
            y = _that.maxScrollY;
        }

        if (x !== _that.x || y !== _that.y) {
            _res = true;
        }

        if (_res) {
            _that._scrollTo(x, y, time, easing);
        }
        return _res;
    }
}
