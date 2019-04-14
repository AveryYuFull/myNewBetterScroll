import { DEFAULT_CONFIG } from '../constants';
import ScrollCore from './Scroll.core';

export default class Scroll extends ScrollCore {
    defaultOptions = DEFAULT_CONFIG;

    constructor (el, options) {
        super(el, options);
        const _that = this;
        _that.setDefaultOptions(options);
    }
}
