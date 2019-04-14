/**
 * 注册事件处理程序
 * @param {HTMLElement} el 需要注册事件的dom元素
 * @param {String} type 事件类型
 * @param {Function} fn 事件处理程序
 * @param {Object|Boolean} capture 事件捕获阶段
 */
function _addEvent (el, type, fn, capture) {
    if (!el || !type || !fn) {
        return;
    }

    if (el.addEventListener instanceof Function) {
        el.addEventListener(type, fn, capture);
    } else if (el.attachEvent instanceof Function) {
        el.attachEvent('on' + type, fn);
    } else {
        el['on' + type] = fn;
    }
}

/**
 * 移除事件处理程序
 * @param {HTMLElement} el 需要移除事件的dom元素
 * @param {String} type 事件类型
 * @param {Function} fn 事件处理程序
 * @param {Object|Boolean} capture 事件捕获阶段
 */
function _removeEvent (el, type, fn, capture) {
    if (!el || !type || !fn) {
        return;
    }

    if (el.removeEventListener instanceof Function) {
        el.removeEventListener(type, fn, capture);
    } else if (el.detachEvent instanceof Function) {
        el.detachEvent('on' + type, fn);
    } else {
        el['on' + type] = null;
    }
}

/**
 * 注册/移除多个事件处理程序
 * @param {HTMLElement} el 需要注册/移除的事件的dom元素
 * @param {Array} types 事件类型
 * @param {Function} fn 事件处理程序
 * @param {Boolean|Object} capture 事件捕获阶段
 * @param {Boolean} flag 注册/移除事件处理程序
 */
function _initEventListener (el, types, fn, capture, flag) {
    if (!el || !types || types.length <= 0 ||
        !fn) {
        return;
    }

    types.forEach((type) => {
        type && _initEvent(type);
    });

    /**
     * 注册/移除事件
     * @param {String} type 事件类型
     */
    function _initEvent (type) {
        if (flag) {
            _addEvent(el, type, fn, capture);
        } else {
            _removeEvent(el, type, fn, capture);
        }
    }
}

/**
 * 获取事件对象
 * @param {Event} evt 事件对象
 * @returns {Event} 返回事件对象
 */
function _getEvent (evt) {
    return evt || window.event;
}

/**
 * 获取事件的target对象
 * @param {Event} evt 事件对象
 * @returns {Object} 返回事件的target对象
 */
function _getTarget (evt) {
    evt = _getEvent(evt);
    return evt && (evt.target || evt.srcElement);
}

/**
 * 阻止事件的默认行为
 * @param {Event} evt 事件对象
 */
function _preventDefault (evt) {
    evt = _getEvent(evt);
    if (!evt) {
        return;
    }
    if (evt.preventDefault instanceof Function) {
        evt.preventDefault();
    } else {
        evt.returnValue = false;
    }
}

/**
 * 阻止事件冒泡
 * @param {Event} evt 事件对象
 */
function _stopPropagation (evt) {
    evt = _getEvent(evt);
    if (!evt) {
        return;
    }
    if (evt.stopPropagation instanceof Function) {
        evt.stopPropagation();
    } else {
        evt.cancelBubble = true;
    }
}

/**
 * 事件对象
 */
const eventUtil = (function () {
    return {
        addEvent: _addEvent,
        removeEvent: _removeEvent,
        initEventListener: _initEventListener,
        getEvent: _getEvent,
        getTarget: _getTarget,
        preventDefault: _preventDefault,
        stopPropagation: _stopPropagation
    }
})();

export default eventUtil;
