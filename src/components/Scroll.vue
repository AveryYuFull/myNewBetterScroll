<template>
    <div class="bs_scroll">
        <div class="bs_scroll-cont">
            <div class="bs_list-wrap">
                <slot>
                    <div class="bs_list-item"
                        v-for="(item, index) in list">
                        <slot name="hook_item"
                            :itemData="item">
                            <div class="bs_list-text">{{  }}</div>
                        </slot>
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        /**
         * 列表数据
         */
        list: {
            type: Array
        },
        /**
         * 过滤item项
         */
        filterItem: {
            type: Function
        }
    },
    methods: {
        _
    }
};
</script>
