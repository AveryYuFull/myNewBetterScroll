import { DEFAULT_CONFIG } from '../constants';
import ScrollBase from './Scroll.base';

export default class ScrollCore extends ScrollBase {
    defaultOptions = DEFAULT_CONFIG;

    constructor (el, options) {
        const _that = this;
        _that.setDefaultOptions(options);
    }
}
