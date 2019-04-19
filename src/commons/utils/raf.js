import getNow from './getNow';

(function () {
    let _lastTime = 0;
    const _vendors = ['webkit', 'moz', 'o', 'ms'];
    for (let i = 0; i < _vendors.length && !window.requestAnimationFrame; i++) {
        const _prefix = _vendors[i];
        window.requestAnimationFrame = window[_prefix + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[_prefix + 'CancelAnimationFrame'] ||
            window[_prefix + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            const _curTime = getNow();
            const _timeToCall = Math.max(0, 16 - (_curTime - _lastTime));
            let _id = setTimeout(() => {
                if (callback instanceof Function) {
                    callback(_curTime + _timeToCall);
                }
            }, _timeToCall);
            _lastTime = _curTime + _timeToCall;
            return _id;
        };
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
})();

const raf = {
    raf: window.requestAnimationFrame,
    caf: window.cancelAnimationFrame
};

export default raf;
