<template>
    <md-content class="md-scrollbar" ref="content" style="overflow-y: auto; background: transparent">
        <div v-if="!showLoading">
            <md-list v-if="$scopedSlots['md-list'] && items.length" style="background: transparent">
                <template v-for="(item, index) in items">
                    <md-list-item :key="index" class="md-hover">
                        <slot name="md-list" :item="item"/>
                    </md-list-item>
                    <md-divider :class="dividerClasses" :key="'-' + index"></md-divider>
                </template>
            </md-list>
            <slot v-if="!$scopedSlots['md-list'] && items.length" v-for="item in items" :item="item"/>
            <center v-if="loading && page > 1"><md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/></center>
        </div>
        <div class="loading" v-if="!items.length && !loading && !showLoading">
            <slot name="md-empty-state"/>
        </div>
        <div class="loading" v-if="loading && page == 1 || showLoading">
            <div>
                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto"/>
            </div>
        </div>
    </md-content>
</template>

<script>
export default {
    name: "InfiniteScroller",
    props: {
        dividerClasses: {
            type: [Object, String, Array],
            default: ""
        },
        loader: Function,
        showLoading: Boolean,
        refresh: Boolean
    },
    data(){
        return {
            items: [],
            page: 1,
            loading: false,
        }
    },
    methods: {
        loadMoreItems(event){
            var scrollHeight = event.target.scrollHeight, 
                clientHeight = event.target.clientHeight,
                scrollTop = event.target.scrollTop;
            if (scrollHeight == clientHeight + scrollTop && this.hasNextPage){
                this.loadItems()
            }
        },
        loadItems(reload = false){
            this.loading = true
            this.$refs.content.$el.removeEventListener("scroll", this.loadMoreItems)
            return this.loader(this.page).then(data => {
                if(reload){
                    this.items = data.items
                }
                else{
                    this.items.push(...data.items)
                }
                this.loading = false
                this.page++;
                this.hasNextPage = data.hasNextPage
                if(this.hasNextPage){
                    this.$refs.content.$el.addEventListener("scroll", this.loadMoreItems)
                }
            })
        }
    },
    mounted(){
        this.loadItems()
    },
    watch: {
        refresh(newValue){
            if(newValue){
                this.page = 1
                this.loadItems(true).then(() => this.$emit("update:refresh", false))
            }
        }
    }
}
</script>
<style lang="scss">
    .loading {
        display: flex;
        justify-content:center;
        align-items: center;
    }
    
</style>