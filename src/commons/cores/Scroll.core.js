/* eslint-disable */
import { DEFAULT_CONFIG, evtType,
    TOUCH_EVENT, EVENT_TYPE,
    LOCK_DIRECTION, PROBE_TYPE,
    MOVING_DIRECTION,
    styleName} from '../constants';
import ScrollBase from './Scroll.base';
import eventUtil from '../utils/eventUtil';
import getNow from '../utils/getNow';
import { ease } from '../utils/ease';
import momentum from '../utils/momentum';
import setStyle from '../utils/setStyle';
import { requestAnimationFrame, cancelAnimationFrame } from '../utils/raf';
import getStyle from '../utils/getStyle';
import setTransition from '../helpers/setTransition';

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
        if (_that.destroyed || _type !== TOUCH_EVENT &&
            _button !== '0') {
            return;
        }
        if (!_that.enabled ||
                (_that.initiated && _that.initiated !== _type)) {
            return;
        }
        _that.initiated = _type;
        _that._preventEvent(evt);

        _that._stop();

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
        if (_that.destroyed || !_that.enabled || _that.initiated !== _type) {
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
        if ((_timestamp - _that.endTime) > _options.momentumLimitTime &&
            (_absDistX < _options.momentumLimitDistance && _absDistY < _options.momentumLimitDistance)) {
            return;
        }

        _that.directionLocked = _that._handleDir(_absDistX, _absDistY);
        const _delta = _that._handleDelta(_deltaX, _deltaY);
        _deltaX = _delta.x;
        _deltaY = _delta.y;
        const _newPos = _that._handleNewPos(_deltaX, _deltaY, _that.directionLocked);
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
        if (_probeType > PROBE_TYPE.DEBOUNCE) {
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
        if (_that.destroyed || !_that.enabled || _that.initiated !== _evtType) {
            return;
        }
        _that.initiated = false;
        _that.$emit(EVENT_TYPE.TOUCH_END, {
            x: _that.x,
            y: _that.y
        });
        const _options = _that.defaultOptions;
        const _bounceTime = _options.bounceTime;

        if (_that._resetPos(_bounceTime, ease.bounce)) {
            return;
        }

        let _newX = _that.x;
        let _newY = _that.y;

        const _deltaX = _newX - _that.absStartX;
        const _deltaY = _newY - _that.absStartY;
        _that.directionX = _deltaX < 0 ? MOVING_DIRECTION.LEFT : (_deltaX > 0 ? MOVING_DIRECTION.RIGHT : 0);
        _that.directionY = _deltaY < 0 ? MOVING_DIRECTION.TOP : (_deltaY > 0 ? MOVING_DIRECTION.BOTTOM : 0);

        _that.endTime = getNow();
        let _absDistX = Math.abs(_newX - _that.startX);
        let _absDistY = Math.abs(_newY - _that.startY);
        let _duration = _that.endTime - _that.startTime;

        // 开启动量
        let _time = 0;
        if (_options.momentum && _duration < _options.momentumLimitTime &&
            (_absDistX > _options.momentumLimitDistance || _absDistY > _options.momentumLimitDistance)) { // 开启动量
            const { left, right, top, bottom } = _that._filterBounce();
            let _wrapWidth = ((_that.directionX === MOVING_DIRECTION.LEFT && right) || (_that.directionX === MOVING_DIRECTION.RIGHT && left))
                ? _that.wrapperWidth : 0;
            let _wrapHeight = ((_that.directionY === MOVING_DIRECTION.TOP && bottom) || (_that.directionY === MOVING_DIRECTION.BOTTOM && top))
                ? _that.wrapperHeight : 0;
            const _momentX = _that.hasScrollX ? momentum(_newX, _that.startX, _duration, _that.maxScrollX, _that.minScrollX, _wrapWidth, _options)
                : {destination: _newX, duration: 0};
            const _momentY = _that.hasScrollY ? momentum(_newY, _that.startY, _duration, _that.maxScrollY, _that.minScrollY, _wrapHeight, _options)
                : {destination: _newY, duration: 0};
            _newX = _momentX.destination || _newX;
            _newY = _momentY.destination || _newY;
            _time = Math.max(_momentX.duration, _momentY.duration);
        }

        let _easing = ease.swipe;
        if (_newX !== _that.x || _newY !== _that.y) {
            if (_newX < _that.minScrollX || _newX > _that.maxScrollX ||
                _newY < _that.minScrollY || _newY > _that.maxScrollY) {
                _easing = ease.swipeBounce;
            }
            _that._scrollTo(_newX, _newY, _time, _easing);
            return;
        }

        _that.$emit(EVENT_TYPE.SCROLL_END, {
            x: _that.x,
            y: _that.y
        });
    }

    /**
     * 固定滚动方向
     * @param {Number} absDistX 水平方向滑动的总距离
     * @param {Number} absDistY 垂直方向滑动的总距离
     * @returns {String} 返回固定的滚动方向
     */
    _handleDir (absDistX, absDistY) {
        const _that = this;
        const _options = _that.defaultOptions;
        let _dirLocked = _that.directionLocked;
        if (!_dirLocked && !_options.freeScroll) {
            if (absDistY - absDistX >= _options.directionLockThreshold) {
                _dirLocked = LOCK_DIRECTION.VERTICAL;
            } else if (absDistX - absDistY > _options.directionLockThreshold) {
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
     * @param {LOCK_DIRECTION} dirLocked 滑动锁定的方向
     * @returns {Object} 返回处理后的delta
     */
    _handleDelta (deltaX, deltaY, dirLocked) {
        const _that = this;
        const _options = _that.defaultOptions;
        const _evtPassthrough = _options.eventPassthrough;
        if (dirLocked === LOCK_DIRECTION.HORIZONTAL) {
            if (_evtPassthrough === LOCK_DIRECTION.HORIZONTAL) {
                _that.initiated = false;
                return;
            }
            deltaY = 0;
        } else if (dirLocked === LOCK_DIRECTION.VERTICAL) {
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
        const _that = this;
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
     * 停止动画
     */
    _stop () {
        const _that = this;
        if (!_that.isInTransition && !_that.isAnimating) {
            return;
        }
        if (_that.defaultOptions.useTransition) {
            const _pos = _that._getComputedPos();
            _that._scrollTo(_pos.x, _pos.y);
        }
        _that.$dispatchEvent(_that.scroller, styleName.transitionEnd);
    }

    /**
     * 动画结束回调方法
     * @param {Event} evt 事件对象
     */
    _transitionEnd (evt) {
        const _that = this;
        if (evt.target !== _that.scroller ||
            (!_that.isInTransition && !_that.isAnimating)) {
            return;
        }

        const _opts = _that.defaultOptions;
        setTransition(_that.scroller, 0, null);
        if (_opts.useTransition) {
            cancelAnimationFrame(_that.probeTimer);
            _that.probeTimer = null;
            _that.isInTransition = false;
        } else {
            cancelAnimationFrame(_that.animateTimer);
            _that.animateTimer = null;
            _that.isAnimating = false;
        }
        if (!_that._resetPos(_opts.bounceTime, ease.bounce)) {
            _that.$emit(EVENT_TYPE.SCROLL_END, {
                x: _that.x,
                y: _that.y
            });
        }
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
        if (!time) {
            _that._translate(x, y);
        } else if (_opts.useTransition) {
            _that.isInTransition = true;
            setTransition(_that.scroller, time, easing && easing.style);
            _that._translate(x, y);
            if (time && _opts.probeType === PROBE_TYPE.MOMENTUM) {
                _that._startProbe();
            }
        } else {
            _that.isAnimating = true;
            _that._animate(x, y, time, easing.fn);
        }
    }

    /**
     * 使用js动画
     * @param {Number} x 新的水平位置
     * @param {Number} y 新的垂直位置
     * @param {Number} time 动画时长
     * @param {Function} easing 动画规则方法
     */
    _animate (x, y, time, easing) {
        const _that = this;
        const _opts = _that.defaultOptions;
        let _startX = _that.x;
        let _startY = _that.y;
        let _startTime = getNow();
        let _destTime = _startTime + time;

        function _step () {
            let _curTime = getNow();
            if (_curTime >= _destTime) {
                _that._translate(x, y);
                if (_opts.probeType === PROBE_TYPE.MOMENTUM) {
                    _that.$emit(EVENT_TYPE.SCROLL, {
                        x: _that.x,
                        y: _that.y
                    });
                }
                _that.$dispatchEvent(_that.scroller, styleName.transitionEnd);
                return;
            }
            _curTime = (_curTime - _startTime) / time;
            let _newX = _startX + easing(_curTime) * (x - _startX);
            let _newY = _startY + easing(_curTime) * (y - _startY);
            _that._translate(_newX, _newY);
            if (_opts.probeType === PROBE_TYPE.MOMENTUM) {
                _that.$emit(EVENT_TYPE.SCROLL, {
                    x: _that.x,
                    y: _that.y
                });
            }

            _that.animateTimer = requestAnimationFrame(_step);
        }

        cancelAnimationFrame(_that.animateTimer);
        _that.animateTimer = requestAnimationFrame(_step);
    }

    /**
     * 实时记录动画的滚动信息
     */
    _startProbe () {
        const _that = this;
        cancelAnimationFrame(_that.probeTimer);
        _that.probeTimer = requestAnimationFrame(_step);

        /**
         * 每一步执行的方法
         */
        function _step () {
            let _pos = _that._getComputedPos();
            _that.$emit(EVENT_TYPE.SCROLL, {
                x: _pos.x,
                y: _pos.y
            });
            if (_that.isInTransition) {
                _that.probeTimer = requestAnimationFrame(_step);
            }
        }
    }

    /**
     * 获取滚动条的位置信息
     * @returns {Object|Undefined} 返回滚动条的位置信息
     */
    _getComputedPos () {
        const _that = this;
        const _opts = _that.defaultOptions;
        let _style = getStyle(_that.scroller);
        if (!_style) {
            return {};
        }

        let _x;
        let _y;
        if (_opts.useTransform) {
            let _matrix = _style[styleName.transform] || '';
            _matrix = (_matrix.split(')')[0]) || '';
            _matrix = _matrix.split(', ');
            _x = _matrix[12] || _matrix[4];
            _y = _matrix[13] || _matrix[5];
        } else {
            _x = (_style['left'] || '').replace(/[^-.\d]/g, '');
            _y = (_style['top'] || '').replace(/[^-.\d]/g, '');
        }
        return {
            x: +_x,
            y: +_y
        };
    }

    /**
     * 设置新的位置
     * @param {Number} x 水平位置
     * @param {Number} y 垂直位置
     */
    _translate(x, y) {
        const _that = this;
        const _opts = _that.defaultOptions;
        if (x === _that.x && y === _that.y) {
            return;
        }
        if (_opts.useTransform) {
            setStyle(_that.scroller, styleName.transform, `translate3d(${x}px, ${y}px, 0)`);
        } else {
            setStyle(_that.scroller, 'left', `${x}px`);
            setStyle(_that.scroller, 'top', `${y}px`);
        }
        _that.x = x;
        _that.y = y;
    }

    /**
     * 重置滚动条位置
     * @param {Number} time 动画时间
     * @param {*} easing 动画规则方法
     * @returns {Boolean} 是否重置滚动条位置成功
     */
    _resetPos (time, easing) {
        const _that = this;
        let _res = false;
        let x = _that.x;
        let y = _that.y;
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
