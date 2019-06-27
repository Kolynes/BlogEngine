<template>
    <div ref="content" class="v-scroll-view px-3">
        <div v-if="!loading" class="pb-3">
            <v-list :two-line="twoLine" :three-line="threeLine" v-if="$scopedSlots['list'] && items.length" style="background: transparent">
                <template v-for="(item, index) in items">
                    <v-list-tile :key="index" @click="$emit('item-tap', {item, index})">
                        <slot name="list" :item="item" :index="index"/>
                    </v-list-tile>
                    <v-divider :inset="inset" :key="'-' + index"/>
                </template>
            </v-list>
            <template v-if="!$scopedSlots['list'] && items.length" >
                <slot v-for="(item, index) in items" :item="item" :index="index"/>
            </template>
            <center v-if="page > 1">
                <v-progress-circular v-if="showLoading" :color="progressColor" indeterminate width="2" size="30"/>
                <span @click="loadItems(false)" v-else-if="!infinite && hasNextPage">
                    <slot name="load-more">
                        <v-btn>Load More</v-btn>
                    </slot>
                </span>
            </center>
        </div>
        <div class="showLoading" v-if="!items.length && !showLoading && !loading">
            <slot name="empty-state"/>
        </div>
        <div class="showLoading" v-if="(showLoading && page == 1 || loading) && !(hideProgressOnRefresh && items.length > 0)">
            <div>
                <v-progress-circular :color="color" indeterminate width="2" size="30"/>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "VScrollView",
    props: {
        inset: Boolean,
        loader: Function,
        loading: Boolean,
        refresh: Boolean,
        color: String,
        twoLine: Boolean,
        threeLine: Boolean,
        infinite: Boolean,
        hideProgressOnRefresh: Boolean
    },
    data(){
        return {
            items: [],
            page: 1,
            showLoading: false,
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
            this.showLoading = true
            if(this.infinite){
                this.$refs.content.removeEventListener("scroll", this.loadMoreItems)
            }
            return this.loader(this.page).then(data => {
                if(reload){
                    this.items = data.items
                }
                else{
                    this.items.push(...data.items)
                }
                this.showLoading = false
                this.page++;
                this.hasNextPage = data.hasNextPage
                if(this.hasNextPage){
                    if(this.infinite){
                        this.$refs.content.addEventListener("scroll", this.loadMoreItems)
                    }
                }
            }).catch(reason => {
                this.showLoading = false
                this.$emit("update:refresh", false)
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
<style lang="scss" scoped>
    .showLoading {
        display: flex;
        justify-content:center;
        align-items: center;
        height: 100%;
    }
    .v-scroll-view{
        overflow-y: auto !important;
        background: transparent;
        margin-top: 0;
        padding: 0;
    }
    
</style>