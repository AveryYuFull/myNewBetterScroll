<template>
    <div class="bss_scroll">
        <div class="bs_scroll-cont">
            <div class="bs_list-wrap">
                <slot>
                    <div class="bs_list-item"
                        v-for="(item, index) in list"
                        :key="index">
                        <slot name="hook_item"
                            :itemData="_filterItem(item)">
                            <div class="bs_text">{{ _getText(item) }}</div>
                        </slot>
                    </div>
                </slot>
            </div>
            <slot
                v-if="pullupLoad"
                :state="myState"
                :pullupLoad="pullupLoad">
                <bs-pullup-load
                    :state="myState"
                    :nameText="pullUpTxt">
                </bs-pullup-load>
            </slot>
        </div>
    </div>
</template>

<script>
import callFn from '../../commons/utils/callFn';
import BsPullupLoad from './pullupLoad/PullupLoad';
import { STATE_TYPE, EVENT_TYPE,
    DEFAULT_MORE_TEXT, DEFAULT_NO_MORE_TEXT } from './constants';
export default {
    components: {
        BsPullupLoad
    },
    props: {
        /**
         * 列表数据
         */
        list: {
            type: Array
        },
        /**
         * 上拉加载状态
         */
        state: {
            type: String,
            default: STATE_TYPE.READY
        },
        /**
         * 上拉加载配置
         */
        pullupLoad: {
            type: [Boolean, Object],
            default () {
                return {
                    threshold: 90
                };
            }
        },
        /**
         * 过滤item项
         */
        filterItem: {
            type: Function
        }
    },
    data () {
        return {
            myState: this.state || STATE_TYPE.READY
        };
    },
    computed: {
        /**
         * 组装上拉加载显示的文案
         * @returns {String} 返回显示的文案
         */
        pullUpTxt () {
            const _that = this;
            let _res;
            const _pullUpload = _that.pullupLoad || {};
            switch ((_that.state || '') + '') {
                case STATE_TYPE.SUCCESS:
                    _res = _pullUpload.moreText || DEFAULT_MORE_TEXT;
                    break;
                case STATE_TYPE.NO_MORE:
                    _res = _pullUpload.noMoreText || DEFAULT_NO_MORE_TEXT;
                    break;
            }
            return _res;
        }
    },
    watch: {
        /**
         * 监听上拉加载状态
         * @param {String} nowVal 当前的加载状态
         */
        state (nowVal) {
            this.myState = nowVal;
        },
        /**
         * 监听上拉加载状态
         * @param {String} nowVal 当前的加载状态
         */
        myState (nowVal) {
            this.$emit(EVENT_TYPE.UPDATE_STATE, nowVal);
        }
    },
    methods: {
        /**
         * 获取显示的文本
         * @param {Object} item 每个数据项
         * @returns {String} 返回显示的文本
         */
        _getText (item) {
            const _that = this;
            let _res = _that._filterItem(item);
            if (typeof _res === 'string') {
                _res = {
                    text: _res
                };
            }
            return (_res && _res.text) || _res || '';
        },
        /**
         * 过滤item项数据
         * @param {Object} item item项数据
         * @returns {Object} 返回过滤后的item项数据
         */
        _filterItem (item) {
            const _that = this;
            return callFn(_that.filterItem || item, [item]);
        }
    }
};
</script>

<style lang="less">
.bss_scroll {
    .bs_list-item {
        position: relative;
        padding: 15px 10px;
        line-height: 1;
        &::after {
            content: '\20';
            position: absolute;
            border-bottom: 1px solid rgba(0, 0, 0, 0.5);
            left: 0;
            right: 0;
            bottom: 0;
            height: 0;
            transform: scaleY(0.5);
        }
    }
}
</style>
