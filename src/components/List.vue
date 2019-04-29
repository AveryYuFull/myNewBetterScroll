<template>
    <div class="bs_wrapper">
        <bs-scroll
            class="bs_scroll"
            :list="list">
        </bs-scroll>
    </div>
</template>

<script>
import scrollFactory from '../commons';
import BsScroll from './scroll/Scroll';
export default {
    name: 'bs-list',
    components: {
        BsScroll
    },
    data () {
        return {
            list: []
        };
    },
    mounted() {
        const _that = this;
        _that._genList();
        setTimeout(() => {
            let bScroll = scrollFactory(_that.$el);
            bScroll.$on('pullingUp', () => {
                console.log('pullingUp');
            });
            // bScroll.$on('beforeScrollStart', (evt) => {
            //     console.log('beforeScrollStart-->', evt);
            // });
            // bScroll.$on('scrollStart', (evt) => {
            //     console.log('scrollStart-->', evt);
            // });
            // bScroll.$on('scroll', (evt) => {
            //     console.log('scroll-->', evt);
            // });
            // bScroll.$on('touchEnd', (evt) => {
            //     console.log('touchEnd-->', evt);
            // });
            // bScroll.$on('scrollEnd', (evt) => {
            //     console.log('scrollEnd-->', evt);
            // });
        });
    },
    methods: {
        _genList (lower = 0, upper = 100) {
            const _that = this;
            for (let i = lower; i < upper; i++) {
                _that.list.push(i);
            }
        }
    }
};
</script>

<style lang="less">
ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
.bs_wrapper {
    position: relative;
    overflow: hidden;
    height: 350px;
    border: 1px solid rgba(0, 0, 0, 0.3);
}
</style>
