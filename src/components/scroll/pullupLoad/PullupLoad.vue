<template>
    <div class="bss_pullupload">
        <div class="bs_beforeTrigger"
            v-if="isLoading">
            loading...
        </div>
        <div class="bs_afterTrigger"
            v-else>
            {{ nameText }}
        </div>
    </div>
</template>

<script>
import { STATE_TYPE } from '../constants';
export default {
    props: {
        /**
         * 上拉加载状态
         */
        state: {
            type: String,
            default: STATE_TYPE.READY
        },
        /**
         * 显示提示文案
         */
        nameText: {
            type: String
        }
    },
    computed: {
        /**
         * 获取加载状态
         * @returns {Boolean} 返回加载状态
         */
        isLoading () {
            return (this.state || '') + '' === STATE_TYPE.LOADING;
        }
    }
};
</script>
